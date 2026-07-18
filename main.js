/* main.js - Premium Gift Wallay Store Engine */

// --- Google Apps Script Web App URL ---
// Replace this placeholder with your deployed Google Apps Script URL
const PRODUCTS_API = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

// --- 1. INITIAL PREMIUM PRODUCTS DATABASE ---
const INITIAL_PRODUCTS = [
    {
        id: "1",
        name: "Royal Emerald Watch",
        price: 12500,
        category: "Watches",
        description: "A masterpiece of craftsmanship designed for the premium collector. Features a scratch-resistant sapphire crystal glass, 24K gold plated bezel, and a genuine leather strap. Crafted with timeless care.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        reviews: [
            { name: "Ahmed K.", rating: 5, comment: "Absolutely stunning. The packaging was premium and the watch feels heavy and expensive. Highly recommended.", date: "July 10, 2026" },
            { name: "Sarah J.", rating: 4, comment: "Great gift for my husband. Delivery took 3 days to Lahore.", date: "July 05, 2026" }
        ]
    },
    {
        id: "2",
        name: "Oud Intense Perfume",
        price: 4800,
        category: "Perfumes",
        description: "Rich, mysterious, and deeply captivating. Oud Intense is a premium blend of rare agarwood, amber, and dark rose, designed to make a lasting impression in any room.",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",
        reviews: [
            { name: "Bilal S.", rating: 5, comment: "Smells incredibly luxurious and stays for more than 12 hours. A perfect gift.", date: "July 12, 2026" }
        ]
    },
    {
        id: "3",
        name: "Full Leather Wallet Set",
        price: 3500,
        category: "Wallets",
        description: "Handcrafted from full-grain genuine leather. This set includes an elegant slim wallet and a matching classic keyholder, packaged in a premium magnetic gift box.",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
        reviews: [
            { name: "Zainab R.", rating: 5, comment: "Pure leather, highly polished finish. The color is exactly like the picture.", date: "June 28, 2026" }
        ]
    },
    {
        id: "4",
        name: "Gold Geometric Cufflinks",
        price: 2200,
        category: "Jewelry",
        description: "Add a touch of absolute sophistication to your formal wear. These 18K gold plated cufflinks feature delicate geometric engravings and a smooth clasp.",
        image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&auto=format&fit=crop&q=80",
        reviews: []
    },
    {
        id: "5",
        name: "Golden Aviator Sunglasses",
        price: 1800,
        category: "Glasses",
        description: "Timeless styling meets modern protection. Featuring polarized dark lenses with 100% UV protection and an ultra-lightweight golden frame.",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
        reviews: []
    },
    {
        id: "6",
        name: "Matte Black Custom Pen",
        price: 1500,
        category: "Customized",
        description: "A luxury matte-black ballpoint pen custom engraved with your name. Features smooth German ink flow and golden trim accents. Comes in a plush velvet box.",
        image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
        reviews: []
    },
    {
        id: "7",
        name: "Luxury Rose Gift Hamper",
        price: 8500,
        category: "Hampers",
        description: "The ultimate expression of luxury. This deluxe hamper contains premium imported chocolates, a scented candle, a personalized greeting card, and preserved roses.",
        image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop&q=80",
        reviews: []
    }
];

// --- 2. STORAGE SYNC LOGIC ---
function getDb(key, fallback) {
    const data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
    }
    return JSON.parse(data);
}

