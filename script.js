const products = [
  { id: 1, title: "Max Verstappen F1 Poster", price: 6799, category: "sale", accent: "F1" },
  { id: 2, title: "The Weeknd Music Poster", price: 6299, category: "sale", accent: "Music" },
  { id: 3, title: "Demon Slayer Anime Poster", price: 6299, category: "sale", accent: "Anime" },
  { id: 4, title: "Fight Club Poster", price: 6299, category: "sale", accent: "Movie" },

  { id: 5, title: "Custom Poster", price: 6799, category: "best", accent: "Custom" },
  { id: 6, title: "J-10C Dragon Poster", price: 6799, category: "best", accent: "Aviation" },
  { id: 7, title: "Porsche 911 GT3 RS Car Poster", price: 6799, category: "best", accent: "Car" },
  { id: 8, title: "Spider-Man Poster", price: 6799, category: "best", accent: "Hero" },

  { id: 9, title: "Goku Dragon Ball Z Poster", price: 6799, category: "anime", accent: "Anime" },
  { id: 10, title: "Itachi Naruto Anime Poster", price: 6799, category: "anime", accent: "Anime" },
  { id: 11, title: "Solo Leveling Anime Poster", price: 6799, category: "anime", accent: "Anime" },
  { id: 12, title: "Sukuna Jujutsu Kaisen Poster", price: 6799, category: "anime", accent: "Anime" },

  { id: 13, title: "Batman Poster", price: 6799, category: "movie", accent: "Movie" },
  { id: 14, title: "Interstellar Movie Poster", price: 6799, category: "movie", accent: "Movie" },
  { id: 15, title: "Deadpool & Wolverine Poster", price: 6799, category: "movie", accent: "Movie" },
  { id: 16, title: "Star Wars Poster", price: 6799, category: "movie", accent: "Movie" },

  { id: 17, title: "Nissan GTR R35 Car Poster", price: 6799, category: "cars", accent: "Car" },
  { id: 18, title: "Mustang Shelby GT500 Poster", price: 6799, category: "cars", accent: "Car" },
  { id: 19, title: "Lewis Hamilton F1 Poster", price: 6799, category: "cars", accent: "F1" },
  { id: 20, title: "Lamborghini Huracan Poster", price: 6799, category: "cars", accent: "Car" },
];

const saleGrid = document.getElementById("saleGrid");
const bestGrid = document.getElementById("bestGrid");
const animeGrid = document.getElementById("animeGrid");
const movieGrid = document.getElementById("movieGrid");
const carGrid = document.getElementById("carGrid");
const searchInput = document.getElementById("searchInput");
const cartCount = document.getElementById("cartCount");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

let cart = 0;

function priceFmt(value) {
  return "Rs." + value.toLocaleString("en-PK");
}

function cardHTML(product, group) {
  return `
    <article class="product-card" data-title="${product.title.toLowerCase()}">
      <div class="product-thumb thumb-${group}-${product.id}"></div>
      <div class="product-body">
        <span class="badge">${product.accent}</span>
        <h3>${product.title}</h3>
        <div class="price-row">
          <span class="price">${priceFmt(product.price)}</span>
        </div>
        <div class="product-actions">
          <button class="small-btn" onclick="viewProduct('${product.title}', ${product.price})">View</button>
          <button class="small-btn primary" onclick="addToCart()">Add</button>
        </div>
      </div>
    </article>
  `;
}

function render() {
  saleGrid.innerHTML = products.filter(p => p.category === "sale").map(p => cardHTML(p, "sale")).join("");
  bestGrid.innerHTML = products.filter(p => p.category === "best").map(p => cardHTML(p, "best")).join("");
  animeGrid.innerHTML = products.filter(p => p.category === "anime").map(p => cardHTML(p, "anime")).join("");
  movieGrid.innerHTML = products.filter(p => p.category === "movie").map(p => cardHTML(p, "movie")).join("");
  carGrid.innerHTML = products.filter(p => p.category === "cars").map(p => cardHTML(p, "cars")).join("");
}

function addToCart() {
  cart += 1;
  cartCount.textContent = cart;
}

function viewProduct(title, price) {
  alert(title + "\n" + priceFmt(price));
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();
  document.querySelectorAll(".product-card").forEach(card => {
    const match = card.dataset.title.includes(q);
    card.style.display = match ? "" : "none";
  });
});

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

render();
