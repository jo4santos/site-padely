#!/usr/bin/env python3
"""
Simple HTTP server with SPA routing support.
Serves index.html for all routes that don't match real files.
"""

import http.server
import socketserver
import os
from urllib.parse import unquote

PORT = 8080

class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Store original path for serving
        original_path = self.path

        # Decode the URL
        path = unquote(self.path)

        # Remove query string for file checking
        path_without_query = path.split('?')[0]

        # Get the file path (remove leading slash for filesystem check)
        file_path = path_without_query.lstrip('/')

        # If it's the root, serve index.html
        if path_without_query == '/':
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

        # Check if the file exists (including extensions like .css, .js, .png, etc.)
        if file_path and os.path.isfile(file_path):
            # File exists, serve it normally with original path
            self.path = original_path
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        elif file_path and os.path.isdir(file_path):
            # Directory exists, serve index.html from it if present
            index_path = os.path.join(file_path, 'index.html')
            if os.path.isfile(index_path):
                self.path = '/' + index_path
                return http.server.SimpleHTTPRequestHandler.do_GET(self)

        # No file found, serve index.html for SPA routing
        self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def run_server():
    with socketserver.TCPServer(("", PORT), SPAHTTPRequestHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()