function saveDb(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// In-memory local state copies synced with local storage
let products = [];
let cart = getDb('gw_cart', []);
let users = [];
let orders = [];
let currentUser = getDb('gw_current_user', null);

let isStoreInitialized = false;

// Google Sheets live syncing pipeline
async function syncProducts() {
    try {
        const response = await fetch(PRODUCTS_API + "?action=products&t=" + Date.now(), {
            cache: "no-store"
        });

        if (!response.ok) throw new Error("Network Error");

        const latestProducts = await response.json();
        if (!Array.isArray(latestProducts)) return;

        const oldProducts = JSON.parse(localStorage.getItem("gw_products") || "[]");

        // Update ONLY if items in database have visually changed
        if (JSON.stringify(oldProducts) !== JSON.stringify(latestProducts)) {
            products = latestProducts;
            localStorage.setItem("gw_products", JSON.stringify(latestProducts));

            // Quietly re-render UI assets matching latest sheet parameters
            loadPageData();
            console.log("Products synced from Google Sheets.");
        }
    } catch (err) {
        console.log("Using cached localized products database.");
        products = JSON.parse(localStorage.getItem("gw_products")) || INITIAL_PRODUCTS;
    }
}

async function initStore() {
    if (isStoreInitialized) return;
    
    // 1. Load backup local cache instantly for immediate synchronous rendering
    products = getDb('gw_products', INITIAL_PRODUCTS);
    users = getDb('gw_users', [
        { email: "user@gift.com", name: "Hamza Ahmed", phone: "0300-9876543", pass: "user123" }
    ]);
    orders = getDb('gw_orders', []);
    
    // 2. Render instantly from cache (0ms delay!)
    injectHeaderFooter();
    loadPageData();
    injectBackButton();
    updateCartBadge();
    
    // Load interactive endless category carousel on home page
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    if (page === 'index.html' || page === '') {
        initInfiniteCarousel();
    }
    
    // 3. Sync from Google Sheets API in background
    await syncProducts();
    
    // Auto check every 60 seconds
    setInterval(syncProducts, 60000);

    isStoreInitialized = true;
}

// Local Fallback Synchronizers (No-Op servers since hosting on static GitHub Pages)
async function saveProductToServer(newProduct) {
    console.log("Static Mode: Changes will reset unless committed to Google Sheets.");
}

async function deleteProductFromServer(id) {
    console.log("Static Mode: Deletions should occur via Google Sheets Admin.");
}

async function addReviewToServer(productId, review) {
    console.log("Static Mode: Review saved locally on user device.");
}

async function addOrderToServer(order) {
    console.log("Static Mode: Order captured locally.");
}

async function updateOrderStatusOnServer(orderNum, status) {
    console.log("Static Mode: Local status configuration adjusted.");
}

async function addUserToServer(user) {
    console.log("Static Mode: User structured locally.");
}

// --- 3. COMMON DYNAMIC NAVBAR & SIDEBAR INJECTION ---
function injectHeaderFooter() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    const bannerHtml = `
        <div id="topBanner" style="background: black; color: var(--gold); text-align: center; padding: 10px; font-size: 0.8rem; letter-spacing: 1.5px; font-weight: 700; width: 100%;">
            WELCOME10 - GET 10% OFF YOUR FIRST ORDER
        </div>
    `;
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.removeAttribute('style'); 
        
        let headerWrapper = document.getElementById('gwHeader');
        if (!headerWrapper) {
            headerWrapper = document.createElement('header');
            headerWrapper.id = 'gwHeader';
            headerWrapper.className = 'header-wrapper';
            document.body.prepend(headerWrapper);
        }

        if (!document.getElementById('topBanner')) {
            headerWrapper.innerHTML = bannerHtml;
        }

        if (navbar.parentElement !== headerWrapper) {
            headerWrapper.appendChild(navbar);
        }

        const showBack = page !== 'index.html' && page !== '';
        let fallbackUrl = 'index.html';
        if (page === 'product.html' || page === 'category.html') {
            fallbackUrl = 'shop.html';
        } else if (page === 'checkout.html') {
            fallbackUrl = 'cart.html';
        } else if (page === 'cart.html') {
            fallbackUrl = 'shop.html';
        }

        navbar.innerHTML = `
            <div class="menu-btn" id="burgerBtn">☰</div>
            <a href="index.html" class="brand" id="brandLogo" style="text-decoration: none; display: flex; align-items: center; justify-content: center;">
                <img src="Gift-Wallay.png" alt="Gift-Wallay Logo" style="height: 48px; max-height: 48px; width: auto; object-fit: contain; display: block;">
            </a>
            <div style="display: flex; align-items: center; gap: 1.5rem; position: relative;">
                <a href="cart.html" class="cart-icon" style="display: flex; align-items: center; justify-content: center;">
                    🛒<span class="cart-count">0</span>
                </a>
            </div>
        `;

        const existingBackBtn = document.getElementById('gwBackButton');
        if (existingBackBtn) {
            existingBackBtn.remove();
        }

        if (showBack) {
            const backDiv = document.createElement('div');
            backDiv.id = 'gwBackButton';
            backDiv.style.position = 'fixed';
            backDiv.style.top = '112px'; 
            backDiv.style.left = '5%';   
            backDiv.style.zIndex = '1500';
            backDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            backDiv.innerHTML = `
                <a href="${fallbackUrl}" id="navbarBackBtn" style="display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; background: var(--white); box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.05); color: var(--black); font-size: 1.1rem; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); text-decoration: none;" title="Go Back">
                    ←
                </a>
            `;
            document.body.prepend(backDiv);

            const navBackBtn = document.getElementById('navbarBackBtn');
            if (navBackBtn) {
                navBackBtn.onclick = function(e) {
                    if (window.history.length > 1) {
                        e.preventDefault();
                        window.history.back();
                    }
                };
                navBackBtn.addEventListener('mouseenter', () => {
                    navBackBtn.style.transform = 'translateY(-2px) scale(1.05)';
                    navBackBtn.style.borderColor = 'var(--gold)';
                    navBackBtn.style.color = 'var(--gold)';
                    navBackBtn.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.2)';
                });
                navBackBtn.addEventListener('mouseleave', () => {
                    navBackBtn.style.transform = 'translateY(0) scale(1)';
                    navBackBtn.style.borderColor = 'rgba(0,0,0,0.05)';
                    navBackBtn.style.color = 'var(--black)';
                    navBackBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.06)';
                });
            }
        }

        document.getElementById('burgerBtn').addEventListener('click', toggleSidebar);
    }

    let sidebarOverlay = document.getElementById('sidebarOverlay');
    let sidebarMenu = document.getElementById('sidebarMenu');
    
    if (!sidebarOverlay) {
        sidebarOverlay = document.createElement('div');
        sidebarOverlay.id = "sidebarOverlay";
        sidebarOverlay.className = "sidebar-overlay";
        document.body.appendChild(sidebarOverlay);
    }
    
    if (!sidebarMenu) {
        sidebarMenu = document.createElement('div');
        sidebarMenu.id = "sidebarMenu";
        sidebarMenu.className = "sidebar-menu";
        document.body.appendChild(sidebarMenu);
    }

    sidebarOverlay.onclick = toggleSidebar;
    
    sidebarMenu.innerHTML = `
        <div style="text-align: right; font-size: 1.5rem; cursor: pointer; color: var(--gold);" onclick="toggleSidebar()">×</div>
        <div style="margin-top: 1.5rem; display: flex; flex-direction: column; height: calc(100% - 40px); justify-content: space-between;">
            <div style="overflow-y: auto; padding-right: 5px;">
                <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 0.5rem; font-weight: bold;">Main Menu</p>
                <a href="index.html" class="sidebar-link" style="border-bottom: none; padding: 10px 0;">Home</a>
                <a href="shop.html" class="sidebar-link" style="border-bottom: none; padding: 10px 0;">Shop All</a>
                <a href="account.html" class="sidebar-link" style="border-bottom: none; padding: 10px 0;">My Account</a>
                
                <div id="categoriesToggleBtn" class="sidebar-link" style="border-bottom: none; padding: 10px 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-top: 1.2rem; user-select: none;">
                    <span style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); font-weight: bold; display: flex; align-items: center; gap: 6px;">📂 Categories</span>
                    <span id="categoriesToggleArrow" style="font-size: 0.65rem; transition: transform 0.3s; color: var(--gold);">▼</span>
                </div>
                <div id="sidebarCategoriesContainer" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; padding-left: 15px; display: flex; flex-direction: column; gap: 4px;">
                    <a href="category.html?type=Watches" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">⌚ Watches</a>
                    <a href="category.html?type=Perfumes" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">🌹 Perfumes</a>
                    <a href="category.html?type=Wallets" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">💼 Wallets</a>
                    <a href="category.html?type=Jewelry" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">💎 Jewelry</a>
                    <a href="category.html?type=Glasses" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">🕶️ Sunglasses</a>
                    <a href="category.html?type=Customized" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">🖋️ Customized</a>
                    <a href="category.html?type=Hampers" class="sidebar-link" style="font-size: 0.9rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">🎁 Gift Hampers</a>
                </div>
            </div>
            
            <div style="padding-top: 1.5rem; border-top: 1px dashed rgba(0,0,0,0.1); margin-top: auto; padding-bottom: 10px;">
                <p style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 0.8rem; font-weight: bold; text-align: center;">Connect With Us</p>
                <div style="display: flex; justify-content: center; gap: 1.5rem; align-items: center;">
                    <a href="https://wa.me/923211234567" target="_blank" style="text-decoration: none; color: #25D366; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(37, 211, 102, 0.1); border-radius: 50%; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.15)'; this.style.background='rgba(37,211,102,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(37,211,102,0.1)'" title="WhatsApp">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.735-4.326 9.738-9.725.002-2.617-1.011-5.074-2.852-6.918C16.307 2.116 13.86 1.1 11.247 1.1 5.845 1.1 1.511 5.428 1.508 10.826c-.001 1.508.397 2.979 1.155 4.269l-.988 3.61 3.73-.977c1.238.675 2.535 1.031 3.754 1.031l-.001-.005zm10.748-6.147c-.296-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.668.149-.198.297-.766.967-.94 1.165-.173.198-.346.223-.642.074-.296-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.174.2-.298.3-.496.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.011c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                        </svg>
                    </a>
                    <a href="https://instagram.com/gift_wallay" target="_blank" style="text-decoration: none; color: #E1306C; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(225, 48, 108, 0.1); border-radius: 50%; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.15)'; this.style.background='rgba(225,48,108,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(225,48,108,0.1)'" title="Instagram">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://facebook.com/gift_wallay" target="_blank" style="text-decoration: none; color: #1877F2; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: rgba(24, 119, 242, 0.1); border-radius: 50%; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.15)'; this.style.background='rgba(24,119,242,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(24,119,242,0.1)'" title="Facebook">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `;

    const categoriesToggle = document.getElementById('categoriesToggleBtn');
    const categoriesContainer = document.getElementById('sidebarCategoriesContainer');
    const categoriesArrow = document.getElementById('categoriesToggleArrow');
    
    if (categoriesToggle && categoriesContainer) {
        categoriesToggle.onclick = function() {
            const isOpen = categoriesContainer.style.maxHeight !== '0px' && categoriesContainer.style.maxHeight !== '';
            if (isOpen) {
                categoriesContainer.style.maxHeight = '0px';
                if (categoriesArrow) categoriesArrow.style.transform = 'rotate(0deg)';
            } else {
                categoriesContainer.style.maxHeight = '500px';
                if (categoriesArrow) categoriesArrow.style.transform = 'rotate(180deg)';
            }
        };
    }

    if (!document.getElementById('gwModalOverlay')) {
        const modalContainer = document.createElement('div');
        modalContainer.id = "gwModalOverlay";
        modalContainer.className = "gw-modal-overlay";
        modalContainer.innerHTML = `
            <div class="gw-modal-card" id="gwModalCard">
            </div>
        `;
        document.body.appendChild(modalContainer);
    }

    updateCartBadge();
}

// --- 4. PREMIUM CENTER POPUP MODALS SYSTEM ---
function showPremiumAlert(title, message, type = 'success', callback = null) {
    const overlay = document.getElementById('gwModalOverlay');
    const card = document.getElementById('gwModalCard');
    if (!overlay || !card) return;

    let icon = "✓";
    let color = "var(--gold)";
    if (type === 'error') {
        icon = "×";
        color = "#ff4444";
    } else if (type === 'info') {
        icon = "ℹ";
        color = "#33b5e5";
    }

    card.innerHTML = `
        <span class="gw-modal-close" id="gwModalCloseBtn">&times;</span>
        <div style="font-size: 3.5rem; color: ${color}; margin-bottom: 1rem; font-weight: bold; line-height: 1;">${icon}</div>
        <h2 style="font-family: var(--font-head); margin-bottom: 1rem; font-size: 1.8rem;">${title}</h2>
        <p style="color: #666; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem;">${message}</p>
        <button class="btn" id="gwModalOkBtn" style="width: 100%; max-width: 200px; margin: 0 auto;">OK</button>
    `;

    overlay.classList.add('active');

    const closeAlert = () => {
        overlay.classList.remove('active');
        if (callback) callback();
    };

    document.getElementById('gwModalCloseBtn').onclick = closeAlert;
    document.getElementById('gwModalOkBtn').onclick = closeAlert;
    overlay.onclick = function(e) {
        if (e.target === overlay) closeAlert();
    };
}

function showPremiumConfirm(title, message, onConfirm, onCancel = null) {
    const overlay = document.getElementById('gwModalOverlay');
    const card = document.getElementById('gwModalCard');
    if (!overlay || !card) return;

    card.innerHTML = `
        <span class="gw-modal-close" id="gwModalCloseBtn">&times;</span>
        <div style="margin-bottom: 1.5rem;"></div>
        <h2 style="font-family: var(--font-head); margin-bottom: 1.2rem; font-size: 1.8rem; color: var(--black);">${title}</h2>
        <p style="color: #666; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem;">${message}</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn" id="gwModalConfirmBtn" style="flex: 1;">Yes, Proceed</button>
            <button class="btn" id="gwModalCancelBtn" style="flex: 1; background: #eee; color: #333; border-color: #eee;">Cancel</button>
        </div>
    `;

    overlay.classList.add('active');

    const handleConfirm = () => {
        overlay.classList.remove('active');
        if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
        overlay.classList.remove('active');
        if (onCancel) onCancel();
    };

    document.getElementById('gwModalCloseBtn').onclick = handleCancel;
    document.getElementById('gwModalCancelBtn').onclick = handleCancel;
    document.getElementById('gwModalConfirmBtn').onclick = handleConfirm;
    overlay.onclick = function(e) {
        if (e.target === overlay) handleCancel();
    };
}

