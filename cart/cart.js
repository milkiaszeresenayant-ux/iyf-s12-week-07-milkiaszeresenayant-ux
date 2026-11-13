const CART_STORAGE_KEY = "daylight.cart.v1";
const PRODUCTS = [
    { id: 1, name: "Mandazi (pack of 6)", price: 120, image: "🥟" },
    { id: 2, name: "Chapati (pack of 5)", price: 150, image: "🫓" },
    { id: 3, name: "Tea leaves 250g", price: 180, image: "🍵" },
];
const currency = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
});
const productList = document.querySelector("#product-list");
const basketList = document.querySelector("#basket-list");
const basketEmpty = document.querySelector("#basket-empty");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const cartStatus = document.querySelector("#cart-status");
const clearCartButton = document.querySelector("#clear-cart");
const undoCartButton = document.querySelector("#undo-cart");
let cart = [];
const cartHistory = [];
let storageWarning = "";

function showStorageStatus(message, isError = false) {
    cartStatus.textContent = message;
    cartStatus.dataset.state = isError ? "error" : "info";
}

function loadCart() {
    try {
        const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart === null) {
            return [];
        }

        const parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) {
            throw new TypeError("Saved basket data is not a list.");
        }

        const validItems = parsedCart.filter(
            (item) =>
                item &&
                Number.isInteger(item.productId) &&
                PRODUCTS.some((product) => product.id === item.productId) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
        );
        if (validItems.length < parsedCart.length) {
            storageWarning = "Invalid saved basket items were skipped.";
        }
        return validItems;
    } catch (error) {
        console.error("Could not load the saved basket:", error);
        storageWarning = "Saved basket data could not be read. Starting with an empty basket.";
        return [];
    }
}

function persistCart() {
    try {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        storageWarning = "";
    } catch (error) {
        console.error("Could not save the basket:", error);
        storageWarning = "Browser storage is unavailable. Your basket may not persist.";
    }
}

function saveCartChange(nextCart) {
    if (nextCart === cart) {
        return;
    }
    cartHistory.push(cart.map((item) => ({ ...item })));
    cart = nextCart;
    persistCart();
    renderCart();
}

function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

function getCartTotal() {
    return cart.reduce((total, item) => {
        const product = PRODUCTS.find((entry) => entry.id === item.productId);
        return total + product.price * item.quantity;
    }, 0);
}

function renderProducts() {
    const fragment = document.createDocumentFragment();
    PRODUCTS.forEach((product) => {
        const item = document.createElement("li");
        item.className = "product-item";

        const image = document.createElement("span");
        image.className = "product-image";
        image.setAttribute("aria-hidden", "true");
        image.textContent = product.image;

        const details = document.createElement("span");
        details.className = "product-details";
        const name = document.createElement("strong");
        name.textContent = product.name;
        const price = document.createElement("span");
        price.textContent = currency.format(product.price);
        details.append(name, price);

        const addButton = document.createElement("button");
        addButton.className = "add-button";
        addButton.type = "button";
        addButton.dataset.action = "add";
        addButton.dataset.productId = String(product.id);
        addButton.textContent = "Add";

        item.append(image, details, addButton);
        fragment.append(item);
    });
    productList.replaceChildren(fragment);
}

function renderCart() {
    const fragment = document.createDocumentFragment();
    cart.forEach((cartItem) => {
        const product = PRODUCTS.find((entry) => entry.id === cartItem.productId);
        const item = document.createElement("li");
        item.className = "basket-item";

        const name = document.createElement("span");
        name.className = "basket-item-name";
        name.textContent = product.name;

        const quantityControls = document.createElement("div");
        quantityControls.className = "quantity-controls";
        quantityControls.setAttribute("aria-label", `${product.name} quantity`);

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.dataset.action = "decrease";
        decreaseButton.dataset.productId = String(product.id);
        decreaseButton.setAttribute("aria-label", `Decrease ${product.name} quantity`);
        decreaseButton.textContent = "−";

        const quantity = document.createElement("span");
        quantity.textContent = String(cartItem.quantity);

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.dataset.action = "increase";
        increaseButton.dataset.productId = String(product.id);
        increaseButton.setAttribute("aria-label", `Increase ${product.name} quantity`);
        increaseButton.textContent = "+";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.dataset.action = "remove";
        removeButton.dataset.productId = String(product.id);
        removeButton.setAttribute("aria-label", `Remove ${product.name} from basket`);
        removeButton.textContent = "×";

        quantityControls.append(decreaseButton, quantity, increaseButton, removeButton);
        item.append(name, quantityControls);
        fragment.append(item);
    });

    basketList.replaceChildren(fragment);
    const count = getCartCount();
    cartCount.textContent = `${count} ${count === 1 ? "item" : "items"}`;
    cartTotal.textContent = currency.format(getCartTotal());
    basketEmpty.hidden = cart.length > 0;
    clearCartButton.disabled = cart.length === 0;
    undoCartButton.disabled = cartHistory.length === 0;
    showStorageStatus(storageWarning || "Saved on this device.", Boolean(storageWarning));
}

function addToCart(productId) {
    const existingItem = cart.find((item) => item.productId === productId);
    const nextCart = existingItem
        ? cart.map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...cart, { productId, quantity: 1 }];
    saveCartChange(nextCart);
}

function updateQuantity(productId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 0) {
        return;
    }

    const nextCart =
        quantity === 0
            ? cart.filter((item) => item.productId !== productId)
            : cart.map((item) => (item.productId === productId ? { ...item, quantity } : item));
    saveCartChange(nextCart);
}

function removeFromCart(productId) {
    updateQuantity(productId, 0);
}

function undoLastChange() {
    const previousCart = cartHistory.pop();
    if (!previousCart) {
        return;
    }
    cart = previousCart;
    persistCart();
    renderCart();
}

function clearCart() {
    saveCartChange([]);
}

productList.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }
    const button = event.target.closest('[data-action="add"]');
    if (button) {
        addToCart(Number(button.dataset.productId));
    }
});

basketList.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) {
        return;
    }
    const productId = Number(button.dataset.productId);
    const existingItem = cart.find((item) => item.productId === productId);
    if (!existingItem) {
        return;
    }
    if (button.dataset.action === "increase") {
        updateQuantity(productId, existingItem.quantity + 1);
    } else if (button.dataset.action === "decrease") {
        updateQuantity(productId, existingItem.quantity - 1);
    } else if (button.dataset.action === "remove") {
        removeFromCart(productId);
    }
});

clearCartButton.addEventListener("click", clearCart);
undoCartButton.addEventListener("click", undoLastChange);
cart = loadCart();
renderProducts();
renderCart();
