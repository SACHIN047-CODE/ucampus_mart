import { createContext, useContext, useState, useCallback } from 'react';
import { products as seedProducts } from '../data/products';
import { getRelevantFallbackImage } from '../utils/imageUtils';

const AppContext = createContext();

const seedNotifications = [
  {
    id: 'n1',
    message: 'Ananya Sharma showed interest in your "Engineering Mathematics" book.',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    read: false,
    type: 'interest'
  },
  {
    id: 'n2',
    message: 'Rohan Mehta sent you a message: "Great, I can pick it up tomorrow"',
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    read: false,
    type: 'message'
  },
  {
    id: 'n3',
    message: 'Your listing "MacBook Air M1" has been successfully posted.',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    read: true,
    type: 'system'
  }
];

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('campusmart-products');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasPicsum = parsed.some((p) => p.images && p.images.some((img) => typeof img === 'string' && img.includes('picsum.photos')));
        if (hasPicsum) {
          localStorage.setItem('campusmart-products', JSON.stringify(seedProducts));
          return seedProducts;
        }
        return parsed.map((p) => ({
          ...p,
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [getRelevantFallbackImage(p.title, p.category)]
        }));
      }
      return seedProducts;
    } catch {
      return seedProducts;
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('campusmart-wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusmart-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeChat, setActiveChat] = useState(() => {
    try {
      const saved = localStorage.getItem('campusmart-active-chat');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [toasts, setToasts] = useState([]);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('campusmart-notifications');
      return saved ? JSON.parse(saved) : seedNotifications;
    } catch {
      return seedNotifications;
    }
  });

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const addNotification = useCallback((message, type = 'system') => {
    setNotifications((prev) => {
      const newNotif = {
        id: 'notif-' + Date.now() + Math.random(),
        message,
        createdAt: new Date().toISOString(),
        read: false,
        type
      };
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem('campusmart-notifications', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save failed', err);
      }
      return updated;
    });
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem('campusmart-notifications', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save failed', err);
      }
      return updated;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem('campusmart-notifications', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save failed', err);
      }
      return updated;
    });
  }, []);

  const addProduct = useCallback((newProduct) => {
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      try {
        localStorage.setItem('campusmart-products', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save failed', err);
      }
      return updated;
    });
    addNotification(`Your listing "${newProduct.title}" was successfully posted.`, 'system');
  }, [addNotification]);

  const deleteProduct = useCallback((productId) => {
    let deletedTitle = '';
    setProducts((prev) => {
      const target = prev.find((p) => String(p.id) === String(productId));
      if (target) deletedTitle = target.title;
      const updated = prev.filter((p) => String(p.id) !== String(productId));
      try {
        localStorage.setItem('campusmart-products', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save failed', err);
      }
      return updated;
    });
    if (deletedTitle) {
      addNotification(`Your listing "${deletedTitle}" was marked as sold and removed.`, 'system');
    }
    showToast('Listing removed successfully', 'default');
  }, [addNotification, showToast]);

  const login = useCallback((userData = {}) => {
    const email = userData.email || 'sachin.sharma@chitkara.edu.in';
    const name = userData.name || (email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()));
    const initials = userData.initials || (name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'SS');
    const newUser = {
      name,
      email,
      department: userData.department || 'B.Tech CSE, 2nd Year',
      hostel: userData.hostel || 'CS Dept Hostel',
      phone: userData.phone || '+91 98765 43210',
      initials,
      ...userData,
    };
    setUser(newUser);
    localStorage.setItem('campusmart-user', JSON.stringify(newUser));
    return newUser;
  }, []);

  const updateUser = useCallback((updates = {}) => {
    setUser((prev) => {
      const base = prev || {
        name: 'Sachin Sharma',
        email: 'sachin.sharma@chitkara.edu.in',
        department: 'B.Tech CSE, 2nd Year',
        hostel: 'CS Dept Hostel',
        phone: '+91 98765 43210',
        initials: 'SS',
      };
      const next = { ...base, ...updates };
      if (updates.name) {
        next.initials = updates.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || base.initials;
      }
      try {
        localStorage.setItem('campusmart-user', JSON.stringify(next));
      } catch (err) {
        console.warn('LocalStorage save failed', err);
      }
      return next;
    });
    showToast('Profile updated successfully', 'success');
  }, [showToast]);

  const startChat = useCallback(({ seller, sellerAvatar, sellerEmail, title }) => {
    const name = seller || 'Verified Student';
    const initials = sellerAvatar || (name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'VS');
    const chat = {
      id: 'seller-' + String(sellerEmail || name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      initials,
      last: `Interested in "${title}"`,
      time: 'now',
      unread: 0,
      online: true,
      product: title,
    };
    setActiveChat(chat);
    try {
      localStorage.setItem('campusmart-active-chat', JSON.stringify(chat));
    } catch (err) {
      console.warn('LocalStorage save failed', err);
    }
    return chat;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('campusmart-user');
    showToast('Logged out successfully', 'default');
  }, [showToast]);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem('campusmart-wishlist', JSON.stringify(next));
      showToast(exists ? 'Removed from wishlist' : 'Saved to wishlist', exists ? 'default' : 'success');
      return next;
    });
  }, [showToast]);

  const isWishlisted = (id) => wishlist.includes(id);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        products,
        addProduct,
        deleteProduct,
        wishlist,
        toggleWishlist,
        isWishlisted,
        user,
        isLoggedIn: Boolean(user),
        login,
        logout,
        updateUser,
        activeChat,
        startChat,
        toasts,
        showToast,
        notifications,
        unreadCount,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
