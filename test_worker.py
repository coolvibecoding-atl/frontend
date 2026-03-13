#!/usr/bin/env python3
"""
Simple test script for the stem separator worker.
"""

import json
import subprocess
import sys
import tempfile
import os


def test_worker():
    """Test the stem separator worker with a dummy file."""

    # Create a temporary directory for test
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create a dummy audio file (we'll use a silent WAV for testing)
        dummy_input = os.path.join(temp_dir, "test_input.wav")
        output_dir = os.path.join(temp_dir, "output")

        # Create a simple WAV file (1 second of silence, 44.1kHz, mono)
        import wave
        import numpy as np

        sample_rate = 44100
        duration = 1.0  # seconds
        samples = int(sample_rate * duration)
        audio_data = np.zeros(samples, dtype=np.int16)

        with wave.open(dummy_input, "w") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_data.tobytes())

        # Test the worker
        cmd = [
            sys.executable,
            "stem_separator.py",
            "--input",
            dummy_input,
            "--output",
            output_dir,
            "--stems",
            "2",
        ]

        print(f"Running command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)

        print(f"Return code: {result.returncode}")
        print(f"Stdout: {result.stdout}")
        print(f"Stderr: {result.stderr}")

        if result.returncode == 0:
            try:
                output = json.loads(result.stdout)
                print("Worker test successful!")
                print(json.dumps(output, indent=2))
                return True
            except json.JSONDecodeError:
                print("Failed to parse worker output as JSON")
                return False
        else:
            print("Worker test failed!")
            return False


if __name__ == "__main__":
    success = test_worker()
    sys.exit(0 if success else 1)
