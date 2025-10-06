# Library Portal

A simple library portal with user session management using Express.js and EJS templates.

## Features

- User login with name input
- Session management to store user name and login time
- Profile page displaying user session information
- Logout functionality to destroy sessions
- Responsive design with modern UI

## Setup Instructions

1. **Create package.json file** (since the system had issues creating it automatically):

   Create a file named `package.json` in the library-portal directory with the following content:

   ```json
   {
     "name": "library-portal",
     "version": "1.0.0",
     "description": "Library portal with user session management",
     "main": "server.js",
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     },
     "dependencies": {
       "express": "^4.18.2",
       "express-session": "^1.17.3",
       "ejs": "^3.1.9"
     },
     "devDependencies": {
       "nodemon": "^3.0.1"
     }
   }
   ```

2. **Install dependencies**:

   ```bash
   cd library-portal
   npm install
   ```

3. **Run the application**:

   ```bash
   npm start
   ```

   Or for development with auto-restart:

   ```bash
   npm run dev
   ```

4. **Access the application**:

   Open your browser and go to `http://localhost:3000`

## How It Works

1. **Login Page**: Users enter their name to log in
2. **Session Creation**: When a user logs in, a session is created storing:
   - User name
   - Login time
3. **Profile Page**: Displays user session information including name and login time
4. **Logout**: Destroys the session and redirects to login page

## Session Configuration

- Session secret: `library-portal-secret-key`
- Session duration: 24 hours
- Session is stored server-side

## File Structure

```
library-portal/
├── server.js          # Express server with session management
├── package.json       # Project dependencies (needs to be created manually)
├── views/
│   ├── login.ejs      # Login page template
│   └── profile.ejs    # Profile page template
└── public/
    └── style.css      # CSS styling
```

## Routes

- `GET /` - Redirects to login or profile based on session
- `GET /login` - Displays login page
- `POST /login` - Processes login and creates session
- `GET /profile` - Displays user profile (requires authentication)
- `GET /logout` - Destroys session and redirects to login

## Security Notes

- This is a demo application with basic session management
- In production, use HTTPS and set `cookie: { secure: true }`
- Use a strong, randomly generated session secret
- Add proper input validation and error handling
- Consider adding user authentication with passwords in a real application
