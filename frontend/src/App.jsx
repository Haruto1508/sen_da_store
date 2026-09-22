import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import SeoMeta from './components/SeoMeta';

// Dedicated Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PolicyPage from './pages/PolicyPage';

import { PRODUCTS } from './data/products';
import { NEWS_ARTICLES } from './data/news';
import { getProducts, validateCoupon, USE_MOCK_DATA, isMockUser, updateUserProfile } from './services/api';

// Route Helper Wrappers to extract URL parameters via useParams()
function ProductDetailRoute({ productList, onAddToCart, onBuyNow, wishlist, onToggleWishlist, navigateTo }) {
  const { id } = useParams();
  const product =
    productList.find(
      (p) => String(p.id) === String(id) || (p.publicId && String(p.publicId) === String(id))
    ) || productList[0];

  const isWishlisted = product
    ? wishlist.some(
        (wId) =>
          String(wId) === String(product.id) ||
          (product.publicId && String(wId) === String(product.publicId))
      )
    : false;

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
      isWishlisted={isWishlisted}
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

// Chuẩn hóa đối tượng user để đảm bảo các thuộc tính name, email... luôn ở tầng root
function normalizeUserData(raw) {
  if (!raw) return null;
  if (raw.user && typeof raw.user === 'object' && !raw.name) {
    return { ...raw.user, token: raw.token || raw.user.token };
  }
  return raw;
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

  // Khóa lưu trữ tài khoản tách biệt rõ ràng giữa chế độ Mock Data và Live Database
  const userStorageKey = USE_MOCK_DATA ? 'senxinh_user_mock' : 'senxinh_user_live';

  // User state (Loaded from LocalStorage; defaults to null for unauthenticated guests)
  const [user, setUser] = useState(() => {
    try {
      // 1. Kiểm tra session riêng biệt của chế độ hiện tại
      const savedInCurrentMode = localStorage.getItem(userStorageKey);
      if (savedInCurrentMode) {
        let parsed = JSON.parse(savedInCurrentMode);
        parsed = normalizeUserData(parsed);
        if (USE_MOCK_DATA) {
          if (isMockUser(parsed)) {
            parsed.isMockUser = true;
            return parsed;
          }
          localStorage.removeItem(userStorageKey);
          return null;
        } else {
          // Chế độ Live: không chấp nhận mock user
          if (isMockUser(parsed)) {
            localStorage.removeItem(userStorageKey);
            return null;
          }
          // Đảm bảo lưu lại dạng phẳng chuẩn
          try {
            localStorage.setItem(userStorageKey, JSON.stringify(parsed));
          } catch (e) {}
          return parsed;
        }
      }

      // 2. Xử lý khóa cũ (senxinh_user legacy) nếu người dùng vừa chuyển chế độ
      const legacySaved = localStorage.getItem('senxinh_user');
      if (legacySaved) {
        let parsedLegacy = JSON.parse(legacySaved);
        parsedLegacy = normalizeUserData(parsedLegacy);
        if (USE_MOCK_DATA) {
          // Đang ở Mock Data: Nếu user cũ từ Live Backend -> KHÔNG giữ đăng nhập, dọn dẹp key cũ
          if (!isMockUser(parsedLegacy)) {
            localStorage.removeItem('senxinh_user');
            return null;
          }
          parsedLegacy.isMockUser = true;
          localStorage.setItem(userStorageKey, JSON.stringify(parsedLegacy));
          localStorage.removeItem('senxinh_user');
          return parsedLegacy;
        } else {
          // Đang ở Live Database: Nếu user cũ là Mock -> dọn dẹp key cũ, không đăng nhập
          if (isMockUser(parsedLegacy)) {
            localStorage.removeItem('senxinh_user');
            return null;
          }
          localStorage.setItem(userStorageKey, JSON.stringify(parsedLegacy));
          localStorage.removeItem('senxinh_user');
          return parsedLegacy;
        }
      }
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
    if (path === '/policy') return 'policy';
    if (path === '/admin/login') return 'admin-login';
    if (path === '/admin') return 'admin';
    if (path === '/cart') return 'cart';
    if (path === '/wishlist' || path === '/account/wishlist') return 'wishlist';
    if (path === '/checkout') return 'checkout';
    if (path.startsWith('/order-success')) return 'order-success';
    if (path === '/quiz') return 'quiz';
    if (path.startsWith('/account') || path === '/orders' || path === '/history') return 'account';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    if (path === '/forgot-password' || path === '/password') return 'password';
    return 'home';
  }, [location.pathname]);

  // Centralized Navigation function using react-router-dom
  const navigateTo = (route, param = null, options = {}) => {
    let navOptions = options;
    let routeParam = param;
    if (param && typeof param === 'object' && !Array.isArray(param)) {
      navOptions = param;
      routeParam = null;
    }

    switch (route) {
      case 'home':
        navigate('/', { replace: true, ...navOptions });
        break;
      case 'shop':
        setOnlyWishlist(false);
        navigate('/shop', navOptions);
        break;
      case 'product-detail':
        navigate(`/product/${routeParam}`, navOptions);
        break;
      case 'news':
        navigate('/news', navOptions);
        break;
      case 'news-detail':
        navigate(`/news/${routeParam}`, navOptions);
        break;
      case 'policy':
        navigate('/policy', navOptions);
        break;
      case 'admin':
        navigate('/admin', navOptions);
        break;
      case 'admin-login':
        navigate('/admin/login', navOptions);
        break;
      case 'cart':
        navigate('/cart', navOptions);
        break;
      case 'wishlist':
        navigate('/wishlist', navOptions);
        break;
      case 'checkout':
        navigate('/checkout', navOptions);
        break;
      case 'order-success':
        navigate(routeParam ? `/order-success/${routeParam}` : '/order-success', navOptions);
        break;
      case 'quiz':
        navigate('/shop', navOptions);
        break;
      case 'account':
        navigate('/account', navOptions);
        break;
      case 'orders':
        navigate('/account/orders', navOptions);
        break;
      case 'history':
        navigate('/account/history', navOptions);
        break;
      case 'login':
        navigate('/login', navOptions);
        break;
      case 'register':
        navigate('/register', navOptions);
        break;
      case 'password':
      case 'forgot-password':
        navigate('/login', navOptions);
        break;
      default:
        navigate('/', navOptions);
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

      let hasChanges = false;
      let adjustedCount = 0;

      const updatedItems = prevItems.map((item) => {
        // Tìm sản phẩm tương ứng từ Database API
        const liveProduct = productList.find(
          (p) => p.id === item.id || (p.publicId && p.publicId === item.id)
        );

        if (!liveProduct || liveProduct.status === 'DELETED' || liveProduct.status === 'INACTIVE') {
          if (item.available !== false || item.status !== 'DELETED') {
            hasChanges = true;
          }
          return {
            ...item,
            available: false,
            status: 'DELETED',
            message: 'Sản phẩm không còn được bán hoặc đã ngừng kinh doanh'
          };
        }

        const currentStock = liveProduct.inStock !== undefined ? liveProduct.inStock : 999;
        const stockExceeded = currentStock > 0 && item.quantity > currentStock;
        const newQty = stockExceeded ? currentStock : item.quantity;
        if (stockExceeded) adjustedCount++;

        const isModified =
          item.available === false ||
          item.status === 'DELETED' ||
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
            available: true,
            status: 'ACTIVE',
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
    if (!product) return false;

    const prodId = product.id || product.publicId;
    const liveProduct =
      productList.find(
        (p) =>
          (p.id !== undefined && String(p.id) === String(prodId)) ||
          (p.publicId && String(p.publicId) === String(prodId))
      ) || product;

    const stockVal = liveProduct.inStock;
    const availableStock =
      stockVal !== null && stockVal !== undefined && !isNaN(stockVal)
        ? Math.max(0, Number(stockVal))
        : 999;

    if (availableStock <= 0) {
      addToast(`Cây "${liveProduct.name}" hiện đang tạm hết hàng trong kho.`, 'error');
      return false;
    }

    const requestQty = Math.max(1, Number(qty) || 1);
    let reachedMax = false;

    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          String(item.id) === String(liveProduct.id) ||
          (liveProduct.publicId && String(item.publicId) === String(liveProduct.publicId))
      );

      if (existing) {
        const targetQty = existing.quantity + requestQty;
        if (targetQty > availableStock) {
          reachedMax = true;
          return prev.map((item) =>
            item.id === existing.id
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
          item.id === existing.id
            ? {
                ...item,
                ...liveProduct,
                quantity: targetQty,
                inStock: availableStock
              }
            : item
        );
      }

      const initialQty = Math.min(requestQty, availableStock);
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

    return true;
  };

  const handleLoginSuccess = (userData, remember = true) => {
    const cleanUser = normalizeUserData(userData);
    const userToSave = USE_MOCK_DATA ? { ...cleanUser, isMockUser: true } : cleanUser;
    setUser(userToSave);
    if (remember) {
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(userToSave));
        localStorage.removeItem('senxinh_user');
      } catch (err) {
        console.error(err);
      }
    }

    const isAdmin = Boolean(
      userToSave &&
      (userToSave.role?.toLowerCase().includes('admin') || userToSave.email === 'admin@senxinh.vn')
    );
    if (isAdmin) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleAdminLoginSuccess = (userData) => {
    const cleanUser = normalizeUserData(userData);
    const userToSave = USE_MOCK_DATA ? { ...cleanUser, isMockUser: true } : cleanUser;
    setUser(userToSave);
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(userToSave));
      localStorage.removeItem('senxinh_user');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterSuccess = (userData) => {
    const cleanUser = normalizeUserData(userData);
    const userToSave = USE_MOCK_DATA ? { ...cleanUser, isMockUser: true } : cleanUser;
    setUser(userToSave);
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(userToSave));
      localStorage.removeItem('senxinh_user');
    } catch (err) {
      console.error(err);
    }
    navigate('/', { replace: true });
  };

  const handleUpdateUser = async (updated) => {
    try {
      await updateUserProfile(updated);
    } catch (err) {
      console.warn('Lỗi khi lưu thông tin tài khoản lên máy chủ:', err);
    }
    setUser((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    addToast('Đã cập nhật thông tin tài khoản thành công!', 'info');
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem(userStorageKey);
      localStorage.removeItem('senxinh_user');
      localStorage.removeItem('senxinh_auth_token');
    } catch (err) {
      console.error(err);
    }
    addToast('Đã đăng xuất tài khoản thành công. Hẹn gặp lại bạn!', 'info');
    navigate('/login', { replace: true });
  };

  const handleBuyNow = (product, qty = 1) => {
    const liveProduct = productList.find(
      (p) => String(p.id) === String(product.id) || (p.publicId && String(p.publicId) === String(product.publicId))
    ) || product;

    const availableStock = liveProduct.inStock !== undefined && liveProduct.inStock !== null ? Number(liveProduct.inStock) : 999;
    if (availableStock <= 0) {
      addToast('Sản phẩm tạm hết hàng trong kho!', 'error');
      return;
    }

    const buyQty = Math.max(1, Math.min(Number(qty) || 1, availableStock));
    const buyNowItem = {
      id: liveProduct.id || liveProduct.publicId,
      publicId: liveProduct.publicId,
      name: liveProduct.name,
      price: liveProduct.price,
      originalPrice: liveProduct.originalPrice,
      quantity: buyQty,
      image: liveProduct.image,
      inStock: availableStock
    };

    navigate('/checkout', { state: { buyNowItem } });
  };

  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const liveProduct = productList.find(
      (p) => String(p.id) === String(productId) || (p.publicId && String(p.publicId) === String(productId))
    );
    const availableStock = liveProduct?.inStock !== undefined && liveProduct.inStock !== null ? Number(liveProduct.inStock) : 999;

    if (newQty > availableStock) {
      addToast(`Kho chỉ còn tối đa ${availableStock} cây cho sản phẩm này!`, 'info');
      setCartItems((prev) =>
        prev.map((item) => (String(item.id) === String(productId) ? { ...item, quantity: availableStock, inStock: availableStock } : item))
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => (String(item.id) === String(productId) ? { ...item, quantity: newQty, inStock: availableStock } : item))
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
    addToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const handleToggleWishlist = (productId) => {
    if (!productId) return;
    const targetId = String(productId);
    setWishlist((prev) => {
      const exists = prev.some((id) => String(id) === targetId);
      if (exists) {
        addToast('Đã xóa khỏi danh sách yêu thích', 'info');
        return prev.filter((id) => String(id) !== targetId);
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
        if (
          onlyWishlist &&
          !wishlist.some(
            (wId) =>
              String(wId) === String(item.id) ||
              (item.publicId && String(wId) === String(item.publicId))
          )
        )
          return false;

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

  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isAuthRoute = currentRoute === 'login' || currentRoute === 'register' || currentRoute === 'password' || currentRoute === 'admin-login';

  const pageMeta = useMemo(() => {
    const path = location.pathname;

    if (path === '/') {
      return {
        title: 'Trang chủ',
        description: 'Sen Xinh Garden chuyên bán sen đá, xương rồng, chậu cảnh và phụ kiện cây xanh cho không gian sống tối ưu.',
        image: 'https://senxinhgarden.com/hero-banner.jpg'
      };
    }

    if (path === '/shop') {
      return {
        title: 'Cửa hàng sen đá & cây cảnh',
        description: 'Khám phá bộ sưu tập sen đá, xương rồng, chậu đất nung và cây cảnh phong thủy được tuyển chọn kỹ lưỡng.',
        image: 'https://senxinhgarden.com/hero-banner.jpg'
      };
    }

    if (path.startsWith('/product/')) {
      const productId = path.split('/').filter(Boolean).pop();
      const product = productList.find((item) => String(item.id) === String(productId) || (item.publicId && String(item.publicId) === String(productId)));

      if (product) {
        return {
          title: product.name,
          description: product.description || `Mua ${product.name} tại Sen Xinh Garden với giá tốt, chăm sóc dễ dàng và giao hàng toàn quốc.`,
          image: product.image || 'https://senxinhgarden.com/hero-banner.jpg'
        };
      }
    }

    if (path === '/news') {
      return {
        title: 'Tin tức & cẩm nang chăm cây',
        description: 'Cẩm nang tưới nước, kỹ thuật chăm sóc, cách trồng sen đá và xương rồng tại nhà từ chuyên gia Sen Xinh Garden.',
        image: 'https://senxinhgarden.com/hero-banner.jpg'
      };
    }

    if (path.startsWith('/news/')) {
      const articleId = path.split('/').filter(Boolean).pop();
      const article = NEWS_ARTICLES.find((item) => String(item.id) === String(articleId));

      if (article) {
        return {
          title: article.title,
          description: article.summary,
          image: article.thumbnail || 'https://senxinhgarden.com/hero-banner.jpg'
        };
      }
    }

    if (path === '/cart') {
      return {
        title: 'Giỏ hàng của bạn',
        description: 'Xem lại sản phẩm trong giỏ hàng, áp dụng mã ưu đãi và thanh toán đơn hàng sen đá nhanh chóng.',
        image: 'https://senxinhgarden.com/hero-banner.jpg'
      };
    }

    if (path === '/checkout') {
      return {
        title: 'Thanh toán & đặt hàng',
        description: 'Đặt hàng sen đá, xương rồng và cây cảnh ngay hôm nay với thanh toán an toàn, thuận tiện.',
        image: 'https://senxinhgarden.com/hero-banner.jpg'
      };
    }

    if (path === '/account') {
      return {
        title: 'Tài khoản của tôi',
        description: 'Quản lý thông tin cá nhân, đơn hàng và danh sách yêu thích sản phẩm yêu thích của bạn.',
        image: 'https://senxinhgarden.com/hero-banner.jpg'
      };
    }

    if (path === '/login') {
      return {
        title: 'Đăng nhập',
        description: 'Đăng nhập vào tài khoản Sen Xinh Garden để theo dõi đơn hàng, wishlist và ưu đãi thành viên.',
        image: 'https://senxinhgarden.com/hero-banner.jpg'
      };
    }

    if (path === '/register') {
      return {
        title: 'Đăng ký tài khoản',
        description: 'Tạo tài khoản Sen Xinh Garden để lưu giỏ hàng, theo dõi đơn đặt hàng và nhận ưu đãi thành viên.',
        image: 'https://senxinhgarden.com/hero-banner.jpg'
      };
    }

    if (path === '/policy') {
      return {
        title: 'Chính sách đổi trả & bảo hành 7 ngày',
        description: 'Chính sách hoàn tiền, đổi trả trong vòng 7 ngày và cam kết chất lượng cây cảnh thuần dưỡng tại Sen Xinh Garden.',
        image: 'https://senxinhgarden.com/hero-banner.jpg'
      };
    }

    return {
      title: 'Sen Xinh Garden',
      description: 'Cửa hàng sen đá, xương rồng và cây cảnh phong thủy với dịch vụ tư vấn chăm sóc chuyên nghiệp.',
      image: 'https://senxinhgarden.com/hero-banner.jpg'
    };
  }, [location.pathname, productList]);

  return (
    <>
      <SeoMeta title={pageMeta.title} description={pageMeta.description} path={location.pathname} image={pageMeta.image} />
      <div className={`app ${isAdminRoute ? 'admin-layout' : ''} ${isAuthRoute ? 'auth-layout' : ''}`}>
      {/* Ẩn Header Navbar trên trang Admin và các trang Đăng nhập / Đăng ký */}
      {!isAdminRoute && !isAuthRoute && (
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
                onBuyNow={handleBuyNow}
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
                onBuyNow={handleBuyNow}
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

          {/* Shop Policy Route */}
          <Route
            path="/policy"
            element={
              <PolicyPage
                onNavigateHome={() => navigateTo('home')}
                onNavigateShop={() => navigateTo('shop')}
                onNavigateAccount={() => navigateTo('account')}
              />
            }
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
                onOrderSuccess={(order, isDirectBuy, directBuyItem) => {
                  if (isDirectBuy && directBuyItem) {
                    setCartItems((prev) =>
                      prev.filter(
                        (it) =>
                          String(it.id) !== String(directBuyItem.id) &&
                          (!directBuyItem.publicId || String(it.publicId) !== String(directBuyItem.publicId))
                      )
                    );
                  } else {
                    setCartItems([]);
                  }
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
              user && (user.role?.toLowerCase().includes('admin') || user.email === 'admin@senxinh.vn') ? (
                <AdminPage
                  user={user}
                  onLoginAsAdmin={handleAdminLoginSuccess}
                  onLogout={handleLogout}
                  onNavigateHome={() => navigateTo('home')}
                  onNavigateShop={() => navigateTo('shop')}
                  onProductsChange={(updated) => setProductList(updated)}
                  addToast={addToast}
                />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          />
          <Route
            path="/admin/login"
            element={
              <AdminLoginPage
                user={user}
                onLoginAsAdmin={handleAdminLoginSuccess}
                onLogout={handleLogout}
                onNavigateHome={() => navigateTo('home')}
                addToast={addToast}
              />
            }
          />

          {/* Dedicated Login Route */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onNavigate={navigateTo}
                  addToast={addToast}
                />
              )
            }
          />

          {/* Dedicated Register Route */}
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <RegisterPage
                  onRegisterSuccess={handleRegisterSuccess}
                  onNavigate={navigateTo}
                  addToast={addToast}
                />
              )
            }
          />

          {/* Password routes redirect to Login */}
          <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
          <Route path="/password" element={<Navigate to="/login" replace />} />

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
                onNavigateAccount={() => navigateTo('account')}
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
                onNavigateCart={(opts) => navigateTo('cart', null, opts)}
                onNavigateAdmin={() => navigateTo('admin')}
                onNavigateHome={() => navigateTo('home')}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
              />
            }
          />

          {/* Dedicated Account & Tab Routes (Profile, Orders, History, Wishlist, Cart) */}
          {['/account', '/account/profile', '/account/orders', '/orders', '/account/history', '/history', '/account/wishlist', '/account/cart'].map((routePath) => (
            <Route
              key={routePath}
              path={routePath}
              element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : (
                  <AccountPage
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
                    onNavigateCart={(opts) => navigateTo('cart', null, opts)}
                    onNavigateAdmin={() => navigateTo('admin')}
                    onNavigateHome={() => navigateTo('home')}
                    onLogout={handleLogout}
                    onUpdateUser={handleUpdateUser}
                  />
                )
              }
            />
          ))}

          {/* Catch-all Wildcard Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Chỉ hiển thị Footer khách hàng khi KHÔNG PHẢI trang admin và KHÔNG PHẢI trang xác thực (login/register) */}
      {!isAdminRoute && !isAuthRoute && <Footer />}

      {/* Toast Notifications */}
      <Toast toasts={toasts} />

      {/* Floating Scroll To Top Button (chỉ ở trang khách hàng) */}
      {!isAdminRoute && !isAuthRoute && <ScrollToTop />}
    </div>
    </>
  );
}
