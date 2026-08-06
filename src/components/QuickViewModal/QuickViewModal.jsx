import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../Button/Button';
import Avatar from '../Avatar/Avatar';
import './QuickViewModal.css';

export default function QuickViewModal({ product, onClose }) {
  const { toggleWishlist, isWishlisted, showToast } = useApp();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [bidValue, setBidValue] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'seller',
      time: 'Just now',
      text: `Hey! Thanks for expressing interest. I'm usually free to meet near the block parking or cafeteria. Let me know if you have any questions!`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const images = product.images || [`https://picsum.photos/seed/${product.id}/600/450`];
  const isSaved = isWishlisted(product.id);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  const handleMakeOffer = (e) => {
    e.preventDefault();
    const bidPrice = parseFloat(bidValue);
    if (isNaN(bidPrice) || bidPrice <= 0) {
      showToast('Please enter a valid bid amount!', 'default');
      return;
    }

    if (!product.negotiable) {
      showToast('This item has a fixed price from the seller.', 'default');
      return;
    }

    const minAcceptablePrice = product.price * 0.8; // 20% discount max
    if (bidPrice < minAcceptablePrice) {
      // High discount offer
      showToast('Offer is too low for the seller to accept immediately.', 'default');
      setChatHistory((prev) => [
        ...prev,
        { sender: 'user', time: 'Just now', text: `My bid offer: ₹${bidPrice.toLocaleString('en-IN')}` },
        {
          sender: 'seller',
          time: 'Just now',
          text: `Ah, ₹${bidPrice} is a bit too low, sorry. Can you meet me somewhere closer to ₹${Math.round(product.price * 0.9)}?`,
        },
      ]);
    } else {
      // Good price
      showToast('Offer submitted to seller!', 'success');
      setChatHistory((prev) => [
        ...prev,
        { sender: 'user', time: 'Just now', text: `My bid offer: ₹${bidPrice.toLocaleString('en-IN')}` },
        {
          sender: 'seller',
          time: 'Just now',
          text: `That works for me! I'm in ${product.hostel || 'Hostel Block'}. When are you free to meet up?`,
        },
      ]);
    }
    setBidValue('');
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    // Add user message to history
    setChatHistory((prev) => [...prev, { sender: 'user', time: 'Just now', text: userText }]);
    setChatMessage('');
    setIsTyping(true);

    // Simulate seller typing and replying
    setTimeout(() => {
      setIsTyping(false);
      let replyText = `Ok, let's meet up today! I have classes till 4:30 PM. I can get the item to the library block stairs.`;
      
      const lower = userText.toLowerCase();
      if (lower.includes('price') || lower.includes('cost') || lower.includes('cheap')) {
        replyText = product.negotiable 
          ? `I can negotiate a bit! What price were you thinking?` 
          : `Sorry, this is a fixed price. The item is in really great condition so it's a fair price!`;
      } else if (lower.includes('condition') || lower.includes('work') || lower.includes('damage') || lower.includes('broken')) {
        replyText = `The condition is "${product.condition}". It works perfectly. You can check it out in person before buying.`;
      } else if (lower.includes('time') || lower.includes('where') || lower.includes('meet') || lower.includes('available')) {
        replyText = `Yes, it is available! Let's connect on campus. I'm usually near ${product.location || 'Engineering Block'} or ${product.hostel || 'Hostel Area'}.`;
      }
      
      setChatHistory((prev) => [...prev, { sender: 'seller', time: 'Just now', text: replyText }]);
    }, 1200);
  };

  return (
    <div className="cm-qv-overlay" onClick={onClose}>
      <div className="cm-qv-modal scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="cm-qv-close" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        <div className="cm-qv-grid">
          {/* LEFT: Pictures & Swipers */}
          <div className="cm-qv-media">
            <div className="cm-qv-main-img">
              <img src={images[activeImageIdx]} alt={product.title} />
              {product.negotiable && <span className="cm-qv-tag negotiable">🤝 Negotiable</span>}
              {!product.negotiable && <span className="cm-qv-tag fixed">🏷️ Fixed Price</span>}
              {product.price === 0 && <span className="cm-qv-tag free-tag">🎁 Free Item</span>}
            </div>
            
            {images.length > 1 && (
              <div className="cm-qv-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`cm-qv-thumb-btn ${activeImageIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}

            <div className="cm-qv-quick-details">
              <h4>Item Specifications</h4>
              <ul className="spec-list">
                <li><strong>Condition:</strong> <span className={`cond-badge ${product.condition.toLowerCase().replace(' ', '-')}`}>{product.condition}</span></li>
                <li><strong>Seller:</strong> {product.seller}</li>
                <li><strong>Location:</strong> {product.location || 'Campus Wide'}</li>
                <li><strong>Hostel:</strong> {product.hostel || 'Day Scholar'}</li>
                <li><strong>Posted Check:</strong> {product.postedAt || 'Recently'}</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: Info & Interactive Chat Simulator */}
          <div className="cm-qv-info">
            <div className="cm-qv-header">
              <span className="info-category">{product.category.toUpperCase()}</span>
              <h2>{product.title}</h2>
              <div className="price-set">
                <span className="price-tag">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice > 0 && (
                  <>
                    <span className="orig-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    <span className="discount-pct">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="cm-qv-divider" />

            <div className="cm-qv-description">
              <h4>Description</h4>
              <p>{product.description}</p>
            </div>

            <div className="cm-qv-actions">
              <Button 
                variant={isSaved ? 'secondary' : 'primary'} 
                onClick={() => toggleWishlist(product.id)}
                style={{ flex: '1', display: 'flex', justifyContent: 'center' }}
              >
                {isSaved ? '❤️ Saved in Wishlist' : '🤍 Save to Wishlist'}
              </Button>
            </div>

            {/* Bidding Section */}
            {product.price > 0 && product.negotiable && (
              <form onSubmit={handleMakeOffer} className="cm-qv-bid-form">
                <label>Make an Instant Offer:</label>
                <div className="bid-input-wrap">
                  <span className="bid-currency-symbol">₹</span>
                  <input
                    type="number"
                    placeholder={`e.g., ${Math.round(product.price * 0.9)}`}
                    value={bidValue}
                    onChange={(e) => setBidValue(e.target.value)}
                  />
                  <Button type="submit" variant="outline" size="sm">Submit Offer</Button>
                </div>
              </form>
            )}

            <div className="cm-qv-divider" style={{ margin: '16px 0' }} />

            {/* Chat Simulator */}
            <div className="cm-qv-chat-simulator">
              <div className="chat-header">
                <Avatar initials={product.sellerAvatar || 'CU'} size={32} online />
                <div>
                  <strong>Chat with student: {product.seller}</strong>
                  <span>active on campus</span>
                </div>
              </div>
              
              <div className="chat-messages">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.sender}`}>
                    <div className="bubble-text">{msg.text}</div>
                    <div className="bubble-meta">{msg.time}</div>
                  </div>
                ))}
                {isTyping && (
                  <div className="chat-bubble seller typing">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendChatMessage} className="chat-input-area">
                <input
                  type="text"
                  placeholder="Ask if available, make an offer..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" aria-label="Send message">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
