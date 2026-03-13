#!/usr/bin/env python3
"""
Audio mastering service using Pedalboard and Torchaudio
"""

import json
import sys
import os
import tempfile
import time
from pathlib import Path

# Try to import required libraries
try:
    import numpy as np
    import torchaudio
    import torch
    from pedalboard import (
        Pedalboard,
        Compressor,
        HighPassFilter,
        LowShelfFilter,
        HighShelfFilter,
        Limiter,
        Gain,
    )
    from pedalboard.io import AudioFile

    PEDALBOARD_AVAILABLE = True
except ImportError:
    print(
        "Warning: Pedalboard or torchaudio not available. Using mock processing.",
        file=sys.stderr,
    )
    PEDALBOARD_AVAILABLE = False


def apply_mastering(input_path, preset_name="transparent", output_path=None):
    """
    Apply mastering processing to an audio file

    Args:
        input_path: Path to input audio file
        preset_name: Mastering preset name
        output_path: Path for output file (optional)

    Returns:
        dict: Processing results including output path and metrics
    """
    if not PEDALBOARD_AVAILABLE:
        # Mock processing when libraries aren't available
        time.sleep(2)  # Simulate processing time
        return {
            "output_path": output_path or f"{input_path}.mastered.wav",
            "processing_time": 2.0,
            "metrics": {"lufs": -14.0, "peak": -1.0, "dynamic_range": 10.0},
            "settings": preset_name,
        }

    # Load audio file
    start_time = time.time()
    waveform, sample_rate = torchaudio.load(input_path)

    # Convert to mono if stereo
    if waveform.shape[0] > 1:
        waveform = torch.mean(waveform, dim=0, keepdim=True)

    # Apply mastering chain based on preset
    if preset_name == "transparent":
        board = Pedalboard(
            [
                Compressor(threshold_db=-20, ratio=1.2, attack_ms=30, release_ms=400),
                Limiter(threshold_db=-1.0, release_ms=50),
            ]
        )
    elif preset_name == "loud":
        board = Pedalboard(
            [
                Compressor(threshold_db=-12, ratio=1.8, attack_ms=10, release_ms=100),
                Limiter(threshold_db=-0.3, release_ms=30),
            ]
        )
    elif preset_name == "warm":
        board = Pedalboard(
            [
                LowShelfFilter(cutoff_frequency_hz=200, gain_db=2.0),
                Compressor(threshold_db=-18, ratio=1.5, attack_ms=50, release_ms=600),
                Limiter(threshold_db=-0.5, release_ms=100),
            ]
        )
    elif preset_name == "punchy":
        board = Pedalboard(
            [
                HighPassFilter(cutoff_frequency_hz=100),
                Compressor(threshold_db=-8, ratio=2.5, attack_ms=5, release_ms=50),
                Limiter(threshold_db=-0.4, release_ms=20),
            ]
        )
    elif preset_name == "vocal":
        board = Pedalboard(
            [
                HighShelfFilter(cutoff_frequency_hz=8000, gain_db=1.0),
                Compressor(threshold_db=-16, ratio=1.6, attack_ms=20, release_ms=250),
                Limiter(threshold_db=-0.6, release_ms=75),
            ]
        )
    else:
        # Default transparent
        board = Pedalboard(
            [
                Compressor(threshold_db=-20, ratio=1.2, attack_ms=30, release_ms=400),
                Limiter(threshold_db=-1.0, release_ms=50),
            ]
        )

    # Apply processing
    processed = board(waveform, sample_rate)

    # Calculate metrics
    # LUFS estimation (simplified)
    rms = torch.sqrt(torch.mean(processed**2))
    lufs = 20 * torch.log10(rms) - 23  # Approximate LUFS

    # Peak level
    peak = torch.max(torch.abs(processed))
    peak_db = 20 * torch.log10(peak)

    # Dynamic range (simplified)
    dynamic_range = 20  # Placeholder

    # Save output
    if output_path is None:
        output_path = f"{Path(input_path).stem}_mastered.wav"

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True) if os.path.dirname(
        output_path
    ) else None

    # Convert back to stereo for output
    if processed.shape[0] == 1:
        processed = processed.repeat(2, 1)

    torchaudio.save(output_path, processed, sample_rate)

    processing_time = time.time() - start_time

    return {
        "output_path": output_path,
        "processing_time": processing_time,
        "metrics": {
            "lufs": float(lufs),
            "peak": float(peak_db),
            "dynamic_range": dynamic_range,
        },
        "settings": preset_name,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(
            "Usage: python mastering.py <input_path> [preset_name] [output_path]",
            file=sys.stderr,
        )
        sys.exit(1)

    input_path = sys.argv[1]
    preset_name = sys.argv[2] if len(sys.argv) > 2 else "transparent"
    output_path = sys.argv[3] if len(sys.argv) > 3 else None

    try:
        result = apply_mastering(input_path, preset_name, output_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
