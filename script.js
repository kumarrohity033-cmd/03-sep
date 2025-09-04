document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;
    const role = event.target.role.value;

    let url;
    if (role === 'principal') {
        url = 'http://localhost:3000/principals';
    } else {
        url = 'http://localhost:3000/teachers';
    }

    try {
        const response = await fetch(url);
        const users = await response.json();

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            if (role === 'principal') {
                window.location.href = 'principal.html';
            } else {
                window.location.href = 'teacher.html';
            }
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
