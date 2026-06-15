// --- DARK MODE ---
let darkModeEnabled = localStorage.getItem("darkMode") === "true";
// --- WISHLIST ---
let wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];
// --- COUPON SYSTEM ---
let activeDiscount = 0;
const coupons = { ALBRETO10: 10, WELCOME20: 20, VIP30: 30 };
// --- ORDER HISTORY ---
let orderHistory = JSON.parse(localStorage.getItem("orders")) || [];
// --- RECENTLY VIEWED ---
let viewedItems = [];
// --- Authorization Global State variables (Restored from LocalStorage) ---
let isUserLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
let loggedInUser = localStorage.getItem('loggedInUser') || "";

// Array container to track watches stored inside user shopping session
let shoppingCartItemsArray = [];

orderHistory.push({
    date: new Date().toLocaleDateString(),
    customer: loggedInUser,
    items: [...shoppingCartItemsArray]
});
localStorage.setItem("orders", JSON.stringify(orderHistory));

// Find elements from the DOM
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartCountDisplay = document.getElementById('cart-count');

// Modal Elements references
const loginModal = document.getElementById('login-modal');
const loginNavBtn = document.getElementById('login-nav-btn');
const closeLoginBtn = document.getElementById('close-login');
const loginForm = document.getElementById('login-form');
const navLoginItem = document.getElementById('nav-login-item');

// Cart Slider references
const cartModal = document.getElementById('cart-modal');
const cartNavBtn = document.getElementById('cart-nav-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsWrapper = document.getElementById('cart-items-wrapper');
const cartTotalAmountDisplay = document.getElementById('cart-total-amount');
const checkoutBtn = document.getElementById('checkout-btn');


// --- Reusable Function to update UI display states across pages ---
function restoreLoginUIState() {
    if (isUserLoggedIn && navLoginItem) {
        // Automatically show the logged in view with working logout click event
        navLoginItem.innerHTML = `<a href="#" id="login-nav-btn">Logout (${loggedInUser})</a>`;
        
        document.getElementById('login-nav-btn').addEventListener('click', (ev) => {
            ev.preventDefault();
            handleGlobalLogoutAction();
        });
    }
}

// Global Logout Action Helper
function handleGlobalLogoutAction() {
    isUserLoggedIn = false;
    loggedInUser = "";
    shoppingCartItemsArray = [];
    
    // Clear browser permanent storage memory records
    localStorage.removeItem('isUserLoggedIn');
    localStorage.removeItem('loggedInUser');
    
    if (typeof updateCartUIDrawerDisplay === "function") {
        updateCartUIDrawerDisplay();
    }
    
    // Reset navbar back to login option
    navLoginItem.innerHTML = `<a href="#" id="login-nav-btn">Login</a>`;
    
    // Re-bind modal pop up handler to the fresh Login button
    document.getElementById('login-nav-btn').addEventListener('click', (evt) => {
        evt.preventDefault();
        loginModal.style.display = "flex";
    });
    
    alert("🔒 You have signed out successfully.");
    window.location.reload();
}

// --- Interactive Login Modal Trigger Controls ---
if (loginNavBtn) {
    loginNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isUserLoggedIn) {
            loginModal.style.display = "flex";
        } else {
            handleGlobalLogoutAction();
        }
    });
}

// RUN AUTOMATICALLY ON PAGE LOAD: Restores session instantly across subpages (Rolex, Casio, etc.)
restoreLoginUIState();

if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', () => {
        loginModal.style.display = "none";
    });
}


