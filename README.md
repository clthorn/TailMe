# TailMeApp - Sports Picks Subscription Platform

TailMeApp is a platform where sports handicappers (creators) can publish their picks, and users can subscribe to see those picks. The application integrates with The Odds API to provide up-to-date odds for various sports events.

I wanted to build this app because I thought it would be a good way for people to find and follow sports handicappers. Also, I wanted there to be some transparency where a creator can't delete picks after the result to prop up winning percentage.

## Features

- **User Authentication**: Register and login as either a regular user or a creator
- **Creator Profiles**: View creator statistics including win rates and total picks
- **Subscription System**: Subscribe to creators to access their picks
- **Sports Odds Integration**: Real-time odds from The Odds API for various sports
- **Pick Management**: Creators can add picks with odds and update results
- **User Dashboard**: View all available creators and manage subscriptions
- **Creator Dashboard**: Manage picks and view subscriber statistics

## Tech Stack

- **Frontend**: React, TypeScript, Material UI
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Authentication**: JWT
- **API Integration**: The Odds API

## Project Structure

```
TailMeApp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context for state management
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point
│   └── package.json        # Frontend dependencies
│
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── .env                # Environment variables (not in Git)
│   ├── database.sqlite     # SQLite database (not in Git)
│   ├── server.js           # Server entry point
│   └── package.json        # Backend dependencies
│
├── .env.template           # Template for environment variables
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/TailMeApp.git
   cd TailMeApp
   ```

2. Install backend dependencies:
   ```
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../client
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.template` to `server/.env`
   - Get an API key from [The Odds API](https://the-odds-api.com/)
   - Update the `.env` file with your API key and a secure JWT secret

### Running the Application Locally

1. Start the backend server:
   ```
   cd server
   npm start
   ```

2. Start the frontend development server:
   ```
   cd ../client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get JWT token

### Creators
- `GET /api/creators` - Get all creators
- `GET /api/creators/:id` - Get a specific creator

### Subscriptions
- `GET /api/subscriptions` - Get user's subscriptions
- `POST /api/subscriptions/:creatorId` - Subscribe to a creator
- `DELETE /api/subscriptions/:creatorId` - Unsubscribe from a creator

### Picks
- `GET /api/picks/subscribed` - Get picks from subscribed creators
- `GET /api/picks/creator/:id` - Get picks from a specific creator
- `POST /api/picks` - Create a new pick (creator only)
- `PUT /api/picks/:id` - Update a pick result (creator only)

### Odds
- `GET /api/odds` - Get odds for all sports
- `GET /api/odds/:sport` - Get odds for a specific sport

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Data Sources
- [The Odds API](https://the-odds-api.com/)