function toggleCategoriesModal() {
    const overlay = document.getElementById('gwModalOverlay');
    const card = document.getElementById('gwModalCard');
    if (!overlay || !card) return;

    card.innerHTML = `
        <span class="gw-modal-close" id="gwModalCloseBtn">&times;</span>
        <h2 style="font-family: var(--font-head); margin-bottom: 1.5rem; font-size: 1.8rem; color: var(--black); border-bottom: 1px solid var(--gold); padding-bottom: 10px;">Our Collections ➔</h2>
        <div style="display: flex; flex-direction: column; gap: 0.8rem; text-align: left;">
            <a href="category.html?type=Watches" class="btn" style="background: #ffffff; color: #000000; border: 1.5px solid var(--gold); text-align: left; display: flex; justify-content: space-between; text-transform: none; padding: 12px 20px; box-shadow: 0 4px 10px rgba(212,175,55,0.05);">
                <span>⌚ Watches</span> <span style="color: var(--gold);">Explore ➔</span>
            </a>
            <a href="category.html?type=Perfumes" class="btn" style="background: #ffffff; color: #000000; border: 1.5px solid var(--gold); text-align: left; display: flex; justify-content: space-between; text-transform: none; padding: 12px 20px; box-shadow: 0 4px 10px rgba(212,175,55,0.05);">
                <span>🌹 Perfumes</span> <span style="color: var(--gold);">Explore ➔</span>
            </a>
            <a href="category.html?type=Wallets" class="btn" style="background: #ffffff; color: #000000; border: 1.5px solid var(--gold); text-align: left; display: flex; justify-content: space-between; text-transform: none; padding: 12px 20px; box-shadow: 0 4px 10px rgba(212,175,55,0.05);">
                <span>💼 Wallets</span> <span style="color: var(--gold);">Explore ➔</span>
            </a>
            <a href="category.html?type=Jewelry" class="btn" style="background: #ffffff; color: #000000; border: 1.5px solid var(--gold); text-align: left; display: flex; justify-content: space-between; text-transform: none; padding: 12px 20px; box-shadow: 0 4px 10px rgba(212,175,55,0.05);">
                <span>💎 Jewelry</span> <span style="color: var(--gold);">Explore ➔</span>
            </a>
            <a href="category.html?type=Glasses" class="btn" style="background: #ffffff; color: #000000; border: 1.5px solid var(--gold); text-align: left; display: flex; justify-content: space-between; text-transform: none; padding: 12px 20px; box-shadow: 0 4px 10px rgba(212,175,55,0.05);">
                <span>🕶️ Sun Glasses</span> <span style="color: var(--gold);">Explore ➔</span>
            </a>
            <a href="category.html?type=Customized" class="btn" style="background: #ffffff; color: #000000; border: 1.5px solid var(--gold); text-align: left; display: flex; justify-content: space-between; text-transform: none; padding: 12px 20px; box-shadow: 0 4px 10px rgba(212,175,55,0.05);">
                <span>🖋️ Customized Gifts</span> <span style="color: var(--gold);">Explore ➔</span>
            </a>
            <a href="category.html?type=Hampers" class="btn" style="background: #ffffff; color: #000000; border: 1.5px solid var(--gold); text-align: left; display: flex; justify-content: space-between; text-transform: none; padding: 12px 20px; box-shadow: 0 4px 10px rgba(212,175,55,0.05);">
                <span>🎁 Gift Hampers</span> <span style="color: var(--gold);">Explore ➔</span>
            </a>
        </div>
    `;

    overlay.classList.add('active');

    document.getElementById('gwModalCloseBtn').onclick = () => overlay.classList.remove('active');
    overlay.onclick = function(e) {
        if (e.target === overlay) overlay.classList.remove('active');
    };
}

// --- 5. SIDEBAR NAVIGATION ---
function toggleSidebar() {
    const menu = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    const backBtn = document.getElementById('gwBackButton');
    if (menu && overlay) {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        if (backBtn) {
            if (menu.classList.contains('active')) {
                backBtn.style.opacity = '0';
                backBtn.style.pointerEvents = 'none';
                backBtn.style.transform = 'scale(0.9)';
            } else {
                backBtn.style.opacity = '1';
                backBtn.style.pointerEvents = 'auto';
                backBtn.style.transform = 'scale(1)';
            }
        }
    }
}

// --- 6. CART ENGINE ---
function updateCartBadge() {
    const count = cart.reduce((total, item) => total + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(badge => {
        badge.innerText = count;
    });
}

function addToCart(productName, price, qty = 1) {
    const matchingProduct = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
    const productId = matchingProduct ? matchingProduct.id : String(Date.now());
    const imageUrl = matchingProduct ? matchingProduct.image : "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop&q=80";

    addToCartById(productId, qty, imageUrl, productName, price);
}

function addToCartById(productId, qty = 1, imageUrl = "", name = "", price = 0) {
    const product = products.find(p => p.id === productId);
    const finalName = product ? product.name : name;
    const finalPrice = product ? product.price : price;
    const finalImage = product ? product.image : imageUrl;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.qty += parseInt(qty);
    } else {
        cart.push({
            id: productId,
            name: finalName,
            price: finalPrice,
            image: finalImage,
            qty: parseInt(qty)
        });
    }

    saveDb('gw_cart', cart);
    updateCartBadge();
    
    showPremiumAlert(
        "Added to Cart Successfully", 
        `✓ <strong>${finalName}</strong> (Qty: ${qty}) has been added to your cart successfully.`,
        'success'
    );
}

// --- 7. PAGE LOADING CONTROLLER ---
function loadPageData() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    if (page === 'index.html' || page === '') {
        loadIndexPage();
    } else if (page === 'shop.html') {
        loadShopPage();
    } else if (page === 'category.html') {
        loadCategoryPage();
    } else if (page === 'product.html') {
        loadProductPage();
    } else if (page === 'cart.html') {
        loadCartPage();
    } else if (page === 'checkout.html') {
        loadCheckoutPage();
    } else if (page === 'account.html') {
        loadAccountPage();
    }
}

// --- 8. PAGE CONTROLLERS ---

// A. INDEX PAGE (Home)
function loadIndexPage() {
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        const recentProducts = products.slice(0, 4);
        productGrid.innerHTML = recentProducts.map(p => `
            <div class="product-card" style="animation: fadeUp 1s ease forwards;">
                <a href="product.html?id=${p.id}">
                    <div class="p-image">
                        <span style="position: absolute; top: 10px; left: 10px; background: black; color: var(--gold); padding: 5px 12px; font-size: 0.7rem; letter-spacing: 1.5px; font-weight: 700; z-index: 5;">NEW</span>
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <h4 style="margin-top: 0.5rem; font-size: 1.1rem; line-height: 1.4; height: 3rem; overflow: hidden;">${p.name}</h4>
                    <p class="text-gold" style="margin-top: 0.3rem; font-size: 1.1rem;">Rs. ${p.price.toLocaleString()}</p>
                </a>
            </div>
        `).join('');
    }
}

