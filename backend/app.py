# app.py

# -------------------- Imports --------------------
import pandas as pd
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from sklearn.linear_model import LinearRegression

# -------------------- App SetupNo --------------------
app = Flask(__name__)
CORS(app)

# -------------------- Upload Route --------------------
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file uploaded", 400

    uploaded_file = request.files['file']

    if uploaded_file.filename == '':
        return "No selected file", 400

    try:
        if uploaded_file.filename.endswith('.csv'):
            df = pd.read_csv(uploaded_file)
        elif uploaded_file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(uploaded_file)
        else:
            return "Unsupported file type", 400

        # Process your dataframe here (you can add logic later)
        return "File processed successfully! Rows: " + str(len(df))

    except Exception as e:
        return f"Error processing file: {str(e)}", 500

# -------------------- Emission Calculation Route --------------------
@app.route('/calculate', methods=['POST'])
def calculate_emissions():
    data = request.json
    scope1 = calculate_scope1(
        data.get('diesel_used', 0),
        data.get('gasoline_used', 0),
        data.get('natural_gas_used', 0)
    )
    scope2 = calculate_scope2(data.get('kwh_used', 0), data.get('State', 'Washington'))
    return jsonify({"scope1": scope1, "scope2": scope2})

# -------------------- Helper Functions --------------------
def calculate_scope1(diesel_used, gasoline_used, natural_gas_used):
    factors = {
        'diesel': 10.19,    # kg CO₂/Gallon
        'gasoline': 8.887,  # kg CO₂/Gallon
        'natural_gas': 1.9  # kg CO₂/m³
    }
    total_scope1 = (
        diesel_used * factors['diesel'] +
        gasoline_used * factors['gasoline'] +
        natural_gas_used * factors['natural_gas']
    )
    return total_scope1

def calculate_scope2(kwh_used, State="Washington"):
    grid_factors = {
        "Washington": 0.385  # kg CO₂/kWh
    }
    return (kwh_used * grid_factors.get(State, 0.3)) / .907185

# For improvement recommendations
tiers = {
    "A+": {"max_emissions": 20, "apr": 3.5},
    "A": {"max_emissions": 50, "apr": 4.5},
    "B": {"max_emissions": 100, "apr": 6.0},
    "C": {"max_emissions": 175, "apr": 8.5},
    "D": {"apr": None}
}

def get_improvement_recommendations(current_emissions):
    recommendations = []
    sorted_tiers = sorted(
        [(name, data) for name, data in tiers.items() if name != "D"],
        key=lambda x: x[1]["max_emissions"]
    )
    for tier_name, tier_data in sorted_tiers:
        if current_emissions > tier_data["max_emissions"]:
            reduction_needed = current_emissions - tier_data["max_emissions"]
            recommendations.append(
                f"Reduce emissions by {reduction_needed} kg CO₂ to reach Tier {tier_name} (APR: {tier_data['apr']}%)"
            )
    return recommendations if recommendations else ["You're at the highest tier!"]

def calculate_apr(total_emissions):
    for tier_name, tier_data in tiers.items():
        if tier_name == "D":
            return None  # Not eligible
        if total_emissions <= tier_data["max_emissions"]:
            return tier_data["apr"]
    return tiers["D"]["apr"]

# -------------------- SQLite Database Setup (Optional) --------------------
def setup_database():
    conn = sqlite3.connect('carbon_db.sqlite')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS emissions (
            user_id INT,
            scope1 FLOAT,
            scope2 FLOAT,
            date TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Setup database when server starts
setup_database()

# -------------------- Run Server --------------------
if __name__ == '__main__':
    app.run(debug=True)