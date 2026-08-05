import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ placeholder = 'Search for books, laptops, cycles…', size = 'md', initialValue = '' }) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/marketplace${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  return (
    <form className={`cm-search cm-search--${size}`} onSubmit={handleSubmit} role="search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search listings"
      />
      <button type="submit"><span>Search</span></button>
    </form>
  );
}
