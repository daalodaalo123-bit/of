const API_BASE = 'http://localhost:3000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setupNavigation();
    loadDashboard();
    loadPatients();
    loadAppointments();
    setupCalendar();
});

// Check backend status
async function checkStatus() {
    try {
        const response = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            document.querySelector('.status-dot').classList.add('online');
            document.querySelector('.status-indicator span:last-child').textContent = 'System Online';
        }
    } catch (error) {
        console.error('Status check failed:', error);
    }
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            switchTab(tab);
            
            // Update active state
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        patients: 'Patient Management',
        appointments: 'Appointment Management'
    };
    document.querySelector('.page-title').textContent = titles[tabName] || 'Dashboard';
    
    // Load data for the tab
    if (tabName === 'dashboard') loadDashboard();
    if (tabName === 'patients') loadPatients();
    if (tabName === 'appointments') loadAppointments();
}

// Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const stats = await response.json();
        
        document.getElementById('stat-patients').textContent = stats.patientCount || 0;
        document.getElementById('stat-appointments').textContent = stats.appointmentCount || 0;
        document.getElementById('stat-today').textContent = stats.todayAppointments || 0;
        document.getElementById('stat-revenue').textContent = `$${(stats.totalRevenue || 0).toLocaleString()}`;
        
        // Load today's appointments
        await loadTodayAppointments();
    } catch (error) {
        console.error('Dashboard error:', error);
        document.getElementById('stat-patients').textContent = '0';
        document.getElementById('stat-appointments').textContent = '0';
        document.getElementById('stat-today').textContent = '0';
    }
}

async function loadTodayAppointments() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_BASE}/appointments?date=${today}`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const appointments = await response.json();
        const scheduled = appointments.filter(a => a.status === 'scheduled');
        
        const container = document.getElementById('today-appointments-list');
        if (scheduled.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><h3>No appointments today</h3><p>All clear!</p></div>';
        } else {
            container.innerHTML = scheduled.map(apt => `
                <div class="appointment-item">
                    <div class="appointment-info">
                        <h3>${apt.patientName}</h3>
                        <p><i class="fas fa-clock"></i> ${new Date(apt.appointmentDate).toLocaleTimeString()} - ${apt.timeSlot}</p>
                    </div>
                    <span class="status-badge ${apt.status}">${apt.status}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Today appointments error:', error);
    }
}

// Patients
let allPatients = [];

