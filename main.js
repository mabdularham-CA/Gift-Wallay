/* main.js - Premium Gift Wallay Store Engine */

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

// In-memory local state copies synced with server DB
let products = [];
let cart = getDb('gw_cart', []);
let users = [];
let orders = [];
let currentUser = getDb('gw_current_user', null);

let isStoreInitialized = false;
let initPromise = null;

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
    
    // 3. Fetch fresh database values in parallel in the background (Non-blocking)
    initPromise = Promise.all([
        fetch('/api/products').then(r => {
            if (!r.ok) throw new Error("Status " + r.status);
            return r.json();
        }).then(data => {
            if (data && Array.isArray(data)) {
                products = data;
                saveDb('gw_products', data);
            }
        }).catch(err => {
            console.error("Failed to load products from server, falling back:", err);
        }),
        
        fetch('/api/users').then(r => {
            if (!r.ok) throw new Error("Status " + r.status);
            return r.json();
        }).then(data => {
            if (data && Array.isArray(data)) {
                users = data;
                saveDb('gw_users', data);
            }
        }).catch(err => {
            console.error("Failed to load users from server, falling back:", err);
        }),
        
        fetch('/api/orders').then(r => {
            if (!r.ok) throw new Error("Status " + r.status);
            return r.json();
        }).then(data => {
            if (data && Array.isArray(data)) {
                orders = data;
                saveDb('gw_orders', data);
            }
        }).catch(err => {
            console.error("Failed to load orders from server, falling back:", err);
        })
    ]).then(() => {
        isStoreInitialized = true;
        
        // Refresh with fresh database data quietly (with zero visual jumps)
        injectHeaderFooter();
        loadPageData();
        updateCartBadge();
        
        if (page === 'index.html' || page === '') {
            initInfiniteCarousel();
        }
    });
    
    return initPromise;
}

// API synchronizers
async function saveProductToServer(newProduct) {
    try {
        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
    } catch (e) {
        console.error("Failed to sync product to server:", e);
    }
}

async function deleteProductFromServer(id) {
    try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (e) {
        console.error("Failed to delete product from server:", e);
    }
}

