# Wild West Forum

An intentionally insecure web application designed as a simple public forum for educational purposes. 
Users can register accounts, login, and make comments on the forum.


## Features

- User registration and authentication
- Public forum for posting comments


## Architecture

- nginx: Serves static files and acts as reverse proxy
- Node.js/Express: Handles API endpoints and  authentication
- Docker Compose: Orchestrates both containers with internal networking


## Project Structure
```
wild-west-forum/
├── backend/                 # Express.js backend container
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── nginx/                   # nginx reverse proxy container
│   ├── Dockerfile
│   ├── default.conf
│   └── public/              # Static HTML/CSS/JS files
├── docker-compose.yml       # Production configuration
└── README.md
```

## Setup Instructions

1. Clone the repository
   ```
   git clone https://github.com/ryanpbrown2002/serverMidterm>
   cd wild-west-forum
   ```

2. Start the application
   ```
   docker compose up -d
   ```

3. Verify containers are running
   ```
   docker compose ps
   ```

4. Access the application
   ```
   Open your browser to http://your-server-ip
   ```
