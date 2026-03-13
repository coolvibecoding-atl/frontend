#!/usr/bin/env python3
"""
Stem separation worker service using Spleeter.
Accepts audio file path and separation options, returns stem paths and metadata.
"""

import argparse
import json
import os
import sys
import tempfile
import time
from pathlib import Path


def separate_stems(input_path, output_dir, stems=2):
    """
    Separate audio into stems using Spleeter.

    Args:
        input_path (str): Path to input audio file
        output_dir (str): Directory to save separated stems
        stems (int): Number of stems (2, 4, or 5)

    Returns:
        dict: Separation results with stem paths and metadata
    """
    start_time = time.time()

    try:
        # Validate input file
        if not os.path.exists(input_path):
            return {
                "success": False,
                "error": f"Input file not found: {input_path}",
                "processing_time_seconds": time.time() - start_time,
            }

        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Import Spleeter
        try:
            from spleeter.separator import Separator
        except ImportError:
            return {
                "success": False,
                "error": "Spleeter not installed. Install with: pip install spleeter",
                "processing_time_seconds": time.time() - start_time,
            }

        # Determine model based on stems
        model_map = {2: "spleeter:2stems", 4: "spleeter:4stems", 5: "spleeter:5stems"}

        if stems not in model_map:
            return {
                "success": False,
                "error": f"Unsupported stem count: {stems}. Supported: 2, 4, 5",
                "processing_time_seconds": time.time() - start_time,
            }

        model = model_map[stems]

        # Initialize separator
        separator = Separator(model)

        # Perform separation
        separator.separate_to_file(
            input_path, output_dir, filename_format="{instrument}.wav", codec="wav"
        )

        # Collect stem paths
        stem_paths = {}
        expected_stems = {
            2: ["vocals", "accompaniment"],
            4: ["vocals", "drums", "bass", "other"],
            5: ["vocals", "drums", "bass", "piano", "other"],
        }[stems]

        for stem in expected_stems:
            stem_path = os.path.join(output_dir, f"{stem}.wav")
            if os.path.exists(stem_path):
                stem_paths[stem] = stem_path
            else:
                return {
                    "success": False,
                    "error": f"Expected stem file not found: {stem_path}",
                    "processing_time_seconds": time.time() - start_time,
                }

        processing_time = time.time() - start_time

        return {
            "success": True,
            "output_directory": output_dir,
            "stems": stem_paths,
            "processing_time_seconds": round(processing_time, 2),
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "processing_time_seconds": time.time() - start_time,
        }


def main():
    parser = argparse.ArgumentParser(
        description="Stem separation worker using Spleeter"
    )
    parser.add_argument("--input", required=True, help="Path to input audio file")
    parser.add_argument(
        "--output", required=True, help="Directory to save separated stems"
    )
    parser.add_argument(
        "--stems",
        type=int,
        default=2,
        choices=[2, 4, 5],
        help="Number of stems to separate (2, 4, or 5)",
    )

    args = parser.parse_args()

    result = separate_stems(args.input, args.output, args.stems)

    # Output result as JSON to stdout
    print(json.dumps(result))

    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
