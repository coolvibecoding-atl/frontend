import os
import uuid
import time
import json
import tempfile
import shutil
from pathlib import Path
from typing import List, Dict, Optional

import requests
from flask import Flask, request, jsonify
from spleeter.separator import Separator

app = Flask(__name__)

# Configuration
OUTPUT_DIR = Path(tempfile.gettempdir()) / "spleeter_output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_MODELS = {"spleeter:2stems", "spleeter:4stems", "spleeter:5stems"}
SUPPORTED_STEMS = {"vocals", "drums", "bass", "other"}


def download_audio(url: str, dest: Path) -> Path:
    """Download audio from URL to destination path."""
    try:
        resp = requests.get(url, stream=True, timeout=30)
        resp.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return dest
    except Exception as e:
        raise RuntimeError(f"Failed to download audio from {url}: {str(e)}")


def separate_audio(
    audio_path: str,
    model_name: str = "spleeter:2stems",
    stems: Optional[List[str]] = None,
) -> Dict[str, str]:
    """
    Separate audio using Spleeter.
    Returns dict mapping stem name to file path.
    """
    if model_name not in ALLOWED_MODELS:
        raise ValueError(
            f"Unsupported model: {model_name}. Choose from {ALLOWED_MODELS}"
        )

    # Determine which stems to extract
    num_stems = int(model_name.split(":")[1].replace("stems", ""))
    all_stems = {
        2: ["vocals", "accompaniment"],
        4: ["vocals", "drums", "bass", "other"],
        5: ["vocals", "drums", "bass", "piano", "other"],
    }[num_stems]

    if stems:
        # Filter to requested stems that are available
        requested = [s for s in stems if s in all_stems]
        if not requested:
            raise ValueError(f"No valid stems requested. Available: {all_stems}")
        target_stems = requested
    else:
        target_stems = all_stems

    # Create separator
    separator = Separator(model_name)

    # Generate unique output subdirectory
    job_id = str(uuid.uuid4())
    output_dir = OUTPUT_DIR / job_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # Perform separation
    separator.separate_to_file(
        audio_path, str(output_dir), filename_format="{instrument}.{codec}"
    )

    # Build result mapping
    result = {}
    for stem in target_stems:
        stem_file = output_dir / f"{stem}.wav"
        if stem_file.exists():
            result[stem] = str(stem_file)
        else:
            # Some models may not produce certain stems (e.g., 2stem doesn't have drums/bass)
            pass

    return {"job_id": job_id, "stems": result, "output_directory": str(output_dir)}


@app.route("/separate", methods=["POST"])
def separate_endpoint():
    """HTTP endpoint to trigger separation."""
    start_time = time.time()
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        audio_input = data.get("audio_path") or data.get("audio_url")
        if not audio_input:
            return jsonify({"error": "Missing audio_path or audio_url"}), 400

        model_name = data.get("model", "spleeter:2stems")
        stems = data.get("stems")  # e.g., ["vocals", "drums"]

        # Handle URL vs local path
        if audio_input.startswith(("http://", "https://")):
            # Download to temp file
            suffix = Path(audio_input).suffix or ".mp3"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp_path = tmp.name
            try:
                audio_path = download_audio(audio_input, Path(tmp_path))
            except Exception as e:
                return jsonify({"error": str(e)}), 400
            cleanup_temp = True
        else:
            audio_path = audio_input
            if not os.path.exists(audio_path):
                return jsonify({"error": f"File not found: {audio_path}"}), 404
            cleanup_temp = False

        # Perform separation
        result = separate_audio(audio_path, model_name, stems)

        # Cleanup downloaded file if needed
        if cleanup_temp and os.path.exists(audio_path):
            os.unlink(audio_path)

        processing_time = time.time() - start_time
        result["processing_time_seconds"] = round(processing_time, 2)

        return jsonify(result), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except RuntimeError as re:
        return jsonify({"error": str(re)}), 500
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


if __name__ == "__main__":
    # For development; in production use gunicorn or similar
    app.run(host="0.0.0.0", port=5000, debug=False)
