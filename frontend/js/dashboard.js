const token = localStorage.getItem('token');

if (!token) {
  // não está logado
  window.location.href = 'login.html';
}

async function loadUser() {
  try {
    const response = await fetch('http://localhost:3000/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Token inválido');
    }

    const user = await response.json();

    document.getElementById('userInfo').textContent =
      `Olá, ${user.name} (${user.email})`;
  } catch (error) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
}

loadUser();

// logout
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});