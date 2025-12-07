// =========================
// UTILITIES
// =========================
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// =========================
// USER AUTH (LOGIN / REGISTER)
// =========================
function registerUser() {
    const username = $("#register-username")?.value?.trim();
    const password = $("#register-password")?.value?.trim();

    if (!username || !password) {
        alert("لطفاً همه فیلدها را پر کنید");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // جلوگیری از ثبت تکراری
    if (users.some(u => u.username === username)) {
        alert("این نام کاربری قبلاً ثبت شده");
        return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("ثبت نام با موفقیت انجام شد");
}

function loginUser() {
    const username = $("#login-username")?.value?.trim();
    const password = $("#login-password")?.value?.trim();

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("نام کاربری یا رمز عبور اشتباه است");
        return;
    }

    localStorage.setItem("loggedInUser", username);
    alert("با موفقیت وارد شدید");
}

// =========================
// CART SYSTEM
// =========================
function loadCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id, name, price, img) {
    const cart = loadCart();

    // اگر کالای تکراری بود تعداد افزایش پیدا کند
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id,
            name,
            price,
            img,
            qty: 1
        });
    }

    saveCart(cart);
    alert("به سبد خرید اضافه شد");
}

function removeFromCart(id) {
    let cart = loadCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
}

function updateQty(id, qty) {
    const cart = loadCart();
    const item = cart.find(i => i.id === id);

    if (item) {
        item.qty = qty;
    }

    saveCart(cart);
}

// =========================
// RENDER PRODUCTS
// =========================
function initAddToCartButtons() {
    const buttons = $$(".add-to-cart");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = Number(btn.dataset.price);
            const img = btn.dataset.img;

            addToCart(id, name, price, img);
        });
    });
}

// =========================
// PRODUCT FILTERING
// =========================
function initFilters() {
    const filterInput = $("#product-filter");

    if (!filterInput) return;

    filterInput.addEventListener("input", () => {
        const value = filterInput.value.toLowerCase();
        const products = $$(".product");

        products.forEach(product => {
            const title = product.querySelector(".product-title").innerText.toLowerCase();

            if (title.includes(value)) {
                product.style.display = "flex";
            } else {
                product.style.display = "none";
            }
        });
    });
}
document.addEventListener("DOMContentLoaded", () => {
    initAddToCartButtons();
    initFilters();
});
