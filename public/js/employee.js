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

// Create ticket
document.getElementById('createTicketForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value;
  const priority = document.getElementById('priority').value;
  const description = document.getElementById('description').value;
  
  const successDiv = document.getElementById('success');
  const errorDiv = document.getElementById('error');
  
  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, category, priority, description })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create ticket');
    }
    
    successDiv.textContent = 'Ticket created successfully!';
    successDiv.classList.add('show');
    setTimeout(() => successDiv.classList.remove('show'), 3000);
    
    // Reset form
    document.getElementById('createTicketForm').reset();
    
    // Reload tickets
    loadMyTickets();
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.add('show');
    setTimeout(() => errorDiv.classList.remove('show'), 3000);
  }
});

// Load my tickets
async function loadMyTickets() {
  const ticketsList = document.getElementById('ticketsList');
  
  try {
    const response = await fetch('/api/tickets/my');
    const tickets = await response.json();
    
    if (tickets.length === 0) {
      ticketsList.innerHTML = '<p>No tickets submitted yet.</p>';
      return;
    }
    
    ticketsList.innerHTML = tickets.map(ticket => `
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
          <span><strong>Submitted:</strong> ${new Date(ticket.created_at).toLocaleString()}</span>
          ${ticket.assigned_to_name ? `<span><strong>Assigned to:</strong> ${ticket.assigned_to_name}</span>` : ''}
        </div>
        <p class="ticket-description">${escapeHtml(ticket.description)}</p>
      </div>
    `).join('');
  } catch (error) {
    ticketsList.innerHTML = '<p>Failed to load tickets.</p>';
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
loadMyTickets();
