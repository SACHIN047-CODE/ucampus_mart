import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getRelevantFallbackImage } from '../utils/imageUtils';
import { apiGetMe } from '../utils/api';
import { getInitials, isChitkaraEmail } from '../utils/userUtils';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('campusmart-products');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Exclude mock seed products that had id p1..p20 or fake picsum images
        const realOnly = parsed.filter((p) => {
          if (!p.id) return false;
          if (typeof p.id === 'string' && p.id.match(/^p([1-9]|1[0-9]|20)$/)) return false;
          return true;
        });
        return realOnly.map((p) => ({
          ...p,
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [getRelevantFallbackImage(p.title, p.category)],
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('campusmart-wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campusmart-user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed) {
        parsed.initials = getInitials(parsed.name, parsed.email);
        parsed.isVerified = isChitkaraEmail(parsed.email);
        parsed.isCampusVerified = parsed.isVerified;
      }
      return parsed;
    } catch {
      return null;
    }
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
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out legacy mock notifications
        return parsed.filter((n) => !['n1', 'n2', 'n3'].includes(n.id));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Verify real user session on mount
  useEffect(() => {
    const token = localStorage.getItem('campusmart-token');
    if (token) {
      apiGetMe()
        .then((res) => {
          if (res?.success && res?.user) {
            const formatted = {
              ...res.user,
              isVerified: isChitkaraEmail(res.user.email),
              isCampusVerified: isChitkaraEmail(res.user.email),
              initials: getInitials(res.user.name, res.user.email),
            };
            setUser((prev) => ({ ...(prev || {}), ...formatted }));
            localStorage.setItem('campusmart-user', JSON.stringify(formatted));
          }
        })
        .catch(() => {
          // If session expired, let them log in again
        });
    }
  }, []);

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
    const email = userData.email || '';
    const name = userData.name || (email ? email.split('@')[0] : 'Student');
    const initials = getInitials(name, email);
    const isVerified = isChitkaraEmail(email);
    const newUser = {
      ...userData,
      id: userData.id || 'user-' + Date.now(),
      name,
      email,
      department: userData.department || (isVerified ? 'Chitkara University' : ''),
      hostel: userData.hostel || '',
      phone: userData.phone || '',
      avatar: userData.avatar || null,
      role: userData.role || 'STUDENT',
      isVerified,
      isCampusVerified: isVerified,
      initials,
    };
    setUser(newUser);
    localStorage.setItem('campusmart-user', JSON.stringify(newUser));
    return newUser;
  }, []);

  const updateUser = useCallback((updates = {}) => {
    setUser((prev) => {
      const base = prev || {};
      const next = { ...base, ...updates };
      if (next.email) {
        next.isVerified = isChitkaraEmail(next.email);
        next.isCampusVerified = next.isVerified;
      }
      next.initials = getInitials(next.name, next.email);
      try {
        localStorage.setItem('campusmart-user', JSON.stringify(next));
      } catch (err) {
        console.warn('LocalStorage save failed', err);
      }
      return next;
    });
  }, []);

  const startChat = useCallback(({ seller, sellerAvatar, sellerEmail, title }) => {
    const name = seller || 'Verified Student';
    const initials = sellerAvatar || getInitials(name, sellerEmail);
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
