#!/usr/bin/env python3
"""Render a fade-in intro version of the site BGM.

Reads a source MP3 (never modified), decodes it to raw float PCM with ffmpeg,
applies a natural ~5 s logarithmic-smoothstep fade-in that ends at unity gain,
guards the true peak, and re-encodes to 192 kbps CBR MP3.

Default run (from the repo root):

    python scripts/make_bgm_intro.py

The fade curve is smoothstep in dB space:

    x    = t / fade                       (clamped to 0..1)
    s    = x * x * (3 - 2x)               (smoothstep, C1 continuous at both ends)
    gain = 10 ** ((-60 * (1 - s)) / 20)   (-60 dB at t=0, 0 dB at t=fade)

The curve is C1-continuous and starts at -60 dB (not hard zero), so there is no
click. From t=fade onward the gain is exactly 1.0, restoring the original
loudness. No loudness normalisation is applied anywhere, because that would
reshape the fade.

Peak safety: a sample-accurate soft knee limiter runs only on samples above
0.9 * ceiling; with the source at -2.3 dBTP it is a no-op. The ebur128 true
peak of the encoded result is still measured and checked.

Exit code is non-zero if any verification check fails.
"""

from __future__ import annotations

import argparse
import glob
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = REPO_ROOT / "static" / "bgm" / "Doki Doki Literature Club! - Dan Salvato.mp3"
DEFAULT_INPUT = Path.home() / "Downloads" / "bgm.mp3"

FADE_DB_START = -60.0  # gain at t=0
LIMITER_KNEE_RATIO = 0.9  # limiter starts above this fraction of the ceiling
DURATION_TOLERANCE_S = 0.2
SILENT_WINDOW_S = 0.5
NORMAL_WINDOW_S = (12.0, 15.0)  # fully-faded reference window
SILENT_WINDOW_MAX_DBFS = -50.0


# --------------------------------------------------------------------------- #
# tool discovery
# --------------------------------------------------------------------------- #
def _exe(name: str) -> str:
    return name + ".exe" if os.name == "nt" else name


def _as_tool(path: str, name: str) -> str | None:
    """Accept either a tool binary or a directory containing it."""
    p = Path(path).expanduser()
    if p.is_dir():
        p = p / _exe(name)
    return str(p) if p.is_file() else None


def _winget_candidates(name: str) -> list[str]:
    local_appdata = os.environ.get("LOCALAPPDATA")
    roots = [Path(local_appdata)] if local_appdata else []
    roots.append(Path.home() / "AppData" / "Local")
    roots.append(Path("/c/Users") / os.environ.get("USERNAME", "") / "AppData" / "Local")

    patterns: list[str] = []
    for root in roots:
        if not root or not str(root):
            continue
        pkg = root / "Microsoft" / "WinGet" / "Packages"
        patterns += [
            str(pkg / "Gyan.FFmpeg*" / "ffmpeg-*" / "bin" / _exe(name)),
            str(pkg / "Gyan.FFmpeg*" / "**" / "bin" / _exe(name)),
            str(pkg / "Gyan.FFmpeg*" / "**" / _exe(name)),
        ]
    found: list[str] = []
    for pattern in patterns:
        found += sorted(glob.glob(pattern, recursive=True))
    return found


def _extra_candidates(name: str) -> list[str]:
    paths = [
        Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "ffmpeg" / "bin" / _exe(name),
        Path(os.environ.get("ProgramData", r"C:\ProgramData")) / "chocolatey" / "bin" / _exe(name),
        Path(r"C:\ffmpeg\bin") / _exe(name),
        Path("/usr/bin") / name,
        Path("/usr/local/bin") / name,
    ]
    return [str(p) for p in paths]


def locate_tool(name: str, explicit: str | None = None) -> str | None:
    """arg -> FFMPEG_BIN -> PATH -> winget glob -> known install dirs."""
    if explicit:
        hit = _as_tool(explicit, name)
        if hit:
            return hit
        print(f"warning: --ffmpeg '{explicit}' is not a usable {name}; falling back", file=sys.stderr)

    env_bin = os.environ.get("FFMPEG_BIN")
    if env_bin:
        # FFMPEG_BIN may point at the binary itself or at its folder.
        for cand in (_as_tool(env_bin, name), _as_tool(str(Path(env_bin).parent), name)):
            if cand:
                return cand
        print(f"warning: FFMPEG_BIN '{env_bin}' is not usable; falling back", file=sys.stderr)

    on_path = shutil.which(name)
    if on_path:
        return on_path

    for cand in _winget_candidates(name) + _extra_candidates(name):
        if Path(cand).is_file():
            return cand
    return None