async function addReviewToServer(productId, review) {
    try {
        await fetch(`/api/products/${productId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });
    } catch (e) {
        console.error("Failed to add review to server:", e);
    }
}

async function addOrderToServer(order) {
    try {
        await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
    } catch (e) {
        console.error("Failed to add order to server:", e);
    }
}

async function updateOrderStatusOnServer(orderNum, status) {
    try {
        await fetch(`/api/orders/${orderNum}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
    } catch (e) {
        console.error("Failed to update status on server:", e);
    }
}

async function addUserToServer(user) {
    try {
        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
    } catch (e) {
        console.error("Failed to add user to server:", e);
    }
}

// --- 3. COMMON DYNAMIC NAVBAR & SIDEBAR INJECTION ---
function injectHeaderFooter() {
    // Determine current page filename
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    
    // Skip injection on admin lock or admin screen, as it has a custom admin layout
    if (page === 'admin.html') return;

    // 1. Inject Banner + Navbar Content inside a single fixed wrapper
    const bannerHtml = `
        <div id="topBanner" style="background: black; color: var(--gold); text-align: center; padding: 10px; font-size: 0.8rem; letter-spacing: 1.5px; font-weight: 700; width: 100%;">
            WELCOME10 - GET 10% OFF YOUR FIRST ORDER
        </div>
    `;
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.removeAttribute('style'); // Clear any inline styles like top: 35px
        
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
                <div class="logo-container" style="display: flex; align-items: center; gap: 12px;">
                    <!-- Beautiful SVG Gift Box Icon with GW inside -->
                    <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.06));">
                        <!-- Gift Box Base -->
                        <rect x="20" y="45" width="60" height="45" rx="4" fill="#ffffff" stroke="var(--gold)" stroke-width="4.5"/>
                        <rect x="18" y="38" width="64" height="10" rx="2" fill="var(--gold)"/>
                        <!-- Golden Ribbon Vertical -->
                        <rect x="47" y="38" width="6" height="52" fill="var(--gold)"/>
                        <!-- GW Letters inside box -->
                        <text x="31" y="70" font-family="'Cinzel', serif" font-size="20" font-weight="bold" fill="#000000">G</text>
                        <text x="53" y="70" font-family="'Cinzel', serif" font-size="20" font-weight="bold" fill="var(--gold)">W</text>
                        <!-- Heart in the middle of G -->
                        <path d="M41 59.5 C41 58.5, 42 57.5, 43 58.5 C44 57.5, 45 58.5, 45 59.5 C45 61, 43 62, 43 62 C43 62, 41 61, 41 59.5 Z" fill="var(--gold)"/>
                        <!-- Golden Bow Ribbon on Top -->
                        <path d="M50 38 C40 25, 30 35, 48 38 Z" fill="var(--gold)" stroke="var(--gold)" stroke-width="1.5"/>
                        <path d="M50 38 C60 25, 70 35, 52 38 Z" fill="var(--gold)" stroke="var(--gold)" stroke-width="1.5"/>
                        <!-- Heart in the center of bow -->
                        <path d="M47 34 C47 32, 48.5 31, 50 32.5 C51.5 31, 53 32, 53 34 C53 36, 50 38, 50 38 C50 38, 47 36, 47 34 Z" fill="#000000"/>
                    </svg>
                    <!-- Brand Text with Logo fonts -->
                    <div style="display: flex; flex-direction: column; align-items: start; line-height: 1.1; text-align: left;">
                        <span style="font-family: var(--font-head); font-size: 1.5rem; font-weight: 700; color: #000000; letter-spacing: 1px; text-transform: uppercase;">Gift<span style="color: var(--gold);">Wallay</span></span>
                        <span style="font-family: 'Cinzel', serif; font-size: 0.55rem; letter-spacing: 1.8px; color: #555; text-transform: uppercase; margin-top: 2px; font-weight: bold;">Har Thofa, Dil Se</span>
                    </div>
                </div>
            </a>
            <div style="display: flex; align-items: center; gap: 1.5rem; position: relative;">
                <a href="cart.html" class="cart-icon" style="display: flex; align-items: center; justify-content: center;">
                    🛒<span class="cart-count">0</span>
                </a>
            </div>
        `;

        // Clean up any existing back button first to avoid duplicates
        const existingBackBtn = document.getElementById('gwBackButton');
        if (existingBackBtn) {
            existingBackBtn.remove();
        }

        if (showBack) {
            const backDiv = document.createElement('div');
            backDiv.id = 'gwBackButton';
            backDiv.style.position = 'fixed';
            backDiv.style.top = '112px'; // Directly under the 98px header (38px banner + 60px navbar)
            backDiv.style.left = '5%';   // Perfectly aligned with the hamburger menu button
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

        // Bind events
        document.getElementById('burgerBtn').addEventListener('click', toggleSidebar);
    }

    // 2. Inject Sidebar Content
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
                
                <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); margin-top: 1.8rem; margin-bottom: 0.8rem; font-weight: bold;">Our Collections</p>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <a href="category.html?type=Watches" class="sidebar-link" style="font-size: 0.95rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">⌚ Watches</a>
                    <a href="category.html?type=Perfumes" class="sidebar-link" style="font-size: 0.95rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">🌹 Perfumes</a>
                    <a href="category.html?type=Wallets" class="sidebar-link" style="font-size: 0.95rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">💼 Wallets</a>
                    <a href="category.html?type=Jewelry" class="sidebar-link" style="font-size: 0.95rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">💎 Jewelry</a>
                    <a href="category.html?type=Glasses" class="sidebar-link" style="font-size: 0.95rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">🕶️ Sunglasses</a>
                    <a href="category.html?type=Customized" class="sidebar-link" style="font-size: 0.95rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">🖋️ Customized</a>
                    <a href="category.html?type=Hampers" class="sidebar-link" style="font-size: 0.95rem; border-bottom: none; padding: 8px 0; display: flex; align-items: center; gap: 8px;">🎁 Gift Hampers</a>
                </div>
            </div>
        </div>
    `;

    // 3. Inject Custom Premium Modal Container
    if (!document.getElementById('gwModalOverlay')) {
        const modalContainer = document.createElement('div');
        modalContainer.id = "gwModalOverlay";
        modalContainer.className = "gw-modal-overlay";
        modalContainer.innerHTML = `
            <div class="gw-modal-card" id="gwModalCard">
                <!-- Injected dynamically -->
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
    // Check if we can map this product to our database for better data matching
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
    } else if (page === 'admin.html') {
        loadAdminPage();
    }
}

// --- 8. PAGE CONTROLLERS ---

// A. INDEX PAGE (Home)
function loadIndexPage() {
    // 1. Dynamic Recently Added
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        // Take the first 4 items or show custom featured items
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

// D. PRODUCT DETAIL PAGE (With Reviews & Review Addition)
function loadProductPage() {
    const params = new URLSearchParams(window.location.search);
    let productId = params.get('id') || "1"; // Default to 1 if no ID passed

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

    // Set Document Title
    document.title = `${product.name} | Gift Wallay`;

    // 1. Render Product Detail Layout
    const detailContainer = document.querySelector('.container.section-pad.split-layout');
    if (detailContainer) {
        const ratingAvg = product.reviews && product.reviews.length > 0 
            ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
            : "5.0";
        const starStr = "★".repeat(Math.round(ratingAvg)) + "☆".repeat(5 - Math.round(ratingAvg));

        detailContainer.innerHTML = `
            <!-- Product Image -->
            <div style="background: #fdfdfd; border: 1px solid #f0f0f0; padding: 1rem; height: 500px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: var(--shadow);">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>

            <!-- Product Details -->
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

                <!-- Quantity controls -->
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

        // Bind Quantity Controls
        let qty = 1;
        document.getElementById('prodQtyMinus').onclick = () => {
            if (qty > 1) qty--;
            document.getElementById('qtyDisplay').innerText = qty;
        };
        document.getElementById('prodQtyPlus').onclick = () => {
            qty++;
            document.getElementById('qtyDisplay').innerText = qty;
        };

        // Bind Add to Cart Click
        document.getElementById('addToCartBtn').onclick = () => {
            addToCartById(product.id, qty);
        };
    }

    // 2. Render Product Reviews Section Dynamically
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

    // Calculate rating stats
    const totalReviews = product.reviews ? product.reviews.length : 0;
    const ratingAvg = totalReviews > 0 
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : "5.0";
    
    // Count distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (product.reviews) {
        product.reviews.forEach(r => {
            if (distribution[r.rating] !== undefined) {
                distribution[r.rating]++;
            }
        });
    } else {
        distribution[5] = 1; // Default
    }

    // Build the visual stars distribution bars
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

    // Build the reviews list
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

    // Set reviews Section contents with premium 2-column layout!
    reviewsSection.innerHTML = `
        <div style="margin-top: 4rem; border-top: 1px solid #eee; padding-top: 4rem;">
            <h3 style="font-family: var(--font-head); font-size: 1.8rem; letter-spacing: 2px; text-transform: uppercase; text-align: center; margin-bottom: 3rem; color: var(--black);">Client Appreciation</h3>
            
            <div style="display: grid; grid-template-columns: 1fr; md:grid-template-columns: 1.2fr 2fr; gap: 4rem; align-items: start;" class="reviews-grid-wrapper">
                
                <!-- Left: Distribution Summary Panel -->
                <div style="background: #fafafa; border: 1px solid rgba(0,0,0,0.05); padding: 2.5rem; position: sticky; top: 120px; box-shadow: 0 4px 20px rgba(0,0,0,0.01);" class="reviews-summary-panel">
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
                    
                    <!-- Write review container (hidden by default, toggles open smoothly) -->
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
                                
                                <!-- Photo Upload -->
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

                <!-- Right: Reviews List -->
                <div style="flex: 1;" class="reviews-list-panel">
                    <h4 style="font-family: var(--font-head); font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--black); margin-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 10px;">Client Feedback</h4>
                    <div id="reviewsWrapper">
                        ${reviewsListHtml}
                    </div>
                </div>

            </div>
        </div>
    `;

    // Dynamic responsive styles for reviews panel grid
    if (!document.getElementById('reviewsMediaStyles')) {
        const style = document.createElement('style');
        style.id = 'reviewsMediaStyles';
        style.innerHTML = `
            @media (min-width: 768px) {
                .reviews-grid-wrapper {
                    grid-template-columns: 1.2fr 2fr !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Toggle Write Review Form open/close smoothly
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

    // Bind Interactive Stars
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

    // Image Upload Bindings
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

    // Form Submit Bind
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

            // Post to Server
            await addReviewToServer(product.id, newReview);

            // Update local state instantly so it re-renders without refreshing
            if (!product.reviews) product.reviews = [];
            product.reviews.unshift(newReview);

            showPremiumAlert("Review Submitted", "Thank you! Your verified feedback has been added successfully.", "success", () => {
                // Re-render
                renderReviews(product);
                // Also trigger product page stats reload
                loadProductPage();
            });
        };
    }
}

// E. SHOPPING CART PAGE (Dynamic Rows & Asking Confirm)
function loadCartPage() {
    const tableBody = document.querySelector('#cartTable tbody');
    const subtotalEl = document.getElementById('cartSubtotal');

    if (!tableBody) return;

    if (cart.length === 0) {
        // Empty state
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

    // Populate rows
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
            // Confirm removal
            cart = cart.filter(item => item.id !== id);
            saveDb('gw_cart', cart);
            updateCartBadge();
            
            // Re-render
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

// F. CHECKOUT PAGE (Dynamic Summary & COD tax calculations with Promo Code support)
function loadCheckoutPage() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) return;

    if (cart.length === 0) {
        showPremiumAlert("Cart Empty", "Your shopping cart is empty. Please add items to checkout.", "info", () => {
            window.location.href = "shop.html";
        });
        return;
    }

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
            
            <!-- Promo Code Section (Top) -->
            <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">
                <label class="checkout-label" style="margin-bottom: 8px; display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #555;">Apply Promo Code (Optional)</label>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                    <input type="text" id="promoCodeInput" class="checkout-input" placeholder="E.g., WELCOME_10" value="${appliedPromo}" style="flex: 1; margin-bottom: 0; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.15); border-radius: 4px; font-size: 0.9rem; height: 40px;" ${discount > 0 ? 'disabled' : ''}>
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

                <!-- TAX ROW -->
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

            <!-- Trust Badges -->
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

        // Bind events inside renderSummary so they are wireable when DOM updates
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

                if (code === 'WELCOME_10' || code === 'WELCOME10') {
                    discount = Math.round(subtotal * 0.1);
                    appliedPromo = 'WELCOME_10';
                    promoSuccess = 'Promo code WELCOME_10 applied! 10% Discount saved.';
                    promoError = '';
                } else if (code === 'EID20') {
                    discount = Math.round(subtotal * 0.2);
                    appliedPromo = 'EID20';
                    promoSuccess = 'Promo code EID20 applied! 20% Discount saved.';
                    promoError = '';
                } else if (code === 'WELCOME500') {
                    discount = Math.min(500, subtotal);
                    appliedPromo = 'WELCOME500';
                    promoSuccess = 'Promo code WELCOME500 applied! Rs. 500 Discount saved.';
                    promoError = '';
                } else {
                    promoError = 'Invalid promo code. Try WELCOME_10.';
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

    // Initial render of summary
    renderSummary();

    // 2. Select Payment Toggle bind
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

        renderSummary(); // Re-render summary to sync surcharge and grand totals!
    };

    // Trigger initial selectPay layout sync (COD is default checked in HTML)
    const initialCodOption = document.querySelector('.pay-option input[value="cod"]');
    if (initialCodOption && initialCodOption.checked) {
        window.selectPay(initialCodOption.closest('.pay-option'), 'cod');
    }

    // 3. Process Checkout Submit
    const completeOrderBtn = document.getElementById('completeOrderBtn') || document.querySelector('button[onclick*="Complete Order"]');
    if (completeOrderBtn) {
        completeOrderBtn.removeAttribute('onclick');
        completeOrderBtn.onclick = async function(e) {
            e.preventDefault();
            
            // Form validation
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
            const paymentType = checkoutForm.querySelector('input[name="payment"]:checked')?.value || 'cod';

            // Generate Order Number
            const orderNum = String(Math.floor(Math.random() * 90000) + 10000);
            const surcharge = paymentType === 'cod' ? Math.round((subtotal - discount) * 0.09) : 0;
            const grandTotal = subtotal + shipping + surcharge - discount;

            const orderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            const newOrder = {
                orderNum,
                email: currentUser ? currentUser.email : "guest@gift.com",
                name: `${firstName} ${lastName}`,
                phone,
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

            // Sync order to backend DB
            await addOrderToServer(newOrder);

            // Save to Orders Database
            orders.unshift(newOrder);
            saveDb('gw_orders', orders);

            // Clear Cart
            cart = [];
            saveDb('gw_cart', cart);
            updateCartBadge();

            // Display Premium Success PopUp and redirect
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
        // USER LOGGED IN - SHOW DASHBOARD
        renderUserDashboard(authContainer);
    } else {
        // USER GUEST - SHOW LOGIN / REGISTRATION TABS
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

        <!-- LOGIN FORM -->
        <form id="loginForm">
            <div class="input-group">
                <label>Email Address</label>
                <input type="email" id="email" class="input-field" placeholder="user@gift.com" required>
            </div>
            <div class="input-group">
                <label>Password</label>
                <input type="password" id="password" class="input-field" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn" style="width: 100%; padding: 15px;">Secure Login</button>
            <p style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem;">
                <a href="#" id="forgotPassBtn" style="color: #888; text-decoration: underline;">Forgot Password?</a>
            </p>
        </form>

        <!-- REGISTER FORM -->
        <form id="registerForm" style="display: none;">
            <div class="input-group">
                <label>Full Name</label>
                <input type="text" id="regName" class="input-field" placeholder="E.g., Zain Ahmed" required>
            </div>
            <div class="input-group">
                <label>Email Address</label>
                <input type="email" id="regEmail" class="input-field" placeholder="zain@gmail.com" required>
            </div>
            <div class="input-group">
                <label>Phone Number</label>
                <input type="text" id="regPhone" class="input-field" placeholder="03XXXXXXXXX" required>
            </div>
            <div class="input-group">
                <label>Create Password</label>
                <input type="password" id="regPass" class="input-field" placeholder="Min. 6 characters" required>
            </div>
            <button type="submit" class="btn" style="width: 100%; padding: 15px;">Create Account</button>
        </form>
    `;

    // Tab Switching binds
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

    // Login Form Submit Bind
    logForm.onsubmit = (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email').value.trim().toLowerCase();
        const passInput = document.getElementById('password').value;

        // Admin override check
        if (emailInput === 'admin@gmail.com' || emailInput === 'admin') {
            if (passInput === 'Gift_Wallay') {
                window.location.href = 'admin.html';
                return;
            } else {
                showPremiumAlert("Auth Failed", "Invalid admin password credentials.", "error");
                return;
            }
        }

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

    // Register Form Submit Bind
    regForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const phone = document.getElementById('regPhone').value.trim();
        const pass = document.getElementById('regPass').value;

        if (pass.length < 5) {
            showPremiumAlert("Password Weak", "Please ensure your security password has at least 5 characters.", "error");
            return;
        }

        const emailExists = users.some(u => u.email === email);
        if (emailExists) {
            showPremiumAlert("Account Exists", "An account is already configured under this email address.", "error");
            return;
        }

        // Add to db
        const newUser = { email, name, phone, pass };
        
        // Sync user creation to backend
        await addUserToServer(newUser);

        users.push(newUser);
        saveDb('gw_users', users);

        // Auto Login
        currentUser = { email, name, phone };
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
    // Style the auth-container box wider for a premium double panel dashboard
    const parentContainer = container.closest('.auth-container');
    if (parentContainer) {
        parentContainer.style.maxWidth = "850px";
        parentContainer.style.padding = "2.5rem";
    }

    // Filter orders by current logged in user
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
            <!-- Profile Info Panel -->
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

            <!-- Past Orders History -->
            <div>
                <h3 style="font-family: var(--font-head); margin-bottom: 1.5rem; font-size: 1.4rem; color: var(--black); border-bottom: 1px solid #eee; padding-bottom: 8px;">Your Orders</h3>
                <div style="max-height: 380px; overflow-y: auto; padding-right: 5px;">
                    ${ordersHtml}
                </div>
            </div>
        </div>
    `;

    // Logout click bind
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

// H. ADMIN DASHBOARD PAGE (Manage Products, Users, and Orders)
function loadAdminPage() {
    // Check if logged in. If yes, hide lock, show panel.
    const lock = document.getElementById('adminLock');
    const panel = document.getElementById('adminPanel');

    window.adminLogin = function() {
        const u = document.getElementById('admUser').value;
        const p = document.getElementById('admPass').value;

        if ((u === 'admin' || u === 'admin@gmail.com') && p === 'Gift_Wallay') {
            if (lock) lock.style.display = 'none';
            if (panel) panel.style.filter = 'none';
            // Auto load active panels
            renderAdminProducts();
            renderAdminUsers();
            renderAdminOrders();
        } else {
            const err = document.getElementById('loginError');
            if (err) err.style.display = 'block';
        }
    };

    // Tab switcher override
    window.showPanel = function(id, btn) {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        const activePanel = document.getElementById(id);
        if (activePanel) activePanel.classList.add('active');
        document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
        btn.classList.add('active');
    };

    // Add Product Bind
    window.addNewProduct = async function() {
        const name = document.getElementById('pName').value.trim();
        const price = parseFloat(document.getElementById('pPrice').value);
        const category = document.getElementById('pCat').value;
        const img = document.getElementById('pImg').value.trim() || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop&q=80";

        if (!name || isNaN(price)) {
            alert("Please fill in Product Name and Price");
            return;
        }

        const newId = String(Date.now());
        const newProduct = {
            id: newId,
            name,
            price,
            category,
            description: `Elegant premium curations in the ${category} collection. Handcrafted for Gift Wallay.`,
            image: img,
            reviews: []
        };

        // Sync to Server
        await saveProductToServer(newProduct);

        products.push(newProduct);
        saveDb('gw_products', products);

        // Reset inputs
        document.getElementById('pName').value = '';
        document.getElementById('pPrice').value = '';
        document.getElementById('pImg').value = '';

        alert("✓ Product Uploaded Successfully!");
        renderAdminProducts();
    };

    // Delete Product Bind
    window.deleteProductAdmin = async function(id) {
        if (confirm("Are you sure you want to permanently delete this product?")) {
            await deleteProductFromServer(id);
            products = products.filter(p => p.id !== id);
            saveDb('gw_products', products);
            renderAdminProducts();
        }
    };

    // Admin order status modifier
    window.updateOrderStatus = async function(orderNum, newStatus) {
        const order = orders.find(o => o.orderNum === orderNum);
        if (order) {
            await updateOrderStatusOnServer(orderNum, newStatus);
            order.status = newStatus;
            saveDb('gw_orders', orders);
            renderAdminOrders();
            alert(`✓ Order #${orderNum} status set to ${newStatus}`);
        }
    };
}

