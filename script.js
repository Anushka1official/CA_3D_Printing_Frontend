// Load Operational Base settings from LocalStorage on startup
document.addEventListener("DOMContentLoaded", function() {
    const fields = ['P', 'rho', 'd_mm', 'R'];
    fields.forEach(field => {
        const savedValue = localStorage.getItem('ca_3d_' + field);
        if (savedValue) {
            document.getElementById(field).value = savedValue;
        }
    });
});

function calculatePrice() {
    // 1. Get Operational Inputs
    const P = parseFloat(document.getElementById('P').value);
    const rho = parseFloat(document.getElementById('rho').value);
    const d_mm = parseFloat(document.getElementById('d_mm').value);
    const R = parseFloat(document.getElementById('R').value);
    
    // Save these to memory
    localStorage.setItem('ca_3d_P', P);
    localStorage.setItem('ca_3d_rho', rho);
    localStorage.setItem('ca_3d_d_mm', d_mm);
    localStorage.setItem('ca_3d_R', R);

    // 2. Get Job Specific Inputs
    const T_min = parseFloat(document.getElementById('T_min').value);
    const L_m = parseFloat(document.getElementById('L_m').value);
    const M_pct = parseFloat(document.getElementById('M_pct').value);

    // Validation
    if ([P, rho, d_mm, R, T_min, L_m, M_pct].some(isNaN)) {
        alert("Please fill all fields with valid numbers.");
        return;
    }

    // 3. Conversions & Constants
    const T = T_min * 60;        // Min to Sec
    const L = L_m * 100;         // M to cm
    const d = d_mm / 10;         // mm to cm
    const M = M_pct / 100;       // % to decimal
    const W = 150;               // Power (Watts)
    const Cp = 140000;           // Printer Cost (Rs)
    const H = 2000;              // Lifetime (Hrs)
    const F = 0.1;               // Risk (10%)

    // 4. Formula Logic
    const Cm = (Math.PI * Math.pow(d, 2) / 4) * L * rho * (P / 1000);
    const Ce = (W * T / 3600000) * R;
    const Cd = (Cp / H) * (T / 3600);
    
    const Cbase = Cm + Ce + Cd;
    const Cfinal = (Cbase / (1 - F)) * (1 + M);

    // 5. Display Result
    document.getElementById('finalPrice').innerText = "Rs " + Cfinal.toLocaleString(undefined, {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
    });
}