async function loadPatients() {
    try {
        const response = await fetch(`${API_BASE}/patients`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        allPatients = await response.json();
        displayPatients(allPatients);
    } catch (error) {
        console.error('Patients error:', error);
        document.getElementById('patients-list').innerHTML = 
            '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Error loading patients</h3><p>' + error.message + '</p></div>';
    }
}

function displayPatients(patients) {
    const container = document.getElementById('patients-list');
    
    if (patients.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><h3>No patients yet</h3><p>Add your first patient to get started</p></div>';
        return;
    }
    
    container.innerHTML = patients.map(patient => `
        <div class="patient-card">
            <div class="patient-header">
                <div class="patient-avatar">${patient.name.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="patient-name">${patient.name}</div>
                    <div class="patient-info">${patient.email}</div>
                </div>
            </div>
            <div class="patient-details">
                <div class="patient-detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${patient.phone}</span>
                </div>
                <div class="patient-detail-item">
                    <i class="fas fa-venus-mars"></i>
                    <span>${patient.gender}</span>
                </div>
                <div class="patient-detail-item">
                    <i class="fas fa-birthday-cake"></i>
                    <span>${new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
                ${patient.allergies ? `
                <div class="patient-detail-item">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Allergies: ${patient.allergies}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function filterPatients() {
    const search = document.getElementById('patient-search').value.toLowerCase();
    const filtered = allPatients.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search) ||
        p.phone.includes(search)
    );
    displayPatients(filtered);
}

// Patient Modal
function openPatientModal() {
    document.getElementById('patient-modal').classList.add('active');
    document.getElementById('patient-form').reset();
    document.getElementById('patient-modal-title').textContent = 'Add New Patient';
}

function closePatientModal() {
    document.getElementById('patient-modal').classList.remove('active');
}

async function savePatient(event) {
    event.preventDefault();
    
    const patient = {
        id: 'patient-' + Date.now(),
        name: document.getElementById('patient-name').value,
        email: document.getElementById('patient-email').value,
        phone: document.getElementById('patient-phone').value,
        dateOfBirth: new Date(document.getElementById('patient-dob').value).toISOString(),
        gender: document.getElementById('patient-gender').value,
        address: document.getElementById('patient-address').value,
        medicalHistory: document.getElementById('patient-history').value || null,
        allergies: document.getElementById('patient-allergies').value || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE}/patients`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient)
        });
        
        if (!response.ok) throw new Error('Failed to save patient');
        
        closePatientModal();
        loadPatients();
        loadDashboard();
        
        // Show success message
        showNotification('Patient added successfully!', 'success');
    } catch (error) {
        console.error('Save patient error:', error);
        showNotification('Error saving patient: ' + error.message, 'error');
    }
}

// Appointments
let allAppointments = [];
let currentDate = new Date();

async function loadAppointments() {
    try {
        const response = await fetch(`${API_BASE}/appointments`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        allAppointments = await response.json();
        displayAppointments(allAppointments);
        updateCalendar();
    } catch (error) {
        console.error('Appointments error:', error);
        document.getElementById('appointments-list').innerHTML = 
            '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Error loading appointments</h3><p>' + error.message + '</p></div>';
    }
}

function displayAppointments(appointments) {
    const container = document.getElementById('appointments-list');
    
    if (appointments.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><h3>No appointments yet</h3><p>Schedule your first appointment</p></div>';
        return;
    }
    
    const sorted = appointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    
    container.innerHTML = sorted.map(apt => `
        <div class="appointment-item">
            <div class="appointment-info">
                <h3>${apt.patientName}</h3>
                <p><i class="fas fa-calendar"></i> ${new Date(apt.appointmentDate).toLocaleDateString()} at ${apt.timeSlot}</p>
                ${apt.treatmentType ? `<p><i class="fas fa-stethoscope"></i> ${apt.treatmentType}</p>` : ''}
            </div>
            <span class="status-badge ${apt.status}">${apt.status}</span>
        </div>
    `).join('');
}

// Calendar
function setupCalendar() {
    updateCalendar();
}

function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('current-month').textContent = 
        currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const container = document.getElementById('calendar-grid');
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let html = dayNames.map(name => `<div class="calendar-day-header">${name}</div>`).join('');
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="calendar-day"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasAppointments = allAppointments.some(apt => {
            const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
            return aptDate === dateStr;
        });
        
        html += `<div class="calendar-day ${hasAppointments ? 'has-appointments' : ''}" onclick="viewDayAppointments('${dateStr}')">
            ${day}
        </div>`;
    }
    
    container.innerHTML = html;
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    updateCalendar();
}

function viewDayAppointments(dateStr) {
    const dayAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
        return aptDate === dateStr;
    });
    
    if (dayAppointments.length > 0) {
        alert(`${dayAppointments.length} appointment(s) on ${new Date(dateStr).toLocaleDateString()}`);
    }
}

// Appointment Modal
function openAppointmentModal() {
    document.getElementById('appointment-modal').classList.add('active');
    document.getElementById('appointment-form').reset();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointment-date').value = today;
}

function closeAppointmentModal() {
    document.getElementById('appointment-modal').classList.remove('active');
}

async function saveAppointment(event) {
    event.preventDefault();
    
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const dateTime = new Date(`${date}T${time}`);
    
    const appointment = {
        id: 'apt-' + Date.now(),
        patientId: document.getElementById('appointment-patient-id').value,
        patientName: document.getElementById('appointment-patient-name').value,
        appointmentDate: dateTime.toISOString(),
        timeSlot: document.getElementById('appointment-time-slot').value,
        status: document.getElementById('appointment-status').value,
        treatmentType: document.getElementById('appointment-treatment').value || null,
        notes: document.getElementById('appointment-notes').value || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE}/appointments`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment)
        });
        
        if (!response.ok) throw new Error('Failed to save appointment');
        
        closeAppointmentModal();
        loadAppointments();
        loadDashboard();
        
        showNotification('Appointment scheduled successfully!', 'success');
    } catch (error) {
        console.error('Save appointment error:', error);
        showNotification('Error scheduling appointment: ' + error.message, 'error');
    }
}

// Notifications
function showNotification(message, type = 'info') {
    // Simple alert for now - can be enhanced with a toast library
    alert(message);
}

// Close modals on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