// Admin Sub-renderers
function renderAdminProducts() {
    const list = document.getElementById('inventoryList');
    if (!list) return;

    list.innerHTML = products.map(p => `
        <div class="product-list-item" style="animation: slideUp 0.3s ease;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; border: 1px solid #ddd; overflow: hidden;">
                    <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div>
                    <strong>${p.name}</strong><br>
                    <small style="color: var(--gold); font-weight: bold;">PKR ${p.price.toLocaleString()}</small> | <small style="color:#666;">Cat: ${p.category}</small>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteProductAdmin('${p.id}')">×</button>
        </div>
    `).join('');
}

function renderAdminUsers() {
    const userTableBody = document.querySelector('#users table tbody');
    if (!userTableBody) return;

    userTableBody.innerHTML = users.map((u, idx) => `
        <tr>
            <td>${idx + 101}</td>
            <td style="font-weight: bold; color: #111;">${u.name}</td>
            <td>${u.email}</td>
            <td>${u.phone}</td>
            <td>Rs. 0</td>
            <td><a href="#" onclick="alert('Viewing keys for member ${u.name}. Phone: ${u.phone}')" style="color: var(--gold); text-decoration: underline; font-weight: bold;">Inspect</a></td>
        </tr>
    `).join('');
}

function renderAdminOrders() {
    const orderList = document.querySelector('#orders div');
    if (!orderList) return;

    if (orders.length === 0) {
        orderList.innerHTML = `<p style="padding: 2rem; color: #666;">No incoming customer transactions recorded yet.</p>`;
        return;
    }

    orderList.innerHTML = orders.map(o => {
        const itemsStr = o.items.map(item => `${item.name} (x${item.qty})`).join(', ');
        
        let statusColor = "orange";
        if (o.status.toLowerCase() === 'accepted' || o.status.toLowerCase() === 'shipped') statusColor = "blue";
        if (o.status.toLowerCase() === 'delivered') statusColor = "green";
        if (o.status.toLowerCase() === 'rejected') statusColor = "red";

        return `
            <div class="product-list-item" style="border-left-width: 5px; border-left-color: ${statusColor}; margin-bottom: 1.5rem; flex-direction: column; align-items: flex-start; gap: 10px; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; border-bottom: 1px dashed #eee; padding-bottom: 8px;">
                    <strong>Order #${o.orderNum} (${o.date})</strong>
                    <span style="background: ${statusColor}; color: white; padding: 2px 8px; font-size: 0.65rem; font-weight: bold; text-transform: uppercase;">${o.status}</span>
                </div>
                <div style="font-size: 0.9rem; color: #333; width: 100%;">
                    <p style="margin-bottom: 5px;">👤 <strong>Client:</strong> ${o.name} (${o.phone}) | ✉️ ${o.email}</p>
                    <p style="margin-bottom: 5px;">📍 <strong>Delivery Address:</strong> ${o.address}</p>
                    <p style="margin-bottom: 5px;">📦 <strong>Items:</strong> ${itemsStr}</p>
                    <p>💰 <strong>Total Amount:</strong> <span style="color: var(--gold); font-weight: bold;">Rs. ${o.total.toLocaleString()}</span> [Method: ${o.payment.toUpperCase()}]</p>
                </div>
                <div style="display: flex; gap: 10px; align-self: flex-end; margin-top: 10px;">
                    <button class="btn" onclick="updateOrderStatus('${o.orderNum}', 'Accepted')" style="padding: 6px 15px; font-size: 0.7rem; background: #28a745; border-color: #28a745; color: white;">Accept</button>
                    <button class="btn" onclick="updateOrderStatus('${o.orderNum}', 'Shipped')" style="padding: 6px 15px; font-size: 0.7rem; background: #007bff; border-color: #007bff; color: white;">Ship</button>
                    <button class="btn" onclick="updateOrderStatus('${o.orderNum}', 'Delivered')" style="padding: 6px 15px; font-size: 0.7rem; background: #17a2b8; border-color: #17a2b8; color: white;">Deliver</button>
                    <button class="btn" onclick="updateOrderStatus('${o.orderNum}', 'Rejected')" style="padding: 6px 15px; font-size: 0.7rem; background: #dc3545; border-color: #dc3545; color: white;">Reject</button>
                </div>
            </div>
        `;
    }).join('');
}


