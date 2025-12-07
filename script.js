// Use strict mode for better error handling
'use strict';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // --- CART FUNCTIONALITY ---
    let cart = JSON.parse(localStorage.getItem('mahdiLaptopCart')) || [];
    let cartCount = 0;
    let cartTotal = 0;

    function updateCartUI() {
        cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Update cart count in the navbar
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }

        // Update cart modal
        const cartItemsContainer = document.getElementById('cartItems');
        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-cart text-center p-4">سبد خرید شما خالی است</div>';
            } else {
                let html = '';
                cart.forEach(item => {
                    html += `
                        <div class="cart-item d-flex align-items-center p-2 border-bottom">
                            <img src="${item.image}" alt="${item.name}" class="me-3" style="width: 60px; height: 60px; object-fit: cover;">
                            <div class="cart-item-details flex-grow-1">
                                <div class="cart-item-title fw-bold">${item.name}</div>
                                <div class="cart-item-price text-danger">${formatPrice(item.price)} تومان</div>
                                <div class="cart-item-quantity d-flex align-items-center mt-1">
                                    <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
                                    <span class="quantity-value mx-2">${item.quantity}</span>
                                    <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-danger remove-item ms-2" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                });
                cartItemsContainer.innerHTML = html;
            }
        }

        // Update cart total
        const cartTotalElement = document.getElementById('cartTotal');
        if (cartTotalElement) {
            cartTotalElement.textContent = formatPrice(cartTotal) + ' تومان';
        }
        
        // Save cart to localStorage
        localStorage.setItem('mahdiLaptopCart', JSON.stringify(cart));
    }

    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function addToCart(e) {
        const btn = e.currentTarget;
        const productId = btn.getAttribute('data-product-id');
        const productName = btn.getAttribute('data-product-name');
        const productPrice = parseInt(btn.getAttribute('data-product-price'));
        const productImage = document.querySelector(`[data-product-id="${productId}"] .card-img-top`).getAttribute('src');

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, name: productName, price: productPrice, image: productImage, quantity: 1 });
        }

        updateCartUI();
        showToast('محصول به سبد خرید اضافه شد', 'success');
    }
    
    // --- EVENT LISTENERS FOR CART ---
    document.addEventListener('click', function(e) {
        if (e.target.closest('.cart-btn')) {
            addToCart(e);
        }
        if (e.target.closest('.remove-item')) {
            const id = e.target.closest('.remove-item').getAttribute('data-id');
            cart = cart.filter(item => item.id !== id);
            updateCartUI();
            showToast('محصول از سبد خرید حذف شد', 'info');
        }
        if (e.target.closest('.increase-quantity')) {
            const id = e.target.closest('.increase-quantity').getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            if (item) item.quantity++;
            updateCartUI();
        }
        if (e.target.closest('.decrease-quantity')) {
            const id = e.target.closest('.decrease-quantity').getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            if (item && item.quantity > 1) {
                item.quantity--;
            } else {
                cart = cart.filter(cartItem => cartItem.id !== id);
            }
            updateCartUI();
        }
    });

    // --- WISHLIST FUNCTIONALITY ---
    document.addEventListener('click', function(e) {
        if (e.target.closest('.wishlist-btn')) {
            const icon = e.target.closest('.wishlist-btn').querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            const isWished = icon.classList.contains('fas');
            showToast(isWished ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد', isWished ? 'success' : 'info');
        }
    });

    // --- FILTER & SORT FUNCTIONALITY ---
    function filterAndSortProducts() {
        const products = document.querySelectorAll('.product-item');
        const activeCategories = Array.from(document.querySelectorAll('#categoryFilter input:checked')).map(cb => cb.value);
        const activeBrands = Array.from(document.querySelectorAll('#brandFilter input:checked')).map(cb => cb.value);
        const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;
        const activeRating = parseInt(document.querySelector('input[name="rating"]:checked')?.value) || 0;
        const sortValue = document.getElementById('sortSelect').value;

        let visibleProducts = [];
        products.forEach(product => {
            const category = product.getAttribute('data-category');
            const brand = product.getAttribute('data-brand');
            const price = parseInt(product.getAttribute('data-price'));
            const rating = parseFloat(product.getAttribute('data-rating'));

            const categoryMatch = activeCategories.length === 0 || activeCategories.includes(category);
            const brandMatch = activeBrands.length === 0 || activeBrands.includes(brand);
            const priceMatch = price >= minPrice && price <= maxPrice;
            const ratingMatch = rating >= activeRating;

            if (categoryMatch && brandMatch && priceMatch && ratingMatch) {
                product.style.display = '';
                visibleProducts.push(product);
            } else {
                product.style.display = 'none';
            }
        });
        
        // Sorting
        const productsList = document.getElementById('productsList');
        visibleProducts.sort((a, b) => {
            switch (sortValue) {
                case 'price-low': return parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price'));
                case 'price-high': return parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price'));
                case 'rating': return parseFloat(b.getAttribute('data-rating')) - parseFloat(a.getAttribute('data-rating'));
                default: return 0;
            }
        });
        visibleProducts.forEach(product => productsList.appendChild(product));
    }

    document.querySelectorAll('.product-filters input, #sortSelect').forEach(input => {
        input.addEventListener('change', filterAndSortProducts);
    });
    document.getElementById('applyPriceFilter')?.addEventListener('click', filterAndSortProducts);

    document.getElementById('clearFilters')?.addEventListener('click', function() {
        document.querySelectorAll('.product-filters input[type="checkbox"], .product-filters input[type="radio"]').forEach(input => input.checked = false);
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('sortSelect').value = 'default';
        filterAndSortProducts();
    });

    // --- SEARCH FUNCTIONALITY ---
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput?.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const products = document.querySelectorAll('.product-item');
        let resultsHtml = '';
        let hasResults = false;

        products.forEach(product => {
            const title = product.querySelector('.card-title').textContent.toLowerCase();
            if (title.includes(query)) {
                hasResults = true;
                const productId = product.getAttribute('data-product-id');
                const productTitle = product.querySelector('.card-title').textContent;
                const productImage = product.querySelector('.card-img-top').getAttribute('src');
                resultsHtml += `
                    <a href="#" class="search-result-item d-flex align-items-center p-2" data-id="${productId}">
                        <img src="${productImage}" alt="${productTitle}" class="me-2" style="width: 40px; height: 40px; object-fit: cover;">
                        <div>${productTitle}</div>
                    </a>
                `;
            }
        });

        searchResults.innerHTML = hasResults ? resultsHtml : '<div class="p-2 text-muted">محصولی یافت نشد</div>';
        searchResults.style.display = 'block';
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-box')) {
            searchResults.style.display = 'none';
        }
    });

    // Scroll to product from search result
    searchResults?.addEventListener('click', function(e) {
        e.preventDefault();
        const resultItem = e.target.closest('.search-result-item');
        if (resultItem) {
            const productId = resultItem.getAttribute('data-id');
            const productElement = document.querySelector(`.product-item[data-product-id="${productId}"]`);
            if (productElement) {
                productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                searchResults.style.display = 'none';
                searchInput.value = '';
            }
        }
    });


    // --- FORM VALIDATION & SUBMISSION ---
    function showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container');
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
    }
    
    // --- INITIALIZATION ---
    updateCartUI(); // Initial cart update on page load
});
// --- PRODUCT DETAIL PAGE FUNCTIONALITY ---

// "بانک اطلاعاتی" محصولات. در یک پروژه واقعی، این اطلاعات از یک سرور (API) دریافت می‌شود.
const productsDatabase = [
    {
        id: 1,
        name: 'لنوو ThinkPad X1',
        price: 15500000,
        oldPrice: 19375000,
        image: './لنوو ThinkPad X1.jpg',
        images: ['./لنوو ThinkPad X1.jpg', './lenovo-laptop-hero.jpg', './apple-laptop-hero.jpg'], // تصاویر بیشتر
        description: 'لنوو ThinkPad X1 Carbon ناز نوین‌ترین لپ‌تاپ‌های اولترابوک در جهان است که ترکیبی از طراحی باریک، وزن سبک و عملکرد قدرتمند را ارائه می‌دهد. این لپ‌تاپ با صفحه نمایش 14 اینچی با وضوح بالا و پردازنده‌های نسل جدید، برای متخصصان و کارآفرینانی که همیشه در حال حرکت هستند، ایده‌آل است.',
        specs: {
            'پردازنده': 'Intel Core Ultra 7',
            'حافظه RAM': '32 گیگابایت',
            'حافظه داخلی': '512 گیگابایت SSD',
            'کارت گرافیک': 'Intel Iris Xe',
            'صفحه نمایش': '14 اینچی 2.8K (2880x1800) OLED',
            'سیستم عامل': 'Windows 11 Pro'
        }
    },
    {
        id: 2,
        name: 'ایسوس ROG Strix',
        price: 12200000,
        oldPrice: 14350000,
        image: './rog-strix-g16-rgb-6462090fa32dd7bdc5f78325.webp',
        images: ['./rog-strix-g16-rgb-6462090fa32dd7bdc5f78325.webp', './lenovo-laptop-hero.jpg'],
        description: 'ایسوس ROG Strix یک هیولای گیمینگ است که با جدیدترین سخت‌افزارها برای ارائه بهترین عملکرد در بازی‌های روز دنیا مجهز شده است. این لپ‌تاپ با طراحی جذاب و نورپردازی RGB، تجربه‌ای فراموش‌نشدنی برای گیمرها به ارمغان می‌آورد.',
        specs: {
            'پردازنده': 'Intel Core i9-13980HX',
            'حافظه RAM': '32 گیگابایت DDR5',
            'حافظه داخلی': '1 ترابایت SSD',
            'کارت گرافیک': 'NVIDIA GeForce RTX 4070',
            'صفحه نمایش': '16 اینچی 2.5K (2560x1600) 240Hz',
            'سیستم عامل': 'Windows 11 Home'
        }
    },
    {
        id: 3,
        name: 'اپل MacBook Pro',
        price: 28500000,
        oldPrice: null, // بدون قیمت قبلی
        image: '6e57ca6ee4c9680214d6e0a58c6ad744cc73a90d_1746264720.webp',
        images: ['6e57ca6ee4c9680214d6e0a58c6ad744cc73a90d_1746264720.webp', './apple-laptop-hero.jpg'],
        description: 'مک‌بوک پرو با تراشه اپل M4 Pro، عملکرد و کارایی را به سطح جدیدی ارتقا می‌بخشد. این لپ‌تاپ برای حرفه‌ای‌هایی که در زمینه‌های ویرایش ویدیو، موسیقی، برنامه‌نویسی و طراحی گرافیک فعالیت می‌کنند، یک ابزار قدرتمند و قابل اعتماد است.',
        specs: {
            'پردازنده': 'Apple M4 Pro',
            'حافظه RAM': '16 گیگابایت یکپارچه',
            'حافظه داخلی': '256 گیگابایت SSD',
            'کارت گرافیک': 'Apple GPU (16-core)',
            'صفحه نمایش': '14.2 اینچی Liquid Retina XDR (3024x1964)',
            'سیستم عامل': 'macOS'
        }
    },
    {
        id: 4,
        name: 'اچ‌پی Pavilion',
        price: 10800000,
        oldPrice: 12000000,
        image: './8609b9c65753cdc3c5233637b036d0799b681fef_1753634326.webp',
        images: ['./8609b9c65753cdc3c5233637b036d0799b681fef_1753634326.webp', './lenovo-laptop-hero.jpg'],
        description: 'اچ‌پی Pavilion یک لپ‌تاپ همه‌کاره و مقرون‌به‌صرفه است که برای انجام کارهای روزمره، تحصیل و سرگرمی ایده‌آل است. این لپ‌تاپ با طراحی زیبا و عملکرد قابل اعتماد، تجربه‌ای روان و لذت‌بخش را ارائه می‌دهد.',
        specs: {
            'پردازنده': 'Intel Core i7-1255U',
            'حافظه RAM': '8 گیگابایت DDR4',
            'حافظه داخلی': '1 ترابایت HDD',
            'کارت گرافیک': 'Intel Iris Xe',
            'صفحه نمایش': '15.6 اینچی FHD (1920x1080)',
            'سیستم عامل': 'Windows 11 Home'
        }
    },
    {
        id: 5,
        name: 'دل XPS 13',
        price: 16700000,
        oldPrice: null,
        image: './c1f5860938d7dc087df2dddc1dccf07aa63f1d02_1694265753.webp',
        images: ['./c1f5860938d7dc087df2dddc1dccf07aa63f1d02_1694265753.webp', './lenovo-laptop-hero.jpg'],
        description: 'دل XPS 13 نمادی از نوآوری و طراحی زیبا در دنیای اولترابوک‌هاست. این لپ‌تاپ فوق‌باریک و سبک با صفحه نمایش بی‌نظیر InfinityEdge، برای کاربرانی که به دنبال بهترین ترکیب از قابلیت حمل و عملکرد هستند، انتخابی بی‌نظیر است.',
        specs: {
            'پردازنده': 'Intel Core i7-1360P',
            'حافظه RAM': '16 گیگابایت LPDDR5',
            'حافظه داخلی': '512 گیگابایت SSD',
            'کارت گرافیک': 'Intel Iris Xe',
            'صفحه نمایش': '13.4 اینچی FHD+ (1920x1200)',
            'سیستم عامل': 'Windows 11 Home'
        }
    },
    {
        id: 6,
        name: 'ام‌اس‌آی Creator',
        price: 19900000,
        oldPrice: 20947000,
        image: './e4eb8ea1c800f1454184dcca89571a0ff5336fee_1756111783.webp',
        images: ['./e4eb8ea1c800f1454184dcca89571a0ff5336fee_1756111783.webp', './lenovo-laptop-hero.jpg'],
        description: 'لپ‌تاپ ام‌اس‌آی Creator به طور خاص برای طراحان، هنرمندان و سازندگان محتوا طراحی شده است. این لپ‌تاپ با صفحه نمایش رنگی دقیق و عملکرد گرافیکی قدرتمند، ابزاری ایده‌آل برای خلق آثار هنری دیجیتال است.',
        specs: {
            'پردازنده': 'Intel Core i7-13700H',
            'حافظه RAM': '16 گیگابایت DDR5',
            'حافظه داخلی': '1 ترابایت NVMe SSD',
            'کارت گرافیک': 'NVIDIA GeForce RTX 3060',
            'صفحه نمایش': '16 اینچی QHD+ (2560x1600) 100% DCI-P3',
            'سیستم عامل': 'Windows 11 Pro'
        }
    }
];

// تابعی برای پیدا کردن محصول بر اساس ID
function findProductById(id) {
    return productsDatabase.find(product => product.id == id);
}

// تابعی برای نمایش جزئیات محصول در صفحه
function displayProductDetails(product) {
    if (!product) {
        document.getElementById('productDetailContainer').innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                محصولی یافت نشد.
            </div>
        `;
        return;
    }

    // به‌روزرسانی تگ‌های متا
    document.title = `${product.name} | فروشگاه لپ‌تاپ Mahdi Arshi`;
    document.getElementById('productPageTitle').textContent = product.name;
    document.getElementById('productPageDescription').content = `مشاهده جزئیات و خرید ${product.name} با بهترین قیمت در فروشگاه Mahdi Arshi.`;

    // ساخت HTML جزئیات محصول
    const productDetailsHtml = `
        <div class="row">
            <!-- بخش تصاویر -->
            <div class="col-lg-6 mb-4">
                <div class="main-image-container">
                    <img id="mainProductImage" src="${product.image}" alt="${product.name}">
                </div>
                <div class="d-flex mt-3">
                    ${product.images.map(img => `<img src="${img}" alt="${product.name}" class="thumbnail img-fluid me-2" onclick="changeMainImage('${img}')">`).join('')}
                </div>
            </div>
            
            <!-- بخش اطلاعات محصول -->
            <div class="col-lg-6 mb-4">
                <h1 class="mb-3">${product.name}</h1>
                <div class="mb-3">
                    <span class="price-display">${formatPrice(product.price)} تومان</span>
                    ${product.oldPrice ? `<span class="old-price-display me-2">${formatPrice(product.oldPrice)} تومان</span>` : ''}
                </div>
                <p class="lead">${product.description}</p>
                
                <div class="d-flex align-items-center mt-4">
                    <button class="btn wishlist-btn me-3" aria-label="افزودن به علاقه‌مندی‌ها" data-product-id="${product.id}">
                        <i class="far fa-heart fa-2x"></i>
                    </button>
                    <button class="btn btn-primary btn-lg cart-btn" aria-label="افزودن به سبد خرید" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}">
                        <i class="fas fa-shopping-cart ms-2"></i> افزودن به سبد خرید
                    </button>
                </div>
            </div>
        </div>

        <!-- بخش مشخصات فنی -->
        <div class="row mt-5">
            <div class="col-12">
                <h3 class="section-title">مشخصات فنی</h3>
                <table class="table specs-table">
                    <tbody>
                        ${Object.entries(product.specs).map(([key, value]) => `
                            <tr>
                                <th>${key}</th>
                                <td>${value}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('productDetailContainer').innerHTML = productDetailsHtml;
}

// تابعی برای تغییر تصویر اصلی
function changeMainImage(imageSrc) {
    document.getElementById('mainProductImage').src = imageSrc;
}

// اجرای منطق صفحه جزئیات محصول
document.addEventListener('DOMContentLoaded', function() {
    // بررسی اینکه آیا در صفحه جزئیات محصول هستیم یا خیر
    if (window.location.pathname.includes('product-detail.html')) {
        // گرفتن ID محصول از URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            const product = findProductById(productId);
            displayProductDetails(product);
        } else {
            // اگر ID وجود نداشت، به صفحه اصلی برگرد
            window.location.href = 'index.html';
        }
    }
});
// --- CHECKOUT PAGE FUNCTIONALITY ---

