// Mock Product Dataset replicating Chromaplate items
const products = [
    { id: 1, title: "Dualview Future Art", price: 5999, img: "https://unsplash.com" },
    { id: 2, title: "The Dark Knight Portrait", price: 5799, img: "https://unsplash.com" },
    { id: 3, title: "Anime Cyberpunk Edition", price: 6119, img: "https://unsplash.com" },
    { id: 4, title: "Arabic Metallic Calligraphy", price: 7799, img: "https://unsplash.com" }
];

// App Shopping Cart State Variable
let cart = [];

// SPA Routing Controller Engine
function navigateTo(page, productId = null) {
    const container = document.getElementById("view-container");
    window.scrollTo(0,0);
    
    if (page === 'home') {
        container.innerHTML = `
            <section class="hero">
                <h1>Revolutionary <span class="text-gold">Metal Posters</span></h1>
                <p>Ultra-thin 0.5mm structural art panels anchored securely using damage-free magnetic walls.</p>
                <button class="btn-gold" onclick="navigateTo('shop')">Explore Collections</button>
            </section>
            <h2 class="section-title">Trending Plates</h2>
            <div class="grid" id="featured-grid"></div>
        `;
        renderGrid("featured-grid", products.slice(0, 2));
        
    } else if (page === 'shop') {
        container.innerHTML = `
            <h2 class="section-title">All Metal Art Catalog</h2>
            <div class="grid" id="shop-grid"></div>
        `;
        renderGrid("shop-grid", products);
        
    } else if (page === 'detail' && productId) {
        const item = products.find(p => p.id === parseInt(productId));
        container.innerHTML = `
            <div class="detail-container">
                <img src="${item.img}" class="detail-img" alt="${item.title}">
                <div class="detail-info">
                    <h2>${item.title}</h2>
                    <div class="price">Rs. ${item.price.toLocaleString()}</div>
                    <p>Experience ultra high-definition manufacturing. Every Chromaplate clone panel features dynamic, scratchproof deep color prints layer engineered right over solid base steel plate matrix sheets.</p>
                    <button class="btn-gold" onclick="addToCart(${item.id})">Add To Cart</button>
                </div>
            </div>
        `;
        
    } else if (page === 'custom') {
        container.innerHTML = `
            <div class="custom-box">
                <h2>Design Your Custom Chromaplate</h2>
                <p style="color:#aaa; margin: 10px 0 20px;">Upload crisp images or artwork. We convert them into a luxury steel design statement.</p>
                <input type="file" id="upload-file" accept="image/*"><br>
                <button class="btn-gold" onclick="alert('Image asset uploaded successfully into temporary production engine!')">Initialize Processing</button>
            </div>
        `;
        
    } else if (page === 'cart') {
        if(cart.length === 0) {
            container.innerHTML = `<div class="cart-container"><h2 class="section-title">Your Cart is Empty</h2></div>`;
            return;
        }
        let total = cart.reduce((sum, item) => sum + item.price, 0);
        let itemsHtml = cart.map(item => `
            <div class="cart-item">
                <div>
                    <h4>${item.title}</h4>
                    <small class="text-gold">Rs. ${item.price.toLocaleString()}</small>
                </div>
                <button class="btn-gold" style="padding:5px 10px;" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="cart-container">
                <h2>Your Shopping Cart Order Summary</h2>
                ${itemsHtml}
                <div class="cart-total">Total Price: <span class="text-gold">Rs. ${total.toLocaleString()}</span></div>
                <button class="btn-gold" style="width:100%; margin-top:20px;" onclick="alert('Checkout integration engine initialized!')">Proceed To Checkout</button>
            </div>
        `;
    }
}

// Render dynamic card sets to columns
function renderGrid(targetId, itemsList) {
    const grid = document.getElementById(targetId);
    grid.innerHTML = itemsList.map(item => `
        <div class="card" onclick="navigateTo('detail', ${item.id})">
            <img src="${item.img}" alt="${item.title}">
            <h3>${item.title}</h3>
            <div class="price">Rs. ${item.price.toLocaleString()}</div>
        </div>
    `).join('');
}

// State Operations 
function addToCart(productId) {
    const item = products.find(p => p.id === productId);
    cart.push(item);
    updateCartUI();
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart.splice(index, 1);
    }
    updateCartUI();
    navigateTo('cart');
}

function updateCartUI() {
    document.getElementById("cart-count").innerText = cart.length;
}

// Initial Boot Screen Hook
window.onload = () => {
    navigateTo('home');
};
