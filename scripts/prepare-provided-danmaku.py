#!/usr/bin/env python3
"""Take a normal-speed, single-play 6.4s excerpt without re-encoding GIF image data.

The original geometry, palette, timing and compressed image blocks stay intact.
Spatial and final opacity fades use the native image's CSS mask/opacity, because
GIF's one-bit transparency cannot encode a smooth transparent edge.
"""
import argparse
import hashlib
import json
import struct
from pathlib import Path


def read_gif(data):
    if data[:6] not in (b'GIF89a', b'GIF87a'):
        raise ValueError('Expected GIF')
    offset = 13 + (3 * (1 << ((data[10] & 7) + 1)) if data[10] & 128 else 0)
    header = data[:offset]
    gce = None
    elapsed = 0
    frames = []

    def skip_blocks(pos):
        while True:
            size = data[pos]
            pos += 1
            if not size:
                return pos
            pos += size

    while offset < len(data):
        start = offset
        kind = data[offset]
        offset += 1
        if kind == 0x3b:
            break
        if kind == 0x21:
            label = data[offset]
            offset += 1
            offset = skip_blocks(offset)
            if label == 0xf9:
                gce = bytearray(data[start:offset])
        elif kind == 0x2c:
            packed = data[offset + 8]
            offset += 9
            if packed & 128:
                offset += 3 * (1 << ((packed & 7) + 1))
            offset += 1
            offset = skip_blocks(offset)
            if gce is None:
                raise ValueError('Missing frame timing')
            delay = struct.unpack_from('<H', gce, 4)[0] * 10
            frames.append((elapsed, elapsed + delay, gce, data[start:offset]))
            elapsed += delay
        else:
            raise ValueError(f'Unexpected GIF block {kind}')
    return header, frames


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('--start-ms', type=int, default=1800)
    parser.add_argument('--duration-ms', type=int, default=6400)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    original = args.source.read_bytes()
    header, frames = read_gif(original)
    end = args.start_ms + args.duration_ms - 10
    result = bytearray(header)
    kept = 0
    duration = 0
    for begin, finish, control, image in frames:
        overlap = min(finish, end) - max(begin, args.start_ms)
        if overlap <= 0:
            continue
        if overlap % 10:
            raise ValueError('Timing must be on the GIF 10ms grid')
        control = bytearray(control)
        struct.pack_into('<H', control, 4, overlap // 10)
        result.extend(control)
        result.extend(image)
        duration += overlap
        kept += 1
    # A transparent tile clears the final frame after its disposal=2, without
    # invoking Pillow's transparent-tail global-header bug.
    result.extend(b'\x21\xf9\x04\x09\x01\x00\x00\x00')
    result.extend(b'\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b')
    duration += 10
    if duration != args.duration_ms:
        raise ValueError('Source window did not produce the requested duration')
    output = root / 'static/img/shrine/danmaku/tools.gif'
    output.write_bytes(result)
    digest = hashlib.sha256(result).hexdigest()
    manifest_path = root / 'static/data/danmaku.json'
    manifest = json.loads(manifest_path.read_text())
    clip = manifest['items']['tools']
    clip.update({
        'durationMs': duration, 'frames': kept + 1, 'bytes': len(result),
        'src': '/static/img/shrine/danmaku/tools.gif?v=' + digest[:12],
        'assetSha256': digest, 'sourceSha256': hashlib.sha256(original).hexdigest(),
        'sourceFile': args.source.name, 'nativeLoop': None,
        'sourceGenerator': 'th10_ring_half_arc_pmp_v4_gif.py',
        'derivation': {'sourceWindowMs': [args.start_ms, end + 10],
                       'playbackSpeed': 1, 'edgeFadePx': 26, 'fadeOutMs': 650},
    })
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Tools: {kept + 1} frames, {duration}ms, {len(result)} bytes; original image blocks unchanged')


if __name__ == '__main__':
    main()
