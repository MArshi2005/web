// Use strict
'use strict';

const App = (function () {
    // وضعیت عمومی
    let cart = JSON.parse(localStorage.getItem('mahdiLaptopCart')) || [];

    // ------------ HELPERS ------------
    function formatPrice(price) {
        return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            console.warn('toast container not found');
            return;
        }
        const toastId = 'toast-' + Date.now();
        const bg = type === 'success' ? 'success' : type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary';
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${bg} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = document.getElementById(toastId);
        try {
            const bsToast = new bootstrap.Toast(toastEl);
            bsToast.show();
            toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        } catch (err) {
            // اگر bootstrap نبود فقط remove بعد از چند ثانیه
            setTimeout(() => toastEl.remove(), 3000);
        }
    }

    // ------------ CART ------------
    function saveCart() {
        localStorage.setItem('mahdiLaptopCart', JSON.stringify(cart));
    }

    function updateCartUI() {
        const cartCountElement = document.querySelector('.cart-count');
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');

        const cartCount = cart.reduce((s, it) => s + it.quantity, 0);
        const cartTotal = cart.reduce((s, it) => s + (it.price * it.quantity), 0);

        if (cartCountElement) cartCountElement.textContent = cartCount;
        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-cart text-center p-4">سبد خرید شما خالی است</div>';
            } else {
                let html = '';
                cart.forEach(item => {
                    html += `<div class="cart-item d-flex align-items-center p-2 border-bottom">
                        <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover" class="me-3">
                        <div class="flex-grow-1">
                            <div class="fw-bold">${item.name}</div>
                            <div class="text-danger">${formatPrice(item.price)} تومان</div>
                            <div class="d-flex align-items-center mt-1">
                                <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
                                <span class="quantity-value mx-2">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-danger remove-item ms-2" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>`;
                });
                cartItemsContainer.innerHTML = html;
            }
        }
        if (cartTotalElement) cartTotalElement.textContent = formatPrice(cartTotal) + ' تومان';
        saveCart();
    }

    function addToCartFromButton(btn) {
        if (!btn) return;
        const productId = btn.getAttribute('data-product-id');
        const productName = btn.getAttribute('data-product-name') || 'محصول';
        const productPrice = parseInt(btn.getAttribute('data-product-price')) || 0;

        // تلاش برای گرفتن تصویر از چند منبع (اول کارت محصول در لیست، بعد data attribute خود دکمه، در نهایت placeholder)
        let productImage = btn.getAttribute('data-product-image') || null;
        if (!productImage) {
            const card = document.querySelector(`.product-item[data-product-id="${productId}"]`);
            productImage = card?.querySelector('.card-img-top')?.getAttribute('src') || 'placeholder.jpg';
        }

        const existing = cart.find(i => String(i.id) === String(productId));
        if (existing) existing.quantity++;
        else cart.push({ id: productId, name: productName, price: productPrice, image: productImage, quantity: 1 });

        updateCartUI();
        showToast('محصول به سبد خرید اضافه شد', 'success');
    }

    // ------------ AUTH (login/register) ------------
    async function handleLoginSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        formData.append('action', 'login');

        try {
            const res = await fetch('process.php', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                showToast(data.message || 'ورود موفق', 'success');
                // redirect یا بستن modal اگر لازم است
            } else {
                showToast(data.message || 'اطلاعات وارد شده نادرست است', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('خطا در ارسال درخواست', 'danger');
        }
    }

    async function handleRegisterSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        formData.append('action', 'register');

        try {
            const res = await fetch('process.php', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                showToast(data.message || 'ثبت‌نام موفق', 'success');
                form.reset();
                // مثلاً بستن modal
            } else {
                showToast(data.message || 'خطا در ثبت‌نام', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('خطا در ارسال درخواست', 'danger');
        }
    }

    // ------------ INIT & GLOBAL EVENT HANDLERS ------------
    function init() {
        // initial UI
        updateCartUI();

        // Global click handler (delegation)
        document.addEventListener('click', function (e) {
            const cartBtn = e.target.closest('.cart-btn');
            if (cartBtn) {
                addToCartFromButton(cartBtn);
                return;
            }

            if (e.target.closest('.remove-item')) {
                const id = e.target.closest('.remove-item').getAttribute('data-id');
                cart = cart.filter(i => String(i.id) !== String(id));
                updateCartUI();
                showToast('محصول از سبد حذف شد', 'info');
                return;
            }

            if (e.target.closest('.increase-quantity')) {
                const id = e.target.closest('.increase-quantity').getAttribute('data-id');
                const item = cart.find(i => String(i.id) === String(id));
                if (item) item.quantity++;
                updateCartUI();
                return;
            }
            if (e.target.closest('.decrease-quantity')) {
                const id = e.target.closest('.decrease-quantity').getAttribute('data-id');
                const item = cart.find(i => String(i.id) === String(id));
                if (item) {
                    if (item.quantity > 1) item.quantity--;
                    else cart = cart.filter(i => String(i.id) !== String(id));
                    updateCartUI();
                }
                return;
            }
        });

        // wishlist toggle
        document.addEventListener('click', function(e) {
            const wish = e.target.closest('.wishlist-btn');
            if (wish) {
                const icon = wish.querySelector('i');
                if (icon) {
                    icon.classList.toggle('far');
                    icon.classList.toggle('fas');
                }
            }
        });

        // فرم‌ها
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

        const registerForm = document.getElementById('registerForm');
        if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

        // review forms safe selector fix (previously had broken quote)
        document.querySelectorAll('.add-review form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                // نمونه ساده‌ی پردازش (در فایل شما احتمالا پیچیده‌تر است)
                const nameEl = form.querySelector('[id^="reviewName"]');
                const ratingEl = form.querySelector('[id^="reviewRating"]');
                const textEl = form.querySelector('[id^="reviewText"]');
                const productId = nameEl?.id.replace('reviewName', '') || form.dataset.productId;

                const rating = ratingEl ? parseInt(ratingEl.value || '0') : 0;
                const text = textEl ? textEl.value : '';

                let reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
                reviews.push({ author: nameEl?.value || 'مهمان', rating, text, date: new Date().toISOString() });
                localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
                showToast('نظر شما با موفقیت ثبت شد', 'success');
                form.reset();
            });
        });
    }

    // expose init
    return { init };
})();

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', App.init);
