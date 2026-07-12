/* main.js */

// 1. Simple Cart System using LocalStorage
let cart = JSON.parse(localStorage.getItem('gw-cart')) || [];

function addToCart(productName, price) {
    cart.push({ name: productName, price: price });
    localStorage.setItem('gw-cart', JSON.stringify(cart));
    updateCartCount();
    showPopup('Added to Cart', `${productName} is now in your bag.`);
}

function updateCartCount() {
    const count = document.querySelectorAll('.cart-count');
    count.forEach(el => el.textContent = `(${cart.length})`);
}

// 2. Global Popup System
function showPopup(title, message) {
    const overlay = document.getElementById('globalPopup');
    const titleEl = document.getElementById('popupTitle');
    const msgEl = document.getElementById('popupMessage');
    
    titleEl.textContent = title;
    msgEl.textContent = message;
    overlay.style.display = 'flex';
}

function closePopup() {
    document.getElementById('globalPopup').style.display = 'none';
}

// 3. Tab System (For Account/Admin pages)
function openTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => c.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
}

// Initialize
document.addEventListener('DOMContentLoaded', updateCartCount);
