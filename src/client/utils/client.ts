import { useState } from "react";

const PORT = 5000
const URL = `http://localhost:${PORT}`

export const workoutTypes = ["running", "biking", "rowing"] as const
export type WorkoutType = typeof workoutTypes[number]

export type Workout = {
    id?: string,
    user: User,
    date: Date,
    type: WorkoutType,
    duration: number,
}

export type User = {
    id: string,
    userName: string,
    workouts: Workout[],
}

export const useServer = () => {
    const [users, setUsers] = useState<Record<string, User>>({});
    return {
        getUser: async (userName: string) => {
            if(users[userName]) {
                return users[userName];
            }
            const response = await fetch(`${URL}/user`, {
                method: "POST",
                credentials: "same-origin", // include, *same-origin, omit
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({userName})
            });
            if(!response.ok) {
                return null;
            }
            const json = await response.json();
            const user: User = {
                id: json["id"],
                userName: json["userName"],
                workouts: [],
                };
            const workouts= json["workouts"].map((workout: any)=> {
                return {
                    id: workout["id"],
                    date: new Date(workout["date"]),
                    duration: workout["duration"],
                    type: workout["type"],
                    user: user
                } as Workout ;
            });
            user.workouts = workouts;
            setUsers({...users, [userName]:  user});
            return user;
        },
        createWorkout: async (workout: Workout) => {
            const {user,...workoutWithoutUser} = workout;
            const response = await fetch(`${URL}/workout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({user_id: user.id, ...workoutWithoutUser })
            })
            if(!response.ok) {
                return null;
            }
            if(!users[user.userName]) {
                users[user.userName] = user
            }
            const modifiedWorkouts = [...users[user.userName].workouts, workout];
            const modifiedUser = {...users[user.userName], workouts: modifiedWorkouts}
            setUsers({...users, 
                [user.userName]: modifiedUser
            })
            return response;
        },
        users,
    }
}