# Workout Log

## Running

Pull the code, with `git clone https://github.com/AMWJ/tristar.git`, then enter the directory with `cd tristar`.


### Running in Docker

If these steps don't work, look below to run without Docker.

1. Run `docker compose build`, to build the React frontend and Flask backend simultaneously. This could take about 5 minutes.

2. Run `docker compose up`, to start both the React frontend (on port 8080) and Flask backend (on port 5000)

3. Browse to `http://localhost:8080`.

### Running out of Docker

1. Run `npm install` to install the frontend dependencies. You'll need `node` installed for this to work.

2. Run `python -m pip install -r requirements.txt` to install the backend dependencies. You'll need `python` and `pip` installed for this to work.

3. Run `npm run client:watch` to start the React frontend.

4. Run `python ./src/server/app.py` to start the Flask backend.

5. Browse to `http://localhost:8080`.