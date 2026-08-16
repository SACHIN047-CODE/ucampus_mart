import { createContext, useContext, useState, useCallback } from 'react';
import { products as seedProducts } from '../data/products';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [products] = useState(seedProducts);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('campusmart-wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusmart-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

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

  return (
    <AppContext.Provider
      value={{
        products,
        wishlist,
        toggleWishlist,
        isWishlisted,
        user,
        isLoggedIn: Boolean(user),
        login,
        logout,
        toasts,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
