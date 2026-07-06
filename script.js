// --- MOCK DATA FROM mockData.js ---
const categories = [
    { id: 'anime', name: 'ANIME', slug: 'anime', image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&q=80' },
    { id: 'comics', name: 'COMICS', slug: 'comics', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80' },
    { id: 'cartoons', name: 'CARTOONS', slug: 'cartoons', image: 'https://images.unsplash.com/photo-1530099486328-e021101a494a?w=800&q=80' },
    { id: 'gaming', name: 'GAMING', slug: 'gaming', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80' },
    { id: 'motivational', name: 'MOTIVATIONAL QUOTES', slug: 'motivational', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80' }
];

const products = [
    { id: '1', title: 'Cyberpunk Warrior', category: 'anime', price: 2499, image: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&q=80', description: 'High-quality metal poster featuring a cyberpunk warrior in stunning detail.', featured: true, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '2', title: 'Neon City Dreams', category: 'anime', price: 2799, image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80', description: 'Vibrant neon cityscape with futuristic anime aesthetics.', featured: true, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '3', title: 'Minimalist Cat', category: 'cartoons', price: 1999, image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80', description: 'Cute minimalist cat design perfect for any room.', featured: true, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '4', title: 'Abstract Warrior', category: 'anime', price: 2299, image: 'https://images.unsplash.com/photo-15786322767115-351597cf2477?w=800&q=80', description: 'Abstract warrior design with bold colors and dynamic composition.', featured: true, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '5', title: 'Gaming Controller', category: 'gaming', price: 2199, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80', description: 'Classic gaming controller in vibrant colors.', featured: false, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '6', title: 'Retro Gaming', category: 'gaming', price: 2399, image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80', description: 'Retro gaming aesthetics for the nostalgic gamer.', featured: false, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '7', title: 'Superhero Icon', category: 'comics', price: 2599, image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&q=80', description: 'Iconic superhero design in bold comic book style.', featured: false, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '8', title: 'Motivational Quote', category: 'motivational', price: 1799, image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80', description: 'Inspirational quote to keep you motivated every day.', featured: false, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '9', title: 'Dream Big', category: 'motivational', price: 1899, image: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&q=80', description: 'Bold typography with powerful motivational message.', featured: false, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '10', title: 'Cartoon Adventure', category: 'cartoons', price: 2099, image: 'https://images.unsplash.com/photo-1528557865400-b88d5dce5174?w=800&q=80', description: 'Whimsical cartoon characters on an adventure.', featured: false, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '11', title: 'Space Explorer', category: 'anime', price: 2699, image: 'https://images.unsplash.com/photo-1579566346927-c68383817a25?w=800&q=80', description: 'Epic space exploration scene with stunning visuals.', featured: false, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] },
    { id: '12', title: 'Comic Hero', category: 'comics', price: 2499, image: 'https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?w=800&q=80', description: 'Classic comic book hero in action pose.', featured: false, sizes: ['Small (30x40cm)', 'Medium (40x60cm)', 'Large (60x90cm)'] }
];

// --- GLOBAL APPLICATION STATE ---
let cartCount = 0;

// --- DOM ELEMENTS ---
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
const cartBadge = document.getElementById('cart-count-badge');
const desktopDropdown = document.getElementById('desktop-categories-dropdown');
const mobileCategoriesList = document.getElementById('mobile-categories-list');
const categoriesGrid = document.getElementById('categories-grid');
const productsGrid = document.getElementById('products-grid');
const newsletterForm = document.getElementById('newsletter-form');
const toastContainer = document.getElementById('toast-container');

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderFeaturedProducts();
    setupEventListeners();
    lucide.createIcons(); // Initialize Lucide Icons graphics
});

// --- RENDER COMPONENT FUNCTIONS ---
function renderCategories() {
    let dropdownHtml = '';
    let mobileListHtml = '';
    let gridHtml = '';

    categories.forEach(cat => {
        dropdownHtml += `<a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-yellow-600 transition-colors">${cat.name}</a>`;
        mobileListHtml += `<a href="#" class="block py-1 pl-4 text-gray-600 hover:text-yellow-600">${cat.name}</a>`;
        gridHtml += `
            <a href="#" class="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <img src="${cat.image}" alt="${cat.name}" class="w-full h-full object-cover brightness-75 group-hover:brightness-50 group-hover:scale-110 transition-all duration-500" />
                <div class="absolute inset-0 flex items-center justify-center">
                    <h3 class="text-white font-bold text-xl md:text-2xl text-center px-4 group-hover:scale-110 transition-transform duration-300">${cat.name}</h3>
                </div>
            </a>`;
    });

    desktopDropdown.innerHTML = dropdownHtml;
    mobileCategoriesList.innerHTML = mobileListHtml;
    categoriesGrid.innerHTML = gridHtml;
}

function renderFeaturedProducts() {
    const featuredProducts = products.filter(p => p.featured);
    let html = '';

    featuredProducts.forEach(product => {
        html += `
        <div class="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-yellow-600 transition-all duration-300 hover:shadow-lg">
            <div class="aspect-square overflow-hidden bg-gray-100">
                <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">${product.title}</h3>
                <p class="text-sm text-gray-500 mb-3">${product.category.toUpperCase()}</p>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-bold text-gray-900">PKR ${product.price.toLocaleString()}</span>
                    <button class="add-to-cart-btn p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors" data-title="${product.title}">
                        <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>`;
    });

    productsGrid.innerHTML = html;
}

// --- EVENT HANDLERS & ACTIONS ---
function setupEventListeners() {
    // Mobile Responsive Menu Toggle
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const isHidden = mobileMenu.classList.contains('hidden');
        menuIcon.setAttribute('data-lucide', isHidden ? 'menu' : 'x');
        lucide.createIcons();
    });

    // Event Delegation for Dynamic Add-to-Cart Buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn) {
            e.stopPropagation();
            cartCount++;
            cartBadge.textContent = cartCount;
            cartBadge.classList.remove('hidden');
            showToast("Added to cart!", `${btn.getAttribute('data-title')} has been added to your cart.`);
        }
    });

    // Newsletter Submission Setup
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        if (emailInput.value) {
            showToast("Subscribed!", "You've been subscribed to our newsletter.");
            emailInput.value = '';
        }
    });
}

// --- CUSTOM SHADCN-STYLE TOAST EMULATION ---
function showToast(title, description) {
    const toast = document.createElement('div');
    toast.className = 'toast-notice bg-white border border-gray-200 shadow-xl rounded-xl p-4 min-w-[300px] text-gray-900 flex flex-col gap-1 transition-all duration-300 border-l-4 border-l-yellow-600';
    toast.innerHTML = `
        <strong class="font-semibold text-sm text-gray-900">${title}</strong>
        <span class="text-xs text-gray-500">${description}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