// --- FIXED: ONE SINGLE MERGED LOGIN FORM HANDLER WITH STORAGE CAPABILITIES ---
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userInput = document.getElementById('username').value.trim();
       
        isUserLoggedIn = true;
        loggedInUser = userInput || "Valued Customer";
        
        // SAVE PERSISTENT DATA TO BROWSER SESSIONS SAFELY
        localStorage.setItem('isUserLoggedIn', 'true');
        localStorage.setItem('loggedInUser', loggedInUser);
        
        loginModal.style.display = "none";
       
        // Update navigation item representation layout
        navLoginItem.innerHTML = `<a href="#" id="login-nav-btn">Logout (${loggedInUser})</a>`;
        
        // Re-bind listeners onto newly updated node elements
        document.getElementById('login-nav-btn').addEventListener('click', (ev) => {
            ev.preventDefault();
            handleGlobalLogoutAction();
        });

        alert(`👋 Welcome back, ${loggedInUser}! Shopping capabilities are now completely unlocked.`);
        loginForm.reset();
    });
}


// --- Cart Popup Window Slide Panel System Functions ---
if (cartNavBtn) {
    cartNavBtn.addEventListener('click', () => {
        cartModal.style.display = "flex";
    });
}

if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
        cartModal.style.display = "none";
    });
}


// Close windows if overlay boundaries get clicked on directly
window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = "none";
    if (e.target === cartModal) cartModal.style.display = "none";
});


// Parse standard text price integer components together cleanly
function computeTotalCartSumAmount() {
    let totalSum = 0;
    shoppingCartItemsArray.forEach(item => {
        const numericValue = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(numericValue)) {
            totalSum += numericValue;
        }
    });
    if (cartTotalAmountDisplay) {
       let discountAmount = totalSum * (activeDiscount / 100);
        let finalAmount = totalSum - discountAmount;
        cartTotalAmountDisplay.innerText = `QAR ${finalAmount.toLocaleString()}`; 
    }
}


