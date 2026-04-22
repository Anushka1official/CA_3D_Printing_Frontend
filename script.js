// Change this to your live Railway URL
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
function checkLogin() {
    const pass = document.getElementById('adminPassword').value;
    // Set your admin password here
    if (pass === "admin123") {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('calculatorSection').style.display = 'block';
    } else {
        alert("Incorrect Password");
    }
}

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