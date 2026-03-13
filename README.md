# Stem Separation Worker Service

This service provides stem separation functionality using Spleeter, designed to be integrated with a Node.js backend via BullMQ queue system.

## Components

1. **stem_separator.py** - Python worker that performs stem separation
2. **requirements.txt** - Python dependencies
3. **test_worker.py** - Test script for the worker
4. **nodejs-integration.md** - Guide for integrating with Node.js/BullMQ
5. **simple_test.py** - Simple test for worker argument handling

## Usage

### Direct Usage (Command Line)

```bash
python3 stem_separator.py --input input_audio.wav --output ./stems --stems 4
```

Arguments:
- `--input`: Path to input audio file (required)
- `--output`: Directory to save separated stems (required)
- `--stems`: Number of stems (2, 4, or 5, default: 2)

### As a Module

The worker can also be imported and used programmatically:

```python
from stem_separator import separate_stems

result = separate_stems(
    input_path="input.wav",
    output_dir="./stems",
    stems=4
)

if result["success"]:
    print(f"Separation completed in {result['processing_time_seconds']}s")
    print(f"Stems saved to: {result['output_directory']}")
else:
    print(f"Error: {result['error']}")
```

## Integration with Node.js/BullMQ

See `nodejs-integration.md` for detailed instructions on integrating this worker with a Node.js backend using BullMQ for job queuing.

Key integration points:
- Node.js enqueues jobs with audio file paths and separation options
- BullMQ worker processes listen to the queue and execute the Python stem separator
- Results are returned as JSON and can be stored or forwarded via callbacks

## Requirements

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Note: For Apple Silicon Macs with Python 3.14, you may need to use a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Output Format

The worker returns a JSON object with the following structure:

On success:
```json
{
  "success": true,
  "output_directory": "/path/to/output",
  "stems": {
    "vocals": "/path/to/vocals.wav",
    "drums": "/path/to/drums.wav",
    "bass": "/path/to/bass.wav",
    "other": "/path/to/other.wav"
  },
  "processing_time_seconds": 12.34
}
```

On failure:
```json
{
  "success": false,
  "error": "Error description",
  "processing_time_seconds": 5.67
}
```

## Supported Stem Configurations

- 2 stems: vocals, accompaniment
- 4 stems: vocals, drums, bass, other
- 5 stems: vocals, drums, bass, piano, other

## Error Handling

The worker handles various error conditions:
- Missing input files
- Invalid stem counts
- Spleeter not installed
- Separation process failures
- Output directory creation issues

All errors are returned in the JSON response with `success: false`.