// B. SHOP PAGE
function loadShopPage() {
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 5rem 0;">
                    <p style="color: #666; font-size: 1.2rem;">No premium products currently in catalog.</p>
                </div>
            `;
            return;
        }
        productGrid.innerHTML = products.map(p => `
            <div class="product-card" style="animation: fadeUp 0.8s ease forwards;">
                <a href="product.html?id=${p.id}">
                    <div class="p-image">
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <h4 style="margin-top: 0.5rem; font-size: 1.1rem; line-height: 1.4; height: 3rem; overflow: hidden;">${p.name}</h4>
                    <p class="text-gold" style="margin-top: 0.3rem; font-size: 1.1rem;">Rs. ${p.price.toLocaleString()}</p>
                </a>
            </div>
        `).join('');
    }
}

// C. CATEGORY PAGE
async function loadCategory() {
    await initStore();
}

// C. CATEGORY PAGE
function loadCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    
    const titleEl = document.getElementById('catTitle');
    if (titleEl && type) {
        titleEl.innerText = type + " Collection";
        document.title = type + " | Gift Wallay";
    }

    const productGrid = document.querySelector('.product-grid');
    if (productGrid && type) {
        const filteredProducts = products.filter(p => p.category.toLowerCase() === type.toLowerCase());
        
        if (filteredProducts.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 5rem 0; width: 100%;">
                    <p style="color: #666; font-size: 1.2rem;">Our ${type} collection is currently being curated. Check back soon!</p>
                    <a href="shop.html" class="btn" style="width: fit-content; margin: 1.5rem auto 0; padding: 12px 40px;">Shop All Collections</a>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = filteredProducts.map(p => `
            <div class="product-card" style="animation: fadeUp 0.8s ease forwards;">
                <a href="product.html?id=${p.id}">
                    <div class="p-image">
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <h4 style="margin-top: 0.5rem; font-size: 1.1rem; line-height: 1.4; height: 3rem; overflow: hidden;">${p.name}</h4>
                    <p class="text-gold" style="margin-top: 0.3rem; font-size: 1.1rem;">Rs. ${p.price.toLocaleString()}</p>
                </a>
            </div>
        `).join('');
    }
}

// D. PRODUCT DETAIL PAGE
function loadProductPage() {
    const params = new URLSearchParams(window.location.search);
    let productId = params.get('id') || "1"; 

    const product = products.find(p => p.id === productId);
    if (!product) {
        document.querySelector('.container.section-pad').innerHTML = `
            <div style="text-align: center; padding: 5rem 0;">
                <h2>Product Not Found</h2>
                <p style="margin: 1rem 0; color: #666;">The premium product you are looking for does not exist.</p>
                <a href="shop.html" class="btn" style="width: fit-content; margin: 1rem auto; padding: 12px 30px;">Back to Shop</a>
            </div>
        `;
        return;
    }

    document.title = `${product.name} | Gift Wallay`;

    const detailContainer = document.querySelector('.container.section-pad.split-layout');
    if (detailContainer) {
        const ratingAvg = product.reviews && product.reviews.length > 0 
            ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
            : "5.0";
        const starStr = "★".repeat(Math.round(ratingAvg)) + "☆".repeat(5 - Math.round(ratingAvg));

        detailContainer.innerHTML = `
            <div style="background: #fdfdfd; border: 1px solid #f0f0f0; padding: 1rem; height: 500px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: var(--shadow);">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>

            <div style="display: flex; flex-direction: column; justify-content: center;">
                <div style="color: var(--gold); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 2px; font-weight: 700; margin-bottom: 10px;">
                    ${product.category}
                </div>
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem; line-height: 1.2;">${product.name}</h1>
                
                <div class="stars" style="margin-bottom: 1rem; font-size: 1.1rem; color: var(--gold);">
                    ${starStr} <span style="color: #888; font-size: 0.85rem; margin-left: 5px;">(${ratingAvg} Stars / ${product.reviews ? product.reviews.length : 0} Reviews)</span>
                </div>
                
                <h2 class="text-gold" style="font-size: 2rem; margin-bottom: 2rem;">Rs. ${product.price.toLocaleString()}</h2>
                
                <p style="line-height: 1.8; color: #555; margin-bottom: 2.5rem; font-size: 1rem;">
                    ${product.description}
                </p>

                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem;">
                    <span style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #333;">Quantity:</span>
                    <div class="qty-box" style="display: flex; align-items: center; border: 1px solid #ddd; width: fit-content; background: #fff;">
                        <button class="qty-btn" id="prodQtyMinus" style="padding: 10px 18px; cursor: pointer; background: #f9f9f9; border: none; font-weight: bold; transition: 0.2s;">-</button>
                        <span class="qty-val" id="qtyDisplay" style="padding: 10px 22px; font-weight: bold; min-width: 50px; text-align: center;">1</span>
                        <button class="qty-btn" id="prodQtyPlus" style="padding: 10px 18px; cursor: pointer; background: #f9f9f9; border: none; font-weight: bold; transition: 0.2s;">+</button>
                    </div>
                </div>

                <button class="btn" id="addToCartBtn" style="width: 100%; padding: 18px; font-weight: 700; letter-spacing: 2px;">Add to Cart</button>
                
                <div style="margin-top: 2.5rem; font-size: 0.85rem; color: #666; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-top: 1px solid #eee; padding-top: 1.5rem;">
                    <p style="display: flex; align-items: center; gap: 5px;">✨ Free Premium Delivery in Pakistan</p>
                    <p style="display: flex; align-items: center; gap: 5px;">🛡️ 1-Year Brand Replacement Warranty</p>
                </div>
            </div>
        `;

        let qty = 1;
        document.getElementById('prodQtyMinus').onclick = () => {
            if (qty > 1) qty--;
            document.getElementById('qtyDisplay').innerText = qty;
        };
        document.getElementById('prodQtyPlus').onclick = () => {
            qty++;
            document.getElementById('qtyDisplay').innerText = qty;
        };

        document.getElementById('addToCartBtn').onclick = () => {
            addToCartById(product.id, qty);
        };
    }

    renderReviews(product);
}

window.showReviewImage = function(src) {
    const overlay = document.getElementById('gwModalOverlay');
    const card = document.getElementById('gwModalCard');
    if (!overlay || !card) return;
    card.innerHTML = `
        <span class="gw-modal-close" id="gwModalCloseBtn">&times;</span>
        <div style="display: flex; justify-content: center; align-items: center; padding: 10px;">
            <img src="${src}" style="max-width: 100%; max-height: 80vh; object-fit: contain; box-shadow: var(--shadow); border: 1.5px solid var(--gold);">
        </div>
    `;
    overlay.classList.add('active');
    document.getElementById('gwModalCloseBtn').onclick = () => overlay.classList.remove('active');
};

function renderReviews(product) {
    const reviewsSection = document.querySelector('.container[style*="padding-bottom: 5rem"]');
    if (!reviewsSection) return;

    const totalReviews = product.reviews ? product.reviews.length : 0;
    const ratingAvg = totalReviews > 0 
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : "5.0";
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (product.reviews) {
        product.reviews.forEach(r => {
            if (distribution[r.rating] !== undefined) {
                distribution[r.rating]++;
            }
        });
    } else {
        distribution[5] = 1;
    }

    let distributionHtml = "";
    for (let stars = 5; stars >= 1; stars--) {
        const count = distribution[stars];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : (stars === 5 ? 100 : 0);
        distributionHtml += `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 0.9rem;">
                <span style="width: 50px; font-weight: bold; color: #555;">${stars} Stars</span>
                <div style="flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; position: relative;">
                    <div style="width: ${percentage}%; height: 100%; background: var(--gold); border-radius: 4px; transition: width 0.8s ease;"></div>
                </div>
                <span style="width: 30px; text-align: right; color: #777; font-size: 0.8rem;">${count}</span>
            </div>
        `;
    }

    let reviewsListHtml = "";
    if (product.reviews && product.reviews.length > 0) {
        reviewsListHtml = product.reviews.map(r => {
            const initials = r.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            const avatarBg = ['#1a1a1a', '#d4af37', '#4a5568', '#2d3748', '#718096'][r.name.length % 5];
            
            return `
                <div class="review-box" style="background: #ffffff; border: 1px solid rgba(0,0,0,0.04); border-left: 3px solid var(--gold); padding: 1.8rem; margin-bottom: 1.5rem; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.01);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 44px; height: 44px; border-radius: 50%; background: ${avatarBg}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.95rem; font-family: var(--font-head); border: 1px solid rgba(255,255,255,0.15);">
                                ${initials}
                            </div>
                            <div>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <strong style="font-size: 1.05rem; color: var(--black);">${r.name}</strong>
                                    <span style="background: #e6f7ed; color: #1e7e34; padding: 2px 6px; border-radius: 10px; font-size: 0.65rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 3px;">
                                        ✓ Verified Purchase
                                    </span>
                                </div>
                                <small style="color: #999; font-size: 0.8rem;">Reviewed on ${r.date}</small>
                            </div>
                        </div>
                        <span class="stars" style="color: var(--gold); font-size: 1rem;">${"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}</span>
                    </div>
                    <p style="color: #444; margin-top: 1rem; line-height: 1.6; font-size: 0.95rem; white-space: pre-line;">"${r.comment}"</p>
                    ${r.image ? `
                    <div style="margin-top: 12px; border-radius: 4px; overflow: hidden; width: fit-content; max-width: 180px; box-shadow: var(--shadow); border: 1px solid rgba(0,0,0,0.05); cursor: zoom-in;" onclick="showReviewImage('${r.image}')">
                        <img src="${r.image}" alt="User Review Photo" style="max-height: 120px; width: auto; object-fit: cover; display: block; transition: transform 0.3s ease;">
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    } else {
        reviewsListHtml = `
            <div style="text-align: center; padding: 4rem 2rem; background: #fff; border: 1px dashed #eee;">
                <p style="color: #888; font-style: italic; margin-bottom: 1.5rem; font-size: 1rem;">No reviews yet for this premium curation.</p>
                <p style="color: #aaa; font-size: 0.85rem;">Be the first to share your exquisite experience!</p>
            </div>
        `;
    }

    reviewsSection.innerHTML = `
        <div style="margin-top: 4rem; border-top: 1px solid #eee; padding-top: 4rem;">
            <h3 style="font-family: var(--font-head); font-size: 1.8rem; letter-spacing: 2px; text-transform: uppercase; text-align: center; margin-bottom: 3rem; color: var(--black);">Client Appreciation</h3>
            
            <div style="display: grid; grid-template-columns: 1fr; md:grid-template-columns: 1.2fr 2fr; gap: 4rem; align-items: start;" class="reviews-grid-wrapper">
                
                <div style="background: #fafafa; border: 1px solid rgba(0,0,0,0.05); padding: 2.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.01);" class="reviews-summary-panel">
                    <h4 style="font-family: var(--font-head); font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--black); margin-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 10px;">Review Summary</h4>
                    
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <span style="font-size: 3.5rem; font-weight: bold; color: var(--black); line-height: 1; font-family: var(--font-head);">${ratingAvg}</span>
                        <div style="color: var(--gold); font-size: 1.4rem; margin: 0.5rem 0 0.2rem 0;">${"★".repeat(Math.round(parseFloat(ratingAvg)))}${"☆".repeat(5 - Math.round(parseFloat(ratingAvg)))}</div>
                        <p style="color: #888; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Based on ${totalReviews} elite reviews</p>
                    </div>

                    <div style="margin-bottom: 2.5rem;">
                        ${distributionHtml}
                    </div>

                    <button class="btn" id="openReviewFormBtn" style="width: 100%; padding: 15px; font-weight: bold; letter-spacing: 1px;">+ Write A Review</button>
                    
                    <div id="reviewFormContainer" style="max-height: 0; overflow: hidden; transition: max-height 0.5s ease-out; margin-top: 0;">
                        <div style="border-top: 1.5px solid var(--gold); margin-top: 2rem; padding-top: 2rem;">
                            <h4 style="margin-bottom: 1.5rem; color: var(--black); font-size: 1.1rem; font-family: var(--font-head); text-transform: uppercase; letter-spacing: 1px;">Share Your Experience</h4>
                            <form id="addReviewForm">
                                <div style="margin-bottom: 1.2rem;">
                                    <label style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 6px; font-weight: bold;">Your Name</label>
                                    <input type="text" id="revName" placeholder="Enter your full name" style="width: 100%; padding: 12px; border: 1px solid #ddd; background: #fff; font-size: 0.9rem;" required>
                                </div>
                                <div style="margin-bottom: 1.2rem;">
                                    <label style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 8px; font-weight: bold;">Rating</label>
                                    <div id="interactiveStars" style="display: flex; gap: 8px; font-size: 1.6rem; cursor: pointer; color: var(--gold); user-select: none;">
                                        <span class="interactive-star" data-value="1">★</span>
                                        <span class="interactive-star" data-value="2">★</span>
                                        <span class="interactive-star" data-value="3">★</span>
                                        <span class="interactive-star" data-value="4">★</span>
                                        <span class="interactive-star" data-value="5">★</span>
                                    </div>
                                    <input type="hidden" id="revRating" value="5">
                                </div>
                                <div style="margin-bottom: 1.2rem;">
                                    <label style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 6px; font-weight: bold;">Your Thoughts</label>
                                    <textarea id="revComment" rows="4" placeholder="How was your exquisite experience with this product?" style="width: 100%; padding: 12px; border: 1px solid #ddd; font-family: var(--font-body); background: #fff; line-height: 1.6; font-size: 0.9rem; resize: vertical;" required></textarea>
                                </div>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 6px; font-weight: bold;">Upload Photo (Optional)</label>
                                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                        <label for="revImage" class="btn" style="width: auto; padding: 8px 15px; font-size: 0.75rem; background: #fff; color: var(--black); border: 1px solid var(--gold); cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                                            📷 Choose Image
                                        </label>
                                        <input type="file" id="revImage" accept="image/*" style="display: none;">
                                        <span id="revImageName" style="color: #666; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px;">No file chosen</span>
                                    </div>
                                    <div id="revImagePreviewContainer" style="margin-top: 12px; display: none; position: relative; width: 80px; height: 80px; border: 1px solid #eee; overflow: hidden;">
                                        <img id="revImagePreview" src="" style="width: 100%; height: 100%; object-fit: cover;">
                                        <button type="button" id="removeRevImage" style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center;">×</button>
                                    </div>
                                </div>

                                <button type="submit" class="btn" style="width: 100%; padding: 12px; font-size: 0.85rem;">Submit Appreciation</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div style="flex: 1;" class="reviews-list-panel">
                    <h4 style="font-family: var(--font-head); font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--black); margin-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 10px;">Client Feedback</h4>
                    <div id="reviewsWrapper">
                        ${reviewsListHtml}
                    </div>
                </div>

            </div>
        </div>
    `;

    if (!document.getElementById('reviewsMediaStyles')) {
        const style = document.createElement('style');
        style.id = 'reviewsMediaStyles';
        style.innerHTML = `
            @media (min-width: 768px) {
                .reviews-grid-wrapper {
                    grid-template-columns: 1.2fr 2fr !important;
                }
                .reviews-summary-panel {
                    position: sticky !important;
                    top: 120px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    const openBtn = document.getElementById('openReviewFormBtn');
    const container = document.getElementById('reviewFormContainer');
    if (openBtn && container) {
        openBtn.onclick = () => {
            if (container.style.maxHeight === '0px' || !container.style.maxHeight || container.style.maxHeight === '0') {
                container.style.maxHeight = '1000px';
                openBtn.innerText = "Close Review Form";
                openBtn.style.background = "#eeeeee";
                openBtn.style.color = "#333333";
                openBtn.style.borderColor = "#eeeeee";
            } else {
                container.style.maxHeight = '0';
                openBtn.innerText = "+ Write A Review";
                openBtn.style.background = "var(--black)";
                openBtn.style.color = "var(--gold)";
                openBtn.style.borderColor = "var(--black)";
            }
        };
    }

    const stars = document.querySelectorAll('.interactive-star');
    const ratingInput = document.getElementById('revRating');
    if (stars && ratingInput) {
        function updateStars(val) {
            stars.forEach(s => {
                const starVal = parseInt(s.getAttribute('data-value'));
                if (starVal <= val) {
                    s.innerText = '★';
                    s.style.color = 'var(--gold)';
                } else {
                    s.innerText = '☆';
                    s.style.color = '#ccc';
                }
            });
        }

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.getAttribute('data-value'));
                ratingInput.value = val;
                updateStars(val);
            });
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.getAttribute('data-value'));
                updateStars(val);
            });
        });

        const starContainer = document.getElementById('interactiveStars');
        if (starContainer) {
            starContainer.addEventListener('mouseleave', () => {
                updateStars(parseInt(ratingInput.value));
            });
        }
    }

    let uploadedImageBase64 = "";
    const imageInput = document.getElementById('revImage');
    const imageName = document.getElementById('revImageName');
    const previewContainer = document.getElementById('revImagePreviewContainer');
    const previewImg = document.getElementById('revImagePreview');
    const removeBtn = document.getElementById('removeRevImage');

    if (imageInput) {
        imageInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                imageName.innerText = file.name;
                const reader = new FileReader();
                reader.onload = function(evt) {
                    uploadedImageBase64 = evt.target.result;
                    previewImg.src = uploadedImageBase64;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        };
    }

    if (removeBtn) {
        removeBtn.onclick = function() {
            imageInput.value = "";
            uploadedImageBase64 = "";
            imageName.innerText = "No file chosen";
            previewContainer.style.display = 'none';
            previewImg.src = "";
        };
    }

    const form = document.getElementById('addReviewForm');
    if (form) {
        form.onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('revName').value.trim();
            const rating = parseInt(document.getElementById('revRating').value);
            const comment = document.getElementById('revComment').value.trim();

            const today = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = today.toLocaleDateString('en-US', options);

            const newReview = { 
                name, 
                rating, 
                comment, 
                date: formattedDate,
                image: uploadedImageBase64 || null
            };

            await addReviewToServer(product.id, newReview);

            if (!product.reviews) product.reviews = [];
            product.reviews.unshift(newReview);

            showPremiumAlert("Review Submitted", "Thank you! Your verified feedback has been added successfully.", "success", () => {
                renderReviews(product);
                loadProductPage();
            });
        };
    }
}