// Render selected watch storage tracking layouts array elements list output onto screen view
function updateCartUIDrawerDisplay() {
    if (cartCountDisplay) {
        cartCountDisplay.innerText = shoppingCartItemsArray.length;
    }

    if (!cartItemsWrapper) return;

    if (shoppingCartItemsArray.length === 0) {
        cartItemsWrapper.innerHTML = `<p class="empty-cart-msg">Your shopping cart is currently empty.</p>`;
        if (cartTotalAmountDisplay) cartTotalAmountDisplay.innerText = "QAR 0";
        return;
    }

    cartItemsWrapper.innerHTML = "";
    shoppingCartItemsArray.forEach((item, index) => {
        const itemCardElement = document.createElement('div');
        itemCardElement.className = "cart-item-card";
        itemCardElement.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
            </div>
            <button class="remove-item-btn" data-index="${index}">Remove</button>
        `;
        cartItemsWrapper.appendChild(itemCardElement);
    });

    computeTotalCartSumAmount();

    // Bind item deletion control operations
    const removeButtons = cartItemsWrapper.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetIndex = parseInt(e.target.getAttribute('data-index'), 10);
            shoppingCartItemsArray.splice(targetIndex, 1);
            updateCartUIDrawerDisplay();
        });
    });
}


// Purchase button handling
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (shoppingCartItemsArray.length === 0) {
            alert("🛒 Your cart is empty. Add watches to your collection first!");
            return;
        }
        alert(`💳 Thank you for choosing Albreto Watches, ${loggedInUser}! Your order purchase confirmation has been dispatched.`);
        shoppingCartItemsArray = [];
        updateCartUIDrawerDisplay();
        cartModal.style.display = "none";
    });
}


// Loop through each button and listen for a mouse click
addToCartButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        if (!isUserLoggedIn) {
            alert("⚠️ Secure Area! Please log in using the dynamic 'Login' navbar selection first to enable purchases.");
            loginModal.style.display = "flex";
            return;
        }

        const productCard = event.target.parentElement;
        const productName = productCard.querySelector('h3').innerText;
        const productPrice = productCard.querySelector('.price').innerText;


        // Track recently viewed
        if (!viewedItems.includes(productName)) {
            viewedItems.unshift(productName);
            if (viewedItems.length > 5) viewedItems.pop();
        }

        shoppingCartItemsArray.push({
            name: productName,
            price: productPrice
        });

        updateCartUIDrawerDisplay();

        if (cartCountDisplay) {
            cartCountDisplay.style.transform = "scale(1.2)";
            setTimeout(() => {
                cartCountDisplay.style.transform = "scale(1)";
            }, 200);
        }

        alert(`🎉 Success! ${productName} (${productPrice}) has been added to your cart.`);

        const originalText = button.innerText;
        button.innerText = "✓ Added";
        button.style.backgroundColor = "#28a745";
        button.style.color = "white";

        setTimeout(() => {
            button.innerText = originalText;
            button.style.backgroundColor = "#111";
            button.style.color = "white";
        }, 1500);
    });
});


// LIVE FUNCTIONAL BRAND FILTER LOGIC
const filterBadges = document.querySelectorAll('.category-badge');
const watchCards = document.querySelectorAll('.card');

filterBadges.forEach(badge => {
    badge.addEventListener('click', () => {
        filterBadges.forEach(b => b.classList.remove('active'));
        badge.classList.add('active');

        const selectedFilter = badge.getAttribute('data-filter');

        watchCards.forEach(card => {
            const cardBrand = card.getAttribute('data-brand');
            
            if (selectedFilter === 'all' || cardBrand === selectedFilter) {
                card.style.display = "block";
                card.style.animation = "none"; 
                card.offsetHeight;             
                card.style.animation = "fadeIn 0.4s ease"; 
            } else {
                card.style.display = "none";
            }
        });
    });
});


// Smooth scroll animation for Shop Now button
const shopButton = document.querySelector('.btn');

if (shopButton) {
    shopButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetSection = document.querySelector('#collection');
        if (targetSection) {
            const headerHeight = document.querySelector('header').offsetHeight || 80;
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
}


// ==========================================
// BRAND PRODUCT FILTERING SYSTEM
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const genderChecks = document.querySelectorAll('.gender-filter');
    const minPrice = document.getElementById('price-min');
    const maxPrice = document.getElementById('price-max');
    const cards = document.querySelectorAll('#brand-grid .card');
    const discountChecks = document.querySelectorAll('.filter-section input[type="checkbox"]');

    if (genderChecks.length > 0 || minPrice || maxPrice) {
        
        function runFilters() {
            const checkedGenders = Array.from(genderChecks).filter(c => c.checked).map(c => c.value);
            const min = parseFloat(minPrice.value) || 0;
            const max = parseFloat(maxPrice.value) || Infinity;

            let requiredDiscount = 0;
            discountChecks.forEach((box, index) => {
                if (box.checked) {
                    if (index === 0) requiredDiscount = Math.max(requiredDiscount, 10);
                    if (index === 1) requiredDiscount = Math.max(requiredDiscount, 25);
                    if (index === 2) requiredDiscount = Math.max(requiredDiscount, 50);
                }
            });

            cards.forEach(card => {
                const cardGender = card.getAttribute('data-gender');
                const cardPrice = parseFloat(card.getAttribute('data-price'));
                const cardDiscount = parseFloat(card.getAttribute('data-discount')) || 0;

                const genderMatch = checkedGenders.includes(cardGender);
                const priceMatch = cardPrice >= min && cardPrice <= max;
                const discountMatch = cardDiscount >= requiredDiscount;

                if (genderMatch && priceMatch && discountMatch) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        genderChecks.forEach(c => c.addEventListener('change', runFilters));
        if (minPrice) minPrice.addEventListener('input', runFilters);
        if (maxPrice) maxPrice.addEventListener('input', runFilters);
        discountChecks.forEach(c => c.addEventListener('change', runFilters));
    }
});


// ==========================================
// TIMEHOUSE ADVERTISEMENT AUTOMATIC SLIDER
// ==========================================
let currentSlideIndex = 0;
const slidesArr = document.querySelectorAll('.slide');
const dotsArr = document.querySelectorAll('.dot');
let sliderAutoplayTimer;

function updateSlideView(index) {
    if (slidesArr.length === 0) return;
    
    if (index >= slidesArr.length) currentSlideIndex = 0;
    if (index < 0) currentSlideIndex = slidesArr.length - 1;

    slidesArr.forEach(slide => slide.classList.remove('active-slide'));
    dotsArr.forEach(dot => dot.classList.remove('active-dot'));

    if (slidesArr[currentSlideIndex]) {
        slidesArr[currentSlideIndex].classList.add('active-slide');
    }
    if (dotsArr[currentSlideIndex]) {
        dotsArr[currentSlideIndex].classList.add('active-dot');
    }
}

function nextSlideSlide() {
    currentSlideIndex++;
    updateSlideView(currentSlideIndex);
}

function resetSliderAutoplay() {
    clearInterval(sliderAutoplayTimer);
    sliderAutoplayTimer = setInterval(nextSlideSlide, 5000); 
}

if (slidesArr.length > 0) {
    resetSliderAutoplay();
}


// ==================================================== 
// DATA SOURCE CONFIGURATIONS (For Carousel & Reviews)   
// ==================================================== 
const reviewsData = [
  { 
    name: "Ahmed Al-Thani", 
    text: "Exceptional service at The Pearl boutique. Bought my Rolex Submariner here. Authentic, certified, and absolute premium treatment.", 
    stars: "⭐⭐⭐⭐⭐", 
    date: "May 2026" 
  },
  { 
    name: "Sarah Jenkins", 
    text: "The repair center fixed my vintage Omega masterpiece seamlessly. It runs like brand new now. Highly recommended horologists in Doha!", 
    stars: "⭐⭐⭐⭐⭐", 
    date: "April 2026" 
  },
  { 
    name: "Tariq Mansoor", 
    text: "Fast delivery to my home! Ordered the Apple Watch Ultra online, and it arrived beautifully wrapped with the official warranty card.", 
    stars: "⭐⭐⭐⭐⭐", 
    date: "March 2026" 
  }
];

let currentSlide = 0;
let carouselTimer;

function startCarousel() {
    carouselTimer = setInterval(() => {
        currentSlide = (currentSlide + 1) % 3; 
        updateCarouselDOM();
    }, 5000); 
}

function updateCarouselDOM() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if(slides.length > 0 && dots.length > 0) {
        slides.forEach((s, idx) => s.classList.toggle('active', idx === currentSlide));
        dots.forEach((d, idx) => d.classList.toggle('active', idx === currentSlide));
    }
}

function renderReviews() {
    const wrapper = document.getElementById('reviewsWrapper');
    if (!wrapper) return; 
    wrapper.innerHTML = '';
    
    reviewsData.forEach(rev => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="stars">${rev.stars}</div>
            <p class="review-text">"${rev.text}"</p>
            <div class="reviewer-name">${rev.name}</div>
            <div class="review-date">${rev.date}</div>
        `;
        wrapper.appendChild(card);
    });
}


