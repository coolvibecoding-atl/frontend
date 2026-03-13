#!/usr/bin/env python3
"""
Simple test for the stem separator worker without numpy dependency in test.
"""

import subprocess
import sys
import json
import os


def test_worker_help():
    """Test that the worker script shows help when called incorrectly."""
    result = subprocess.run(
        [sys.executable, "stem_separator.py"], capture_output=True, text=True
    )

    # Should fail with missing arguments
    print(f"Return code: {result.returncode}")
    print(f"Stdout: {result.stdout}")
    print(f"Stderr: {result.stderr}")

    # Check that it failed (non-zero exit code)
    return result.returncode != 0


if __name__ == "__main__":
    success = test_worker_help()
    print(f"Help test {'passed' if success else 'failed'}")
    sys.exit(0 if success else 1)