// E. SHOPPING CART PAGE
function loadCartPage() {
    const tableBody = document.querySelector('#cartTable tbody');

    if (!tableBody) return;

    if (cart.length === 0) {
        document.querySelector('.container.section-pad').innerHTML = `
            <h1 class="text-center" style="margin-bottom: 2rem;">Your Cart</h1>
            <div style="text-align: center; padding: 5rem 0; border: 1px dashed #ddd; background: #fafafa;">
                <div style="font-size: 4rem; color: #ccc; margin-bottom: 1.5rem;">🛒</div>
                <h2 style="font-family: var(--font-head); margin-bottom: 1rem;">Your Cart is Empty</h2>
                <p style="color: #666; margin-bottom: 2rem;">Choose from our elite collection of timeless, premium gifts.</p>
                <a href="shop.html" class="btn" style="width: fit-content; margin: 0 auto; padding: 15px 40px;">Explore Collections</a>
            </div>
        `;
        return;
    }

    tableBody.innerHTML = cart.map((item, idx) => `
        <tr class="cart-row" data-id="${item.id}" style="animation: fadeUp 0.5s ease forwards;">
            <td style="display: flex; align-items: center; gap: 1.5rem;">
                <div style="width: 70px; height: 70px; border: 1px solid #eee; overflow: hidden; box-shadow: var(--shadow); flex-shrink: 0;">
                    <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div>
                    <strong style="font-family: var(--font-head); font-size: 1.1rem; color: var(--black);">${item.name}</strong><br>
                    <small style="color: #888;">Ref: GW-${item.id}</small>
                </div>
            </td>
            <td data-label="Price" class="price" data-price="${item.price}">Rs. ${item.price.toLocaleString()}</td>
            <td data-label="Quantity">
                <div style="display: flex; align-items: center; border: 1px solid #ddd; width: fit-content; background: #fff;">
                    <button class="qty-control-btn" onclick="changeCartItemQty('${item.id}', -1)" style="border: none; background: #f9f9f9; padding: 5px 12px; cursor: pointer; font-weight: bold;">-</button>
                    <input type="text" value="${item.qty}" class="qty-input" readonly style="width: 35px; border: none; font-weight: bold; text-align: center; background: transparent;">
                    <button class="qty-control-btn" onclick="changeCartItemQty('${item.id}', 1)" style="border: none; background: #f9f9f9; padding: 5px 12px; cursor: pointer; font-weight: bold;">+</button>
                </div>
            </td>
            <td data-label="Total" class="row-total" style="font-weight: bold; color: var(--black);">Rs. ${(item.price * item.qty).toLocaleString()}</td>
            <td><button class="delete-btn" onclick="removeCartItemPrompt('${item.id}', '${item.name}')">×</button></td>
        </tr>
    `).join('');

    const totalsContainer = document.getElementById('cartTotalsContainer');
    if (totalsContainer) {
        totalsContainer.style.opacity = '1';
        totalsContainer.style.pointerEvents = 'auto';
    }

    recalcCartPageSubtotal();
}

