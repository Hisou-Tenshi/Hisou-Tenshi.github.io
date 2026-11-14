#!/usr/bin/env python3
"""Encode transparent, non-looping GIFs with one shared palette and clean disposal."""
import json
import struct
import sys
from pathlib import Path

from PIL import Image

source, destination, fps = Path(sys.argv[1]), Path(sys.argv[2]), int(sys.argv[3])
paths = sorted(source.glob('frame-*.png'))
samples = paths[::6]
atlas = Image.new('RGB', (96 * len(samples), 96))
for i, path in enumerate(samples):
    im = Image.open(path).convert('RGBA')
    im.thumbnail((96, 96), Image.Resampling.LANCZOS)
    atlas.paste(im.convert('RGB'), (i * 96, 0))
palette_image = atlas.quantize(colors=127, method=Image.Quantize.MEDIANCUT)
colors = palette_image.getpalette()[:127 * 3]
colors += colors[-3:] * ((127 * 3 - len(colors)) // 3)
palette = [0, 0, 0] + colors
palette += palette[-3:] * ((768 - len(palette)) // 3)
remap = [min(i + 1, 127) for i in range(256)]
frames = []
durations = []
for i, path in enumerate(paths):
    rgba = Image.open(path).convert('RGBA')
    # A stable binary edge compresses far better than a changing alpha-dither field.
    # Fine outlines and solid white cores preserve the original STG sprite language.
    opaque = rgba.getchannel('A').point(lambda a: 255 if a >= 96 else 0)
    frame = rgba.convert('RGB').quantize(palette=palette_image, dither=Image.Dither.NONE).point(remap)
    frame.putpalette(palette)
    frame.paste(0, mask=Image.eval(opaque, lambda x: 255 - x))
    frame.info['transparency'] = 0
    frames.append(frame)
    durations.append(round((i + 1) * 100 / fps) * 10 - round(i * 100 / fps) * 10)

# Pillow writes a second global GIF header when a disposal=2 frame is fully blank.
# Encode the nonblank sequence, then append one standards-compliant transparent tile.
tail_duration = 0
while len(frames) > 1 and frames[-1].getbbox() is None:
    frames.pop()
    tail_duration += durations.pop()
if not tail_duration:
    raise ValueError('Expected a transparent final hold')
frames[0].save(destination, save_all=True, append_images=frames[1:], duration=durations,
               transparency=0, background=0, disposal=2, optimize=True)
data = destination.read_bytes()
if data[-1:] != b'\x3b':
    raise ValueError('GIF trailer missing')
clear = b'\x21\xf9\x04\x09' + struct.pack('<H', tail_duration // 10) + b'\x00\x00'
tile = b'\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00'
destination.write_bytes(data[:-1] + clear + tile + b'\x3b')
with Image.open(destination) as gif:
    total = 0
    for i in range(gif.n_frames):
        gif.seek(i)
        total += gif.info.get('duration', 0)
    last_blank = gif.convert('RGBA').getbbox() is None
    if 'loop' in gif.info or total != round(len(paths) / fps * 1000) or not last_blank:
        raise ValueError('GIF must play once, last exactly 6.4s, and finish transparent')
    print(json.dumps({'frames': gif.n_frames, 'durationMs': total, 'bytes': destination.stat().st_size}))
