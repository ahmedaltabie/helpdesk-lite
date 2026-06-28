# HelpDesk Lite

A lightweight help desk ticket management system built with Node.js, Express, SQLite3, and vanilla JavaScript.

## Features

- **Role-Based Access Control (RBAC)**
  - Employee: Create and view own tickets
  - Support Agent: View ticket queue, assign tickets, update status
  - Manager: View system statistics and analytics

- **Dynamic Login System**
  - Login using username, email, or phone

- **Ticket Management**
  - Categories: IT, HR, Facilities
  - Priorities: Low, Medium, High
  - Status: New, In Progress, Resolved, Closed

- **Professional Dark-Themed UI**
  - Clean, modern interface
  - Responsive design

## Tech Stack

- **Backend**: Node.js, Express, express-session
- **Database**: SQLite3 (with foreign keys enabled)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Fetch API)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

   If you encounter PowerShell execution policy issues, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   Then run `npm install` again.

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Default Users

The system automatically seeds 3 default users on first run:

- **Employee**: `ahmed99` / `ahmed123`
- **Agent**: `agent01` / `agent123`
- **Manager**: `manager01` / `manager123`

## Project Structure

```
helpdesk/
├── database/
│   ├── db.js              # Database wrapper with Promise helpers
│   ├── init.js            # Database initialization and seeding
│   └── helpdesk.db        # SQLite database (created automatically)
├── middleware/
│   └── auth.js            # Authentication and RBAC middleware
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── tickets.js         # Ticket management routes
│   └── stats.js           # Statistics routes
├── public/
│   ├── css/
│   │   └── styles.css     # Dark-themed CSS
│   ├── js/
│   │   ├── login.js       # Login page logic
│   │   ├── employee.js    # Employee dashboard logic
│   │   ├── agent.js       # Agent dashboard logic
│   │   └── manager.js     # Manager dashboard logic
│   ├── login.html         # Login page
│   ├── employee.html      # Employee dashboard
│   ├── agent.html         # Agent dashboard
│   └── manager.html       # Manager dashboard
├── server.js              # Main Express server
├── package.json           # Dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (username/email/phone + password)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Tickets
- `POST /api/tickets` - Create ticket (Employee only)
- `GET /api/tickets/my` - Get my tickets (Employee only)
- `GET /api/tickets/queue` - Get open ticket queue (Agent only)
- `POST /api/tickets/:id/assign` - Assign ticket to self (Agent only)
- `PATCH /api/tickets/:id/status` - Update ticket status (Agent only)
- `GET /api/tickets/:id` - Get ticket details

### Statistics
- `GET /api/tickets/stats/overview` - Get system statistics (Manager only)

## Database Schema

### users table
- id (INTEGER, PRIMARY KEY)
- username (TEXT, UNIQUE)
- email (TEXT, UNIQUE)
- phone (TEXT, UNIQUE)
- password (TEXT)
- role (TEXT: employee/agent/manager)

### tickets table
- id (INTEGER, PRIMARY KEY)
- title (TEXT)
- category (TEXT: IT/HR/Facilities)
- description (TEXT)
- priority (TEXT: Low/Medium/High)
- status (TEXT: New/In Progress/Resolved/Closed)
- submitted_by (INTEGER, FK to users.id)
- assigned_to (INTEGER, FK to users.id)
- created_at (DATETIME)
- updated_at (DATETIME)

## License

ISC