def require_tools(ffmpeg_arg: str | None) -> tuple[str, str]:
    ffmpeg = locate_tool("ffmpeg", ffmpeg_arg)
    if not ffmpeg:
        raise SystemExit(
            "error: ffmpeg not found. Pass --ffmpeg <path-or-dir>, set FFMPEG_BIN, "
            "or install ffmpeg (winget install Gyan.FFmpeg)."
        )
    ffprobe = locate_tool("ffprobe", str(Path(ffmpeg).parent))
    if not ffprobe:
        raise SystemExit(
            f"error: ffprobe not found next to '{ffmpeg}'. "
            "Pass --ffmpeg pointing at a full ffmpeg build (ffmpeg.exe + ffprobe.exe)."
        )
    return ffmpeg, ffprobe


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def run(cmd: list[str], *, text: bool = False, check: bool = True) -> subprocess.CompletedProcess:
    res = subprocess.run(
        cmd,
        capture_output=True,
        text=text,
        stdin=subprocess.DEVNULL,
    )
    if check and res.returncode != 0:
        err = res.stderr if text else res.stderr.decode("utf-8", "replace")
        raise RuntimeError(f"command failed ({res.returncode}): {' '.join(map(str, cmd))}\n{err[-4000:]}")
    return res


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def probe(ffprobe: str, path: Path) -> dict:
    res = run(
        [ffprobe, "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)],
        text=True,
    )
    data = json.loads(res.stdout or "{}")
    audio = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
    if audio is None:
        raise RuntimeError(f"no audio stream in {path}")
    fmt = data.get("format", {})
    return {
        "codec": audio.get("codec_name"),
        "codec_long": audio.get("codec_long_name"),
        "sample_rate": int(audio.get("sample_rate", 0)),
        "channels": int(audio.get("channels", 0)),
        "channel_layout": audio.get("channel_layout"),
        "sample_fmt": audio.get("sample_fmt"),
        "bit_rate": int(audio.get("bit_rate") or fmt.get("bit_rate") or 0),
        "duration": float(fmt.get("duration") or audio.get("duration") or 0.0),
        "size": int(fmt.get("size") or path.stat().st_size),
        "format_name": fmt.get("format_name"),
    }


def decode_to_float(ffmpeg: str, path: Path, sample_rate: int, channels: int) -> np.ndarray:
    res = run(
        [
            ffmpeg, "-v", "error", "-nostdin", "-i", str(path),
            "-map", "0:a:0", "-f", "f32le", "-acodec", "pcm_f32le", "-",
        ]
    )
    pcm = np.frombuffer(res.stdout, dtype="<f4")
    if pcm.size == 0:
        raise RuntimeError(f"ffmpeg decoded no samples from {path}")
    if pcm.size % channels:
        raise RuntimeError("decoded PCM length is not a whole number of frames")
    return pcm.astype(np.float64).reshape(-1, channels)


def astats_rms(ffmpeg: str, path: Path, start: float, end: float) -> tuple[float, float]:
    """Return (rms_dbfs, peak_dbfs) for [start, end) of the first audio stream."""
    res = run(
        [
            ffmpeg, "-hide_banner", "-nostats", "-nostdin", "-i", str(path),
            "-af",
            f"atrim=start={start}:end={end},astats=measure_overall=RMS_level+Peak_level:measure_perchannel=none",
            "-f", "null", "-",
        ],
        check=False,
    )
    text = res.stderr.decode("utf-8", "replace")
    if res.returncode != 0:
        raise RuntimeError(f"astats failed for {path} [{start},{end})\n{text[-2000:]}")

    def grab(label: str) -> float:
        hit = re.search(rf"{label} level dB:\s*(-?inf|-?[\d.]+)", text)
        if not hit:
            raise RuntimeError(f"could not parse {label} from astats output")
        raw = hit.group(1)
        return math.inf if raw in ("inf", "+inf") else (-math.inf if raw == "-inf" else float(raw))

    return grab("RMS"), grab("Peak")


def ebur128(ffmpeg: str, path: Path) -> tuple[float, float]:
    """Return (integrated LUFS, true peak dBFS) from the ebur128 summary."""
    res = run(
        [
            ffmpeg, "-hide_banner", "-nostats", "-nostdin", "-i", str(path),
            "-af", "ebur128=peak=true", "-f", "null", "-",
        ],
        check=False,
    )
    text = res.stderr.decode("utf-8", "replace")
    if res.returncode != 0:
        raise RuntimeError(f"ebur128 failed for {path}\n{text[-2000:]}")
    i_hit = re.search(r"Integrated loudness:\s*\n\s*I:\s*(-?[\d.]+) LUFS", text)
    if i_hit is not None:
        integrated = float(i_hit.group(1))
    else:
        hits = re.findall(r"\bI:\s*(-?[\d.]+) LUFS", text)
        integrated = float(hits[-1]) if hits else float("nan")
    tp_hit = re.search(r"True peak:\s*\n\s*Peak:\s*(-?[\d.]+) dBFS", text)
    if tp_hit is None:
        hits = re.findall(r"TPK:\s*(?:-?[\d.]+)\s+(-?[\d.]+) dBFS", text)
        true_peak = float(hits[-1]) if hits else float("nan")
    else:
        true_peak = float(tp_hit.group(1))
    return integrated, true_peak


def fade_envelope(n_samples: int, sample_rate: int, fade_seconds: float) -> np.ndarray:
    """Smoothstep-in-dB gain envelope, exactly 1.0 from t=fade onward."""
    t = np.arange(n_samples, dtype=np.float64) / float(sample_rate)
    x = np.clip(t / fade_seconds, 0.0, 1.0)
    smooth = x * x * (3.0 - 2.0 * x)
    gain_db = FADE_DB_START * (1.0 - smooth)
    gain = np.power(10.0, gain_db / 20.0)
    gain[t >= fade_seconds] = 1.0
    return gain


def soft_limit(samples: np.ndarray, ceiling_lin: float) -> tuple[np.ndarray, int]:
    """Soft-knee sample peak guard; a no-op unless the peak exceeds 0.9*ceiling."""
    y = samples.copy()
    knee = ceiling_lin * LIMITER_KNEE_RATIO
    span = ceiling_lin - knee
    mag = np.abs(y)
    mask = mag > knee
    touched = int(np.count_nonzero(mask))
    if touched:
        over = mag[mask]
        y[mask] = np.sign(y[mask]) * (knee + span * np.tanh((over - knee) / span))
    return y, touched


def window_rms_db(samples: np.ndarray, sample_rate: int, start: float, end: float) -> float:
    lo = max(0, int(round(start * sample_rate)))
    hi = min(samples.shape[0], int(round(end * sample_rate)))
    if hi <= lo:
        return -math.inf
    block = samples[lo:hi]
    power = float(np.mean(block * block))
    if power <= 0.0:
        return -math.inf
    return 10.0 * math.log10(power)


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Render a ~5 s natural fade-in intro MP3 from the source BGM.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--input", default=str(DEFAULT_INPUT), help="source MP3 (never modified)")
    p.add_argument("--output", default=str(DEFAULT_OUTPUT), help="destination MP3")
    p.add_argument("--ffmpeg", default=None, help="ffmpeg binary or its bin/ directory")
    p.add_argument("--fade", type=float, default=5.0, help="fade-in length in seconds")
    p.add_argument("--ceiling", type=float, default=-1.0, help="sample/true-peak ceiling in dBFS (<= 0)")
    p.add_argument("--bitrate", default="192k", help="libmp3lame CBR bitrate")
    p.add_argument("--title", default="Doki Doki Literature Club! - Dan Salvato", help="ID3 title")
    p.add_argument("--keep-temp", action="store_true", help="keep the intermediate WAV for inspection")
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    src = Path(args.input).expanduser().resolve()
    dst = Path(args.output).expanduser().resolve()
    if not src.is_file():
        raise SystemExit(f"error: input not found: {src}")
    if src == dst or (dst.exists() and os.path.samefile(src, dst)):
        raise SystemExit(f"error: refusing to overwrite the source: input == output ({src})")
    if not 0.5 <= args.fade <= 60.0:
        raise SystemExit(f"error: --fade out of range: {args.fade}")
    if args.ceiling > 0.0:
        raise SystemExit(f"error: --ceiling must be <= 0 dBFS: {args.ceiling}")
    ceiling_lin = 10.0 ** (args.ceiling / 20.0)

    ffmpeg, ffprobe = require_tools(args.ffmpeg)
    print(f"ffmpeg : {ffmpeg}")
    print(f"ffprobe: {ffprobe}")

    src_hash_before = sha256_of(src)
    src_info = probe(ffprobe, src)
    sr, channels = src_info["sample_rate"], src_info["channels"]
    print(
        f"input  : {src} ({src_info['size']} bytes, {src_info['duration']:.3f}s, "
        f"{sr} Hz, {channels} ch, {src_info['bit_rate'] // 1000} kbps, {src_info['codec']})"
    )
    print(f"sha256 : {src_hash_before}")

    # ---- decode -----------------------------------------------------------
    x = decode_to_float(ffmpeg, src, sr, channels)
    n_samples = x.shape[0]
    decoded_s = n_samples / float(sr)
    if abs(decoded_s - src_info["duration"]) > DURATION_TOLERANCE_S:
        raise SystemExit(
            f"error: decoded {decoded_s:.3f}s but container says {src_info['duration']:.3f}s; aborting"
        )
    if args.fade >= decoded_s:
        raise SystemExit(f"error: --fade {args.fade}s >= track length {decoded_s:.2f}s")
    print(f"decoded: {n_samples} frames = {decoded_s:.3f}s, peak {20 * math.log10(max(np.abs(x).max(), 1e-12)):.2f} dBFS")

    # ---- fade-in ----------------------------------------------------------
    gain = fade_envelope(n_samples, sr, args.fade)
    if np.any(np.diff(gain) < -1e-12):
        raise SystemExit("error: fade envelope is not monotonically non-decreasing")
    y = x * gain[:, None]

    # ---- peak guard -------------------------------------------------------
    y, limited = soft_limit(y, ceiling_lin)
    peak_after = float(np.abs(y).max())
    if peak_after > ceiling_lin:
        raise SystemExit(
            f"error: sample peak {20 * math.log10(peak_after):.2f} dBFS exceeds ceiling {args.ceiling} dBFS"
        )

    # ---- write temp WAV ---------------------------------------------------
    dst.parent.mkdir(parents=True, exist_ok=True)
    i16 = np.clip(np.rint(y * 32767.0), -32768.0, 32767.0).astype("<i2")
    tmp_wav_fd, tmp_wav = tempfile.mkstemp(prefix=".bgm_intro.", suffix=".wav", dir=str(dst.parent))
    os.close(tmp_wav_fd)
    tmp_mp3_fd, tmp_mp3 = tempfile.mkstemp(prefix=".bgm_intro.", suffix=".mp3", dir=str(dst.parent))
    os.close(tmp_mp3_fd)
    try:
        with wave.open(tmp_wav, "wb") as wav:
            wav.setnchannels(channels)
            wav.setsampwidth(2)
            wav.setframerate(sr)
            wav.writeframes(i16.tobytes())

        # ---- encode ------------------------------------------------------
        run(
            [
                ffmpeg, "-v", "error", "-nostdin", "-y",
                "-i", tmp_wav,
                "-map", "0:a:0",
                "-map_metadata", "-1",
                "-c:a", "libmp3lame",
                "-b:a", args.bitrate,
                "-ar", str(sr),
                "-ac", str(channels),
                "-id3v2_version", "3",
                "-metadata", f"title={args.title}",
                "-metadata", "comment=Rendered by scripts/make_bgm_intro.py (natural dB-smoothstep fade-in)",
                "-f", "mp3",
                tmp_mp3,
            ]
        )
        if os.path.getsize(tmp_mp3) == 0:
            raise SystemExit("error: encoder produced an empty file")

        # ---- verify the encoded result before publishing it ---------------
        out_info = probe(ffprobe, Path(tmp_mp3))
        integrated, true_peak = ebur128(ffmpeg, Path(tmp_mp3))
        silent_rms, silent_peak = astats_rms(ffmpeg, Path(tmp_mp3), 0.0, SILENT_WINDOW_S)
        normal_rms, normal_peak = astats_rms(ffmpeg, Path(tmp_mp3), *NORMAL_WINDOW_S)
        src_normal_rms, _ = astats_rms(ffmpeg, src, *NORMAL_WINDOW_S)
        src_silent_rms, _ = astats_rms(ffmpeg, src, 0.0, SILENT_WINDOW_S)

        # numeric envelope probes (from the exact processed buffer)
        env = {
            "t=0.00": gain[0],
            "t=0.50": gain[min(n_samples - 1, int(0.5 * sr))],
            "t=2.50": gain[min(n_samples - 1, int(2.5 * sr))],
            "t=5.00": gain[min(n_samples - 1, int(5.0 * sr))],
            "t=9.00": gain[min(n_samples - 1, int(9.0 * sr))],
            "t=9.99": gain[min(n_samples - 1, int(9.99 * sr))],
            "t=10.00": gain[min(n_samples - 1, int(10.0 * sr))],
            "t=60.00": gain[min(n_samples - 1, int(60.0 * sr))],
        }
        unity_ok = all(abs(g - 1.0) < 1e-12 for t, g in env.items() if float(t.split("=")[1]) >= args.fade)

        failures: list[str] = []
        if out_info["codec"] != "mp3":
            failures.append(f"codec is {out_info['codec']}, expected mp3")
        if out_info["sample_rate"] != sr:
            failures.append(f"sample rate {out_info['sample_rate']} != {sr}")
        if out_info["channels"] != channels:
            failures.append(f"channels {out_info['channels']} != {channels}")
        expected_bitrate = int(re.sub(r"[^0-9]", "", args.bitrate)) * 1000
        if abs(out_info["bit_rate"] - expected_bitrate) > 2000:
            failures.append(f"bitrate {out_info['bit_rate']} != ~{expected_bitrate}")
        if abs(out_info["duration"] - src_info["duration"]) > DURATION_TOLERANCE_S:
            failures.append(
                f"duration {out_info['duration']:.3f}s drifted from source {src_info['duration']:.3f}s"
            )
        if true_peak > args.ceiling + 1e-9:
            failures.append(f"true peak {true_peak:.2f} dBFS exceeds ceiling {args.ceiling} dBFS")
        if silent_rms > SILENT_WINDOW_MAX_DBFS:
            failures.append(f"first {SILENT_WINDOW_S}s RMS {silent_rms:.1f} dBFS is not near-silent")
        if abs(normal_rms - src_normal_rms) > 1.0:
            failures.append(
                f"post-fade RMS {normal_rms:.2f} dBFS drifted from source {src_normal_rms:.2f} dBFS"
            )
        if not unity_ok:
            failures.append("envelope is not exactly unity after the fade")
        if 20 * math.log10(max(peak_after, 1e-12)) > args.ceiling + 1e-9:
            failures.append("processed sample peak exceeds ceiling")
        src_hash_after = sha256_of(src)
        if src_hash_after != src_hash_before:
            failures.append("SOURCE FILE HASH CHANGED")

        if not failures:
            os.replace(tmp_mp3, dst)
            published = True
        else:
            published = False

        # ---- report ------------------------------------------------------
        print()
        print("=" * 74)
        print("VERIFICATION REPORT")
        print("=" * 74)
        print(f"fade curve      : smoothstep in dB, {FADE_DB_START:+.0f} dB -> 0 dB over {args.fade:g}s")
        print(f"limiter         : engaged on {limited} sample(s) "
              f"(knee {20 * math.log10(ceiling_lin * LIMITER_KNEE_RATIO):.2f} dBFS, ceiling {args.ceiling:.1f} dBFS)")
        print(f"sample peak     : {20 * math.log10(max(peak_after, 1e-12)):.2f} dBFS (ceiling {args.ceiling:.1f})")
        print(f"gain @ t (dBFS) : " + "  ".join(f"{t}:{20 * math.log10(max(g, 1e-12)):.1f}" for t, g in env.items()))
        print(f"unity after fade: {'yes' if unity_ok else 'NO'}")
        print()
        print(f"output          : {dst} ({out_info['size']} bytes, published={published})")
        print(f"  codec         : {out_info['codec']} ({out_info['codec_long']})")
        print(f"  sample rate   : {out_info['sample_rate']} Hz")
        print(f"  channels      : {out_info['channels']} ({out_info['channel_layout']})")
        print(f"  bitrate       : {out_info['bit_rate'] / 1000:.0f} kbps")
        print(f"  duration      : {out_info['duration']:.3f}s (source {src_info['duration']:.3f}s, "
              f"delta {out_info['duration'] - src_info['duration']:+.3f}s)")
        print(f"  integrated    : {integrated:.1f} LUFS")
        print(f"  true peak     : {true_peak:.2f} dBTP (limit {args.ceiling:.1f})")
        print()
        print(f"RMS first {SILENT_WINDOW_S}s  : {silent_rms:8.2f} dBFS   (peak {silent_peak:6.2f})   "
              f"source was {src_silent_rms:.2f} dBFS")
        print(f"RMS {NORMAL_WINDOW_S[0]:g}-{NORMAL_WINDOW_S[1]:g}s       : {normal_rms:8.2f} dBFS   "
              f"(peak {normal_peak:6.2f})   source was {src_normal_rms:.2f} dBFS   "
              f"delta {normal_rms - src_normal_rms:+.2f} dB")
        print()
        print(f"source sha256   : {src_hash_before}")
        print(f"                  {src_hash_after}  ({'unchanged' if src_hash_after == src_hash_before else 'CHANGED!'})")
        print()

        if failures:
            print("RESULT: FAILED")
            for item in failures:
                print(f"  - {item}")
            print()
            return 1
        print("RESULT: PASS - all checks green")
        return 0
    finally:
        for tmp in (tmp_wav, tmp_mp3):
            try:
                if os.path.exists(tmp) and not (args.keep_temp and tmp.endswith(".wav")):
                    os.unlink(tmp)
            except OSError:
                pass


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
