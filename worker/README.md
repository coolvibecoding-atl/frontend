# AI Mixer Pro Worker Services

This directory contains the Python worker services for AI-powered audio processing.

## Services

### 1. Stem Separation (`stem_separator.py`)
Uses Spleeter to separate audio into stems (vocals, drums, bass, other).

**Requirements:**
- `spleeter>=2.3.0`
- `torch>=2.0.0`
- `torchaudio>=2.0.0`

**Usage:**
```bash
python stem_separator.py <input_path> [stems_json] [model]
```

### 2. Audio Mastering (`mastering.py`)
Applies mastering processing using Pedalboard and Torchaudio.

**Requirements:**
- `pedalboard>=0.8.0`
- `torchaudio>=2.0.0`
- `numpy>=1.24.0`

**Usage:**
```bash
python mastering.py <input_path> [preset_name] [output_path]
```

### 3. Vocal Tuning (`vocal_tuning.py`)
Applies pitch correction and formant shifting to vocal tracks.

**Requirements:**
- `librosa>=0.10.0`
- `torch>=2.0.0`
- `torchaudio>=2.0.0`

**Usage:**
```bash
python vocal_tuning.py <input_path> [options_json] [output_path]
```

### 4. Reference Matching (`reference_matching.py`)
Matches audio to a reference track for consistent sound.

**Requirements:**
- `librosa>=0.10.0`
- `torch>=2.0.0`
- `torchaudio>=2.0.0`
- `scipy>=1.10.0`

**Usage:**
```bash
python reference_matching.py <target_path> <reference_path> [options_json] [output_path]
```

## Installation

1. Install Python 3.8 or higher
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running Workers

Start all worker services:
```bash
./start_workers.sh
```

Or start individual workers using Node.js:
```bash
node lib/queue.js
```

## Environment Variables

- `REDIS_HOST`: Redis server host (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## Production Deployment

For production deployment:

1. **Use a process manager** like PM2 or systemd
2. **Set up Redis** for queue management
3. **Configure Supabase Storage** for file storage
4. **Monitor workers** with logging and metrics
5. **Scale horizontally** by running multiple worker instances

## Monitoring

Workers emit logs to stdout/stderr. Use a logging aggregator like:
- Datadog
- Logtail
- AWS CloudWatch
- Google Cloud Logging

## Troubleshooting

### Spleeter not available
If Spleeter is not installed, the service will fall back to mock processing. Install with:
```bash
pip install spleeter
```

### CUDA/GPU Support
For faster processing, install PyTorch with CUDA support:
```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Memory Issues
Stem separation is memory-intensive. For large files:
- Process in chunks
- Use a machine with sufficient RAM (16GB+ recommended)
- Consider using cloud-based processing for large batches