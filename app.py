import os
from flask import Flask, render_template, url_for, request, jsonify, session, send_file
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import csv

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'measurements.db')
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True

db = SQLAlchemy(app)

#id_code = 0;  # Initialization of id_code varaible

class Store_measurements(db.Model):
    __tablename__ = 'reflex_measurements'
    id = db.Column('reading_id', db.Integer, primary_key = True)
    user_id = db.Column('user_id', db.Integer)
    timestamp = db.Column('timestamp', db.DateTime)
    reaction_time = db.Column('Reaction time', db.Float)

    def __init__(self, user_id, timestamp, reaction_time):
        self.user_id = user_id
        self.timestamp = timestamp
        self.reaction_time = reaction_time

 
@app.route("/")
def index():
    '''
    This will take us to the login page, where the user needs to enter his ID
    code so that we can associate his performance in the game with the hr data
    measured by the smartband.
    '''
    return render_template("play.html")


@app.route("/info")
def info():
    return "<p>Info!</p>"


@app.route('/save_measurement', methods=['POST', 'GET'])
def saveMeasurement():
  if request.method == "POST":
    if not os.path.exists(os.path.join(basedir, 'measurements.db')):
        db.create_all()
    measured_data = request.get_json()
    db.session.add(Store_measurements(measured_data['user_id'],
        datetime.fromtimestamp(measured_data['timestamp']),
        measured_data['reaction_time']))
    db.session.commit()
    rows = db.session.query(Store_measurements).count()
  results = {'rows': rows,
            'user_id': measured_data['user_id']}
  return jsonify(results)


@app.route('/download_201709739', methods=['POST', 'GET'])
def download_csv_file():
    with app.app_context():
        # Create a csv file from the database
        with open('database.csv', 'w') as file:
            writer = csv.writer(file)
            # Write the headers
            writer.writerow(["id", "user_id", "timestamp", "reaction_time"])
            # Write the data from the database
            for measurement in Store_measurements.query.all():
                writer.writerow([measurement.id, measurement.user_id, measurement.timestamp, measurement.reaction_time])
        # Download the csv file in the administrator browser
        return send_file('database.csv',
                 mimetype='text/csv',
                 attachment_filename='database.csv',
                 as_attachment=True)



if __name__ == '__main__':
    app.run()
