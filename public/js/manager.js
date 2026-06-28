// Check authentication and redirect if not logged in
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      window.location.href = '/';
      return null;
    }
    return await response.json();
  } catch (error) {
    window.location.href = '/';
    return null;
  }
}

// Display user info
async function loadUserInfo() {
  const user = await checkAuth();
  if (user) {
    document.getElementById('username').textContent = user.username;
  }
}

// Load statistics
async function loadStats() {
  try {
    const response = await fetch('/api/tickets/stats/overview');
    const stats = await response.json();
    
    // Update stat cards
    document.getElementById('totalTickets').textContent = stats.totalTickets;
    document.getElementById('resolvedLast7Days').textContent = stats.resolvedLast7Days;
    document.getElementById('avgResolutionTime').textContent = `${stats.avgResolutionTime}h`;
    
    // Update status stats
    const statusStats = document.getElementById('statusStats');
    statusStats.innerHTML = Object.entries(stats.ticketsByStatus).map(([status, count]) => `
      <div class="stat-item">
        <span class="stat-item-label">${status}</span>
        <span class="stat-item-value">${count}</span>
      </div>
    `).join('');
    
    // Update priority stats
    const priorityStats = document.getElementById('priorityStats');
    priorityStats.innerHTML = Object.entries(stats.ticketsByPriority).map(([priority, count]) => `
      <div class="stat-item">
        <span class="stat-item-label">${priority}</span>
        <span class="stat-item-value">${count}</span>
      </div>
    `).join('');
    
    // Update category stats
    const categoryStats = document.getElementById('categoryStats');
    categoryStats.innerHTML = Object.entries(stats.ticketsByCategory).map(([category, count]) => `
      <div class="stat-item">
        <span class="stat-item-label">${category}</span>
        <span class="stat-item-value">${count}</span>
      </div>
    `).join('');
    
    // Update role stats
    const roleStats = document.getElementById('roleStats');
    roleStats.innerHTML = Object.entries(stats.usersByRole).map(([role, count]) => `
      <div class="stat-item">
        <span class="stat-item-label">${role}</span>
        <span class="stat-item-value">${count}</span>
      </div>
    `).join('');
    
    // Update recent tickets
    const recentTickets = document.getElementById('recentTickets');
    if (stats.recentTickets.length === 0) {
      recentTickets.innerHTML = '<p>No tickets yet.</p>';
    } else {
      recentTickets.innerHTML = stats.recentTickets.map(ticket => `
        <div class="ticket-card priority-${ticket.priority}">
          <div class="ticket-header">
            <span class="ticket-title">${escapeHtml(ticket.title)}</span>
            <span class="badge badge-${ticket.status.replace(' ', '-')}">${ticket.status}</span>
          </div>
          <div class="ticket-meta">
            <span><strong>Category:</strong> ${ticket.category}</span>
            <span><strong>Priority:</strong> ${ticket.priority}</span>
          </div>
          <div class="ticket-meta">
            <span><strong>Submitted by:</strong> ${ticket.submitted_by_name}</span>
            <span><strong>Created:</strong> ${new Date(ticket.created_at).toLocaleString()}</span>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
    document.getElementById('error').textContent = 'Failed to load statistics';
    document.getElementById('error').classList.add('show');
    setTimeout(() => document.getElementById('error').classList.remove('show'), 3000);
  }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
});

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
loadUserInfo();
loadStats();

// Auto-refresh stats every 30 seconds
setInterval(loadStats, 30000);