// اجرای منطق مربوط به صفحه تسویه حساب
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutPage();
    }
});

// تابعی برای نمایش صفحه تسویه حساب
function displayCheckoutPage() {
    const cart = JSON.parse(localStorage.getItem('mahdiLaptopCart')) || [];
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutSummaryElement = document.getElementById('checkoutSummary');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    if (cart.length === 0) {
        checkoutSummaryElement.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                سبد خرید شما خالی است. لطفاً ابتدا محصولی را به سبد خرید اضافه کنید.
                <a href="index.html#products" class="btn btn-primary">رفتن به محصولات</a>
            </div>
        `;
        placeOrderBtn.disabled = true;
        cartTotalElement.textContent = '0 تومان';
    } else {
        let summaryHtml = `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>محصول</th>
                        <th>قیمت</th>
                        <th>تعداد</th>
                        <th>مجموع</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let total = 0;
        cart.forEach(item => {
            summaryHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td>${formatPrice(item.price)} تومان</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
                            <span class="quantity-value mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
                        </div>
                    </td>
                    <td>${formatPrice(item.price * item.quantity)} تومان</td>
                </tr>
            `;
            total += item.price * item.quantity;
        });

        summaryHtml += `
                </tbody>
            </table>
            <hr>
            <div class="d-flex justify-content-between align-items-center">
                <h5>جمع کل:</h5>
                <h4>${formatPrice(total)} تومان</h4>
            </div>
        `;

        checkoutSummaryElement.innerHTML = summaryHtml;
        cartTotalElement.textContent = `${formatPrice(total)} تومان`;
        placeOrderBtn.disabled = false;
    }
}

// تابعی برای مدیریت سبد خرید در صفحه تسویه حساب
document.addEventListener('click', function(e) {
    if (e.target.closest('.decrease-quantity') || e.target.closest('.increase-quantity')) {
        const id = e.target.closest('button').dataset.id;
        const item = cart.find(item => item.id == id);
        if (item) {
            if (e.target.classList.contains('decrease-quantity')) {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart.splice(cart.indexOf(item), 1);
                }
            } else {
                item.quantity++;
            }
            updateCartUI();
        }
    }
});

// تابعی برای ارسال فرم تسویه حساب
document.getElementById('checkoutForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    // جمع‌آوری اطلاعات فرم (در یک پروژه واقعی، این اطلاعات به سرور ارسال می‌شود)
    const formData = new FormData(e.target);
    const formDataObject = Object.fromEntries(formData);
    
    console.log('اطلاعات سفارش:', formDataObject);

    // نمایش پیام موفقیت به کاربر
    showToast('سفارش شما با موفقیت ثبت شد. به زودی به صفحه پرداخت منتقل می‌شوید.', 'success');

    // در یک پروژه واقعی، در اینجا شما باید درخواست را به سرور ارسال کنید
    // و سپس کاربر را به درگاه پرداخت هدایت کنید.
    // setTimeout(() => {
    //   window.location.href = 'https://payment-gateway.com/pay?order_id=12345';
    // }, 2000);
});
// ... (کدهای جاوا اسکریپت قبلی شما)

// --- CHECKOUT PAGE FUNCTIONALITY ---
document.addEventListener('DOMContentLoaded', function() {
    // بررسی اینکه آیا در صفحه جزئیات محصول هستیم
    if (window.location.pathname.includes('product-detail.html')) {
        displayProductDetails();
    }
});

// --- CART & CHECKOUT ---
document.addEventListener('click', function(e) {
    if (e.target.closest('.cart-btn')) {
        // منطق افزودن به سبد خرید در اینجا نیز کار می‌کند
        // (این منطق در فایل script.js شما موجود است)
    }
});

// --- NAVIGATION TO CHECKOUT ---
document.getElementById('checkoutBtn')?.addEventListener('click', function() {
    if (cart.length > 0) {
        // به جایگزاری به صفحه تسویه حساب هدایت
        window.location.href = 'checkout.html';
    } else {
        showToast('سبد خرید شما خالی است. لطفاً ابتدا محصولی به سبد خرید اضافه کنید.', 'warning');
    }
});
// --- REVIEW SUBMISSION LOGIC ---

document.addEventListener('submit', function(e) {
    // جلوگیری از رفرش پیش‌فرض
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // دریافت ID محصول از ویژگی‌های دکمه `data-product-id`
    const productId = form.querySelector('[data-product-id]').getAttribute('data-product-id');
    const productName = form.querySelector('[data-product-name]').getAttribute('data-product-name');
    const reviewText = form.querySelector('[id^="reviewText"]').value;
    const reviewRating = form.querySelector('[id^="reviewRating"]').value;

    // ایجاد یک شیء نظرات برای محصول
    let reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
    reviews.push({
        author: form.querySelector('[id^="reviewName"]').value,
        rating: parseInt(reviewRating),
        text: reviewText,
        date: new Date().toISOString()
    });

    // ذخیر نظرات جدید
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));

    // نمایش نظرات جدید در صفحه
    displayReviewsForProduct(productId);

    // نمایش پیام موفقیت به کاربر
    showToast('نظر شما با موفقیت ثبت شد.', 'success');

    // خالی فرم برای جلوگیری از ارسال مجدد
    form.reset();
});
// --- AUTHENTICATION LOGIC ---

// اجرای منطق ورود
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    formData.append('action', 'login');

    fetch('process.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
            // در یک پروژه واقعی، اینجا کاربر را وارد سیستم و توکن (مثلاً توکن) کنید
            // مثلاً:
            // window.location.href = 'dashboard.html';
        } else {
            showToast(data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('خطایی در ارسال درخواست', 'danger');
    });
});

// اجرای منطق ثبت‌نام
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    formData.append('action', 'register');

    fetch('process.php', {
        working
    });
});
// --- PLACE ORDER LOGIC ---
document.addEventListener('click', function(e) {
    if (e.target.id === 'placeOrder') {
        e.preventDefault();
        const cart = JSON.parse(localStorage.getItem('mahdiLaptopCart')) || [];
        
        if (cart.length === 0) {
            showToast('سبد خرید شما خالی است. لطفاً ابتدا محصولی را به سبد خرید اضافه کنید.', 'warning');
            return;
        }

        // در اینجا شما می‌توانید منطق ارسال سفارش به `api.php`
        const orderData = {
            products: cart,
            // ... اطلاعات دیگر مثل آدرس، شماره تلفن و...
        };

        fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('سفارش شما با موفقیت ثبت شد. به زودی پرداخت هدایت', 'success');
                // به صفحه پرداخت هدایت بروید
                setTimeout(() => {
                    // window.location.href = 'https://payment-gateway.com/pay?order_id=123'; // مثلاً
                }, 2000);
            } else {
                showToast('خطایی در ثبت سفارش. لطفاً دوباره با پشتیبام به پشتیبام.', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('خطا در ارتباط با سرور. لطفاً دوباره با پشتیبام.', 'danger');
        });
    }
});
// --- AUTHENTICATION LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    
    // Login Form
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', handleLogin);

    // Register Form
    const registerForm = document.getElementById('registerForm');
    registerForm?.addEventListener('submit', handleRegister);
});

function handleLogin(e) {
    e.preventDefault();
    // ... منطق ورود ...
}

function handleRegister(e) {
    e.preventDefault();
    // ... منطق ثبت‌نام ...
}

// --- CART LOGIC ---
// ... کدهای قبلی شما برای سبد خرید ...
// --- PRODUCT DETAIL PAGE FUNCTIONALITY ---
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('product-detail.html')) {
        displayProductDetails();
    }
});

// --- NAVIGATION TO CHECKOUT ---
document.addEventListener('click', function(e) {
    const isNavLink = e.target.closest('.nav-link');
    if (isNavLink && isNavLink.href.includes('#')) {
        e.preventDefault();
    }
});

// --- CART FUNCTIONALITY ---
document.addEventListener('click', function(e) {
    if (e.target.closest('.cart-btn')) {
        addToCart(e);
    }
});

// --- WISHLIST BUTTON ---
document.addEventListener('click', function(e) {
    const wishlistBtn = e.target.closest('.wishlist-btn');
    if (wishlistBtn) {
        const icon = wishlistBtn.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
    }
});

// --- FORM SUBMISSION ---
document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
document.getElementById('registerForm')?.addEventListener('submit', handleRegister);

// --- REVIEW SUBMISSION ---
document.querySelectorAll('.add-review form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const productId = form.querySelector('[id^="reviewName"]').id.replace('reviewName', '');
        const rating = form.querySelector('[id^="reviewRating]').value;
        const text = form.querySelector('[id^="reviewText"]').value;
        showToast('نظر شما با موفقیت ثبت شد', 'success');
        form.reset();
    });
});
// --- PRODUCT DETAIL PAGE FUNCTIONALITY ---
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('product-detail.html')) {
        displayProductDetails();
    }
});

// --- NAVIGATION TO CHECKOUT ---
document.addEventListener('click', function(e) {
    const isNavLink = e.target.closest('.nav-link');
    if (isNavLink && isNavLink.href.includes('#')) {
        e.preventDefault();
    }
});

// --- CART FUNCTIONALITY ---
document.addEventListener('click', function(e) {
    if (e.target.closest('.cart-btn')) {
        addToCart(e);
    }
});

// --- WISHLIST BUTTON ---
document.addEventListener('click', function(e) {
    const wishlistBtn = e.target.closest('.wishlist-btn');
    if (wishlistBtn) {
        const icon = wishlistBtn.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
    }
});

// --- FORM SUBMISSION ---
document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
document.getElementById('registerForm')?.addEventListener('submit', handleRegister);

// --- REVIEW SUBMISSION ---
document.querySelectorAll('.add-review form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const productId = form.querySelector('[id^="reviewName"]').id.replace('reviewName', '');
        const rating = form.querySelector('[id^="reviewRating]').value;
        const text = form.querySelector('[id^="reviewText"]').value;
        showToast('نظر شما با موفقیت ثبت شد', 'success');
        form.reset();
    });
});