// Listen for clicks on the subscribe button inside the newsletter banner
document.addEventListener('DOMContentLoaded', () => {
    const subscribeSection = document.querySelector('.subscribe-banner');
    
    if (subscribeSection) {
        const emailInput = subscribeSection.querySelector('input[type="email"]');
        const subscribeBtn = subscribeSection.querySelector('button');

        if (subscribeBtn && emailInput) {
            subscribeBtn.addEventListener('click', () => {
                const emailValue = emailInput.value.trim();

                // Check if the user actually typed something in the field
                if (emailValue !== "") {
                    alert("Thank you for subscribing!");
                    emailInput.value = ""; // Clears the input field after clicking
                } else {
                    alert("Please enter a valid email address.");
                }
            });
        }
    }
});

// Function to toggle the mobile menu layout visibility drawer
function toggleMobileMenu() {
    const navMenu = document.getElementById('main-nav');
    const toggleBtn = document.querySelector('.hamburger-toggle');
    
    if (navMenu && toggleBtn) {
        navMenu.classList.toggle('show-menu');
        toggleBtn.classList.toggle('mobile-active');
    }
}

// Global safeguard window observer to clear drawer if user taps page content
window.addEventListener('click', (e) => {
    const navMenu = document.getElementById('main-nav');
    const toggleBtn = document.querySelector('.hamburger-toggle');
    
    if (navMenu && navMenu.classList.contains('show-menu')) {
        if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
            navMenu.classList.remove('show-menu');
            toggleBtn.classList.remove('mobile-active');
        }
    }
});

