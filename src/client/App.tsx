import React, { useState } from "react";
import { useServer, workoutTypes } from "./utils/client";
import type { User, Workout, WorkoutType } from "./utils/client";
import { getMidnight } from "./utils/utils"
import { Chart as ChartJS, registerables } from 'chart.js/auto'
import { Chart, Bar }            from 'react-chartjs-2'
  
import "./styles/output.css"


const LoginComponent = ({ setLoggedInUser, getUser }) => {
	const [userName, setUserName] = useState<string>("");

	const login = async () => {
		const user = await getUser(userName);
		setLoggedInUser(user);
	}

	return (<div className="flex flex-col gap-2 pt-20 w-80 text-center">
		<label>User: <input className="border-2" type="user" value={userName}
							onChange={({target})=>setUserName(target.value)}
							onKeyDown={async ({key}) => key === 'Enter' ? await login() : "" } /></label>
		<button className="border-2" disabled={!userName} onClick={async () => {await login()}}>Sign In / Create</button>
	</div>);
}


const NewWorkoutComponent = ({ user, newWorkout}: {user: User|null,newWorkout: (workout: Workout) => void}) => {
	const [workoutType, setWorkoutType] = useState<WorkoutType>("running")
	const [duration, setDuration] = useState<number>(0)
	const [date, setDate] = useState<Date>(new Date())
	const dateString = `${date.getUTCFullYear().toString().padStart(4,"0")}-${(date.getUTCMonth()+1).toString().padStart(2,"0")}-${date.getUTCDate().toString().padStart(2,"0")}`

	return (<div className="flex flex-col">
		<label>Workout Type: <select value={workoutType}
							onChange={({target})=>setWorkoutType(target.value as WorkoutType)}>
								{workoutTypes.map((workoutType)=>
								<option key={workoutType} value={workoutType}>{workoutType}</option>
								)}
							</select>
		</label>
		<label>Duration: <input className="border-2 w-10" value={duration}
							onChange={({target})=>target.value === "" ? setDuration(0):(target.value)? setDuration(parseInt(target.value)):""}/>
		&nbsp;minutes</label>
		<label>Date: <input type="date" value={dateString}
							onChange={({target})=>setDate(new Date(target.value))}/>
		</label>
		<button className="border-2 hover:bg-gray-400 active:bg-gray-700" onClick={async () => {
			if (user) {
				await newWorkout({ type: workoutType, duration, date, user})
			}
		}}>New Workout</button>
	</div>);
}

export const BarChart = ({data}: {data: Workout[]}) => {
	const sorted = data.sort((a,b)=> a.date<b.date?-1:1);
	const bars = sorted.reduce<{date: Date, workouts: Workout[]}[]>((state, workout: Workout)=> {
		if(state.length === 0) {
			return [{
				date: getMidnight(workout.date),
				workouts: [workout],
			}];
		}
		const lastWorkout = state[state.length-1];
		const newDate = getMidnight(workout.date);
		if(newDate.valueOf() === lastWorkout.date.valueOf()) {
			lastWorkout.workouts.push(workout);
			return state;
		}
		let currentDate = new Date(lastWorkout.date);
		currentDate.setDate(currentDate.getDate() + 1);
	  
		while (currentDate.getTime() < newDate.getTime()) {
		  state.push({
			date: new Date(currentDate),
			workouts: []
		  });
		  currentDate.setDate(currentDate.getDate() + 1);
		}
	  
		state.push({
		  date: newDate,
		  workouts: [workout]
		});
		return state;
	}, [])
	console.log(bars)
	return <Bar datasetIdKey='id'
	data={{
		labels: bars.map((bar)=>bar.date.getDate()),
		datasets: [
			{
				label: 'Minutes',
				data: bars.map((bar)=> bar.workouts.reduce((sum, curr)=> sum+curr.duration, 0)),
			},
		]}}
	/>   
}

const App = async () => {
	const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
	const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType | null>("running");
	const {createWorkout, getUser} = useServer();

	ChartJS.register(...registerables)

	const data = loggedInUser?.workouts.filter((workout)=>workout.type===selectedWorkoutType)??[]

	return (
		<div className="flex justify-center p-3 flex-col items-center">
			{loggedInUser? (<div className="flex w-full">
				<div className="flex flex-col gap-2 bg-blue-50">{workoutTypes.map((workoutType)=>
					<button key={workoutType} className={`border-0cursor-pointer active:bg-blue-500  hover:bg-blue-400 ${workoutType === selectedWorkoutType ? "bg-blue-600": "bg-blue-300"}`} onClick={()=>setSelectedWorkoutType(workoutType)}>
						{workoutType}
					</button>
				)}
				<button className={`border-0cursor-pointer active:bg-blue-500  hover:bg-blue-400 ${!selectedWorkoutType ? "bg-blue-600": "bg-blue-300"}`} onClick={()=>setSelectedWorkoutType(null)}>+ New Workout</button>
				</div>
				<div className="p-4 w-9/12">
					{!selectedWorkoutType && (<NewWorkoutComponent user={loggedInUser} newWorkout={(workout: Workout) => createWorkout(workout)} />)}
			{selectedWorkoutType && <BarChart data={data} />}
				</div>
				<div>
					Logged in as {loggedInUser.userName}
					<button className="border-2 border-r-8" onClick={()=>{
						setLoggedInUser(null);
					}}>Logout</button>
				</div>
			</div>): <LoginComponent setLoggedInUser={setLoggedInUser} getUser={getUser} />}
		</div>
	);
};

export default App;