// --- 8.5. INJECT PREMIUM BACK BUTTON FOR INNER PAGES ---
function injectBackButton() {
    // Handled inline in dynamic navbar generation for superior placement just after the setting button.
}


// --- 8.8. ENDLESS CATEGORY CAROUSEL DRAG & AUTO-ROTATING SYSTEM ---
let carouselX = 0;
let carouselSpeed = 0.5; // default speed (pixels per frame)
let isCarouselDragging = false;
let startCarouselX = 0;
let dragCarouselX = 0;
let animationFrameId = null;

function initInfiniteCarousel() {
    const wrapper = document.querySelector('.scroll-wrapper');
    const track = document.querySelector('.scroll-track');
    if (!wrapper || !track) return;

    // Remove any old CSS animation to let Javascript control coordinates with 1:1 precision
    track.style.animation = 'none';

    const trackWidth = track.scrollWidth;
    const halfWidth = trackWidth / 2;

    function step() {
        if (!isCarouselDragging) {
            carouselX -= carouselSpeed;
            // Seamless infinite wrap around
            if (carouselX <= -halfWidth) {
                carouselX = 0;
            } else if (carouselX > 0) {
                carouselX = -halfWidth;
            }
            track.style.transform = `translate3d(${carouselX}px, 0, 0)`;
        }
        animationFrameId = requestAnimationFrame(step);
    }

    // Drag Actions
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

        // Dynamic auto-rotate direction sync based on user drag direction!
        if (diff < 0) {
            carouselSpeed = 0.5; // Dragged left -> rolls left endless
        } else if (diff > 0) {
            carouselSpeed = -0.5; // Dragged right -> rolls right endless
        }

        // Keep inside bounds
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

    // Attach dragging events
    wrapper.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    wrapper.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    step();
}

// --- 9. BOOT ENGINE ON WINDOW LOAD ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStore);
} else {
    initStore();
}
