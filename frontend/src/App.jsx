import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ScrollToTop from './components/ScrollToTop';

// Dedicated Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import QuizPage from './pages/QuizPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import { PRODUCTS } from './data/products';
import { getProducts, validateCoupon } from './services/api';

export default function App() {
  // Routing State
  // 'home' | 'shop' | 'product-detail' | 'news' | 'news-detail' | 'admin' | 'cart' | 'checkout' | 'order-success' | 'quiz' | 'account'
  const [currentRoute, setCurrentRoute] = useState('home');
  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [orderSuccessCode, setOrderSuccessCode] = useState('');

  // Products state (loaded from Java backend API or fallback)
  const [productList, setProductList] = useState(PRODUCTS);

  // Cart state from LocalStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('senxinh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state from LocalStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('senxinh_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Shop Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLight, setSelectedLight] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyWishlist, setOnlyWishlist] = useState(false);

  // Discount
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // User state (Loaded from LocalStorage with fallback demo user)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('senxinh_user');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Lỗi khi đọc tài khoản từ LocalStorage:', err);
    }
    return {
      name: 'Nguyễn Hoàng Long',
      email: 'long.senxinh@gmail.com',
      phone: '0988 123 456',
      address: '123 Phố Trúc Bạch, Quận Ba Đình, Hà Nội',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'Thành viên thân thiết'
    };
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  // URL Hash Routing Listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      if (hash.startsWith('#product/')) {
        const id = hash.replace('#product/', '');
        setCurrentRoute('product-detail');
        setCurrentProductId(id);
      } else if (hash.startsWith('#news/')) {
        const id = hash.replace('#news/', '');
        setCurrentRoute('news-detail');
        setCurrentArticleId(id);
      } else if (hash.startsWith('#order-success/')) {
        const code = hash.replace('#order-success/', '');
        setCurrentRoute('order-success');
        setOrderSuccessCode(code);
      } else if (hash === '#shop') {
        setCurrentRoute('shop');
      } else if (hash === '#news') {
        setCurrentRoute('news');
      } else if (hash === '#admin') {
        setCurrentRoute('admin');
      } else if (hash === '#cart') {
        setCurrentRoute('cart');
      } else if (hash === '#wishlist') {
        setCurrentRoute('wishlist');
      } else if (hash === '#checkout') {
        setCurrentRoute('checkout');
      } else if (hash === '#quiz') {
        setCurrentRoute('quiz');
      } else if (hash === '#account') {
        setCurrentRoute('account');
      } else if (hash === '#login') {
        setCurrentRoute('login');
      } else if (hash === '#register') {
        setCurrentRoute('register');
      } else if (hash === '#forgot-password' || hash === '#password') {
        setCurrentRoute('password');
      } else {
        setCurrentRoute('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation function
  const navigateTo = (route, param = null) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (route === 'home') {
      window.location.hash = '#home';
    } else if (route === 'shop') {
      setOnlyWishlist(false);
      window.location.hash = '#shop';
    } else if (route === 'product-detail' && param) {
      window.location.hash = `#product/${param}`;
    } else if (route === 'news') {
      window.location.hash = '#news';
    } else if (route === 'news-detail' && param) {
      window.location.hash = `#news/${param}`;
    } else if (route === 'admin') {
      window.location.hash = '#admin';
    } else if (route === 'cart') {
      window.location.hash = '#cart';
    } else if (route === 'wishlist') {
      window.location.hash = '#wishlist';
    } else if (route === 'checkout') {
      window.location.hash = '#checkout';
    } else if (route === 'order-success' && param) {
      window.location.hash = `#order-success/${param}`;
    } else if (route === 'quiz') {
      window.location.hash = '#quiz';
    } else if (route === 'account') {
      window.location.hash = '#account';
    } else if (route === 'login') {
      window.location.hash = '#login';
    } else if (route === 'register') {
      window.location.hash = '#register';
    } else if (route === 'password' || route === 'forgot-password') {
      window.location.hash = '#forgot-password';
    }
  };

  // Load products from Java Spring Boot Backend
  useEffect(() => {
    getProducts().then((data) => {
      if (data && data.length > 0) {
        setProductList(data);
      }
    });
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('senxinh_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error(err);
    }
  }, [cartItems]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('senxinh_wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.error(err);
    }
  }, [wishlist]);

  // Toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Cart operations
  const handleAddToCart = (product, qty = 1, showToast = true) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    if (showToast) {
      addToast(`Đã thêm ${product.name} vào giỏ hàng!`, 'cart');
    }
  };

  const handleLoginSuccess = (userData, remember = true) => {
    setUser(userData);
    if (remember) {
      try {
        localStorage.setItem('senxinh_user', JSON.stringify(userData));
      } catch (err) {
        console.error(err);
      }
    }
    navigateTo('account');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('senxinh_user', JSON.stringify(userData));
    } catch (err) {
      console.error(err);
    }
    navigateTo('account');
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('senxinh_user');
    } catch (err) {
      console.error(err);
    }
    addToast('Đã đăng xuất tài khoản thành công. Hẹn gặp lại bạn!', 'info');
    navigateTo('login');
  };

  const handleBuyNow = (product, qty = 1) => {
    handleAddToCart(product, qty, false);
    navigateTo('checkout');
  };

  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    addToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const handleToggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Đã xóa khỏi danh sách yêu thích', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast('Đã lưu vào danh sách yêu thích!', 'wishlist');
        return [...prev, productId];
      }
    });
  };

  // Validate coupon through Java Spring Boot API
  const handleApplyCoupon = async (code) => {
    try {
      const result = await validateCoupon(code);
      if (result.valid) {
        setDiscountCode(result.code);
        setDiscountPercent(result.discountPercent);
        addToast(`Áp dụng mã giảm ${result.discountPercent}% thành công!`, 'cart');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Filter & Sort Logic for Shop Page
  const filteredProducts = useMemo(() => {
    return productList.filter((item) => {
      // Wishlist filter
      if (onlyWishlist && !wishlist.includes(item.id)) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSci = (item.scientificName || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSci && !matchesDesc) return false;
      }

      // Light filter
      if (selectedLight !== 'all' && item.lightType !== selectedLight) return false;

      // Difficulty filter
      if (selectedDifficulty === 'easy' && item.difficultyLevel !== 1) return false;
      if (selectedDifficulty === 'medium' && item.difficultyLevel < 2) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }, [productList, selectedCategory, searchQuery, selectedLight, selectedDifficulty, sortBy, onlyWishlist, wishlist]);

  const cartTotalCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  // Current active product for detail view
  const activeProduct = useMemo(() => {
    if (!currentProductId) return productList[0];
    return productList.find((p) => p.id === currentProductId) || productList[0];
  }, [currentProductId, productList]);

  return (
    <div className="app">
      {/* Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        cartCount={cartTotalCount}
        wishlistCount={wishlist.length}
        user={user}
        onLogout={handleLogout}
        onOpenWishlist={() => {
          navigateTo('wishlist');
        }}
        onNavigate={navigateTo}
      />

      {/* Main Dedicated Views */}
      <main className="main-content">
        {currentRoute === 'home' && (
          <HomePage
            products={productList}
            onOpenProductDetail={(id) => navigateTo('product-detail', id)}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onNavigateShop={() => navigateTo('shop')}
            onNavigateNews={() => navigateTo('news')}
            onSelectArticle={(id) => navigateTo('news-detail', id)}
            onOpenQuiz={() => navigateTo('quiz')}
          />
        )}

        {currentRoute === 'shop' && (
          <ShopPage
            products={filteredProducts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLight={selectedLight}
            onSelectLight={setSelectedLight}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onOpenProductDetail={(id) => navigateTo('product-detail', id)}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onlyWishlist={onlyWishlist}
            onSetOnlyWishlist={setOnlyWishlist}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentRoute === 'product-detail' && (
          <ProductDetailPage
            product={activeProduct}
            allProducts={productList}
            onNavigateBack={() => window.history.back()}
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={() => navigateTo('shop')}
            onSelectProduct={(id) => navigateTo('product-detail', id)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isWishlisted={wishlist.includes(activeProduct?.id)}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        )}

        {currentRoute === 'news' && (
          <NewsPage
            onSelectArticle={(id) => navigateTo('news-detail', id)}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentRoute === 'news-detail' && (
          <NewsDetailPage
            articleId={currentArticleId}
            onNavigateBack={() => navigateTo('news')}
            onNavigateHome={() => navigateTo('home')}
            onNavigateNews={() => navigateTo('news')}
            onNavigateShop={() => navigateTo('shop')}
            onSelectArticle={(id) => navigateTo('news-detail', id)}
          />
        )}

        {/* Dedicated Checkout Page */}
        {currentRoute === 'checkout' && (
          <CheckoutPage
            user={user}
            cartItems={cartItems}
            discountCode={discountCode}
            discountPercent={discountPercent}
            onOrderSuccess={(order) => {
              setCartItems([]);
              if (order?.orderCode) {
                navigateTo('order-success', order.orderCode);
              }
            }}
            onClearCart={() => setCartItems([])}
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={() => navigateTo('shop')}
            onNavigateCart={() => navigateTo('cart')}
            onNavigateAdmin={() => navigateTo('admin')}
          />
        )}

        {/* Dedicated Order Success & VietQR View */}
        {currentRoute === 'order-success' && (
          <CheckoutPage
            user={user}
            cartItems={[]}
            initialOrderCode={orderSuccessCode}
            onClearCart={() => setCartItems([])}
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={() => navigateTo('shop')}
            onNavigateCart={() => navigateTo('cart')}
            onNavigateAdmin={() => navigateTo('admin')}
          />
        )}

        {/* Dedicated Quiz Page */}
        {currentRoute === 'quiz' && (
          <QuizPage
            onSelectProduct={(prod) => navigateTo('product-detail', prod.id)}
            onAddToCart={handleAddToCart}
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={() => navigateTo('shop')}
          />
        )}

        {/* Dedicated Login Page */}
        {currentRoute === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
            addToast={addToast}
          />
        )}

        {/* Dedicated Register Page */}
        {currentRoute === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onNavigate={navigateTo}
            addToast={addToast}
          />
        )}

        {/* Dedicated Forgot / Reset Password Page */}
        {currentRoute === 'password' && (
          <ForgotPasswordPage
            onNavigate={navigateTo}
            addToast={addToast}
          />
        )}

        {/* Dedicated Admin Console Page */}
        {currentRoute === 'admin' && (
          <AdminPage
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={() => navigateTo('shop')}
            onProductsChange={(updated) => setProductList(updated)}
            addToast={addToast}
          />
        )}

        {/* Dedicated Account Dashboard: Profile, Orders, Wishlist, Cart (Always Preserves Sidebar) */}
        {currentRoute === 'account' && !user ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
            addToast={addToast}
          />
        ) : ['account', 'cart', 'wishlist'].includes(currentRoute) && (
          <AccountPage
            initialTab={
              currentRoute === 'cart'
                ? 'cart'
                : currentRoute === 'wishlist'
                ? 'wishlist'
                : 'profile'
            }
            user={user}
            wishlistCount={wishlist.length}
            cartCount={cartTotalCount}
            cartItems={cartItems}
            products={productList}
            wishlist={wishlist}
            discountCode={discountCode}
            discountPercent={discountPercent}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onApplyCoupon={handleApplyCoupon}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onOpenProductDetail={(id) => navigateTo('product-detail', id)}
            onNavigateCheckout={() => navigateTo('checkout')}
            onNavigateShop={() => navigateTo('shop')}
            onNavigateCart={() => navigateTo('cart')}
            onNavigateAdmin={() => navigateTo('admin')}
            onNavigateHome={() => navigateTo('home')}
            onLogout={handleLogout}
            onUpdateUser={(updated) => {
              setUser((prev) => ({ ...prev, ...updated }));
              addToast('Đã cập nhật thông tin tài khoản thành công!', 'info');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <Toast toasts={toasts} />

      {/* Floating Scroll To Top Button */}
      <ScrollToTop />
    </div>
  );
}
