/**
 * Image Utilities for CampusMart
 * Provides relevant product image mapping based on product title & category,
 * as well as fallback handling and SVG Data URIs for offline/network failure cases.
 */

// Category to SVG Data URIs (clean, modern vector fallbacks matching site theme)
const CATEGORY_SVG_FALLBACKS = {
  books: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%231e293b"/><g transform="translate(220,135) scale(2.5)"><path fill="%236366f1" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/><path fill="%23818cf8" d="M19 2H9v2h10v14h2V4c0-1.1-.9-2-2-2z"/></g><text x="300" y="340" fill="%2394a3b8" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Academic Textbooks</text></svg>`,

  calculators: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%230f172a"/><g transform="translate(230,120) scale(2.8)"><path fill="%2338bdf8" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 4H7V5h10v2zm-6 4H7v-2h4v2zm0 4H7v-2h4v2zm6 4h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4v-2h4v2z"/></g><text x="300" y="340" fill="%2394a3b8" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Scientific Calculator</text></svg>`,

  electronics: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%2318181b"/><g transform="translate(220,130) scale(2.6)"><path fill="%23a855f7" d="M20 18c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2H0c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2h-4zM4 5h16v11H4V5z"/></g><text x="300" y="340" fill="%23a1a1aa" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Electronics %26 Gadgets</text></svg>`,

  cycles: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%23064e3b"/><g transform="translate(220,130) scale(2.5)"><path fill="%2334d399" d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm14-8.5c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></g><text x="300" y="340" fill="%23a7f3d0" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Campus Bicycle</text></svg>`,

  lab: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%231e1b4b"/><g transform="translate(230,130) scale(2.6)"><path fill="%23818cf8" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm5 12H7v-1c0-2.3 3.3-3.5 5-3.5s5 1.2 5 3.5v1z"/></g><text x="300" y="340" fill="%23c7d2fe" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Lab %26 Safety Equipment</text></svg>`,

  hostel: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%23451a03"/><g transform="translate(220,130) scale(2.5)"><path fill="%23fbbf24" d="M19 7h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.2-1.8-4-4-4zm-11 6c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3z"/></g><text x="300" y="340" fill="%23fef3c7" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Hostel Essentials</text></svg>`,

  furniture: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%23292524"/><g transform="translate(220,130) scale(2.5)"><path fill="%23f97316" d="M20 10V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5h1.33L4 21h2l.67-4h10.66l.67 4h2l.67-4H22v-5c0-1.1-.9-2-2-2zm-14-3h12v3H6V7z"/></g><text x="300" y="340" fill="%23fed7aa" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Hostel Furniture</text></svg>`,

  fashion: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%23831843"/><g transform="translate(220,130) scale(2.5)"><path fill="%23f472b6" d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z"/></g><text x="300" y="340" fill="%23fbcfe8" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Fashion %26 Apparel</text></svg>`,

  sports: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%23065f46"/><g transform="translate(220,130) scale(2.5)"><path fill="%2334d399" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></g><text x="300" y="340" fill="%23a7f3d0" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Sports Gear</text></svg>`,

  other: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%233f3f46"/><g transform="translate(220,130) scale(2.5)"><path fill="%23a1a1aa" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></g><text x="300" y="340" fill="%23e4e4e7" font-family="system-ui,sans-serif" font-size="22" font-weight="600" text-anchor="middle">Campus Marketplace Item</text></svg>`
};

// Curated high-reliability product images mapped to product types
const PRODUCT_TYPE_IMAGES = {
  // Scientific Calculator / Casio
  calculator: [
    'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop'
  ],
  // Textbooks (Mathematics, CS, Algorithms, Chemistry, Physics, NCERT)
  math_book: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop'
  ],
  cs_book: [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop'
  ],
  chem_book: [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop'
  ],
  generic_book: [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop'
  ],
  // Laptops / Computers
  laptop: [
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop'
  ],
  // Phones / iPhone
  phone: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop'
  ],
  // Headphones / Audio / Speaker
  headphones: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop'
  ],
  speaker: [
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop'
  ],
  // Bicycles / Cycles
  cycle: [
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&auto=format&fit=crop'
  ],
  // Lab Equipment / Lab Coat / Goggles / Drafter
  lab_coat: [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop'
  ],
  drafting_kit: [
    'https://images.unsplash.com/photo-1585336261026-875a60a1c92f?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop'
  ],
  // Furniture: Study Table / Chair / Almirah / Bookshelf
  study_table: [
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop'
  ],
  almirah: [
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop'
  ],
  bookshelf: [
    'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&auto=format&fit=crop'
  ],
  // Hostel Essentials: Kettle, Fridge, Bucket
  kettle: [
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop'
  ],
  fridge: [
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop'
  ],
  hostel_bundle: [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop'
  ],
  // Fashion: Jacket, Shoes
  jacket: [
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&auto=format&fit=crop'
  ],
  shoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop'
  ],
  // Sports: Badminton, Cricket
  badminton: [
    'https://images.unsplash.com/photo-1626225967045-9440e5a6f2b5?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=600&auto=format&fit=crop'
  ],
  cricket: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop'
  ],
  // Music: Guitar
  guitar: [
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop'
  ]
};

/**
 * Returns a relevant image URL based on product title and category.
 * Matches specific keywords in the title first, then category fallbacks.
 */
