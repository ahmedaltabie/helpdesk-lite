document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const identifier = document.getElementById('identifier').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Redirect based on role
    switch (data.user.role) {
      case 'employee':
        window.location.href = '/employee';
        break;
      case 'agent':
        window.location.href = '/agent';
        break;
      case 'manager':
        window.location.href = '/manager';
        break;
      default:
        throw new Error('Unknown role');
    }
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.add('show');
    setTimeout(() => {
      errorDiv.classList.remove('show');
    }, 3000);
  }
});
