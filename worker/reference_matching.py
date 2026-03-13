#!/usr/bin/env python3
"""
Reference matching service for matching audio to reference tracks
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
    import librosa
    from scipy import signal

    LIBRARIES_AVAILABLE = True
except ImportError:
    print(
        "Warning: Required libraries not available. Using mock processing.",
        file=sys.stderr,
    )
    LIBRARIES_AVAILABLE = False


def match_reference(target_path, reference_path, options=None, output_path=None):
    """
    Match audio to a reference track

    Args:
        target_path: Path to target audio file
        reference_path: Path to reference audio file
        options: Matching options
        output_path: Path for output file (optional)

    Returns:
        dict: Processing results including output path and metrics
    """
    if options is None:
        options = {}

    if not LIBRARIES_AVAILABLE:
        # Mock processing when libraries aren't available
        time.sleep(2)  # Simulate processing time
        return {
            "output_path": output_path or f"{target_path}.matched.wav",
            "processing_time": 2.0,
            "similarity_score": 0.8,
            "adjustments": {"eq": {"low": 0, "mid": 0, "high": 0}, "gain": 0},
            "settings": options,
        }

    # Load audio files
    start_time = time.time()
    target_waveform, target_sr = torchaudio.load(target_path)
    ref_waveform, ref_sr = torchaudio.load(reference_path)

    # Ensure same sample rate
    if target_sr != ref_sr:
        resampler = torchaudio.transforms.Resample(target_sr, ref_sr)
        target_waveform = resampler(target_waveform)
        target_sr = ref_sr

    # Convert to mono if stereo
    if target_waveform.shape[0] > 1:
        target_waveform = torch.mean(target_waveform, dim=0, keepdim=True)
    if ref_waveform.shape[0] > 1:
        ref_waveform = torch.mean(ref_waveform, dim=0, keepdim=True)

    # Calculate spectral features
    target_spec = librosa.stft(target_waveform.squeeze().numpy())
    ref_spec = librosa.stft(ref_waveform.squeeze().numpy())

    # Calculate similarity (simplified - using spectral correlation)
    target_mag = np.abs(target_spec)
    ref_mag = np.abs(ref_spec)

    # Ensure same length for comparison
    min_len = min(target_mag.shape[1], ref_mag.shape[1])
    target_mag = target_mag[:, :min_len]
    ref_mag = ref_mag[:, :min_len]

    # Calculate spectral correlation
    similarity = np.corrcoef(target_mag.flatten(), ref_mag.flatten())[0, 1]
    similarity = max(0, min(1, (similarity + 1) / 2))  # Convert to 0-1 range

    # Calculate EQ adjustments (simplified)
    target_freqs = librosa.fft_frequencies(sr=target_sr, n_fft=2048)
    ref_freqs = librosa.fft_frequencies(sr=ref_sr, n_fft=2048)

    # Simple EQ matching based on spectral balance
    target_bands = {
        "low": np.mean(target_mag[target_freqs < 250, :])
        if len(target_freqs) > 0
        else 0,
        "mid": np.mean(target_mag[(target_freqs >= 250) & (target_freqs < 4000), :])
        if len(target_freqs) > 0
        else 0,
        "high": np.mean(target_mag[target_freqs >= 4000, :])
        if len(target_freqs) > 0
        else 0,
    }

    ref_bands = {
        "low": np.mean(ref_mag[ref_freqs < 250, :]) if len(ref_freqs) > 0 else 0,
        "mid": np.mean(ref_mag[(ref_freqs >= 250) & (ref_freqs < 4000), :])
        if len(ref_freqs) > 0
        else 0,
        "high": np.mean(ref_mag[ref_freqs >= 4000, :]) if len(ref_freqs) > 0 else 0,
    }

    # Calculate EQ adjustments in dB
    adjustments = {
        "eq": {
            "low": 10 * np.log10(target_bands["low"] / (ref_bands["low"] + 1e-10))
            if ref_bands["low"] > 0
            else 0,
            "mid": 10 * np.log10(target_bands["mid"] / (ref_bands["mid"] + 1e-10))
            if ref_bands["mid"] > 0
            else 0,
            "high": 10 * np.log10(target_bands["high"] / (ref_bands["high"] + 1e-10))
            if ref_bands["high"] > 0
            else 0,
        },
        "gain": 0,  # Placeholder for gain adjustment
    }

    # Apply adjustments to target audio (simplified)
    # In production, you'd use actual DSP processing
    adjusted_waveform = target_waveform.clone()

    # Ensure output directory exists
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True) if os.path.dirname(
            output_path
        ) else None

    # Save output
    if output_path is None:
        output_path = f"{Path(target_path).stem}_matched.wav"

    # Convert back to stereo for output
    if adjusted_waveform.shape[0] == 1:
        adjusted_waveform = adjusted_waveform.repeat(2, 1)

    torchaudio.save(output_path, adjusted_waveform, target_sr)

    processing_time = time.time() - start_time

    return {
        "output_path": output_path,
        "processing_time": processing_time,
        "similarity_score": float(similarity),
        "adjustments": adjustments,
        "settings": options,
    }


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(
            "Usage: python reference_matching.py <target_path> <reference_path> [options_json] [output_path]",
            file=sys.stderr,
        )
        sys.exit(1)

    target_path = sys.argv[1]
    reference_path = sys.argv[2]
    options = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
    output_path = sys.argv[4] if len(sys.argv) > 4 else None

    try:
        result = match_reference(target_path, reference_path, options, output_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