export function getRelevantFallbackImage(titleOrProduct = '', category = '') {
  let title = '';
  let cat = '';

  if (typeof titleOrProduct === 'object' && titleOrProduct !== null) {
    title = titleOrProduct.title || '';
    cat = titleOrProduct.category || '';
  } else {
    title = String(titleOrProduct || '');
    cat = String(category || '');
  }

  const t = title.toLowerCase();
  const c = cat.toLowerCase();

  // 1. Keyword Title Matching
  if (t.includes('calculator') || t.includes('casio') || t.includes('fx-') || c === 'calculators') {
    return PRODUCT_TYPE_IMAGES.calculator[0];
  }
  if (t.includes('cricket') || t.includes('bat')) {
    return PRODUCT_TYPE_IMAGES.cricket[0];
  }
  if (t.includes('badminton') || t.includes('racket') || t.includes('shuttlecock')) {
    return PRODUCT_TYPE_IMAGES.badminton[0];
  }
  if (t.includes('macbook') || t.includes('laptop') || t.includes('hp') || t.includes('dell') || t.includes('thinkpad')) {
    return PRODUCT_TYPE_IMAGES.laptop[0];
  }
  if (t.includes('iphone') || t.includes('phone') || t.includes('mobile')) {
    return PRODUCT_TYPE_IMAGES.phone[0];
  }
  if (t.includes('headphone') || t.includes('earphone') || t.includes('rockerz')) {
    return PRODUCT_TYPE_IMAGES.headphones[0];
  }
  if (t.includes('speaker') || t.includes('jbl') || t.includes('audio')) {
    return PRODUCT_TYPE_IMAGES.speaker[0];
  }
  if (t.includes('cycle') || t.includes('bicycle') || t.includes('bike') || c === 'cycles') {
    return PRODUCT_TYPE_IMAGES.cycle[0];
  }
  if (t.includes('lab coat') || t.includes('goggles')) {
    return PRODUCT_TYPE_IMAGES.lab_coat[0];
  }
  if (t.includes('drafter') || t.includes('drawing board') || t.includes('drafting') || t.includes('geometry')) {
    return PRODUCT_TYPE_IMAGES.drafting_kit[0];
  }
  if (t.includes('table') || t.includes('desk') || t.includes('chair')) {
    return PRODUCT_TYPE_IMAGES.study_table[0];
  }
  if (t.includes('almirah') || t.includes('wardrobe') || t.includes('cabinet')) {
    return PRODUCT_TYPE_IMAGES.almirah[0];
  }
  if (t.includes('bookshelf') || t.includes('shelf')) {
    return PRODUCT_TYPE_IMAGES.bookshelf[0];
  }
  if (t.includes('kettle')) {
    return PRODUCT_TYPE_IMAGES.kettle[0];
  }
  if (t.includes('fridge') || t.includes('refrigerator')) {
    return PRODUCT_TYPE_IMAGES.fridge[0];
  }
  if (t.includes('bucket') || t.includes('mug') || t.includes('hanger')) {
    return PRODUCT_TYPE_IMAGES.hostel_bundle[0];
  }
  if (t.includes('jacket') || t.includes('denim') || t.includes('coat')) {
    return PRODUCT_TYPE_IMAGES.jacket[0];
  }
  if (t.includes('shoe') || t.includes('sneaker') || t.includes('nike')) {
    return PRODUCT_TYPE_IMAGES.shoes[0];
  }
  if (t.includes('guitar') || t.includes('acoustic')) {
    return PRODUCT_TYPE_IMAGES.guitar[0];
  }
  if (t.includes('math') || t.includes('grewal')) {
    return PRODUCT_TYPE_IMAGES.math_book[0];
  }
  if (t.includes('structures') || t.includes('cormen') || t.includes('algorithm')) {
    return PRODUCT_TYPE_IMAGES.cs_book[0];
  }
  if (t.includes('chemistry') || t.includes('clayden')) {
    return PRODUCT_TYPE_IMAGES.chem_book[0];
  }

  // 2. Category Fallback Matching
  if (c === 'books') return PRODUCT_TYPE_IMAGES.generic_book[0];
  if (c === 'electronics') return PRODUCT_TYPE_IMAGES.laptop[0];
  if (c === 'cycles') return PRODUCT_TYPE_IMAGES.cycle[0];
  if (c === 'lab') return PRODUCT_TYPE_IMAGES.lab_coat[0];
  if (c === 'furniture') return PRODUCT_TYPE_IMAGES.study_table[0];
  if (c === 'hostel') return PRODUCT_TYPE_IMAGES.kettle[0];
  if (c === 'fashion') return PRODUCT_TYPE_IMAGES.jacket[0];
  if (c === 'sports') return PRODUCT_TYPE_IMAGES.badminton[0];

  // 3. SVG Fallback
  return CATEGORY_SVG_FALLBACKS[c] || CATEGORY_SVG_FALLBACKS.other;
}

/**
 * Returns SVG Data URI fallback for offline/broken image cases.
 */
export function getCategorySvgFallback(category = 'other', title = '') {
  const c = (category || '').toLowerCase();
  return CATEGORY_SVG_FALLBACKS[c] || CATEGORY_SVG_FALLBACKS.other;
}

/**
 * Ensures a valid array of image URLs for any product listing.
 */
export function resolveProductImages(product) {
  if (!product) return [CATEGORY_SVG_FALLBACKS.other];
  if (Array.isArray(product.images) && product.images.length > 0) {
    const valid = product.images.filter(img => typeof img === 'string' && img.trim().length > 0);
    if (valid.length > 0) return valid;
  }
  return [getRelevantFallbackImage(product.title, product.category)];
}
