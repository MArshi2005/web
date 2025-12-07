// =========================
// SHORTCUTS
// =========================
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// =========================
// CORE AUTH FUNCTIONS (یکسان در همه صفحات)
// =========================
const AUTH = {
    // ذخیره کاربر
    saveUser: (userData) => {
        localStorage.setItem('loggedInUser', JSON.stringify(userData));
    },

    // دریافت کاربر
    getUser: () => {
        return JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    },

    // حذف کاربر
    logout: () => {
        localStorage.removeItem('loggedInUser');
    },

    // ثبت‌نام
    register: (userData) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // بررسی تکراری نبودن
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'این ایمیل قبلاً ثبت شده است' };
        }
        if (users.some(u => u.username === userData.username)) {
            return { success: false, message: 'این نام کاربری قبلاً ثبت شده است' };
        }

        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            username: userData.username,
            password: userData.password,
            createdAt: new Date().toISOString(),
            isAdmin: false
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        AUTH.saveUser(newUser);

        return { success: true, user: newUser };
    },

    // ورود
    login: (identifier, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => 
            (u.email === identifier || u.username === identifier) && 
            u.password === password
        );

        if (user) {
            AUTH.saveUser(user);
            return { success: true, user };
        }

        return { success: false, message: 'ایمیل/نام کاربری یا رمز عبور اشتباه است' };
    }
};

// =========================
// USER UI MANAGEMENT (یکسان در همه صفحات)
// =========================
const USER_UI = {
    // به‌روزرسانی UI کاربر
    updateUI: () => {
        const userSection = $('#userSection');
        const authButtons = $('#authButtons');
        const userName = $('#userName');
        const user = AUTH.getUser();

        if (!userSection || !authButtons) return;

        if (user) {
            userSection.style.display = 'block';
            authButtons.style.display = 'none';
            if (userName) userName.textContent = user.name || 'کاربر';
            
            // رویداد خروج
            const logoutBtn = $('#logoutBtn');
            if (logoutBtn) {
                logoutBtn.onclick = () => {
                    AUTH.logout();
                    USER_UI.updateUI();
                    UTILS.showToast('با موفقیت از حساب خارج شدید', 'info');
                    
                    // ریدایرکت به صفحه اصلی اگر در صفحات احتیاج به لاگین هست
                    if (window.location.pathname.includes('profile.html') || 
                        window.location.pathname.includes('orders.html')) {
                        setTimeout(() => window.location.href = 'index.html', 1500);
                    }
                };
            }
        } else {
            userSection.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    },

    // مقداردهی اولیه بخش کاربر
    init: () => {
        USER_UI.updateUI();
        
        // مدیریت تب‌ها در مودال
        $$('.login-btn, .register-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.classList.contains('login-btn') ? 'login' : 'register';
                const tabElement = $(`#${tab}-tab`);
                if (tabElement) {
                    const tabInstance = new bootstrap.Tab(tabElement);
                    tabInstance.show();
                }
            });
        });
    }
};

