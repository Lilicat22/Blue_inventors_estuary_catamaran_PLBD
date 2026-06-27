"""
API Flask pour servir les données réelles des capteurs.
À adapter selon votre matériel exact (Arduino, RPI, etc.)
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Permet les requêtes depuis le React dashboard

# État global des capteurs (remplacer par vraie connexion)
sensor_state = {
    "ph": 7.4,
    "temperature": 23.5,
    "battery": 62,
    "latitude": 6.5,
    "longitude": -5.0,
    "speed": 1.1,
    "waste_today_kg": 12.4,
    "solar_input": 180,
    "turbidity": 18,
    "timestamp": datetime.utcnow().isoformat()
}

@app.route('/api/current', methods=['GET'])
def get_current_sensors():
    """Retourne les valeurs actuelles de tous les capteurs."""
    sensor_state['timestamp'] = datetime.utcnow().isoformat()
    return jsonify(sensor_state)

@app.route('/api/sensor/<sensor_name>', methods=['GET'])
def get_sensor(sensor_name):
    """Retourne la valeur d'un capteur spécifique."""
    if sensor_name in sensor_state:
        return jsonify({sensor_name: sensor_state[sensor_name]})
    return jsonify({"error": f"Capteur '{sensor_name}' non trouvé"}), 404

@app.route('/api/update', methods=['POST'])
def update_sensors():
    """
    Endpoint pour mettre à jour les données des capteurs.
    À appeler depuis votre système d'acquisition.
    """
    global sensor_state
    try:
        new_data = request.get_json()
        sensor_state.update(new_data)
        sensor_state['timestamp'] = datetime.utcnow().isoformat()
        return jsonify({"status": "success", "data": sensor_state})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    """Vérifier que l'API fonctionne."""
    return jsonify({"status": "ok", "api": "Blue Inventors Sensor API"})

if __name__ == '__main__':
    print("🚀 Démarrage API capteurs sur http://localhost:5000")
    print("Endpoints disponibles:")
    print("  GET /api/current - toutes les valeurs actuelles")
    print("  GET /api/sensor/<name> - un capteur spécifique")
    print("  POST /api/update - mettre à jour les données")
    print("  GET /health - vérifier le statut")
    app.run(debug=False, host='0.0.0.0', port=5000)