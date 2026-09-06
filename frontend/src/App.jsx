import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
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
import CheckoutPage from './pages/CheckoutPage';
import QuizPage from './pages/QuizPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import { PRODUCTS } from './data/products';
import { getProducts, validateCoupon } from './services/api';

// Route Helper Wrappers to extract URL parameters via useParams()
function ProductDetailRoute({ productList, onAddToCart, onBuyNow, wishlist, onToggleWishlist, navigateTo }) {
  const { id } = useParams();
  const product = productList.find((p) => p.id === id || p.publicId === id) || productList[0];

  return (
    <ProductDetailPage
      product={product}
      allProducts={productList}
      onNavigateBack={() => window.history.back()}
      onNavigateHome={() => navigateTo('home')}
      onNavigateShop={() => navigateTo('shop')}
      onSelectProduct={(productId) => navigateTo('product-detail', productId)}
      onAddToCart={onAddToCart}
      onBuyNow={onBuyNow}
      isWishlisted={wishlist.includes(product?.id)}
      onToggleWishlist={onToggleWishlist}
      wishlist={wishlist}
    />
  );
}

function NewsDetailRoute({ navigateTo }) {
  const { id } = useParams();

  return (
    <NewsDetailPage
      articleId={id}
      onNavigateBack={() => navigateTo('news')}
      onNavigateHome={() => navigateTo('home')}
      onNavigateNews={() => navigateTo('news')}
      onNavigateShop={() => navigateTo('shop')}
      onSelectArticle={(articleId) => navigateTo('news-detail', articleId)}
    />
  );
}