// =========================
// UTILITIES (ابزارهای کمکی)
// =========================
const UTILS = {
    // نمایش توست
    showToast: (message, type = 'info') => {
        // حذف toastهای قبلی
        $$('.custom-toast').forEach(toast => toast.remove());

        const toastEl = document.createElement('div');
        toastEl.className = `custom-toast toast align-items-center text-white bg-${type} border-0 position-fixed`;
        toastEl.setAttribute('role', 'alert');
        toastEl.style.cssText = `
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            min-width: 300px;
        `;

        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${icons[type] || 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        document.body.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, {
            animation: true,
            autohide: true,
            delay: 3000
        });
        toast.show();

        toastEl.addEventListener('hidden.bs.toast', function() {
            this.remove();
        });
    },

    // فرمت قیمت
    formatPrice: (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // تنظیمات رمز عبور
    initPasswordToggles: () => {
        ['#toggleLoginPassword', '#toggleRegisterPassword', '#toggleConfirmPassword'].forEach(selector => {
            const btn = $(selector);
            if (btn) {
                btn.addEventListener('click', function() {
                    let inputId;
                    if (this.id === 'toggleLoginPassword') inputId = 'loginPassword';
                    else if (this.id === 'toggleRegisterPassword') inputId = 'registerPassword';
                    else if (this.id === 'toggleConfirmPassword') inputId = 'confirmPassword';
                    
                    const input = $(`#${inputId}`);
                    const icon = this.querySelector('i');
                    
                    if (input && icon) {
                        if (input.type === 'password') {
                            input.type = 'text';
                            icon.className = 'fas fa-eye-slash';
                        } else {
                            input.type = 'password';
                            icon.className = 'fas fa-eye';
                        }
                    }
                });
            }
        });
    }
};

// =========================
// FORM VALIDATION (اعتبارسنجی فرم‌ها)
// =========================
const FORM_VALIDATION = {
    // فرم ورود
    initLoginForm: () => {
        const form = $('#loginForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.checkValidity()) {
                this.classList.add('was-validated');
                return;
            }

            const email = $('#loginEmail').value.trim();
            const password = $('#loginPassword').value.trim();
            const rememberMe = $('#rememberMe')?.checked || false;

            const result = AUTH.login(email, password);
            
            if (result.success) {
                UTILS.showToast(`ورود موفقیت‌آمیز! خوش آمدید ${result.user.name}`, 'success');
                
                // بستن مودال
                const modal = bootstrap.Modal.getInstance($('#authModal'));
                if (modal) modal.hide();
                
                // به‌روزرسانی UI
                USER_UI.updateUI();
                
                // بازنشانی فرم
                this.reset();
                this.classList.remove('was-validated');
            } else {
                UTILS.showToast(result.message, 'error');
            }
        });
    },

    // فرم ثبت‌نام
    initRegisterForm: () => {
        const form = $('#registerForm');
        if (!form) return;

        // اعتبارسنجی تکرار رمز بلادرنگ
        const passwordInput = $('#registerPassword');
        const confirmInput = $('#confirmPassword');
        
        if (passwordInput && confirmInput) {
            confirmInput.addEventListener('input', function() {
                if (this.value !== passwordInput.value) {
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            });
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // اعتبارسنجی تکرار رمز
            if (passwordInput && confirmInput && passwordInput.value !== confirmInput.value) {
                confirmInput.classList.add('is-invalid');
                UTILS.showToast('رمز عبور و تکرار آن یکسان نیست', 'error');
                return;
            }

            if (!this.checkValidity()) {
                this.classList.add('was-validated');
                return;
            }

            const userData = {
                name: $('#registerName').value.trim(),
                email: $('#registerEmail').value.trim(),
                username: $('#registerUsername').value.trim(),
                password: passwordInput.value.trim()
            };

            const result = AUTH.register(userData);
            
            if (result.success) {
                UTILS.showToast(`ثبت‌نام موفقیت‌آمیز! خوش آمدید ${result.user.name}`, 'success');
                
                // بستن مودال
                const modal = bootstrap.Modal.getInstance($('#authModal'));
                if (modal) modal.hide();
                
                // به‌روزرسانی UI
                USER_UI.updateUI();
                
                // بازنشانی فرم
                this.reset();
                this.classList.remove('was-validated');
                
                // بازنشانی کلاس‌های اعتبارسنجی
                if (confirmInput) {
                    confirmInput.classList.remove('is-valid', 'is-invalid');
                }
            } else {
                UTILS.showToast(result.message, 'error');
            }
        });
    },

    // فرم تماس
    initContactForm: () => {
        const form = $('#contactForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (this.checkValidity()) {
                UTILS.showToast('پیام شما با موفقیت ارسال شد. در اسرع وقت با شما تماس خواهیم گرفت.', 'success');
                this.reset();
                this.classList.remove('was-validated');
            } else {
                this.classList.add('was-validated');
            }
        });
    },

    // فرم خبرنامه
    initNewsletterForm: () => {
        const form = $('#newsletterForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (this.checkValidity()) {
                const email = $('#newsletterEmail').value.trim();
                UTILS.showToast(`ایمیل ${email} با موفقیت در خبرنامه ثبت شد`, 'success');
                this.reset();
                this.classList.remove('was-validated');
            } else {
                this.classList.add('was-validated');
            }
        });
    }
};

