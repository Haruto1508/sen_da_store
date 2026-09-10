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
import AccountPage from './pages/AccountPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import { PRODUCTS } from './data/products';
import { getProducts, validateCoupon, USE_MOCK_DATA } from './services/api';

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

  // Products state (loaded from Java backend API or fallback mockData.json)
  const [productList, setProductList] = useState(USE_MOCK_DATA ? PRODUCTS : []);
  const [loadingProducts, setLoadingProducts] = useState(!USE_MOCK_DATA);

  // Khóa lưu trữ giỏ hàng tách biệt rõ ràng giữa chế độ Mock Data và Live Database
  const cartStorageKey = USE_MOCK_DATA ? 'senxinh_cart_mock' : 'senxinh_cart_live';

  // Cart state from LocalStorage (không tải dữ liệu mock cũ khi đã tắt mock data)
  const [cartItems, setCartItems] = useState(() => {
    try {
      if (!USE_MOCK_DATA) {
        // Tắt mock data: Dọn dẹp key mock cũ và chỉ lấy giỏ hàng của Live Backend
        localStorage.removeItem('senxinh_cart');
        const liveSaved = localStorage.getItem(cartStorageKey);
        return liveSaved ? JSON.parse(liveSaved) : [];
      }
      const saved = localStorage.getItem(cartStorageKey) || localStorage.getItem('senxinh_cart');
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

  // User state (Loaded from LocalStorage; defaults to null for unauthenticated guests)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('senxinh_user');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Lỗi khi đọc tài khoản từ LocalStorage:', err);
    }
    return null;
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
        navigate('/shop');
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
    setLoadingProducts(true);
    getProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProductList(data);
        } else if (USE_MOCK_DATA) {
          setProductList(PRODUCTS);
        } else {
          setProductList(data || []);
        }
      })
      .catch((err) => {
        console.warn('Lỗi khi tải sản phẩm từ API:', err);
        if (USE_MOCK_DATA) {
          setProductList(PRODUCTS);
        } else {
          // Khi tắt mock data (USE_MOCK_DATA=false), không được fallback sang dữ liệu mock
          setProductList([]);
        }
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
      if (!USE_MOCK_DATA) {
        localStorage.removeItem('senxinh_cart');
      }
    } catch (err) {
      console.error(err);
    }
  }, [cartItems, cartStorageKey]);

  // Đồng bộ động giỏ hàng với dữ liệu sản phẩm mới nhất từ Database API
  useEffect(() => {
    if (!productList) return;

    setCartItems((prevItems) => {
      if (!prevItems || prevItems.length === 0) return prevItems;

      // Khi tắt mock data (!USE_MOCK_DATA): loại bỏ bất kỳ sản phẩm nào không tồn tại trong Database thực tế
      let filtered = prevItems;
      if (!USE_MOCK_DATA) {
        filtered = prevItems.filter((item) =>
          productList.some((p) => p.id === item.id || (p.publicId && p.publicId === item.id))
        );
      }

      let hasChanges = filtered.length !== prevItems.length;
      let adjustedCount = 0;

      const updatedItems = filtered.map((item) => {
        // Tìm sản phẩm tương ứng từ Database API
        const liveProduct = productList.find(
          (p) => p.id === item.id || (p.publicId && p.publicId === item.id)
        );

        if (!liveProduct) {
          return item;
        }

        const currentStock = liveProduct.inStock !== undefined ? liveProduct.inStock : 999;
        const stockExceeded = currentStock > 0 && item.quantity > currentStock;
        const newQty = stockExceeded ? currentStock : item.quantity;
        if (stockExceeded) adjustedCount++;

        const isModified =
          liveProduct.price !== item.price ||
          liveProduct.originalPrice !== item.originalPrice ||
          liveProduct.name !== item.name ||
          liveProduct.image !== item.image ||
          liveProduct.inStock !== item.inStock ||
          item.quantity !== newQty;

        if (isModified) {
          hasChanges = true;
          return {
            ...item,
            name: liveProduct.name || item.name,
            scientificName: liveProduct.scientificName || item.scientificName,
            price: liveProduct.price !== undefined ? liveProduct.price : item.price,
            originalPrice: liveProduct.originalPrice !== undefined ? liveProduct.originalPrice : item.originalPrice,
            image: liveProduct.image || item.image,
            inStock: liveProduct.inStock !== undefined ? liveProduct.inStock : item.inStock,
            category: liveProduct.category || item.category,
            quantity: newQty
          };
        }

        return item;
      });

      if (adjustedCount > 0) {
        addToast(`Số lượng một số sản phẩm trong giỏ đã được tự động điều chỉnh theo tồn kho thực tế.`, 'info');
      }

      return hasChanges ? updatedItems : prevItems;
    });
  }, [productList]);

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

  // Cart operations (Đồng bộ tồn kho động từ Database)
  const handleAddToCart = (product, qty = 1, showToast = true) => {
    const liveProduct =
      productList.find((p) => p.id === product.id || (p.publicId && p.publicId === product.id)) || product;
    const availableStock = liveProduct.inStock !== undefined ? liveProduct.inStock : 999;

    if (availableStock <= 0) {
      addToast(`Cây "${liveProduct.name}" hiện đang tạm hết hàng trong kho.`, 'error');
      return;
    }

    let reachedMax = false;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === liveProduct.id);
      if (existing) {
        const targetQty = existing.quantity + qty;
        if (targetQty > availableStock) {
          reachedMax = true;
          return prev.map((item) =>
            item.id === liveProduct.id
              ? {
                  ...item,
                  ...liveProduct,
                  quantity: availableStock,
                  inStock: availableStock
                }
              : item
          );
        }
        return prev.map((item) =>
          item.id === liveProduct.id
            ? {
                ...item,
                ...liveProduct,
                quantity: targetQty,
                inStock: availableStock
              }
            : item
        );
      }

      const initialQty = Math.min(qty, availableStock);
      return [
        ...prev,
        {
          ...liveProduct,
          quantity: initialQty,
          inStock: availableStock
        }
      ];
    });

    if (showToast) {
      if (reachedMax) {
        addToast(`Đã điều chỉnh về tối đa ${availableStock} cây có sẵn trong kho!`, 'info');
      } else {
        addToast(`Đã thêm ${liveProduct.name} vào giỏ hàng!`, 'cart');
      }
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

    const liveProduct = productList.find(
      (p) => p.id === productId || (p.publicId && p.publicId === productId)
    );
    const availableStock = liveProduct?.inStock !== undefined ? liveProduct.inStock : 999;

    if (newQty > availableStock) {
      addToast(`Kho chỉ còn tối đa ${availableStock} cây cho sản phẩm này!`, 'info');
      setCartItems((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity: availableStock, inStock: availableStock } : item))
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty, inStock: availableStock } : item))
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

  // Validate coupon (kết nối API Backend)
  const handleApplyCoupon = async (code) => {
    try {
      const result = await validateCoupon(code);
      if (result.valid) {
        setDiscountCode(result.code);
        setDiscountPercent(result.discountPercent);
        addToast(`Áp dụng mã ${result.code} (-${result.discountPercent}%) thành công!`, 'cart');
        return { success: true, message: `Áp dụng mã ${result.code} thành công!` };
      }
      return { success: false, message: result.message || 'Mã ưu đãi không hợp lệ hoặc đã hết hạn' };
    } catch (err) {
      return { success: false, message: err.message || 'Lỗi khi kiểm tra mã ưu đãi' };
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountCode('');
    setDiscountPercent(0);
    addToast('Đã gỡ mã ưu đãi', 'info');
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

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`app ${isAdminRoute ? 'admin-layout' : ''}`}>
      {/* Chỉ hiển thị Header Navbar khi là trang người dùng, ẩn hoàn toàn trên trang Admin */}
      {!isAdminRoute && (
        <Navbar
          currentRoute={currentRoute}
          cartCount={cartTotalCount}
          wishlistCount={wishlist.length}
          user={user}
          onLogout={handleLogout}
          onOpenWishlist={() => navigateTo('wishlist')}
          onNavigate={navigateTo}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          products={productList}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedLight={selectedLight}
          onSelectLight={setSelectedLight}
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={setSelectedDifficulty}
          onResetFilters={() => {
            setSelectedCategory('all');
            setSelectedLight('all');
            setSelectedDifficulty('all');
            setSearchQuery('');
          }}
        />
      )}

      {/* Main Routed Content */}
      <main className={isAdminRoute ? 'admin-main-wrapper' : 'main-content'}>
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
                onApplyFilters={(filterObj) => {
                  if (filterObj.category !== undefined) setSelectedCategory(filterObj.category);
                  if (filterObj.searchQuery !== undefined) setSearchQuery(filterObj.searchQuery);
                  if (filterObj.light !== undefined) setSelectedLight(filterObj.light);
                  if (filterObj.difficulty !== undefined) setSelectedDifficulty(filterObj.difficulty);
                  navigateTo('shop');
                }}
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
                allProductsCount={productList.length}
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

          {/* Quiz Route -> Redirects to Shop */}
          <Route path="/quiz" element={<Navigate to="/shop" replace />} />

          {/* Dedicated Admin Console Route */}
          <Route
            path="/admin"
            element={
              <AdminPage
                user={user}
                onLoginAsAdmin={handleLoginSuccess}
                onLogout={handleLogout}
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

          {/* Dedicated Cart Route (Opens CartPage directly) */}
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cartItems}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                discountCode={discountCode}
                discountPercent={discountPercent}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                onClearCart={() => {
                  setCartItems([]);
                  addToast('Đã xóa sạch giỏ hàng!', 'info');
                }}
                onNavigateShop={() => navigateTo('shop')}
                onNavigateCheckout={() => navigateTo('checkout')}
                onNavigateHome={() => navigateTo('home')}
                onOpenProductDetail={(id) => navigateTo('product-detail', id)}
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

      {/* Chỉ hiển thị Footer khách hàng khi KHÔNG PHẢI trang admin */}
      {!isAdminRoute && <Footer />}

      {/* Toast Notifications */}
      <Toast toasts={toasts} />

      {/* Floating Scroll To Top Button (chỉ ở trang khách hàng) */}
      {!isAdminRoute && <ScrollToTop />}
    </div>
  );
}
