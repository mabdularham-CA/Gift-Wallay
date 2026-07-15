import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' })); // Support larger payloads for custom image base64 uploads

// Serve static files from root directory
app.use(express.static(__dirname));

const dbPath = path.join(__dirname, 'db.json');

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

function readDb() {
    try {
        if (!fs.existsSync(dbPath)) {
            const initialData = {
                products: INITIAL_PRODUCTS,
                users: [
                    { email: "user@gift.com", name: "Hamza Ahmed", phone: "0300-9876543", pass: "user123" }
                ],
                orders: [
                    {
                        orderNum: "9921",
                        email: "user@gift.com",
                        name: "Hamza Ahmed",
                        phone: "0300-9876543",
                        address: "DHA Phase 6, Lahore, Punjab",
                        city: "Lahore",
                        payment: "cod",
                        items: [{ id: "1", name: "Royal Emerald Watch", price: 12500, qty: 1, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80" }],
                        total: 13875,
                        date: "July 13, 2026",
                        status: "Pending"
                    }
                ]
            };
            fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (err) {
        console.error("Error reading or creating db:", err);
        return { products: INITIAL_PRODUCTS, users: [], orders: [] };
    }
}

function writeDb(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing db:", err);
    }
}

// API ENDPOINTS

app.get('/api/products', (req, res) => {
    const db = readDb();
    res.json(db.products);
});

app.post('/api/products', (req, res) => {
    const db = readDb();
    const newProduct = req.body;
    db.products.push(newProduct);
    writeDb(db);
    res.json({ success: true, product: newProduct });
});

app.delete('/api/products/:id', (req, res) => {
    const db = readDb();
    db.products = db.products.filter(p => p.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
});

app.post('/api/products/:id/reviews', (req, res) => {
    const db = readDb();
    const product = db.products.find(p => p.id === req.params.id);
    if (product) {
        if (!product.reviews) product.reviews = [];
        product.reviews.unshift(req.body);
        writeDb(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

app.get('/api/orders', (req, res) => {
    const db = readDb();
    res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
    const db = readDb();
    const newOrder = req.body;
    db.orders.unshift(newOrder);
    writeDb(db);
    res.json({ success: true, order: newOrder });
});

app.post('/api/orders/:orderNum/status', (req, res) => {
    const db = readDb();
    const order = db.orders.find(o => o.orderNum === req.params.orderNum);
    if (order) {
        order.status = req.body.status;
        writeDb(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Order not found" });
    }
});

app.get('/api/users', (req, res) => {
    const db = readDb();
    res.json(db.users);
});

app.post('/api/users', (req, res) => {
    const db = readDb();
    const newUser = req.body;
    db.users.push(newUser);
    writeDb(db);
    res.json({ success: true, user: newUser });
});

// Specifically serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