// =========================
// CART SYSTEM (سیستم سبد خرید)
// =========================
const CART = {
    // دریافت سبد خرید
    get: () => JSON.parse(localStorage.getItem('cart') || '[]'),

    // ذخیره سبد خرید
    save: (cart) => localStorage.setItem('cart', JSON.stringify(cart)),

    // به‌روزرسانی تعداد
    updateCount: () => {
        const cartCount = $('#cartCount');
        if (cartCount) {
            const cart = CART.get();
            const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    },

    // افزودن محصول
    add: (id, name, price, img) => {
        // بررسی ورود کاربر
        if (!AUTH.getUser()) {
            UTILS.showToast('لطفاً ابتدا وارد حساب کاربری خود شوید', 'warning');
            return false;
        }

        const cart = CART.get();
        const item = cart.find(x => x.id === id);

        if (item) {
            item.qty = (item.qty || 1) + 1;
        } else {
            cart.push({
                id,
                name,
                price: Number(price),
                img,
                qty: 1
            });
        }

        CART.save(cart);
        CART.updateCount();
        UTILS.showToast(`${name} به سبد خرید اضافه شد`, 'success');
        
        // به‌روزرسانی مودال اگر باز است
        CART.updateModal();
        return true;
    },

    // حذف محصول
    remove: (id) => {
        let cart = CART.get();
        cart = cart.filter(x => x.id !== id);
        CART.save(cart);
        CART.updateCount();
        CART.updateModal();
        UTILS.showToast('محصول از سبد خرید حذف شد', 'info');
    },

    // به‌روزرسانی مودال
    updateModal: () => {
        const cartItemsContainer = $('#cartItems');
        const cartTotal = $('#cartTotal');
        const cartFooter = $('#cartFooter');
        const emptyCart = $('.empty-cart');
        
        if (!cartItemsContainer) return;
        
        const cart = CART.get();
        
        if (cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartTotal) cartTotal.textContent = '0 تومان';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        
        let itemsHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = (item.price || 0) * (item.qty || 1);
            total += itemTotal;
            
            itemsHTML += `
                <div class="cart-item d-flex align-items-center mb-3">
                    <img src="${item.img || 'https://via.placeholder.com/80'}" 
                         alt="${item.name}" 
                         class="rounded" 
                         width="80" 
                         height="80">
                    <div class="flex-grow-1 ms-3">
                        <h6 class="mb-1">${item.name}</h6>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span>${UTILS.formatPrice(item.price)} تومان</span>
                                <span class="text-muted mx-2">×</span>
                                <span>${item.qty || 1}</span>
                            </div>
                            <button class="btn btn-sm btn-outline-danger remove-from-cart" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="mt-2 fw-bold">مجموع: ${UTILS.formatPrice(itemTotal)} تومان</div>
                    </div>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = itemsHTML;
        if (cartTotal) cartTotal.textContent = `${UTILS.formatPrice(total)} تومان`;
        if (cartFooter) cartFooter.style.display = 'flex';
        
        // رویدادهای حذف
        $$('.remove-from-cart').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                CART.remove(id);
            });
        });
    },

    // مقداردهی اولیه دکمه‌های افزودن به سبد
    initAddButtons: () => {
        $$('.add-to-cart, .cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id || this.dataset.productId;
                const name = this.dataset.name || this.dataset.productName;
                const price = this.dataset.price || this.dataset.productPrice;
                const img = this.dataset.img || 
                           this.closest('.product-item')?.querySelector('img')?.src || 
                           'https://via.placeholder.com/80';

                if (!id || !name || !price) {
                    console.error('دیتاست دکمه ناقص است:', this);
                    return;
                }

                CART.add(id, name, price, img);
            });
        });
    }
};

// =========================
// PRODUCT FILTERS (فیلتر محصولات)
// =========================
const FILTERS = {
    init: () => {
        const searchInput = $('#searchInput');
        const products = $$('.product-item');
        
        if (!searchInput || !products.length) return;
        
        // جستجوی زنده
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            
            products.forEach(product => {
                const productName = product.dataset.name?.toLowerCase() || '';
                const productDesc = product.querySelector('.card-text')?.textContent?.toLowerCase() || '';
                
                product.style.display = (productName.includes(searchTerm) || productDesc.includes(searchTerm)) 
                    ? 'block' 
                    : 'none';
            });
        });

        // فیلتر برندها
        $$('.brand-filter').forEach(filter => {
            filter.addEventListener('change', FILTERS.applyFilters);
        });

        // فیلتر دسته‌بندی‌ها
        $$('.category-filter').forEach(filter => {
            filter.addEventListener('change', FILTERS.applyFilters);
        });

        // مرتب‌سازی
        const sortSelect = $('#sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', FILTERS.sortProducts);
        }
    },

    applyFilters: () => {
        const selectedBrands = Array.from($$('.brand-filter:checked')).map(cb => cb.value);
        const selectedCategories = Array.from($$('.category-filter:checked')).map(cb => cb.value);
        const products = $$('.product-item');
        
        products.forEach(product => {
            const brand = product.dataset.brand;
            const category = product.dataset.category;
            
            const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(brand);
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(category);
            
            product.style.display = (brandMatch && categoryMatch) ? 'block' : 'none';
        });
    },

    sortProducts: () => {
        const sortValue = $('#sortSelect').value;
        const productContainer = $('#productsList');
        const products = Array.from($$('.product-item'));
        
        if (!productContainer) return;
        
        products.sort((a, b) => {
            const priceA = parseInt(a.dataset.price) || 0;
            const priceB = parseInt(b.dataset.price) || 0;
            const ratingA = parseFloat(a.dataset.rating) || 0;
            const ratingB = parseFloat(b.dataset.rating) || 0;
            
            switch (sortValue) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'rating':
                    return ratingB - ratingA;
                default:
                    return 0;
            }
        });
        
        // مرتب‌سازی دوباره
        products.forEach(product => {
            productContainer.appendChild(product);
        });
    }
};

// =========================
// INITIALIZATION (مقداردهی اولیه کلی)
// =========================
document.addEventListener('DOMContentLoaded', () => {
    // بررسی Bootstrap
    if (typeof bootstrap === 'undefined') {
        console.warn('Bootstrap JS بارگذاری نشده است!');
    }

    // مقداردهی اولیه سیستم کاربر
    USER_UI.init();
    
    // ابزارهای کمکی
    UTILS.initPasswordToggles();
    
    // فرم‌ها
    FORM_VALIDATION.initLoginForm();
    FORM_VALIDATION.initRegisterForm();
    FORM_VALIDATION.initContactForm();
    FORM_VALIDATION.initNewsletterForm();
    
    // سبد خرید
    CART.initAddButtons();
    CART.updateCount();
    
    // فیلترها
    FILTERS.init();
    
    // مدیریت مودال سبد خرید
    const cartModal = $('#cartModal');
    if (cartModal) {
        cartModal.addEventListener('show.bs.modal', CART.updateModal);
    }
    
    console.log('سیستم فروشگاه با موفقیت بارگذاری شد');
});

// =========================
// PROTECTED PAGES (صفحات محافظت شده)
// =========================
function checkAuthForProtectedPages() {
    const protectedPages = ['profile.html', 'orders.html', 'wishlist.html', 'addresses.html', 'settings.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !AUTH.getUser()) {
        UTILS.showToast('برای دسترسی به این صفحه باید وارد حساب کاربری خود شوید', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
    return true;
}

// اجرای بررسی در صفحات محافظت شده
if (window.location.pathname.includes('profile.html') || 
    window.location.pathname.includes('orders.html') ||
    window.location.pathname.includes('wishlist.html')) {
    document.addEventListener('DOMContentLoaded', checkAuthForProtectedPages);
}