function changeCartItemQty(id, diff) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += diff;
        if (item.qty < 1) {
            removeCartItemPrompt(id, item.name);
        } else {
            saveDb('gw_cart', cart);
            loadCartPage();
            updateCartBadge();
        }
    }
}

function removeCartItemPrompt(id, name) {
    showPremiumConfirm(
        "Remove Item",
        `Are you sure you want to permanently remove <strong>${name}</strong> from your premium gift cart?`,
        () => {
            cart = cart.filter(item => item.id !== id);
            saveDb('gw_cart', cart);
            updateCartBadge();
            loadCartPage();
        }
    );
}

function recalcCartPageSubtotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) {
        subtotalEl.innerText = "Rs. " + total.toLocaleString();
    }
}

// F. CHECKOUT PAGE
function loadCheckoutPage() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) return;

    if (cart.length === 0) {
        showPremiumAlert("Cart Empty", "Your shopping cart is empty. Please add items to checkout.", "info", () => {
            window.location.href = "shop.html";
        });
        return;
    }

    const CUSTOM_PROMO_CODES = {
        "WELCOME_10": { type: "percent", value: 10 },
        "WELCOME10": { type: "percent", value: 10 },
        "EID20": { type: "percent", value: 20 },
        "WELCOME500": { type: "flat", value: 500 },
        "GW_GOLD": { type: "percent", value: 15 },
        "GW_ROYAL": { type: "percent", value: 20 },
        "GW_PREMIUM": { type: "percent", value: 10 },
        "GW_EXCLUSIVE": { type: "percent", value: 25 },
        "GW_ELITE": { type: "percent", value: 30 },
        "GW_VIP": { type: "percent", value: 35 },
        "GW_FIRST": { type: "flat", value: 300 },
        "GW_GIFT": { type: "flat", value: 200 },
        "GW_LOVE": { type: "percent", value: 12 },
        "GW_LUXURY": { type: "percent", value: 18 },
        "GW_CELEBRATE": { type: "flat", value: 500 },
        "GW_FESTIVE": { type: "percent", value: 15 },
        "GW_SPECIAL": { type: "percent", value: 10 },
        "GW_SURPRISE": { type: "flat", value: 150 },
        "GW_DELIGHT": { type: "percent", value: 8 },
        "GW_SMILE": { type: "flat", value: 100 },
        "GW_JOY": { type: "percent", value: 5 },
        "GW_FOREVER": { type: "percent", value: 15 },
        "GW_MEMORIES": { type: "percent", value: 10 },
        "GW_CHROME": { type: "percent", value: 10 },
        "GW_SAPPHIRE": { type: "percent", value: 22 },
        "GW_EMERALD": { type: "percent", value: 25 },
        "GW_RUBY": { type: "percent", value: 15 },
        "GW_DIAMOND": { type: "percent", value: 30 },
        "GW_PLATINUM": { type: "percent", value: 25 },
        "GW_SILVER": { type: "percent", value: 12 },
        "GW_BRONZE": { type: "percent", value: 8 },
        "GW_CLASSIC": { type: "percent", value: 10 },
        "GW_MODERN": { type: "percent", value: 10 },
        "GW_CHIC": { type: "percent", value: 15 },
        "GW_TRENDY": { type: "percent", value: 15 },
        "GW_ELEGANT": { type: "percent", value: 18 },
        "GW_GRACE": { type: "percent", value: 12 },
        "GW_CROWN": { type: "percent", value: 20 },
        "GW_MAJESTIC": { type: "percent", value: 25 },
        "GW_IMPERIAL": { type: "percent", value: 30 },
        "GW_REGAL": { type: "percent", value: 15 },
        "GW_SOVEREIGN": { type: "percent", value: 25 },
        "GW_PALACE": { type: "flat", value: 1000 },
        "GW_VALLEY": { type: "percent", value: 10 },
        "GW_SPRING": { type: "percent", value: 12 },
        "GW_SUMMER": { type: "percent", value: 15 },
        "GW_AUTUMN": { type: "percent", value: 10 },
        "GW_WINTER": { type: "percent", value: 15 },
        "GW_NATURE": { type: "percent", value: 8 },
        "GW_OCEAN": { type: "percent", value: 10 },
        "GW_SKY": { type: "percent", value: 10 },
        "GW_STAR": { type: "flat", value: 400 },
        "GW_MOON": { type: "flat", value: 350 },
        "GW_SUN": { type: "flat", value: 250 },
        "GW_GALAXY": { type: "percent", value: 20 },
        "GW_COSMIC": { type: "percent", value: 25 },
        "GW_INFINITE": { type: "percent", value: 30 },
        "GW_ETERNAL": { type: "percent", value: 15 }
    };

    let discount = 0;
    let appliedPromo = '';
    let promoError = '';
    let promoSuccess = '';

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = 250;

    function renderSummary() {
        const summaryContainer = document.querySelector('.checkout-summary-card');
        if (!summaryContainer) return;

        const paymentType = checkoutForm.querySelector('input[name="payment"]:checked')?.value || 'cod';
        const surcharge = paymentType === 'cod' ? Math.round((subtotal - discount) * 0.09) : 0;
        const grandTotal = subtotal + shipping + surcharge - discount;

        let itemsHtml = cart.map(item => `
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid #e0e0e0; padding-bottom: 1rem;">
                <div class="summ-thumb" style="border: 1px solid #ddd; overflow: hidden; box-shadow: var(--shadow); width: 60px; height: 60px; flex-shrink: 0;">
                    <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1;">
                    <strong style="color: var(--black); font-size: 0.95rem;">${item.name}</strong>
                    <p class="text-gold" style="font-size: 0.9rem; margin-top: 3px;">Rs. ${item.price.toLocaleString()}</p>
                    <small style="color: #666;">Qty: ${item.qty}</small>
                </div>
            </div>
        `).join('');

        summaryContainer.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--black); padding-bottom: 10px;">Order Summary</h3>
            
            <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">
                <label class="checkout-label" style="margin-bottom: 8px; display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #555;">Apply Promo Code (Optional)</label>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                    <input type="text" id="promoCodeInput" class="checkout-input" placeholder="" value="${appliedPromo}" style="flex: 1; margin-bottom: 0; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.15); border-radius: 4px; font-size: 0.9rem; height: 40px;" ${discount > 0 ? 'disabled' : ''}>
                    ${discount > 0 ? `
                        <button type="button" id="removePromoBtn" class="btn" style="flex: 0 0 auto; padding: 0; width: 80px; height: 40px; background: #e57373; color: white; border: none; cursor: pointer; font-weight: 700; font-size: 0.8rem; border-radius: 4px; display: flex; align-items: center; justify-content: center;">Remove</button>
                    ` : `
                        <button type="button" id="applyPromoBtn" class="btn" style="flex: 0 0 auto; padding: 0; width: 80px; height: 40px; background: #d4af37; color: var(--black); border: none; cursor: pointer; font-weight: 700; font-size: 0.8rem; border-radius: 4px; display: flex; align-items: center; justify-content: center;">Apply</button>
                    `}
                </div>
                ${promoSuccess ? `<small style="color: #2e7d32; margin-top: 0.3rem; display: block; font-weight: bold;">✓ ${promoSuccess}</small>` : ''}
                ${promoError ? `<small style="color: #d32f2f; margin-top: 0.3rem; display: block; font-weight: bold;">⚠️ ${promoError}</small>` : ''}
            </div>

            <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                ${itemsHtml}
            </div>

            <div style="border-top: 1px solid #ddd; padding-top: 1.5rem; margin-top: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Subtotal</span>
                    <span style="font-weight: bold; color: var(--black);">Rs. ${subtotal.toLocaleString()}</span>
                </div>
                
                ${discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #2e7d32; font-weight: bold;">
                    <span>Promo Discount (${appliedPromo})</span>
                    <span>-Rs. ${discount.toLocaleString()}</span>
                </div>
                ` : ''}

                <div id="taxRow" class="tax-row" style="display: ${paymentType === 'cod' ? 'flex' : 'none'}; justify-content: space-between; margin-bottom: 8px;">
                    <span>COD Advance Surcharge (9%)</span>
                    <span id="taxAmount" style="font-weight: bold;">Rs. ${surcharge.toLocaleString()}</span>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Shipping Fee</span>
                    <span style="font-weight: bold; color: var(--black);">Rs. ${shipping.toLocaleString()}</span>
                </div>

                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.25rem; margin-top: 1.5rem; border-top: 2px solid var(--black); padding-top: 1rem;">
                    <span>Grand Total</span>
                    <span id="finalTotal" class="text-gold">Rs. ${grandTotal.toLocaleString()}</span>
                </div>
            </div>

            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.1); text-align: center;">
                <p style="font-size: 0.75rem; color: #888; margin-bottom: 0.8rem; letter-spacing: 0.5px; text-transform: uppercase;">TRUSTED BY THOUSANDS</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                    <div style="padding: 0.6rem; background: #fdfdfd; border: 1px solid rgba(0,0,0,0.05); border-radius: 4px;">
                        <p style="font-size: 1.2rem; margin: 0;">🔒</p>
                        <p style="font-size: 0.7rem; color: #555; margin: 0.2rem 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">SSL Encrypted</p>
                    </div>
                    <div style="padding: 0.6rem; background: #fdfdfd; border: 1px solid rgba(0,0,0,0.05); border-radius: 4px;">
                        <p style="font-size: 1.2rem; margin: 0;">✓</p>
                        <p style="font-size: 0.7rem; color: #555; margin: 0.2rem 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Verified Seller</p>
                    </div>
                </div>
            </div>
        `;

        const applyPromoBtn = document.getElementById('applyPromoBtn');
        if (applyPromoBtn) {
            applyPromoBtn.onclick = function() {
                const promoInput = document.getElementById('promoCodeInput');
                const code = promoInput ? promoInput.value.trim().toUpperCase() : '';
                if (!code) {
                    promoError = 'Please enter a promo code.';
                    promoSuccess = '';
                    renderSummary();
                    return;
                }

                if (CUSTOM_PROMO_CODES[code]) {
                    const rule = CUSTOM_PROMO_CODES[code];
                    if (rule.type === 'percent') {
                        discount = Math.round(subtotal * (rule.value / 100));
                        promoSuccess = `Promo code ${code} applied! ${rule.value}% Discount saved.`;
                    } else if (rule.type === 'flat') {
                        discount = Math.min(rule.value, subtotal);
                        promoSuccess = `Promo code ${code} applied! Rs. ${rule.value.toLocaleString()} Discount saved.`;
                    }
                    appliedPromo = code;
                    promoError = '';
                } else {
                    promoError = 'Invalid promo code.';
                    promoSuccess = '';
                }
                renderSummary();
            };
        }

        const removePromoBtn = document.getElementById('removePromoBtn');
        if (removePromoBtn) {
            removePromoBtn.onclick = function() {
                discount = 0;
                appliedPromo = '';
                promoSuccess = '';
                promoError = '';
                renderSummary();
            };
        }
    }

    renderSummary();

    window.selectPay = function(element, type) {
        document.querySelectorAll('.pay-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        const radio = element.querySelector('input');
        if (radio) radio.checked = true;

        const codWarning = document.getElementById('codWarning');
        if (codWarning) {
            if (type === 'cod') {
                codWarning.style.display = 'block';
            } else {
                codWarning.style.display = 'none';
            }
        }

        renderSummary(); 
    };

    const initialCodOption = document.querySelector('.pay-option input[value="cod"]');
    if (initialCodOption && initialCodOption.checked) {
        window.selectPay(initialCodOption.closest('.pay-option'), 'cod');
    }

    const completeOrderBtn = document.getElementById('completeOrderBtn') || document.querySelector('button[onclick*="Complete Order"]');
    if (completeOrderBtn) {
        completeOrderBtn.removeAttribute('onclick');
        completeOrderBtn.onclick = async function(e) {
            e.preventDefault();
            
            const inputs = checkoutForm.querySelectorAll('input[required], select');
            for (let input of inputs) {
                if (!input.value.trim()) {
                    showPremiumAlert("Field Required", "Please complete all billing and delivery information to proceed.", "error");
                    input.focus();
                    return;
                }
            }

            const firstName = document.getElementById('checkoutFirstName')?.value || '';
            const lastName = document.getElementById('checkoutLastName')?.value || '';
            const address = document.getElementById('checkoutAddress')?.value || '';
            const province = document.getElementById('checkoutProvince')?.value || '';
            const city = document.getElementById('checkoutCity')?.value || '';
            const phone = document.getElementById('checkoutPhone')?.value || '';
            
            if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
                showPremiumAlert("Invalid Phone", "Please enter exactly 10 digits for your phone number.", "error");
                document.getElementById('checkoutPhone')?.focus();
                return;
            }
            const finalPhone = '+92' + phone;

            const paymentType = checkoutForm.querySelector('input[name="payment"]:checked')?.value || 'cod';

            const orderNum = String(Math.floor(Math.random() * 90000) + 10000);
            const surcharge = paymentType === 'cod' ? Math.round((subtotal - discount) * 0.09) : 0;
            const grandTotal = subtotal + shipping + surcharge - discount;

            const orderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            const newOrder = {
                orderNum,
                email: currentUser ? currentUser.email : "guest@gift.com",
                name: `${firstName} ${lastName}`,
                phone: finalPhone,
                address: `${address}, ${city}, ${province}`,
                city,
                payment: paymentType,
                items: JSON.parse(JSON.stringify(cart)),
                total: grandTotal,
                date: orderDate,
                promoApplied: appliedPromo || null,
                discountApplied: discount,
                status: "Pending"
            };

            await addOrderToServer(newOrder);

            orders.unshift(newOrder);
            saveDb('gw_orders', orders);

            cart = [];
            saveDb('gw_cart', cart);
            updateCartBadge();

            showPremiumAlert(
                "Order Placed", 
                `Your order <strong>#${orderNum}</strong> has been secured! A confirmation email and tracking link has been routed to your details.`,
                "success",
                () => {
                    window.location.href = "account.html";
                }
            );
        };
    }
}