function OrderSuccessRoute({ user, onClearCart, navigateTo }) {
  const { orderCode } = useParams();

  return (
    <CheckoutPage
      user={user}
      cartItems={[]}
      initialOrderCode={orderCode || ''}
      onClearCart={onClearCart}
      onNavigateHome={() => navigateTo('home')}
      onNavigateShop={() => navigateTo('shop')}
      onNavigateCart={() => navigateTo('cart')}
      onNavigateAdmin={() => navigateTo('admin')}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Products state (loaded from Java backend API or mockData.json)
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

  // Auto scroll to top on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Derived currentRoute for Navbar active states
  const currentRoute = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/shop') return 'shop';
    if (path.startsWith('/product/')) return 'product-detail';
    if (path === '/news') return 'news';
    if (path.startsWith('/news/')) return 'news-detail';
    if (path === '/admin') return 'admin';
    if (path === '/cart') return 'cart';
    if (path === '/wishlist') return 'wishlist';
    if (path === '/checkout') return 'checkout';
    if (path.startsWith('/order-success')) return 'order-success';
    if (path === '/quiz') return 'quiz';
    if (path === '/account') return 'account';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    if (path === '/forgot-password' || path === '/password') return 'password';
    return 'home';
  }, [location.pathname]);

  // Centralized Navigation function using react-router-dom
  const navigateTo = (route, param = null) => {
    switch (route) {
      case 'home':
        navigate('/');
        break;
      case 'shop':
        setOnlyWishlist(false);
        navigate('/shop');
        break;
      case 'product-detail':
        navigate(`/product/${param}`);
        break;
      case 'news':
        navigate('/news');
        break;
      case 'news-detail':
        navigate(`/news/${param}`);
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'cart':
        navigate('/cart');
        break;
      case 'wishlist':
        navigate('/wishlist');
        break;
      case 'checkout':
        navigate('/checkout');
        break;
      case 'order-success':
        navigate(param ? `/order-success/${param}` : '/order-success');
        break;
      case 'quiz':
        navigate('/quiz');
        break;
      case 'account':
        navigate('/account');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'password':
      case 'forgot-password':
        navigate('/forgot-password');
        break;
      default:
        navigate('/');
        break;
    }
  };

  // Load products from API / Mock
  useEffect(() => {
    getProducts()
      .then((data) => {
        if (data && data.length > 0) {
          setProductList(data);
        }
      })
      .catch((err) => console.error('Error loading products:', err));
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

  // Validate coupon
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
    return productList
      .filter((item) => {
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
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured default
      });
  }, [productList, selectedCategory, searchQuery, selectedLight, selectedDifficulty, sortBy, onlyWishlist, wishlist]);

  const cartTotalCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="app">
      {/* Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        cartCount={cartTotalCount}
        wishlistCount={wishlist.length}
        user={user}
        onLogout={handleLogout}
        onOpenWishlist={() => navigateTo('wishlist')}
        onNavigate={navigateTo}
      />

      {/* Main Routed Content */}
      <main className="main-content">
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
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
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Shop Route */}
          <Route
            path="/shop"
            element={
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
            }
          />

          {/* Product Detail Route */}
          <Route
            path="/product/:id"
            element={
              <ProductDetailRoute
                productList={productList}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                navigateTo={navigateTo}
              />
            }
          />

          {/* News & Guides Route */}
          <Route
            path="/news"
            element={
              <NewsPage
                onSelectArticle={(id) => navigateTo('news-detail', id)}
                onNavigateHome={() => navigateTo('home')}
              />
            }
          />

          {/* News Detail Route */}
          <Route
            path="/news/:id"
            element={<NewsDetailRoute navigateTo={navigateTo} />}
          />

          {/* Dedicated Checkout Route */}
          <Route
            path="/checkout"
            element={
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
            }
          />

          {/* Dedicated Order Success & VietQR View */}
          <Route
            path="/order-success/:orderCode"
            element={
              <OrderSuccessRoute
                user={user}
                onClearCart={() => setCartItems([])}
                navigateTo={navigateTo}
              />
            }
          />
          <Route
            path="/order-success"
            element={
              <OrderSuccessRoute
                user={user}
                onClearCart={() => setCartItems([])}
                navigateTo={navigateTo}
              />
            }
          />

          {/* Dedicated Quiz Page */}
          <Route
            path="/quiz"
            element={
              <QuizPage
                onSelectProduct={(prod) => navigateTo('product-detail', prod.id)}
                onAddToCart={handleAddToCart}
                onNavigateHome={() => navigateTo('home')}
                onNavigateShop={() => navigateTo('shop')}
              />
            }
          />

          {/* Dedicated Admin Console Route */}
          <Route
            path="/admin"
            element={
              <AdminPage
                onNavigateHome={() => navigateTo('home')}
                onNavigateShop={() => navigateTo('shop')}
                onProductsChange={(updated) => setProductList(updated)}
                addToast={addToast}
              />
            }
          />

          {/* Dedicated Login Route */}
          <Route
            path="/login"
            element={
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onNavigate={navigateTo}
                addToast={addToast}
              />
            }
          />

          {/* Dedicated Register Route */}
          <Route
            path="/register"
            element={
              <RegisterPage
                onRegisterSuccess={handleRegisterSuccess}
                onNavigate={navigateTo}
                addToast={addToast}
              />
            }
          />

          {/* Dedicated Forgot / Reset Password Route */}
          <Route
            path="/forgot-password"
            element={
              <ForgotPasswordPage
                onNavigate={navigateTo}
                addToast={addToast}
              />
            }
          />
          <Route path="/password" element={<Navigate to="/forgot-password" replace />} />

          {/* Dedicated Cart Route (Opens AccountPage with Cart Tab) */}
          <Route
            path="/cart"
            element={
              <AccountPage
                initialTab="cart"
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
            }
          />

          {/* Dedicated Wishlist Route (Opens AccountPage with Wishlist Tab) */}
          <Route
            path="/wishlist"
            element={
              <AccountPage
                initialTab="wishlist"
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
            }
          />

          {/* Dedicated Account Route (Opens AccountPage with Profile Tab) */}
          <Route
            path="/account"
            element={
              !user ? (
                <LoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onNavigate={navigateTo}
                  addToast={addToast}
                />
              ) : (
                <AccountPage
                  initialTab="profile"
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
              )
            }
          />

          {/* Catch-all Wildcard Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
