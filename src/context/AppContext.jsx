import { createContext, useContext, useState, useCallback } from 'react';
import { products as seedProducts } from '../data/products';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [products] = useState(seedProducts);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('campusmart-wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

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
    <AppContext.Provider value={{ products, wishlist, toggleWishlist, isWishlisted, toasts, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