// Global Array targeting up to 3 comparison structural objects
let comparisonStack = [];

function toggleComparison(buttonElement) {
    // Traverse parent context node elements to secure item datasets
    const card = buttonElement.closest('.card');
    const watchId = card.querySelector('h3').innerText;
    const watchImg = card.querySelector('img').src;
    const watchPrice = card.querySelector('.price').innerText;
    const watchBrand = card.querySelector('.brand-tag').innerText;
    
    // Check if item already exists inside system array context
    const existingIndex = comparisonStack.findIndex(item => item.id === watchId);

    if (existingIndex > -1) {
        // Element exists -> target exclusion loop sequence
        comparisonStack.splice(existingIndex, 1);
        card.classList.remove('in-comparison');
        buttonElement.innerText = "Compare";
    } else {
        // Enforce hard constraint framework ceilings maxed at 3 nodes
        if (comparisonStack.length >= 3) {
            alert("You can compare a maximum of 3 watches simultaneously.");
            return;
        }
        
        // Push target structural details directly to stack arrays
        comparisonStack.push({
            id: watchId,
            img: watchImg,
            price: watchPrice,
            brand: watchBrand
        });
        card.classList.add('in-comparison');
        buttonElement.innerText = "Selected";
    }

    renderSidebarComparison();
}

function renderSidebarComparison() {
    const dynamicArea = document.getElementById('comparison-dynamic-area');
    
    if (comparisonStack.length === 0) {
        dynamicArea.innerHTML = `<p class="comparison-empty">Select up to 3 watches from your collection list to compare specifications directly.</p>`;
        return;
    }

    // Build stack lists tracking active tracking labels inside workspace
    let htmlContent = '';
    comparisonStack.forEach(item => {
        htmlContent += `
            <div class="comp-mini-item">
                <span>${item.id}</span>
                <button class="comp-mini-remove" onclick="removeSpecificWatch('${item.id}')">&times;</button>
            </div>
        `;
    });

    // Append full matrix modal layout launch trigger button mechanics
    htmlContent += `<button class="launch-comp-btn" onclick="openComparisonDrawer()">View Comparison Matrix (${comparisonStack.length})</button>`;
    
    dynamicArea.innerHTML = htmlContent;
}

function removeSpecificWatch(watchId) {
    // Alternate route target clearing mechanics processing internal data loops
    const cards = document.querySelectorAll('#brand-grid .card');
    cards.forEach(card => {
        if (card.querySelector('h3').innerText === watchId) {
            const btn = card.querySelector('.compare-btn');
            toggleComparison(btn);
        }
    });
}

