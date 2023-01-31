import os
from flask import Flask, render_template, url_for, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

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


@app.route('/download', methods=['POST', 'GET'])
def send_csv_file():
    with app.app_context():
        msg = Message(subject="Database File",
                      sender=app.config.get("MAIL_USERNAME"),
                      recipients=["alfonso.serrano.suner999@gmail.com"])
        # Create a csv file from the database
        with open('database.csv', 'w') as file:
            writer = csv.writer(file)
            # Write the headers
            writer.writerow(["id", "user_id", "timestamp", "reaction_time"])
            # Write the data from the database
            for measurement in Store_measurements.query.all():
                writer.writerow([measurement.id, measurement.user_id, measurement.timestamp, measurement.reaction_time])
        with open('database.csv', 'rb') as f:
            # Attach the csv file to the email
            msg.attach("database.csv", "text/csv", f.read())
        mail.send(msg)


if __name__ == '__main__':
    app.run()


from flask_mail import Mail, Message
import csv

# Configure the mail extension
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'reaction.time.measurements@gmail.com'
app.config['MAIL_PASSWORD'] = 'ReactionTimeMeasurementsProject'

mail = Mail(app)

# Define the function to send the data via email
def send_csv_file():
    with app.app_context():
        msg = Message(subject="Database File",
                      sender=app.config.get("MAIL_USERNAME"),
                      recipients=["alfonso.serrano.suner999@gmail.com"])
        # Create a csv file from the database
        with open('database.csv', 'w') as file:
            writer = csv.writer(file)
            # Write the headers
            writer.writerow(["id", "user_id", "timestamp", "reaction_time"])
            # Write the data from the database
            for measurement in Store_measurements.query.all():
                writer.writerow([measurement.id, measurement.user_id, measurement.timestamp, measurement.reaction_time])
        with open('database.csv', 'rb') as f:
            # Attach the csv file to the email
            msg.attach("database.csv", "text/csv", f.read())
        mail.send(msg)

# Schedule the function to run periodically
import schedule
import time

def job():
    send_csv_file()

schedule.every().day.at("07:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(3600)  # Sleep for an hour and revise again schedule to run pending.
