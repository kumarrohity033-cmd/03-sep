document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // Dynamically set the API URL based on the environment (local dev vs. production)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_URL = isLocal ? 'http://localhost:3000' : 'https://your-production-api-domain.com'; // <-- CHANGE THIS for production

    // --- Authentication Placeholder ---
    // CRITICAL: In a real app, this ID must come from a secure session or token
    // after the user logs in. It should NOT be hardcoded.
    const LOGGED_IN_TEACHER_ID = 1; 

    // --- DOM Elements ---
    const teacherStudentList = document.getElementById('teacher-student-list');
    const attendanceStudentList = document.getElementById('attendance-student-list');
    const testStudentList = document.getElementById('test-student-list');
    const attendanceForm = document.getElementById('attendance-form');
    const testForm = document.getElementById('test-form');

    // --- Helper Functions for DOM creation ---

    function createStudentListEntry(student) {
        const studentDiv = document.createElement('div');
        studentDiv.textContent = student.name;
        return studentDiv;
    }

    function createAttendanceListEntry(student) {
        const div = document.createElement('div');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        
        checkbox.type = 'checkbox';
        checkbox.name = 'attendance';
        checkbox.value = student.id;
        checkbox.checked = true;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${student.name}`));
        div.appendChild(label);
        return div;
    }

    function createTestListEntry(student) {
        const div = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = student.name;

        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'Marks';
        input.dataset.studentId = student.id;
        input.dataset.studentName = student.name; // More robust way to access name
        input.required = true;

        div.appendChild(label);
        div.appendChild(input);
        return div;
    }

    // Fetch and display teacher's students
    async function loadStudents() {
        try {
            const response = await fetch(`${API_URL}/students?teacherId=${LOGGED_IN_TEACHER_ID}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const students = await response.json();

            // Clear existing lists before populating
            teacherStudentList.innerHTML = '';
            attendanceStudentList.innerHTML = '';
            testStudentList.innerHTML = '';

            // Use DocumentFragments for better performance
            const teacherFragment = document.createDocumentFragment();
            const attendanceFragment = document.createDocumentFragment();
            const testFragment = document.createDocumentFragment();

            students.forEach(student => {
                teacherFragment.appendChild(createStudentListEntry(student));
                attendanceFragment.appendChild(createAttendanceListEntry(student));
                testFragment.appendChild(createTestListEntry(student));
            });

            // Append fragments to the DOM once
            teacherStudentList.appendChild(teacherFragment);
            attendanceStudentList.appendChild(attendanceFragment);
            testStudentList.appendChild(testFragment);

        } catch (error) {
            console.error('Error loading students:', error);
            teacherStudentList.textContent = 'Failed to load students. Please refresh the page.';
        }
    }

    // Generic function to POST data to the API
    async function postData(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Failed to save data. Server responded with ${response.status}`);
        }
        return response;
    }

    // Handle attendance form submission
    attendanceForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const date = document.getElementById('attendance-date').value;
        const presentStudentIds = Array.from(document.querySelectorAll('input[name="attendance"]:checked'))
            .map(input => parseInt(input.value, 10));

        if (!date) {
            alert('Please select a date before submitting attendance.');
            return; // Stop the function execution
        }

        const submitButton = attendanceForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            await postData(`${API_URL}/attendance`, {
                teacherId: LOGGED_IN_TEACHER_ID,
                date,
                presentStudentIds,
            });
            alert('Attendance saved!');
            attendanceForm.reset();
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert(error.message);
        } finally {
            submitButton.disabled = false;
        }
    });

    // Handle test form submission
    testForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const testName = document.getElementById('test-name').value;
        const results = [];

        const submitButton = testForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            const markInputs = testStudentList.querySelectorAll('input[type="number"]');
            for (const input of markInputs) {
                const marks = parseInt(input.value, 10);
                if (isNaN(marks)) {
                    // Provide specific feedback to the user
                    const studentName = input.dataset.studentName; // Use the robust data attribute
                    throw new Error(`Invalid or missing marks for '${studentName}'. Please enter a number.`);
                }
                results.push({
                    studentId: parseInt(input.dataset.studentId, 10),
                    marks: marks,
                });
            }

            await postData(`${API_URL}/tests`, {
                teacherId: LOGGED_IN_TEACHER_ID,
                testName,
                results,
            });
            alert('Test results saved!');
            testForm.reset();
        } catch (error) {
            console.error('Error saving test results:', error);
            alert(error.message);
        } finally {
            submitButton.disabled = false;
        }
    });

    loadStudents();
});
