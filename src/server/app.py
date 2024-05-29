from flask import Flask
import db
from db import Workout
from flask import request, abort
import json
from flask_cors import CORS, cross_origin
from datetime import datetime

app = Flask(__name__)
CORS(app)

def create_tables():
    with app.app_context():
        db.setup()

@app.post("/user")
@cross_origin()
def userPost():
    print("userPost")
    username = request.json["userName"]
    user = db.get_user(username)
    if not user:
        db.create_user(username)
        user = db.get_user(username)
        user.workouts = []
    else:
        workouts = db.get_workouts(username)
        user.workouts = [{"id": workout.id, "date": workout.date, "duration": workout.duration, "type": workout.type, "user_id": workout.user_id} for workout in workouts]

    return {
        "userName": user.name, 
        "id": user.id, 
        "workouts": user.workouts
    }

@app.post("/workout")
@cross_origin()
def workoutPost():
    print(request.json)
    user_id = request.json["user_id"]
    date = request.json["date"]
    duration = request.json["duration"]
    workout_type = request.json["type"]

    print(user_id)
    print(workout_type)
    print(duration)
    print(date)
    user = db.get_user_by_id(user_id)
    if not user:
        abort(404)
    
    workout = Workout()
    workout.user_id = user_id
    workout.date = datetime.fromisoformat(date.replace("Z", "+00:00"))
    workout.duration = duration
    workout.type = workout_type
    db.create_workout(workout)
    return ""

if __name__ == "__main__":
    create_tables()
    app.run(debug=True, host="0.0.0.0")
