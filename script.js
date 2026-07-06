// Global Mock Database
const DATABASE = {
    products: [
        { id: 'p1', title: 'Cyberpunk Ronin', price: 2999, category: 'Anime', img: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&q=80', desc: 'Ultra-matte finish steel structure featuring hyper-detailed high contrast vector painting.' },
        { id: 'p2', title: 'Retro Synthwave Grid', price: 2999, category: 'Neon', img: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80', desc: 'Deep neon laser aesthetic backdropped into thick, laser-cut specialized alloy.' },
        { id: 'p3', title: 'The Great Manga Wave', price: 3499, category: 'Anime', img: 'https://images.unsplash.com/photo-15786322767115-351597cf2477?w=800&q=80', desc: 'Classic structural layout re-imagined on metadata plate architecture.' },
        { id: 'p4', title: 'Minimalist Tokyo Streets', price: 2799, category: 'Minimalist', img: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=800&q=80', desc: 'Pure black and white structural execution matching architectural blueprints.' }
    ],
    cart: []
};

// Client Route Architecture
const VIEWS = {
    home: () => `
        <div class="view-transition">
            <!-- Hero Spotlight -->
            <section class="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="space-y-8">
                    <span class="text-xs font-mono text-neutral-400 tracking-[0.3em] uppercase">Signature Series</span>
                    <h1 class="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-white">GALVANIZED<br>WALL PIECES.</h1>
                    <p class="text-neutral-400 text-sm max-w-sm leading-relaxed">High-fidelity printing on ultra-thin premium structural alloy. Masterfully built with dynamic light absorption and seamless tool-free magnet installation arrays.</p>
                    <div class="flex gap-4">
                        <button onclick="navigateTo('shop')" class="bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-neutral-200 transition-colors">Explore Gallery</button>
                        <button onclick="navigateTo('custom')" class="border border-neutral-800 text-white text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-neutral-900 transition-colors">Custom Asset Setup</button>
                    </div>
                </div>
                <div class="flex justify-center relative">
                    <div class="w-full max-w-sm bg-neutral-900 p-3 rounded-2xl shadow-2xl border border-neutral-800/60 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        <img src="${DATABASE.products[0].img}" class="rounded-xl w-full h-[450px] object-cover">
                    </div>
                </div>
            </section>
        </div>
    `,
    shop: () => `
        <div class="view-transition max-w-7xl mx-auto px-6 py-12">
            <div class="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-6 mb-12">
                <div>
                    <h2 class="text-2xl font-black uppercase tracking-wider">Catalog Gallery</h2>
                    <p class="text-xs text-neutral-500 mt-1">Select an architectural art piece engineered to endure</p>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                ${DATABASE.products.map(p => `
                    <div class="group bg-neutral-900/40 border border-neutral-900 rounded-2xl p-3 flex flex-col justify-between hover:border-neutral-800 transition-all duration-300">
                        <div class="overflow-hidden rounded-xl bg-neutral-950 cursor-pointer" onclick="navigateTo('product', '${p.id}')">
                            <img src="${p.img}" class="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100">
                        </div>
                        <div class="mt-4">
                            <div class="flex justify-between items-start">
                                <h3 class="font-bold text-sm tracking-wide text-white cursor-pointer" onclick="navigateTo('product', '${p.id}')">${p.title}</h3>
                                <span class="text-xs font-mono text-neutral-400">Rs. ${p.price}</span>
                            </div>
                            <p class="text-[10px] uppercase tracking-widest text-neutral-500 mt-0.5 mb-4">${p.category}</p>
                            <button onclick="addToCart('${p.id}')" class="w-full bg-neutral-900 border border-neutral-800 text-white text-[11px] font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-white hover:text-black hover:border-white transition-all">Add to Bag</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `,
    product: (id) => {
        const p = DATABASE.products.find(item => item.id === id) || DATABASE.products[0];
        return `
            <div class="view-transition max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div class="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                    <img src="${p.img}" class="w-full h-[500px] object-cover rounded-xl">
                </div>
                <div class="flex flex-col justify-center space-y-6">
                    <span class="text-xs font-mono text-neutral-500 uppercase tracking-widest">${p.category} Collection</span>
                    <h2 class="text-4xl font-black text-white">${p.title}</h2>
                    <p class="text-xl font-mono text-neutral-200">Rs. ${p.price}.00</p>
                    <p class="text-sm text-neutral-400 leading-relaxed">${p.desc}</p>
                    <div class="pt-4 border-t border-neutral-900 space-y-3">
                        <h4 class="text-xs uppercase tracking-wider font-bold text-neutral-300">Specifications Matrix</h4>
                        <ul class="text-xs text-neutral-500 space-y-1 font-mono">
                            <li>- Dimensions: 450mm x 320mm</li>
                            <li>- Thickness: 0.5mm Composite Alloy</li>
                            <li>- Finish: High Definition Matte UV-Shielded</li>
                        </ul>
                    </div>
                    <button onclick="addToCart('${p.p1}')" class="w-full bg-white text-black text-xs font-bold uppercase tracking-widest py-4 hover:bg-neutral-200 transition-colors">Secure This Piece</button>
                </div>
            </div>
        `;
    },
    custom: () => `
        <div class="view-transition max-w-3xl mx-auto px-6 py-16 text-center space-y-8">
            <div>
                <h2 class="text-3xl font-black uppercase tracking-widest">Custom Plate Lab</h2>
                <p class="text-xs text-neutral-400 mt-2">Upload personal memories or dynamic graphic assets to construct your personal aluminum alloy display matrix.</p>
            </div>
            <div class="border-2 border-dashed border-neutral-800 rounded-3xl p-12 bg-neutral-900/20 flex flex-col items-center justify-center space-y-4">
                <div class="p-4 bg-neutral-900 rounded-full text-neutral-400"><i data-lucide="upload-cloud" class="w-8 h-8"></i></div>
                <div>
                    <p class="text-sm font-bold text-white">Drag design matrix file here</p>
                    <p class="text-xs text-neutral-500 mt-1">Supports high resolution PNG, JPG (Min 300 DPI recommended)</p>
                </div>
                <input type="file" class="text-xs text-neutral-400 mt-2">
            </div>
            <button onclick="triggerNotification('Lab Alert', 'Custom compilation simulated successfully.')" class="bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-3.5">Initialize Production Frame</button>
        </div>
    `,
    cart: () => `
        <div class="view-transition max-w-4xl mx-auto px-6 py-16">
            <h2 class="text-2xl font-black uppercase tracking-wider mb-8">Selected Bag Assets</h2>
            ${DATABASE.cart.length === 0 ? `
                <div class="text-center py-16 border border-neutral-900 rounded-2xl bg-neutral-900/10">
                    <p class="text-neutral-400 text-sm">Your secure asset bag is currently empty.</p>
                    <button onclick="navigateTo('shop')" class="mt-4 text-xs font-bold uppercase tracking-widest text-white underline">Browse Items</button>
                </div>
            ` : `
                <div class="space-y-4">
                    ${DATABASE.cart.map((item, index) => `
                        <div class="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                            <div class="flex items-center gap-4">
                                <img src="${item.img}" class="w-16 h-16 object-cover rounded-lg">
                                <div>
                                    <h4 class="text-sm font-bold text-white">${item.title}</h4>
                                    <p class="text-xs text-neutral-500 font-mono">Rs. ${item.price}</p>
                                </div>
                            </div>
                            <button onclick="removeFromCart(${index})" class="text-neutral-500 hover:text-rose-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    `).join('')}
                    <div class="pt-6 border-t border-neutral-900 flex justify-between items-center">
                        <div>
                            <p class="text-xs text-neutral-400">Total Valuation</p>
                            <p class="text-xl font-mono font-black text-white">Rs. ${DATABASE.cart.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}</p>
                        </div>
                        <button onclick="checkoutMock()" class="bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-neutral-200 transition-colors">Proceed to Dispatch Pipeline</button>
                    </div>
                </div>
            `}
        </div>
    `
};

// Routing Controller Matrix
function navigateTo(viewKey, param = null) {
    const root = document.getElementById('view-root');
    if (VIEWS[viewKey]) {
        root.innerHTML = VIEWS[viewKey](param);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        lucide.createIcons();
        
        // Dynamic navigation indicator management
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('text-white');
            link.classList.add('text-neutral-400');
        });
    }
}

// Global Core Cart Functions
function addToCart(productId) {
    const product = DATABASE.products.find(p => p.id === productId);
    if (product) {
        DATABASE.cart.push(product);
        updateCartIndicator();
        triggerNotification("Cart Updated", `${product.title} cataloged into bag.`);
    }
}

function removeFromCart(index) {
    DATABASE.cart.splice(index, 1);
    updateCartIndicator();
    navigateTo('cart');
    triggerNotification("Cart Updated", "Item extracted from secure container.");
}

function updateCartIndicator() {
    const counter = document.getElementById('cart-counter');
    if (DATABASE.cart.length > 0) {
        counter.textContent = DATABASE.cart.length;
        counter.classList.remove('hidden');
    } else {
        counter.classList.add('hidden');
    }
}

function checkoutMock() {
    DATABASE.cart = [];
    updateCartIndicator();
    navigateTo('home');
    triggerNotification("Order Authorized", "Manifest generated successfully. Dispatch track queued inside Settings Hub.");
}

// Drawer Visibility State Management (Three-line Setting Logo Handler)
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('account-drawer-toggle');
    const close = document.getElementById('drawer-close');
    const overlay = document.getElementById('drawer-overlay');
    const drawer = document.getElementById('account-drawer');
    const innerContainer = drawer.querySelector('.absolute.top-0.left-0');

    function openDrawer() {
        drawer.classList.remove('pointer-events-none');
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
        innerContainer.classList.remove('-translate-x-full');
    }

    function closeDrawer() {
        drawer.classList.add('pointer-events-none');
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        innerContainer.classList.add('-translate-x-full');
    }

    toggle.addEventListener('click', openDrawer);
    close.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Initial View Injection Setup
    navigateTo('home');
});

// Luxury Modular Toast Pipeline
function triggerNotification(title, content) {
    const container = document.getElementById('toast-bin');
    const toast = document.createElement('div');
    toast.className = "bg-neutral-900 border border-neutral-800 text-neutral-100 p-4 rounded-xl shadow-2xl flex flex-col gap-0.5 min-w-[260px] opacity-0 translate-y-2 transition-all duration-300";
    toast.innerHTML = `
        <span class="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-400 font-bold">${title}</span>
        <span class="text-xs text-neutral-300">${content}</span>
    `;
    container.appendChild(toast);
    
    // Smooth insertion reflow frame trigger
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
    }, 50);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
