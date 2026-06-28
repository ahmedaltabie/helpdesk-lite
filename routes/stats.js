const express = require('express');
const router = express.Router();
const { get, all } = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

// Get overall system statistics (Manager only)
router.get('/overview', authenticate, authorize('manager'), async (req, res) => {
  try {
    // Total tickets
    const totalTickets = await get('SELECT COUNT(*) as count FROM tickets');
    
    // Tickets by status
    const ticketsByStatus = await all(`
      SELECT status, COUNT(*) as count 
      FROM tickets 
      GROUP BY status
    `);

    // Tickets by priority
    const ticketsByPriority = await all(`
      SELECT priority, COUNT(*) as count 
      FROM tickets 
      GROUP BY priority
    `);

    // Tickets by category
    const ticketsByCategory = await all(`
      SELECT category, COUNT(*) as count 
      FROM tickets 
      GROUP BY category
    `);

    // Total users by role
    const usersByRole = await all(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);

    // Recent tickets (last 10)
    const recentTickets = await all(`
      SELECT t.*, 
        s.username as submitted_by_name,
        a.username as assigned_to_name
       FROM tickets t
       LEFT JOIN users s ON t.submitted_by = s.id
       LEFT JOIN users a ON t.assigned_to = a.id
       ORDER BY t.created_at DESC
       LIMIT 10
    `);

    // Tickets resolved in last 7 days
    const resolvedLast7Days = await get(`
      SELECT COUNT(*) as count 
      FROM tickets 
      WHERE status IN ('Resolved', 'Closed') 
      AND updated_at >= datetime('now', '-7 days')
    `);

    // Average resolution time (in hours)
    const avgResolutionTime = await get(`
      SELECT AVG(
        (julianday(updated_at) - julianday(created_at)) * 24
      ) as avg_hours
      FROM tickets 
      WHERE status IN ('Resolved', 'Closed')
    `);

    res.json({
      totalTickets: totalTickets.count,
      ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}),
      ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
        acc[item.priority] = item.count;
        return acc;
      }, {}),
      ticketsByCategory: ticketsByCategory.reduce((acc, item) => {
        acc[item.category] = item.count;
        return acc;
      }, {}),
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item.count;
        return acc;
      }, {}),
      recentTickets,
      resolvedLast7Days: resolvedLast7Days.count,
      avgResolutionTime: avgResolutionTime.avg_hours ? Math.round(avgResolutionTime.avg_hours * 100) / 100 : 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
