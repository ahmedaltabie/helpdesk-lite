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

// Load ticket queue
async function loadTicketQueue() {
  const ticketsQueue = document.getElementById('ticketsQueue');
  
  try {
    const response = await fetch('/api/tickets/queue');
    const tickets = await response.json();
    
    if (tickets.length === 0) {
      ticketsQueue.innerHTML = '<p>No open tickets in queue.</p>';
      return;
    }
    
    ticketsQueue.innerHTML = tickets.map(ticket => `
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
        <p class="ticket-description">${escapeHtml(ticket.description)}</p>
        ${!ticket.assigned_to ? `
          <div class="ticket-actions">
            <button class="btn btn-primary btn-sm" onclick="assignTicket(${ticket.id})">Assign to Me</button>
          </div>
        ` : ''}
      </div>
    `).join('');
  } catch (error) {
    ticketsQueue.innerHTML = '<p>Failed to load ticket queue.</p>';
  }
}

// Load assigned tickets
async function loadAssignedTickets() {
  const assignedTickets = document.getElementById('assignedTickets');
  
  try {
    const response = await fetch('/api/tickets/queue');
    const tickets = await response.json();
    
    // Filter tickets assigned to current user
    const myAssigned = tickets.filter(t => t.assigned_to_name === document.getElementById('username').textContent);
    
    if (myAssigned.length === 0) {
      assignedTickets.innerHTML = '<p>No tickets assigned to you.</p>';
      return;
    }
    
    assignedTickets.innerHTML = myAssigned.map(ticket => `
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
        <p class="ticket-description">${escapeHtml(ticket.description)}</p>
        <div class="ticket-actions">
          ${ticket.status !== 'Resolved' && ticket.status !== 'Closed' ? `
            <button class="btn btn-success btn-sm" onclick="updateStatus(${ticket.id}, 'Resolved')">Mark Resolved</button>
            <button class="btn btn-danger btn-sm" onclick="updateStatus(${ticket.id}, 'Closed')">Close Ticket</button>
          ` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    assignedTickets.innerHTML = '<p>Failed to load assigned tickets.</p>';
  }
}

// Assign ticket to self
async function assignTicket(ticketId) {
  const successDiv = document.getElementById('success');
  const errorDiv = document.getElementById('error');
  
  try {
    const response = await fetch(`/api/tickets/${ticketId}/assign`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to assign ticket');
    }
    
    successDiv.textContent = 'Ticket assigned successfully!';
    successDiv.classList.add('show');
    setTimeout(() => successDiv.classList.remove('show'), 3000);
    
    // Reload both lists
    loadTicketQueue();
    loadAssignedTickets();
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.add('show');
    setTimeout(() => errorDiv.classList.remove('show'), 3000);
  }
}

// Update ticket status
async function updateStatus(ticketId, status) {
  const successDiv = document.getElementById('success');
  const errorDiv = document.getElementById('error');
  
  try {
    const response = await fetch(`/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update status');
    }
    
    successDiv.textContent = `Ticket marked as ${status}!`;
    successDiv.classList.add('show');
    setTimeout(() => successDiv.classList.remove('show'), 3000);
    
    // Reload both lists
    loadTicketQueue();
    loadAssignedTickets();
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.add('show');
    setTimeout(() => errorDiv.classList.remove('show'), 3000);
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
loadTicketQueue();
loadAssignedTickets();
