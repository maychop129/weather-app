"""
Flask Backend Server for Weather Clone Web App
Provides local static serving, API proxying with caching, and fallback data.
"""

from flask import Flask, jsonify, request, send_from_directory
import json
import time
import urllib.request
import urllib.error
import urllib.parse
import os

app = Flask(__name__, static_folder='static', static_url_path='')

# Simple in-memory cache: { key: (timestamp, data) }
CACHE = {}
CACHE_TTL = 300  # 5 minutes cache

def get_cached(key):
    if key in CACHE:
        timestamp, data = CACHE[key]
        if time.time() - timestamp < CACHE_TTL:
            return data
    return None

def set_cached(key, data):
    CACHE[key] = (time.time(), data)

def fetch_json(url, timeout=6):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'WeatherCloneApp/1.0 (Educational/Project)'}
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode('utf-8'))

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/weather')
def get_weather():
    lat = request.args.get('lat', '28.6139')
    lon = request.args.get('lon', '77.2090')
    cache_key = f"weather_{round(float(lat), 3)}_{round(float(lon), 3)}"
    
    cached = get_cached(cache_key)
    if cached:
        return jsonify(cached)
    
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        f"current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&"
        f"hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index,is_day&"
        f"daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&"
        f"timezone=auto&forecast_days=14"
    )
    
    try:
        data = fetch_json(url)
        set_cached(cache_key, data)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e), "fallback": True}), 502

@app.route('/api/air-quality')
def get_air_quality():
    lat = request.args.get('lat', '28.6139')
    lon = request.args.get('lon', '77.2090')
    cache_key = f"aqi_{round(float(lat), 3)}_{round(float(lon), 3)}"
    
    cached = get_cached(cache_key)
    if cached:
        return jsonify(cached)
    
    url = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality?"
        f"latitude={lat}&longitude={lon}&"
        f"current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&"
        f"timezone=auto"
    )
    
    try:
        data = fetch_json(url)
        set_cached(cache_key, data)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e), "fallback": True}), 502

@app.route('/api/geocoding')
def search_city():
    query = request.args.get('name', '').strip()
    if not query:
        return jsonify({"results": []})
    
    cache_key = f"geo_{query.lower()}"
    cached = get_cached(cache_key)
    if cached:
        return jsonify(cached)
    
    encoded = urllib.parse.quote(query)
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded}&count=8&language=en&format=json"
    
    try:
        data = fetch_json(url)
        set_cached(cache_key, data)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e), "results": []}), 502

@app.route('/api/reverse-geocode')
def reverse_geocode():
    lat = request.args.get('lat', '28.6139')
    lon = request.args.get('lon', '77.2090')
    cache_key = f"rev_{round(float(lat), 3)}_{round(float(lon), 3)}"
    
    cached = get_cached(cache_key)
    if cached:
        return jsonify(cached)
    
    url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=en"
    
    try:
        data = fetch_json(url)
        set_cached(cache_key, data)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e), "locality": "Current Location", "countryName": ""}), 502

@app.route('/api/ip-location')
def get_ip_location():
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    if client_ip and client_ip.startswith('127.') or client_ip == '::1':
        client_ip = ''  # Request public IP from provider
    
    url = f"https://ipwho.is/{client_ip}" if client_ip else "https://ipwho.is/"
    try:
        data = fetch_json(url)
        return jsonify(data)
    except Exception as e:
        # Fallback to default
        return jsonify({
            "success": True,
            "city": "New Delhi",
            "region": "Delhi",
            "country": "India",
            "latitude": 28.6139,
            "longitude": 77.2090
        })

@app.route('/api/radar-frames')
def get_radar_frames():
    cache_key = "radar_frames"
    cached = get_cached(cache_key)
    if cached:
        return jsonify(cached)
    
    url = "https://api.rainviewer.com/public/weather-maps.json"
    try:
        data = fetch_json(url)
        set_cached(cache_key, data)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 502

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"==================================================")
    print(f"Nimbus Weather Clone server running at:")
    print(f"http://127.0.0.1:{port}")
    print(f"Press Ctrl+C to stop.")
    print(f"==================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
