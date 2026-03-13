#!/usr/bin/env python3
"""
AI Mixer Pro Worker Entry Point
This module provides a simple HTTP server for health checks and
serves as the entry point for the Python worker container.
"""

import http.server
import socketserver
import threading
import sys
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

PORT = 8000


class HealthCheckHandler(http.server.SimpleHTTPRequestHandler):
    """Handler for health check endpoints"""

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status": "healthy", "service": "ai-mixer-worker"}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        """Suppress default logging"""
        pass


def run_health_server():
    """Run the health check server"""
    with socketserver.TCPServer(("", PORT), HealthCheckHandler) as httpd:
        logger.info(f"Health check server running on port {PORT}")
        httpd.serve_forever()


def main():
    """Main entry point"""
    logger.info("Starting AI Mixer Pro Python Worker...")

    # Check if worker scripts exist
    worker_dir = Path(__file__).parent
    required_scripts = [
        "stem_separator.py",
        "mastering.py",
        "vocal_tuning.py",
        "reference_matching.py",
    ]

    for script in required_scripts:
        script_path = worker_dir / script
        if not script_path.exists():
            logger.warning(f"Worker script not found: {script}")
        else:
            logger.info(f"Found worker script: {script}")

    # Start health check server in a separate thread
    server_thread = threading.Thread(target=run_health_server, daemon=True)
    server_thread.start()

    logger.info("Python Worker is ready. Health checks available at /health")

    # Keep the main thread alive
    try:
        while True:
            import time

            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down worker...")
        sys.exit(0)


if __name__ == "__main__":
    main()
