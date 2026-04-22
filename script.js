// Your live Railway URL
const BACKEND_URL = "https://ca3dprintingbackend-production.up.railway.app"; 

// --- CUSTOMER FORM LOGIC (index.html) ---
const customerForm = document.getElementById('customerForm');
if (customerForm) {
    customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusDiv = document.getElementById('orderStatus');
        statusDiv.innerText = "Connecting to C & A Server...";

        const formData = new FormData();
        formData.append('modelFile', document.getElementById('modelFile').files[0]);
        formData.append('infill', document.getElementById('infill').value);
        formData.append('material', document.getElementById('material').value);
        formData.append('color', document.getElementById('color').value);

        try {
            const response = await fetch(`${BACKEND_URL}/api/orders`, {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                statusDiv.innerText = "Order successfully submitted!";
                customerForm.reset();
            } else {
                statusDiv.innerText = "Error: Could not submit order.";
            }
        } catch (error) {
            statusDiv.innerText = "Server connection failed.";
        }
    });
}

// --- ADMIN LOGIC (admin.html) ---
async function checkLogin() {
    const pass = document.getElementById('adminPassword').value;
    const loginBtn = document.querySelector('#loginSection button');
    
    loginBtn.innerText = "VERIFYING...";

    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });

        const data = await response.json();

        if (data.success) {
            // Password is correct: hide login, show setup manager, show dashboard
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('setupManagerSection').style.display = 'block'; 
            document.getElementById('calculatorSection').style.display = 'block';
            
            // Fetch the incoming orders automatically
            fetchOrders();
        } else {
            alert("Incorrect Password");
            loginBtn.innerText = "LOGIN";
        }
    } catch (error) {
        alert("Server error. Please check your connection.");
        loginBtn.innerText = "LOGIN";
    }
}

// --- FETCH AND DISPLAY CUSTOMER ORDERS ---
async function fetchOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = "<tr><td colspan='5' class='text-center text-muted'>Loading orders...</td></tr>";

    try {
        const response = await fetch(`${BACKEND_URL}/api/orders`);
        const orders = await response.json();

        tableBody.innerHTML = ""; // Clear loading text

        if (orders.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='5' class='text-center text-muted'>No orders yet.</td></tr>";
            return;
        }

        orders.forEach(order => {
            const date = new Date(order.orderDate).toLocaleDateString() + " " + new Date(order.orderDate).toLocaleTimeString();
            
            const row = document.createElement('tr');
            row.style.borderBottom = "1px solid #333";
            row.innerHTML = `
                <td class="py-3">${date}</td>
                <td class="py-3 fw-bold">${order.material}</td>
                <td class="py-3">${order.color}</td>
                <td class="py-3">${order.infill}%</td>
                <td class="py-3">
                    <a href="${order.fileUrl}" target="_blank" class="btn-ca-gold" style="padding: 4px 10px; font-size: 0.8rem; text-decoration: none;">Download File ↓</a>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        tableBody.innerHTML = "<tr><td colspan='5' class='text-center text-danger'>Failed to load orders.</td></tr>";
    }
}

// --- CALCULATOR LOGIC ---
function calculatePrice() {
    // Operational Base
    const P = parseFloat(document.getElementById('P').value);
    const rho = parseFloat(document.getElementById('rho').value);
    const d = parseFloat(document.getElementById('d_mm').value) / 10;
    const W = parseFloat(document.getElementById('W').value);
    const R = parseFloat(document.getElementById('R').value);
    const Cp = parseFloat(document.getElementById('Cp').value);
    const H = parseFloat(document.getElementById('H').value);
    const F = parseFloat(document.getElementById('F').value);
    
    // Job Specifics
    const T = parseFloat(document.getElementById('T_min').value) * 60;
    const L = parseFloat(document.getElementById('L_m').value) * 100;
    const M = parseFloat(document.getElementById('M_pct').value) / 100;

    if ([T, L, M].some(isNaN)) return alert("Please fill in all Job Specifics.");

    // Formulas
    const Cm = (Math.PI * Math.pow(d, 2) / 4) * L * rho * (P / 1000);
    const Ce = (W * T / 3600000) * R;
    const Cd = (Cp / H) * (T / 3600);
    
    const Cbase = Cm + Ce + Cd;
    const Cfinal = (Cbase / (1 - F)) * (1 + M);

    document.getElementById('finalPrice').innerText = "Rs " + Cfinal.toFixed(2);
}

// --- DESKTOP INSTALLER MANAGEMENT ---
async function uploadInstaller() {
    const fileInput = document.getElementById('installerFile');
    const statusDiv = document.getElementById('uploadStatus');
    
    if (!fileInput.files[0]) {
        statusDiv.innerText = "Please select an installer file first.";
        return;
    }
    
    statusDiv.innerText = "Uploading... please wait.";
    const formData = new FormData();
    formData.append('setupFile', fileInput.files[0]);

    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/installer`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            statusDiv.innerText = "Upload successful!";
            fileInput.value = ""; // Clear input after uploading
        } else {
            statusDiv.innerText = "Upload failed.";
        }
    } catch (error) {
        statusDiv.innerText = "Server connection error.";
    }
}

function downloadInstaller() {
    window.location.href = `${BACKEND_URL}/api/installer/download`;
}