/* --- DRAWER INTERFACE CONTROL MATRIX MANIPULATION --- */
function openComparisonDrawer() {
    // Generate functional target markup layout architecture injection anchors
    let modalOverlay = document.getElementById('comparison-drawer-overlay');
    
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'comparison-drawer-overlay';
        modalOverlay.className = 'comp-drawer-overlay';
        document.body.appendChild(modalOverlay);
    }

    // Generate table specs row structure tracking dynamic variables mapped down array chains
    const headers = comparisonStack.map(item => `<th>${item.id}</th>`).join('');
    const images = comparisonStack.map(item => `<td><img src="${item.img}" class="matrix-thumb"><strong>${item.brand}</strong></td>`).join('');
    const prices = comparisonStack.map(item => `<td>${item.price}</td>`).join('');

    modalOverlay.innerHTML = `
        <div class="comp-drawer-header">
            <h2>Specification Comparison</h2>
            <span class="close-comp-drawer" onclick="closeComparisonDrawer()">&times;</span>
        </div>
        <div class="comp-drawer-body">
            <table class="comp-matrix-table">
                <thead>
                    <tr>
                        <th class="row-label">Model Name</th>
                        ${headers}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="row-label">Visual Model</td>
                        ${images}
                    </tr>
                    <tr>
                        <td class="row-label">Pricing Matrix</td>
                        ${prices}
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // Force rendering framework repaint cycles to cleanly register transitions
    setTimeout(() => {
        modalOverlay.classList.add('open');
    }, 10);
}

function closeComparisonDrawer() {
    const modalOverlay = document.getElementById('comparison-drawer-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('open');
    }
}

// --- MOBILE FILTER TOGGLE ---
function toggleMobileFilters() {
    const sidebar = document.getElementById('filter-sidebar');
    const label = document.getElementById('filter-btn-label');
    const isOpen = sidebar.classList.toggle('mobile-open');
    label.textContent = isOpen ? 'Hide Filters' : 'Show Filters';
}

// --- SEARCH FUNCTIONALITY ---
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    function runSearch() {
        const query = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll('#product-grid .card');

        cards.forEach(card => {
            const name = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : '';
            const brand = card.querySelector('.brand-tag') ? card.querySelector('.brand-tag').innerText.toLowerCase() : '';

            if (query === '' || name.includes(query) || brand.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Search on button click
    if (searchBtn) {
        searchBtn.addEventListener('click', runSearch);
    }

    // Search live as user types
    if (searchInput) {
        searchInput.addEventListener('input', runSearch);

        // Search on Enter key press
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') runSearch();
        });
    }
});

// --- DARK MODE FUNCTIONS ---
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const enabled = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", enabled);
}

document.addEventListener("DOMContentLoaded", () => {
    if (darkModeEnabled) {
        document.body.classList.add("dark-mode");
    }
});

// --- WISHLIST FUNCTIONS ---
function addToWishlist(name) {
    if (!wishlistItems.includes(name)) {
        wishlistItems.push(name);
        localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
        alert(name + " added to wishlist ❤️");
    } else {
        alert("Already in wishlist ❤️");
    }
}

// --- COUPON FUNCTION ---
document.addEventListener('DOMContentLoaded', () => {
    const couponBtn = document.getElementById('apply-coupon');
    if (couponBtn) {
        couponBtn.addEventListener('click', () => {
            const code = document.getElementById('coupon-code').value.trim().toUpperCase();
            if (coupons[code]) {
                activeDiscount = coupons[code];
                alert('Coupon Applied: ' + activeDiscount + '% OFF 🎉');
                computeTotalCartSumAmount();
            } else {
                alert('Invalid Coupon Code ❌');
            }
        });
    }
});

// --- ORDER HISTORY FUNCTION ---
function viewOrderHistory() {
    if (orderHistory.length === 0) {
        alert("No previous orders found.");
        return;
    }
    let text = "🧾 YOUR ORDER HISTORY\n\n";
    orderHistory.forEach((order, index) => {
        text += `Order #${index + 1}\n`;
        text += `Date: ${order.date}\n`;
        text += `Customer: ${order.customer}\n`;
        text += `Items: ${order.items.length}\n`;
        order.items.forEach(item => {
            text += `  - ${item.name} (${item.price})\n`;
        });
        text += "\n";
    });
    alert(text);
}

// --- RECENTLY VIEWED FUNCTION ---
function viewRecentlyViewed() {
    if (viewedItems.length === 0) {
        alert("No recently viewed watches yet.");
        return;
    }
    let text = "👁 RECENTLY VIEWED\n\n";
    viewedItems.forEach((name, index) => {
        text += `${index + 1}. ${name}\n`;
    });
    alert(text);
}