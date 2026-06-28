const { db, run, get, all } = require('./db');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    // Create users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('employee', 'agent', 'manager'))
      )
    `);
    console.log('Users table created or already exists');

    // Create tickets table
    await run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('IT', 'HR', 'Facilities')),
        description TEXT NOT NULL,
        priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')),
        status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'In Progress', 'Resolved', 'Closed')),
        submitted_by INTEGER NOT NULL,
        assigned_to INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submitted_by) REFERENCES users(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `);
    console.log('Tickets table created or already exists');

    // Check if users table is empty and seed data
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    
    if (userCount.count === 0) {
      console.log('Seeding default users...');
      
      // Hash passwords
      const ahmedPassword = await bcrypt.hash('ahmed123', 10);
      const agentPassword = await bcrypt.hash('agent123', 10);
      const managerPassword = await bcrypt.hash('manager123', 10);

      // Insert Employee
      await run(
        'INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['ahmed99', 'ahmed99@example.com', '1234567890', ahmedPassword, 'employee']
      );

      // Insert Agent
      await run(
        'INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['agent01', 'agent01@example.com', '1234567891', agentPassword, 'agent']
      );

      // Insert Manager
      await run(
        'INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['manager01', 'manager01@example.com', '1234567892', managerPassword, 'manager']
      );

      console.log('Default users seeded successfully');
      console.log('  - Employee: ahmed99 / ahmed123');
      console.log('  - Agent: agent01 / agent123');
      console.log('  - Manager: manager01 / manager123');
    } else {
      console.log('Users table already contains data, skipping seed');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = initializeDatabase;