// G. PROFILE & LOGIN / REGISTRATION PAGE
function loadAccountPage() {
    const authContainer = document.querySelector('.auth-container');
    if (!authContainer) return;

    if (currentUser) {
        renderUserDashboard(authContainer);
    } else {
        renderAuthForms(authContainer);
    }
}

function renderAuthForms(container) {
    container.innerHTML = `
        <h2 style="text-align: center; margin-bottom: 0.5rem; font-family: var(--font-head); font-size: 1.8rem; color: var(--black);">Welcome Back</h2>
        <p style="text-align: center; color: #666; margin-bottom: 2rem; font-size: 0.9rem;">Sign in to access your premium shopping profile and review order history.</p>

        <div class="tab-nav" style="display: flex; border-bottom: 1px solid #eee; margin-bottom: 2rem;">
            <div class="tab-btn active" id="loginTabBtn" style="flex: 1; padding: 1rem; text-align: center; cursor: pointer; font-family: var(--font-head); border-bottom: 2px solid var(--gold); font-weight: bold; color: var(--black);">Login</div>
            <div class="tab-btn" id="registerTabBtn" style="flex: 1; padding: 1rem; text-align: center; cursor: pointer; font-family: var(--font-head); border-bottom: 2px solid transparent; color: #888;">Register</div>
        </div>

        <form id="loginForm">
            <div class="input-group">
                <label>Email Address</label>
                <input type="email" id="email" class="input-field" placeholder="" required>
            </div>
            <div class="input-group">
                <label>Password</label>
                <input type="password" id="password" class="input-field" placeholder="" required>
            </div>
            <button type="submit" class="btn" style="width: 100%; padding: 15px;">Secure Login</button>
            <p style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem;">
                <a href="#" id="forgotPassBtn" style="color: #888; text-decoration: underline;">Forgot Password?</a>
            </p>
        </form>

        <form id="registerForm" style="display: none;">
            <div class="input-group">
                <label>Full Name</label>
                <input type="text" id="regName" class="input-field" placeholder="" required>
            </div>
            <div class="input-group">
                <label>Email Address</label>
                <input type="email" id="regEmail" class="input-field" placeholder="" required>
            </div>
            <div class="input-group">
                <label>Phone Number</label>
                <div class="phone-input-container">
                    <span class="phone-prefix">
                        <span>🇵🇰</span> <span>+92</span>
                    </span>
                    <input type="tel" id="regPhone" class="input-field" placeholder="" required style="border: none; background: transparent; height: 100%; padding: 14px 18px; flex: 1; font-size: 0.95rem; width: 100%;" maxlength="10" pattern="[0-9]{10}" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);">
                </div>
            </div>
            <div class="input-group" style="margin-top: 1.8rem;">
                <label>Create Password</label>
                <input type="password" id="regPass" class="input-field" placeholder="" required>
            </div>
            <button type="submit" class="btn" style="width: 100%; padding: 15px;">Create Account</button>
        </form>
    `;

    const logTab = document.getElementById('loginTabBtn');
    const regTab = document.getElementById('registerTabBtn');
    const logForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');

    logTab.onclick = () => {
        logTab.classList.add('active');
        logTab.style.borderColor = "var(--gold)";
        logTab.style.fontWeight = "bold";
        logTab.style.color = "var(--black)";

        regTab.classList.remove('active');
        regTab.style.borderColor = "transparent";
        regTab.style.fontWeight = "normal";
        regTab.style.color = "#888";

        logForm.style.display = 'block';
        regForm.style.display = 'none';
    };

    regTab.onclick = () => {
        regTab.classList.add('active');
        regTab.style.borderColor = "var(--gold)";
        regTab.style.fontWeight = "bold";
        regTab.style.color = "var(--black)";

        logTab.classList.remove('active');
        logTab.style.borderColor = "transparent";
        logTab.style.fontWeight = "normal";
        logTab.style.color = "#888";

        regForm.style.display = 'block';
        logForm.style.display = 'none';
    };

    logForm.onsubmit = (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email').value.trim().toLowerCase();
        const passInput = document.getElementById('password').value;

        const user = users.find(u => u.email === emailInput && u.pass === passInput);
        if (user) {
            currentUser = { email: user.email, name: user.name, phone: user.phone };
            saveDb('gw_current_user', currentUser);
            
            showPremiumAlert("Welcome Back", `Login successful! Good to see you, ${user.name}.`, "success", () => {
                loadAccountPage();
            });
        } else {
            showPremiumAlert("Access Denied", "No matching user found with those credentials.", "error");
        }
    };

    regForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const phone = document.getElementById('regPhone').value.trim();
        const pass = document.getElementById('regPass').value;

        if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
            showPremiumAlert("Invalid Phone", "Please enter exactly 10 digits for your phone number.", "error");
            document.getElementById('regPhone')?.focus();
            return;
        }
        const finalPhone = '+92' + phone;

        if (pass.length < 5) {
            showPremiumAlert("Password Weak", "Please ensure your security password has at least 5 characters.", "error");
            return;
        }

        const emailExists = users.some(u => u.email === email);
        if (emailExists) {
            showPremiumAlert("Account Exists", "An account is already configured under this email address.", "error");
            return;
        }

        const newUser = { email, name, phone: finalPhone, pass };
        await addUserToServer(newUser);

        users.push(newUser);
        saveDb('gw_users', users);

        currentUser = { email, name, phone: finalPhone };
        saveDb('gw_current_user', currentUser);

        showPremiumAlert("Registered", `✓ Account configured for ${name} successfully! Welcome to the elite tier of giving.`, "success", () => {
            loadAccountPage();
        });
    };

    const forgotPassBtn = document.getElementById('forgotPassBtn');
    if (forgotPassBtn) {
        forgotPassBtn.onclick = (e) => {
            e.preventDefault();
            showPremiumAlert("Password Reset", "For luxury accounts, please coordinate directly with customercare@giftwallay.com to reset password keys.", "info");
        };
    }
}

