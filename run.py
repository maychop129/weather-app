"""
Launcher script for Nimbus Weather Clone
Starts the Flask server and opens the web application in your default browser.
"""

import sys
import time
import socket
import threading
import webbrowser

def find_available_port(start_port=5000):
    port = start_port
    while port < start_port + 100:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
            port += 1
    return start_port

def open_browser(port):
    time.sleep(1.2)
    url = f"http://127.0.0.1:{port}"
    print(f"\nOpening {url} in your default browser...\n")
    webbrowser.open(url)

if __name__ == '__main__':
    try:
        import flask
    except ImportError:
        print("Flask is not installed. Please run: pip install -r requirements.txt")
        sys.exit(1)

    from app import app
    
    port = find_available_port(5000)
    
    # Launch browser in a background thread
    threading.Thread(target=open_browser, args=(port,), daemon=True).start()
    
    print("=" * 60)
    print("  Nimbus Weather Clone - Live Weather Web Application")
    print(f"  Running at: http://127.0.0.1:{port}")
    print("  Press Ctrl+C to stop the server")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=False)
