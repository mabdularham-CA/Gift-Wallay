// main.js

// 1. Sidebar Toggle
function toggleMenu() {
    const menu = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
}

// 2. Cart: Delete Item Simulation
function deleteItem(btn) {
    if(confirm("Remove this item from cart?")) {
        // Remove the row
        const row = btn.closest('tr');
        row.remove();
        // Update Subtotal (Simulation)
        updateCartTotal(); 
    }
}

function updateCartTotal() {
    // This is a visual simulation for the prototype
    // In a real app, you would loop through rows and recalculate
    alert("Item removed. Total updated (Simulated).");
}

// 3. Checkout: COD Logic (9% Tax + 50% Advance)
function togglePaymentMethod(method) {
    const taxRow = document.getElementById('taxRow');
    const advanceMsg = document.getElementById('advanceMsg');
    const totalDisplay = document.getElementById('finalTotal');
    
    // Base amount (Hardcoded for prototype example)
    let baseTotal = 17550; 

    if (method === 'cod') {
        // Show Tax & Warning
        taxRow.style.display = 'flex';
        advanceMsg.style.display = 'block';
        
        // Calculate 9% Tax
        let tax = baseTotal * 0.09;
        let final = baseTotal + tax;
        
        totalDisplay.innerText = "Rs. " + final.toLocaleString();
        document.getElementById('taxAmount').innerText = "Rs. " + tax.toLocaleString();
        
    } else {
        // Hide Tax & Warning
        taxRow.style.display = 'none';
        advanceMsg.style.display = 'none';
        
        // Revert Total
        totalDisplay.innerText = "Rs. " + baseTotal.toLocaleString();
    }
}
