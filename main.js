/* main.js */

// --- 1. SIDEBAR NAVIGATION ---
function toggleSidebar() {
    const menu = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
    } else {
        menu.classList.add('active');
        overlay.classList.add('active');
    }
}
// Close sidebar if user clicks the blurred overlay
if(document.getElementById('sidebarOverlay')){
    document.getElementById('sidebarOverlay').addEventListener('click', toggleSidebar);
}


// --- 2. CART LOGIC (Global Helpers) ---
function addToCart(productName, price) {
    // In a real app, you would save this to LocalStorage or a Database
    // Here we simulate the visual feedback
    
    // 1. Update Badge
    const badge = document.querySelector('.cart-count');
    let currentCount = parseInt(badge.innerText);
    badge.innerText = currentCount + 1;
    
    // 2. Show Premium 'Toast' Alert
    alert("✓ " + productName + " added to your bag!");
}

// Logic for Cart Page (Recalculation)
// Note: The specific row removal logic is often inline in cart.html 
// to easily access the 'this' context of the button clicked.
function recalcCartGlobal() {
    // This function is called by the inline scripts in cart.html
    let total = 0;
    const rows = document.querySelectorAll('.cart-row');
    
    rows.forEach(row => {
        const price = parseInt(row.querySelector('.price').dataset.price);
        const qty = row.querySelector('.qty-input').value;
        total += (price * qty);
    });

    const subtotalEl = document.getElementById('cartSubtotal');
    if(subtotalEl) {
        subtotalEl.innerText = "Rs. " + total.toLocaleString();
    }
    
    // Update Badge to match row count
    const badge = document.querySelector('.cart-count');
    if(badge) badge.innerText = rows.length;
}


// --- 3. CATEGORY PAGE LOADER ---
// Reads URL (category.html?type=Watches) and updates the page title
function loadCategory() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    
    if(type) {
        const titleEl = document.getElementById('catTitle');
        if(titleEl) {
            titleEl.innerText = type + " Collection";
            document.title = type + " | Gift Wallay";
        }
    }
}


// --- 4. CHECKOUT LOGIC (Tax & COD) ---
const SHIPPING_COST = 250;

function handlePaymentSelection(type, subtotalAmount) {
    const taxRow = document.getElementById('taxRow');
    const warning = document.getElementById('codWarning');
    const taxEl = document.getElementById('taxAmount');
    const finalTotalEl = document.getElementById('finalTotal');
    
    // Base Calculation
    let total = subtotalAmount + SHIPPING_COST;
    
    if(type === 'cod') {
        // Active COD Logic
        warning.style.display = 'block';
        taxRow.style.display = 'flex';
        taxRow.classList.add('active');
        
        // 9% Tax Calculation
        const tax = Math.round(subtotalAmount * 0.09);
        taxEl.innerText = "Rs. " + tax.toLocaleString();
        
        // Update Final Total
        total += tax;
        finalTotalEl.innerText = "Rs. " + total.toLocaleString();
        
    } else {
        // Online Payment Logic
        warning.style.display = 'none';
        taxRow.style.display = 'none';
        taxRow.classList.remove('active');
        
        // Reset Total
        finalTotalEl.innerText = "Rs. " + total.toLocaleString();
    }
}


// --- 5. AUTHENTICATION (Login/Logout Simulation) ---

// Called from account.html login form
function loginSim() {
    // Redirect to home with a success flag
    window.location.href = "index.html?login=success";
}

// Called from account.html dashboard
function logoutSim() {
    window.location.reload();
}

// Check for Login Success (Runs on index.html)
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
        // Remove the param from URL to clean it up
        window.history.replaceState({}, document.title, "index.html");
        
        // Show Welcome Message
        setTimeout(() => {
            alert("✓ Login Successful!\nWelcome back to Gift Wallay.");
        }, 500);
    }
});
