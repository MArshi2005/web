// =========================
// SHORTCUTS
// =========================
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// =========================
// USER AUTH (REGISTER / LOGIN)
// =========================
function registerUser() {
    const username = $("#register-username");
    const password = $("#register-password");

    if (!username || !password) return alert("فیلدها پیدا نشدند!");

    const user = username.value.trim();
    const pass = password.value.trim();

    if (!user || !pass) return alert("لطفاً همه فیلدها را پر کنید");

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some(u => u.username === user)) {
        return alert("این نام کاربری وجود دارد");
    }

    users.push({ username: user, password: pass });
    localStorage.setItem("users", JSON.stringify(users));

    alert("ثبت نام با موفقیت انجام شد");
}

function loginUser() {
    const username = $("#login-username");
    const password = $("#login-password");

    if (!username || !password) return alert("فیلدها پیدا نشدند!");

    const user = username.value.trim();
    const pass = password.value.trim();

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const found = users.find(u => u.username === user && u.password === pass);

    if (!found) return alert("نام کاربری یا رمز اشتباه است");

    localStorage.setItem("loggedInUser", user);
    alert("ورود موفقیت آمیز");
}

// =========================
// CART SYSTEM
// =========================
const loadCart = () =>
    JSON.parse(localStorage.getItem("cart") || "[]");

const saveCart = cart =>
    localStorage.setItem("cart", JSON.stringify(cart));

function addToCart(id, name, price, img) {
    const cart = loadCart();

    const item = cart.find(x => x.id === id);

    if (item) {
        item.qty++;
    } else {
        cart.push({
            id,
            name,
            price: Number(price),
            img,
            qty: 1
        });
    }

    saveCart(cart);
    alert("به سبد خرید اضافه شد");
}

function removeFromCart(id) {
    let cart = loadCart();
    cart = cart.filter(x => x.id !== id);
    saveCart(cart);
}

function updateQty(id, qty) {
    const cart = loadCart();
    const item = cart.find(x => x.id === id);
    if (item) item.qty = qty;
    saveCart(cart);
}

// =========================
// ADD-TO-CART BUTTONS
// =========================
function initAddToCartButtons() {
    const buttons = $$(".add-to-cart");

    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = btn.dataset.price;
            const img = btn.dataset.img;

            if (!id || !name || !price) {
                console.error("★ دکمه add-to-cart دیتاست ناقص دارد", btn);
                return;
            }

            addToCart(id, name, price, img);
        });
    });
}

// =========================
// PRODUCT FILTER
// =========================
function initFilters() {
    const input = $("#product-filter");
    if (!input) return;

    input.addEventListener("input", () => {
        const search = input.value.toLowerCase();
        const products = $$(".product");

        products.forEach(p => {
            const title = p.querySelector(".product-title")?.innerText?.toLowerCase() || "";
            p.style.display = title.includes(search) ? "flex" : "none";
        });
    });
}

// =========================
// INITIALIZER
// =========================
document.addEventListener("DOMContentLoaded", () => {
    initAddToCartButtons();
    initFilters();
});
