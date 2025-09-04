document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('student-form');
    const studentList = document.getElementById('student-list');
    const studentTeacherSelect = document.getElementById('student-teacher');

    const teacherForm = document.getElementById('teacher-form');
    const teacherList = document.getElementById('teacher-list');

    const apiUrl = 'http://localhost:3000';

    // Fetch and display teachers
    async function loadTeachers() {
        try {
            const response = await fetch(`${apiUrl}/teachers`);
            const teachers = await response.json();

            teacherList.innerHTML = '<h4>Teachers</h4>';
            studentTeacherSelect.innerHTML = '';

            teachers.forEach(teacher => {
                const teacherDiv = document.createElement('div');
                teacherDiv.innerHTML = `
                    <span>${teacher.name} (${teacher.username})</span>
                    <button onclick="editTeacher(${teacher.id})">Edit</button>
                    <button onclick="deleteTeacher(${teacher.id})">Delete</button>
                `;
                teacherList.appendChild(teacherDiv);

                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = teacher.name;
                studentTeacherSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading teachers:', error);
        }
    }

    // Fetch and display students
    async function loadStudents() {
        try {
            const response = await fetch(`${apiUrl}/students`);
            const students = await response.json();

            studentList.innerHTML = '<h4>Students</h4>';
            students.forEach(student => {
                const studentDiv = document.createElement('div');
                studentDiv.innerHTML = `
                    <span>${student.name}</span>
                    <button onclick="editStudent(${student.id})">Edit</button>
                    <button onclick="deleteStudent(${student.id})">Delete</button>
                `;
                studentList.appendChild(studentDiv);
            });
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    // Handle teacher form submission
    teacherForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('teacher-id').value;
        const name = document.getElementById('teacher-name').value;
        const username = document.getElementById('teacher-username').value;
        const password = document.getElementById('teacher-password').value;

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/teachers/${id}` : `${apiUrl}/teachers`;

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, password }),
            });
            teacherForm.reset();
            loadTeachers();
        } catch (error) {
            console.error('Error saving teacher:', error);
        }
    });

    // Handle student form submission
    studentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('student-id').value;
        const name = document.getElementById('student-name').value;
        const teacherId = parseInt(studentTeacherSelect.value, 10);

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/students/${id}` : `${apiUrl}/students`;

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, teacherId }),
            });
            studentForm.reset();
            loadStudents();
        } catch (error) {
            console.error('Error saving student:', error);
        }
    });

    // Edit teacher
    window.editTeacher = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/teachers/${id}`);
            const teacher = await response.json();
            document.getElementById('teacher-id').value = teacher.id;
            document.getElementById('teacher-name').value = teacher.name;
            document.getElementById('teacher-username').value = teacher.username;
            document.getElementById('teacher-password').value = teacher.password;
        } catch (error) {
            console.error('Error fetching teacher:', error);
        }
    };

    // Delete teacher
    window.deleteTeacher = async (id) => {
        try {
            await fetch(`${apiUrl}/teachers/${id}`, { method: 'DELETE' });
            loadTeachers();
        } catch (error) {
            console.error('Error deleting teacher:', error);
        }
    };

    // Edit student
    window.editStudent = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/students/${id}`);
            const student = await response.json();
            document.getElementById('student-id').value = student.id;
            document.getElementById('student-name').value = student.name;
            studentTeacherSelect.value = student.teacherId;
        } catch (error) {
            console.error('Error fetching student:', error);
        }
    };

    // Delete student
    window.deleteStudent = async (id) => {
        try {
            await fetch(`${apiUrl}/students/${id}`, { method: 'DELETE' });
            loadStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    loadTeachers();
    loadStudents();
});