function renderUserDashboard(container) {
    const parentContainer = container.closest('.auth-container');
    if (parentContainer) {
        parentContainer.style.maxWidth = "850px";
        parentContainer.style.padding = "2.5rem";
    }

    const userOrders = orders.filter(o => o.email === currentUser.email);
    let ordersHtml = "";

    if (userOrders.length === 0) {
        ordersHtml = `<p style="color: #888; font-style: italic;">No past transactions recorded under your premium member keys.</p>`;
    } else {
        ordersHtml = userOrders.map(o => {
            const itemsList = o.items.map(item => `• ${item.name} (Qty: ${item.qty})`).join('<br>');
            
            let statusColor = "orange";
            if (o.status.toLowerCase() === 'accepted' || o.status.toLowerCase() === 'shipped') statusColor = "blue";
            if (o.status.toLowerCase() === 'delivered') statusColor = "green";
            if (o.status.toLowerCase() === 'rejected') statusColor = "red";

            return `
                <div style="background: #fafafa; border: 1px solid #eee; padding: 1.2rem; margin-bottom: 1rem; border-left: 3px solid ${statusColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong>Order #${o.orderNum}</strong>
                        <span style="background: ${statusColor}; color: white; padding: 3px 10px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">${o.status}</span>
                    </div>
                    <div style="font-size: 0.9rem; color: #555; line-height: 1.5; margin-bottom: 8px;">
                        ${itemsList}
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #888; border-top: 1px dashed #eee; padding-top: 5px;">
                        <span>Date: ${o.date}</span>
                        <strong>Total: Rs. ${o.total.toLocaleString()}</strong>
                    </div>
                </div>
            `;
        }).join('');
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 3rem;">
            <div style="border-right: 1px solid #eee; padding-right: 2rem;">
                <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 1.5rem;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: #000; color: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-family: var(--font-head); font-weight: bold; margin-bottom: 10px; border: 2px solid var(--gold);">
                        ${currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 style="font-size: 1.3rem;">${currentUser.name}</h3>
                    <p style="color: var(--gold); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; margin-top: 3px;">Elite Member</p>
                </div>
                <div style="font-size: 0.85rem; color: #555; display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem;">
                    <p>📧 <strong>Email:</strong> ${currentUser.email}</p>
                    <p>📞 <strong>Phone:</strong> ${currentUser.phone}</p>
                </div>
                <button class="btn" id="logoutBtn" style="padding: 10px; font-size: 0.8rem; background: #eee; color: #333; border-color: #eee;">Logout Session</button>
            </div>

            <div>
                <h3 style="font-family: var(--font-head); margin-bottom: 1.5rem; font-size: 1.4rem; color: var(--black); border-bottom: 1px solid #eee; padding-bottom: 8px;">Your Orders</h3>
                <div style="max-height: 380px; overflow-y: auto; padding-right: 5px;">
                    ${ordersHtml}
                </div>
            </div>
        </div>
    `;

    document.getElementById('logoutBtn').onclick = () => {
        showPremiumConfirm(
            "Logout?",
            "Are you sure you want to end your premium browsing session?",
            () => {
                currentUser = null;
                saveDb('gw_current_user', currentUser);
                window.location.reload();
            }
        );
    };
}

// --- 8.5. INJECT PREMIUM BACK BUTTON FOR INNER PAGES ---
function injectBackButton() {
}

// --- 8.8. ENDLESS CATEGORY CAROUSEL DRAG & AUTO-ROTATING SYSTEM ---
let carouselX = 0;
let carouselSpeed = 0.5; 
let isCarouselDragging = false;
let startCarouselX = 0;
let dragCarouselX = 0;
let animationFrameId = null;

function initInfiniteCarousel() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    const wrapper = document.querySelector('.scroll-wrapper');
    const track = document.querySelector('.scroll-track');
    if (!wrapper || !track) return;

    track.style.animation = 'none';

    carouselX = 0; 
    const trackWidth = track.scrollWidth;
    const halfWidth = trackWidth / 2;

    function step() {
        if (!isCarouselDragging) {
            carouselX -= carouselSpeed;
            if (carouselX <= -halfWidth) {
                carouselX = 0;
            } else if (carouselX > 0) {
                carouselX = -halfWidth;
            }
            track.style.transform = `translate3d(${carouselX}px, 0, 0)`;
        }
        animationFrameId = requestAnimationFrame(step);
    }

    function onDragStart(e) {
        isCarouselDragging = true;
        const pageX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        startCarouselX = pageX;
        dragCarouselX = carouselX;
        wrapper.style.cursor = 'grabbing';
    }

    function onDragMove(e) {
        if (!isCarouselDragging) return;
        const pageX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const diff = pageX - startCarouselX;
        carouselX = dragCarouselX + diff;

        if (diff < 0) {
            carouselSpeed = 0.5; 
        } else if (diff > 0) {
            carouselSpeed = -0.5; 
        }

        if (carouselX <= -halfWidth) {
            carouselX += halfWidth;
            dragCarouselX += halfWidth;
        } else if (carouselX > 0) {
            carouselX -= halfWidth;
            dragCarouselX -= halfWidth;
        }

        track.style.transform = `translate3d(${carouselX}px, 0, 0)`;
    }

    function onDragEnd() {
        if (!isCarouselDragging) return;
        isCarouselDragging = false;
        wrapper.style.cursor = 'grab';
    }

    wrapper.removeEventListener('mousedown', onDragStart);
    wrapper.addEventListener('mousedown', onDragStart);
    
    window.removeEventListener('mousemove', onDragMove);
    window.addEventListener('mousemove', onDragMove);
    
    window.removeEventListener('mouseup', onDragEnd);
    window.addEventListener('mouseup', onDragEnd);

    wrapper.removeEventListener('touchstart', onDragStart);
    wrapper.addEventListener('touchstart', onDragStart, { passive: true });
    
    window.removeEventListener('touchmove', onDragMove);
    window.addEventListener('touchmove', onDragMove, { passive: true });
    
    window.removeEventListener('touchend', onDragEnd);
    window.addEventListener('touchend', onDragEnd);

    step();
}

// --- 9. BOOT ENGINE ON WINDOW LOAD ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initStore());
} else {
    initStore();
}
