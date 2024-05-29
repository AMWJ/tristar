from datetime import date
from typing import List
from sqlite3 import connect
import uuid
import pypika
import pypika.functions
import pypika.queries

class Workout:
    created_at: date
    id: int
    user_id: int
    type: str
    duration: int
    date: date

class User:
    created_at: date
    id: int
    name: str
    workouts: List[Workout]


tables = {
    "users": pypika.Table("users"),
    "workouts": pypika.Table("workouts")
}

def constructWorkout(workoutArray):
    workout = Workout()
    workout.id = workoutArray[0]
    workout.type = workoutArray[1]
    workout.duration = workoutArray[2]
    workout.date = workoutArray[3]
    workout.user_id = workoutArray[4]
    return workout

def setup():
    create_user_table = pypika.Query.create_table("users").columns(
        pypika.Column("id", "text"),
        pypika.Column("created_at", "datetime"),
        pypika.Column("name", "text"),
    ).primary_key("id")
    create_workouts_table = pypika.Query.create_table("workouts").columns(
        pypika.Column("id", "text"),
        pypika.Column("created_at", "datetime"),
        pypika.Column("user_id", "text"),
        pypika.Column("type", "text"),
        pypika.Column("duration", "int"),
        pypika.Column("date", "datetime")
    ).primary_key("id")
    try:
        execute_query(create_user_table)
        execute_query(create_workouts_table)
    except:
        print("Database already exists!")
        pass

def execute_write_query(query):
    connection = connect("data.db")
    print(query.get_sql())
    cursor = connection.execute(query.get_sql())
    connection.commit()


def execute_query(query):
    connection = connect("data.db")
    print(query.get_sql())
    cursor = connection.execute(query.get_sql())
    return cursor.fetchall()

def get_user(user_name) -> User:
    query = pypika.Query.from_(tables["users"]).select("id", "name").where(tables["users"].name == user_name)
    users = execute_query(query)
    if len(users) == 0:
        return None
    user = User()
    user.id = users[0][0]
    user.name = users[0][1]
    return user

def get_user_by_id(user_id) -> User:
    query = pypika.Query.from_(tables["users"]).select("id", "name").where(tables["users"].id == user_id)
    users = execute_query(query)
    if len(users) == 0:
        print("No users")
        return None
    user = User()
    user.id = users[0][0]
    user.name = users[0][1]
    return user

def create_user(user_name):
    user = get_user(user_name)
    if user:
        return user
    create_user_query = pypika.Query.into(tables["users"]).columns("id", "name").insert(uuid.uuid4(), user_name)
    execute_write_query(create_user_query)

def get_workouts(user_name) -> List[Workout]:
    workouts_query = pypika.Query.from_(tables["workouts"]) \
        .join(tables["users"]) \
        .on(tables["workouts"].user_id == tables["users"].id) \
        .select("id", "type", "duration", "date", "user_id") \
        .where(tables["users"].name == user_name)
    workouts = execute_query(workouts_query)
    return [constructWorkout(workout) for workout in workouts]
    return [workouts]


def create_workout(workout: Workout) -> List[Workout]:
    create_workout_query = pypika.Query.into(tables["workouts"]).columns("id", "user_id", "type", "duration", "date").insert(
        uuid.uuid4(), workout.user_id, workout.type, workout.duration, workout.date
    )
        
    execute_write_query(create_workout_query)
