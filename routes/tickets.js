const express = require('express');
const router = express.Router();
const { get, run, all } = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new ticket (Employee only)
router.post('/', authenticate, authorize('employee'), async (req, res) => {
  try {
    const { title, category, description, priority } = req.body;

    if (!title || !category || !description || !priority) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['IT', 'HR', 'Facilities'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (!['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const result = await run(
      `INSERT INTO tickets (title, category, description, priority, submitted_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, category, description, priority, req.session.userId]
    );

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: result.id
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get my submitted tickets (Employee only)
router.get('/my', authenticate, authorize('employee'), async (req, res) => {
  try {
    const tickets = await all(
      `SELECT t.*, 
        s.username as submitted_by_name,
        a.username as assigned_to_name
       FROM tickets t
       LEFT JOIN users s ON t.submitted_by = s.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.submitted_by = ?
       ORDER BY t.created_at DESC`,
      [req.session.userId]
    );

    res.json(tickets);
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// Get open tickets queue (Agent only) - ordered by priority
router.get('/queue', authenticate, authorize('agent'), async (req, res) => {
  try {
    const tickets = await all(
      `SELECT t.*, 
        s.username as submitted_by_name,
        a.username as assigned_to_name
       FROM tickets t
       LEFT JOIN users s ON t.submitted_by = s.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.status IN ('New', 'In Progress')
       ORDER BY 
         CASE t.priority 
           WHEN 'High' THEN 1 
           WHEN 'Medium' THEN 2 
           WHEN 'Low' THEN 3 
         END,
         t.created_at ASC`
    );

    res.json(tickets);
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ error: 'Failed to get ticket queue' });
  }
});

// Assign ticket to self (Agent only)
router.post('/:id/assign', authenticate, authorize('agent'), async (req, res) => {
  try {
    const ticketId = req.params.id;

    // Check if ticket exists and is not already assigned
    const ticket = await get(
      'SELECT * FROM tickets WHERE id = ?',
      [ticketId]
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.assigned_to) {
      return res.status(400).json({ error: 'Ticket is already assigned' });
    }

    // Assign ticket to current agent and update status to 'In Progress'
    await run(
      `UPDATE tickets 
       SET assigned_to = ?, status = 'In Progress', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [req.session.userId, ticketId]
    );

    res.json({ message: 'Ticket assigned successfully' });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

// Update ticket status (Agent only)
router.patch('/:id/status', authenticate, authorize('agent'), async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!['In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if ticket exists
    const ticket = await get(
      'SELECT * FROM tickets WHERE id = ?',
      [ticketId]
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket status
    await run(
      `UPDATE tickets 
       SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, ticketId]
    );

    res.json({ message: 'Ticket status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Get all tickets (for managers and agents to view details)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await get(
      `SELECT t.*, 
        s.username as submitted_by_name,
        a.username as assigned_to_name
       FROM tickets t
       LEFT JOIN users s ON t.submitted_by = s.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Employees can only view their own tickets
    if (req.session.userRole === 'employee' && ticket.submitted_by !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

module.exports = router;
