// =====================
// DOM SELECTIONS
// =====================
const productListContainer = document.getElementById('product-list');
const cartItemsContainer = document.getElementById('cart-items');
const cartQuantitySpan = document.getElementById('cart-quantity');
const cartFooter = document.getElementById('cart-footer');
const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');

// =====================
// APLICATION STATE
// =====================
let cartItems = [];
let allProducts = [];

// =====================
// DATA FETCHING
// =====================
async function loadProducts() {        
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        productListContainer.innerHTML = '<p>Could not load products. Please try again later.</p>';
    }
}

// =====================
// UI RENDERING
// =====================
function displayProducts(products) {
    const productCards = products.map(product =>
        `
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${product.image.desktop}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-details">
                    <p class="product-category">${product.category}</p>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart-button">
                        <img src="./assets/images/icon-add-to-cart.svg" alt="Add to cart icon">
                        Add to Cart
                    </button>
                </div>
            </div>
        `
    ).join('');
    productListContainer.innerHTML = productCards;
    addEventListenersToButtons();
}

// =====================
// EVENT HANDLERS
// =====================
function addEventListenersToButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', () => addToCart(index));
    });
}

cartItemsContainer.addEventListener('click', (e) => {
    const removeButton = e.target.closest('.remove-item-btn');
    if (removeButton) {
        const productName = removeButton.dataset.name;
        removeFromCart(productName);
    }
});

cartFooter.addEventListener('click', (e) => {
    const confirmButton = e.target.closest('.confirm-order-btn');
    if (confirmButton) {
        showConfirmationModal();
    }
})


modalOverlay.addEventListener('click', (e) => {
    const newOrderButton = e.target.closest('.new-order-btn');
    if (newOrderButton) {
        resetApp();
    }
});

// =====================
// APPLICATION LOGIC
// =====================
function addToCart(productIndex) {
    const product = allProducts[productIndex];
    const cartItem = cartItems.find(item => item.name === product.name);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }

    displayCart();

}


function displayCart() {
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <img class="empty-cart-img" src="./assets/images/illustration-empty-cart.svg" alt="empty-cart">
          <p class="cart-empty-message">Your added items will appear here</p>
        </div>
        `;
        cartFooter.innerHTML = '';
        cartQuantitySpan.textContent = 0;
        return;
    }

    const cartItemsRender = cartItems.map((item) => `
        <div class="cart-item">
            <div class="cart-item-details">
                <p class="cart-item-name">${item.name}</p>
                <p class="cart-item-price">
                    <span class="item-quantity">${item.quantity}x</span> @ $${item.price.toFixed(2)}
                    <span class="item-total-price">$${(item.quantity * item.price).toFixed(2)}</span>
                </p>
            </div>
            <button class="remove-item-btn" data-name="${item.name}">
                <img src="./assets/images/icon-remove-item.svg" alt="Remove item">
            </button>
        </div>
    `).join('');

    cartItemsContainer.innerHTML = cartItemsRender;

    const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartQuantitySpan.textContent = totalQuantity;

    const orderTotal = cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    cartFooter.innerHTML = `
        <div class="order-total">
            <p>Order Total</p>
            <p class="total-price">$${orderTotal.toFixed(2)}</p>
        </div>
        <div class="delivery-message">
            <img src="./assets/images/icon-carbon-neutral.svg" alt="Delivery icon"/>
            <p>This is a <span>carbon-neutral</span> delivery</p>
        </div>
        <button class="confirm-order-btn">Confirm Order</button>
    `

}

function removeFromCart(productName) {
    const cartItem = cartItems.find(item => item.name === productName);

    if (cartItem) {
        cartItem.quantity--;
        if (cartItem.quantity === 0) {
            cartItems = cartItems.filter(item => item.name !== productName);
        }
    }

    displayCart();
}

function showConfirmationModal() {
    const modalItemsRender = cartItems.map((item) => `
        <div class="modal-item">
            <img src="${item.image.thumbnail}" alt="${item.name}" class="modal-item-img">
            <div class="modal-item-details">
                <p class="modal-item-name">${item.name}</p>
                <p class="modal-item-price">
                    <span class="item-quatity">${item.quantity}x</span> @ $${item.price.toFixed(2)}
                </p>
            </div>
            <p class="total-price">$${(item.quantity * item.price).toFixed(2)}</p>
        </div>
    `).join('');

    const orderTotal = cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    modal.innerHTML = `
        <div class="modal-header">
            <img src="./assets/images/icon-order-confirmed.svg" alt="Order confirmed" class="modal-item-img">
            <h2 class="modal-title">Order Confirmed</h2>
            <p class="modal-message">We hope you enjoy your food!</p>
        </div>
        <div class="modal-items">
            ${modalItemsRender}
            <div class="modal-total">
                <p>Total</p>
                <p class="total-price">$${orderTotal.toFixed(2)}</p>
            </div>
        </div>
        <button class="new-order-btn">Start New Order</button>
    `;

    modalOverlay.classList.add('show');
}

function resetApp() {
    cartItems = [];
    displayCart();
    modalOverlay.classList.remove('show');
}

// =====================
// INITIALIZATION
// =====================
loadProducts();