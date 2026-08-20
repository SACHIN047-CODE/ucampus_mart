import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../../data/categories';
import { useApp } from '../../context/AppContext';
import { getRelevantFallbackImage } from '../../utils/imageUtils';
import Button from '../../components/Button/Button';
import './SellItem.css';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function SellItem() {
  const { showToast, addProduct, user } = useApp();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', condition: '', price: '', negotiable: false, location: '',
  });
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  const addFiles = (fileList) => {
    const remainingSlots = 6 - images.length;
    const files = Array.from(fileList).slice(0, remainingSlots);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => {
          if (prev.length >= 6) return prev;
          return [...prev, { url: e.target.result, name: file.name }];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Give your listing a title';
    if (!form.description.trim()) errs.description = 'Add a short description';
    if (!form.category) errs.category = 'Choose a category';
    if (!form.condition) errs.condition = 'Choose a condition';
    if (form.price === '' || Number(form.price) < 0) errs.price = 'Enter a valid price (0 for free)';
    if (!form.location.trim()) errs.location = 'Add a pickup location';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the highlighted fields', 'danger');
      return;
    }

    const newId = 'p-' + Date.now();
    const priceNum = Number(form.price);
    const fallbackImage = getRelevantFallbackImage(form.title, form.category);
    const imageUrls = images.length > 0 ? images.map((img) => img.url) : [fallbackImage];

    const newProduct = {
      id: newId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      condition: form.condition,
      price: priceNum,
      originalPrice: priceNum > 0 ? Math.round(priceNum * 1.25) : 0,
      negotiable: Boolean(form.negotiable),
      location: form.location.trim(),
      hostel: user?.hostel || form.location.trim(),
      seller: user?.name || 'Verified Student',
      sellerAvatar: user?.initials || 'VS',
      sellerEmail: user?.email || '',
      postedAt: 'Just now',
      createdAt: Date.now(),
      views: 1,
      free: priceNum === 0,
      wanted: false,
      isMine: true,
      images: imageUrls,
    };

    addProduct(newProduct);
    showToast('🎉 Listing published! It’s now live across the campus.');
    navigate(`/product/${newId}`);
  };

  return (
    <div className="cm-sell container">
      <div className="cm-sell__head">
        <span className="cm-section__eyebrow">List an item</span>
        <h1>Sell Something on CampusMart</h1>
        <p>Takes less than 2 minutes. Verified students in your hostel and department will see it first.</p>
      </div>

      <form className="cm-sell__form" onSubmit={handleSubmit} noValidate>
        <div className="cm-sell__field">
          <label>Product Images (Optional)</label>
          <div
            className={`cm-dropzone ${dragActive ? 'is-active' : ''} ${errors.images ? 'has-error' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 16V4M12 4l-4 4M12 4l4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
            <p><b>Drag & drop</b> your photos here, or click to browse</p>
            <span>Up to 6 images · JPG or PNG (Auto-generates relevant fallback photo if unuploaded)</span>
          </div>
          {errors.images && <span className="cm-field-error">{errors.images}</span>}

          {images.length > 0 && (
            <div className="cm-sell__previews">
              {images.map((img, i) => (
                <div key={i} className="cm-sell__preview">
                  <img src={img.url} alt="Uploaded product preview" />
                  <button type="button" onClick={() => removeImage(i)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cm-sell__row">
          <div className="cm-sell__field">
            <label htmlFor="title">Title</label>
            <input id="title" type="text" placeholder="e.g. Engineering Mathematics — 3rd Edition" value={form.title} onChange={(e) => update('title', e.target.value)} className={errors.title ? 'has-error' : ''} />
            {errors.title && <span className="cm-field-error">{errors.title}</span>}
          </div>
        </div>

        <div className="cm-sell__field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={4} placeholder="Describe the item's condition, why you're selling, and anything a buyer should know." value={form.description} onChange={(e) => update('description', e.target.value)} className={errors.description ? 'has-error' : ''} />
          {errors.description && <span className="cm-field-error">{errors.description}</span>}
        </div>

        <div className="cm-sell__row cm-sell__row--3">
          <div className="cm-sell__field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={(e) => update('category', e.target.value)} className={errors.category ? 'has-error' : ''}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            {errors.category && <span className="cm-field-error">{errors.category}</span>}
          </div>
          <div className="cm-sell__field">
            <label htmlFor="condition">Condition</label>
            <select id="condition" value={form.condition} onChange={(e) => update('condition', e.target.value)} className={errors.condition ? 'has-error' : ''}>
              <option value="">Select condition</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.condition && <span className="cm-field-error">{errors.condition}</span>}
          </div>
          <div className="cm-sell__field">
            <label htmlFor="price">Price (₹)</label>
            <input id="price" type="number" min="0" placeholder="0 for free items" value={form.price} onChange={(e) => update('price', e.target.value)} className={errors.price ? 'has-error' : ''} />
            {errors.price && <span className="cm-field-error">{errors.price}</span>}
          </div>
        </div>

        <div className="cm-sell__row">
          <div className="cm-sell__field">
            <label htmlFor="location">Pickup Location</label>
            <input id="location" type="text" placeholder="e.g. Kasturba Hostel, North Campus" value={form.location} onChange={(e) => update('location', e.target.value)} className={errors.location ? 'has-error' : ''} />
            {errors.location && <span className="cm-field-error">{errors.location}</span>}
          </div>
        </div>

        <label className="cm-sell__toggle">
          <input type="checkbox" checked={form.negotiable} onChange={(e) => update('negotiable', e.target.checked)} />
          <span className="cm-switch" />
          Price is negotiable
        </label>

        <div className="cm-sell__submit">
          <Button type="submit" size="lg" fullWidth>Publish Listing</Button>
        </div>
      </form>
    </div>
  );
}
