// E-commerce Frontend Application Logic

let products = [];
let cart = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');

const checkoutModal = document.getElementById('checkoutModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const checkoutForm = document.getElementById('checkoutForm');
const summaryTotal = document.getElementById('summaryTotal');

const successModal = document.getElementById('successModal');
const successCloseBtn = document.getElementById('successCloseBtn');
const successOrderId = document.getElementById('successOrderId');
const successTotal = document.getElementById('successTotal');

// Product Icons Mapper
const productIcons = {
    1: '⌨️', // Keyboard
    2: '🎧', // Headphones
    3: '🪑', // Chair
    4: '💾', // SSD
    5: '🌀', // Fan
    6: '🖥️'  // Monitor
};

function escapeHtml(value) {
    return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupEventListeners();
});

// Fetch products from backend API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to load products');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = `<p class="error-msg">Failed to load hardware catalog. Please try again later.</p>`;
    }
}

// Render product list to the grid
function renderProducts() {
    if (!products.length) return;
    
    productsGrid.innerHTML = products.map(product => {
        const icon = productIcons[product.id] || '📦';
        const category = escapeHtml(product.category);
        const badge = product.badge ? escapeHtml(product.badge) : '';
        const name = escapeHtml(product.name);
        const description = escapeHtml(product.description);
        const price = Number(product.price) || 0;
        return `
            <div class="product-card">
                <div class="card-header">
                    <span class="category">${category}</span>
                    ${badge ? `<span class="badge">${badge}</span>` : ''}
                </div>
                <div class="product-image-container">
                    <span class="product-icon">${icon}</span>
                </div>
                <h3 class="product-title">${name}</h3>
                <p class="product-description">${description}</p>
                <div class="card-footer">
                    <span class="price">$${price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
}

// Add item to cart
globalThis.addToCart = function(productId) {
    const existing = cart.find(item => item.product_id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ product_id: productId, quantity: 1 });
    }
    updateCart();
    openCart();
};

// Remove or adjust quantity
globalThis.changeQuantity = function(productId, delta) {
    const item = cart.find(item => item.product_id === productId);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.product_id !== productId);
    }
    updateCart();
};

// Update cart interface
function updateCart() {
    // Total count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalCount;

    // Cart items
    if (!cart.length) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-msg">Your shopping cart is empty.</p>`;
        cartTotal.innerText = '$0.00';
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = 0.5;
        return;
    }

    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = 1;

    let subtotal = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.product_id);
        if (!product) return '';
        const productName = escapeHtml(product.name);
        const price = Number(product.price) || 0;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${productName}</div>
                    <div class="cart-item-price">$${price.toFixed(2)}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
                </div>
            </div>
        `;
    }).join('');

    cartTotal.innerText = `$${subtotal.toFixed(2)}`;
    summaryTotal.innerText = `$${subtotal.toFixed(2)}`;
}

// Open/Close Cart Drawer
function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
}

// Payment Option active toggles
const paymentOptions = document.querySelectorAll('.payment-option');
paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
        paymentOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        option.querySelector('input').checked = true;
    });
});

// Setup Event Listeners
function setupEventListeners() {
    cartToggleBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    checkoutBtn.addEventListener('click', () => {
        closeCart();
        checkoutModal.classList.add('open');
    });

    modalCloseBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('open');
    });

    // Handle checkout submission
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const shipping_address = document.getElementById('address').value;
        const payment_method = document.querySelector('input[name="payment_method"]:checked').value;

        const payload = {
            email,
            shipping_address,
            payment_method,
            cart_items: cart
        };

        try {
            const submitBtn = document.getElementById('submitOrderBtn');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Processing Order...';

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Order processing failed');
            
            const data = await response.json();
            
            // Open Success Screen
            checkoutModal.classList.remove('open');
            successOrderId.innerText = data.order_id;
            successTotal.innerText = `$${data.total_amount.toFixed(2)}`;
            successModal.classList.add('open');

            // Reset cart
            cart = [];
            updateCart();
            checkoutForm.reset();

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Checkout failed. Please inspect backend console.');
        } finally {
            const submitBtn = document.getElementById('submitOrderBtn');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Place Secure Order';
        }
    });

    successCloseBtn.addEventListener('click', () => {
        successModal.classList.remove('open');
    });
}
