/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { 
  UserRole, 
  ProductSource, 
  OrderStatus, 
  Product, 
  Category, 
  Order, 
  Review, 
  AffiliateClick, 
  Blog, 
  HomepageBanner, 
  FAQ, 
  Testimonial,
  AppNotification
} from './src/types.js'; // Use extension mapping
import { getSupabaseAdmin } from './src/lib/supabase.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables at startup
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required environment variable: ${key}`);
    console.error('[FATAL] Set this in Vercel → Project → Settings → Environment Variables');
    // Don't crash the process — let the error surface per-request instead
  }
}

// Initialize Supabase & AI inside the app instance or as globals
const supabase = getSupabaseAdmin();
const aiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (aiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: aiApiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

app.use(express.json());

// Export for Vercel
export default app;

/** Escape special XML characters to prevent XSS in XML responses */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Sitemap endpoint for Google SEO
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://dealy.co.ke';
    
    // Fetch dynamic content from Supabase
    const [{ data: products }, { data: blogs }] = await Promise.all([
      supabase.from('products').select('id, updated_at'),
      supabase.from('blogs').select('slug, updated_at')
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Routes
    const staticPages = ['', '/catalog', '/blogs', '/faqs', '/contact', '/privacy-policy', '/terms&services'];
    staticPages.forEach(page => {
      xml += `  <url>\n    <loc>${escapeXml(baseUrl + page)}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Dynamic Product Routes
    products?.forEach(p => {
      const loc = escapeXml(`${baseUrl}/catalog?product=${p.id}`);
      const lastmod = escapeXml(new Date(p.updated_at).toISOString().split('T')[0]);
      xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Dynamic Blog Routes
    blogs?.forEach(b => {
      const loc = escapeXml(`${baseUrl}/blogs/${b.slug}`);
      const lastmod = escapeXml(new Date(b.updated_at).toISOString().split('T')[0]);
      xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).end();
  }
});

// Middleware: guard all /api/* routes if supabase client failed to init
app.use('/api', (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({
      error: 'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.'
    });
  }
  next();
});

// API Endpoints
// Load products
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[Supabase Error] Fetching products:', error);
      throw error;
    }
    
    // Map snake_case to camelCase for frontend
    const mappedData = data.map(p => ({
      ...p,
      originalPrice: p.original_price,
      imageUrl: p.image_url,
    imageGallery: p.image_gallery || [],
    jforceSku: p.jforce_sku,
      affiliateUrl: p.affiliate_url,
      topSeller: p.top_seller,
      rating: Number(p.rating) || 5.0,
      reviewsCount: p.reviews_count || 0
    }));
    
    res.json(mappedData);
  } catch (err: any) {
    console.error('[Server Error] products API:', err);
    res.status(500).json({ error: `Database error querying schema: ${err.message}` });
  }
});

// Create product (Admin)
app.post('/api/products', async (req, res) => {
  const { title, description, specifications, price, originalPrice, imageUrl, source, category, affiliateUrl, jforceSku, availability, featured, trending, topSeller } = req.body;
  
  // First, find the category_id from the slug provided
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category)
    .single();

  const newProduct = {
    title: title || 'Untitled Deal',
    description: description || '',
    specifications: specifications || [],
    price: Number(price) || 0,
    original_price: originalPrice ? Number(originalPrice) : null,
    image_url: imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
    image_gallery: req.body.imageGallery || [],
    source: source || 'JFORCE',
    category_id: catData?.id || null,
    affiliate_url: affiliateUrl || '',
    jforce_sku: jforceSku || '',
    availability: availability !== false,
    featured: featured === true,
    trending: trending === true,
    top_seller: topSeller === true,
  };
  
  const { data, error } = await supabase
    .from('products')
    .insert([newProduct])
    .select()
    .single();
    
  if (error) {
    console.error('[Supabase Error] Creating product:', error);
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});

// Edit product (Admin)
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, specifications, price, originalPrice, imageUrl, source, category, affiliateUrl, jforceSku, availability, featured, trending, topSeller } = req.body;

  // First, find the category_id from the slug provided if category changed
  let category_id = undefined;
  if (category) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();
    if (catData) category_id = catData.id;
  }

  const updates: any = {
    title,
    description,
    specifications,
    price: price ? Number(price) : undefined,
    original_price: originalPrice ? Number(originalPrice) : undefined,
    image_url: imageUrl,
    image_gallery: req.body.imageGallery,
    source,
    category_id,
    affiliate_url: affiliateUrl,
    jforce_sku: jforceSku,
    availability,
    featured,
    trending,
    top_seller: topSeller
  };

  // Remove undefined fields to prevent overwriting with null if not intended
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  );
  
  const { data, error } = await supabase
    .from('products')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('[Supabase Error] Updating product:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// Delete product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Load categories
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
      
    if (error) {
      console.error('[Supabase Error] Fetching categories:', error);
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    console.error('[Server Error] categories API:', err);
    res.status(500).json({ error: `Database error querying schema: ${err.message}` });
  }
});

// Create category
app.post('/api/categories', async (req, res) => {
  const newCat = {
    name: req.body.name,
    slug: req.body.name.toLowerCase().replace(/\s+/g, '-'),
    icon: req.body.icon || 'CategoryName',
    description: req.body.description || ''
  };
  
  const { data, error } = await supabase
    .from('categories')
    .insert([newCat])
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Load orders (Admin/Customers)
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(*)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('[Supabase Error] Fetching orders with products:', error);
      
      // Fallback: Fetch without join if join fails
      const { data: simpleData, error: simpleError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (simpleError) throw simpleError;
      
      const mappedData = simpleData.map(o => ({
        ...o,
        productId: o.product_id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerEmail: o.customer_email,
        deliveryLocation: o.delivery_location,
        referredBy: o.referred_by,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        productTitle: 'Unknown Product',
        productPrice: 0,
        productSource: 'JFORCE'
      }));
      return res.json(mappedData);
    }
    
    const mappedData = data.map(o => ({
      ...o,
      productId: o.product_id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerEmail: o.customer_email,
      deliveryLocation: o.delivery_location,
      referredBy: o.referred_by,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      productTitle: o.products?.title || 'Unknown Product',
      productPrice: o.products?.price || 0,
      productSource: o.products?.source || 'JFORCE'
    }));
    
    res.json(mappedData);
  } catch (err: any) {
    console.error('[Server Error] orders API:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create JForce Order Request
app.post('/api/orders', async (req, res) => {
  const { productId, quantity, customerName, customerPhone, customerEmail, deliveryLocation, notes, referredBy } = req.body;
  
  // Fetch product info for the notification/email
  const { data: product, error: pError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
    
  if (pError || !product) {
    res.status(404).json({ error: 'Product not found for order request' });
    return;
  }
  
  const newOrder = {
    product_id: productId,
    quantity: Number(quantity) || 1,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail || null,
    delivery_location: deliveryLocation,
    notes,
    status: 'NEW',
    referred_by: referredBy || null,
  };
  
  const { data: order, error: oError } = await supabase
    .from('orders')
    .insert([newOrder])
    .select()
    .single();
    
  if (oError) return res.status(500).json({ error: oError.message });
  
  const newNotif = {
    title: 'New JForce Manual Order',
    message: `${customerName} (${customerPhone}) requested ${product.title} (x${quantity}) from ${deliveryLocation}. Notes: "${notes || 'None'}"`,
    is_read: false,
    type: 'order',
  };
  
  await supabase.from('notifications').insert([newNotif]);

  // Email Notification simulated in Node.js logs
  console.log(`
========================================================================
[EMAIL SIMULATION] TO: admin@dealy.co.ke
SUBJECT: [New JForce Order Request] - Order #${order.id} Received
BODY:
Hello Dealy KE Administrator,

A customer has submitted a manual order request for JForce product.

Product: ${product.title} (Price: KES ${product.price.toLocaleString()})
Quantity Requested: ${quantity}
Estimated Commission Value: KES ${(product.price * quantity).toLocaleString()}
Reseller sku: ${product.jforce_sku || 'N/A'}

Customer Persona Info:
- Name: ${customerName}
- Email: ${customerEmail || 'N/A'}
- Phone: ${customerPhone}
- Delivery Location: ${deliveryLocation}
- Special Notes: ${notes || 'None'}

Please initiate contact with the customer and fulfill the JForce logistics.
========================================================================
  `);

  res.status(201).json(order);
});

// Load admin notifications
app.get('/api/notifications', async (req, res) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Mark notification as read
app.post('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Update order status (Admin)
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Track Affiliate Clicks (Twiva)
app.post('/api/clicks', async (req, res) => {
  const { productId, referredBy } = req.body;
  
  const { data, error } = await supabase
    .from('clicks')
    .insert([{ product_id: productId, referred_by: referredBy || null }])
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Load Reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(title)');
      
    if (error) {
      console.error('[Supabase Error] Fetching reviews with products:', error);
      const { data: simpleData, error: simpleError } = await supabase.from('reviews').select('*');
      if (simpleError) throw simpleError;
      
      const mappedData = simpleData.map(r => ({
        ...r,
        productId: r.product_id,
        userName: r.user_name,
        productTitle: 'Unknown Product'
      }));
      return res.json(mappedData);
    }
    
    const mappedData = data.map(r => ({
      ...r,
      productId: r.product_id,
      userName: r.user_name,
      productTitle: r.products?.title || 'Unknown Product'
    }));
    
    res.json(mappedData);
  } catch (err: any) {
    console.error('[Server Error] reviews API:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create Review
app.post('/api/reviews', async (req, res) => {
  const { productId, userName, rating, comment } = req.body;
  
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ product_id: productId, user_name: userName, rating: Number(rating) || 5, comment }])
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Load Wishlist
app.get('/api/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;
  
  if (userId === 'GUEST') {
    return res.json([]);
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(w => w.product_id));
});

// Toggle Wishlist
app.post('/api/wishlist/toggle', async (req, res) => {
  const { userId, productId } = req.body;
  
  // Check if exists
  const { data: existing } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();
    
  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id);
  } else {
    await supabase.from('wishlists').insert([{ user_id: userId, product_id: productId }]);
  }
  
  const { data: updated } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId);
    
  res.json(updated ? updated.map(w => w.product_id) : []);
});

// Load blogs
app.get('/api/blogs', async (req, res) => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).json({ error: error.message });
  
  const mappedData = data.map(b => ({
    ...b,
    imageUrl: b.image_url,
    seoTitle: b.seo_title,
    seoDescription: b.seo_description,
    createdAt: b.created_at
  }));
  
  res.json(mappedData);
});

// Blog Create
app.post('/api/blogs', async (req, res) => {
  const newBlog = {
    title: req.body.title,
    slug: req.body.title.toLowerCase().replace(/\s+/g, '-'),
    summary: req.body.summary || '',
    content: req.body.content || '',
    author: req.body.author || 'Dealy KE Team',
    image_url: req.body.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
    tags: req.body.tags || [],
    seo_title: req.body.seoTitle || req.body.title,
    seo_description: req.body.seoDescription || req.body.summary,
  };
  
  const { data, error } = await supabase
    .from('blogs')
    .insert([newBlog])
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Admin config loads
app.get('/api/banners', async (req, res) => {
  const { data, error } = await supabase.from('banners').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/faqs', async (req, res) => {
  const { data, error } = await supabase.from('faqs').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/testimonials', async (req, res) => {
  const { data, error } = await supabase.from('testimonials').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Load click tracking logs (Admin)
app.get('/api/clicks', async (req, res) => {
  try {
    const { data, error } = await supabase.from('clicks').select('*, products(title, source)');
    
    if (error) {
      console.error('[Supabase Error] Fetching clicks with products:', error);
      const { data: simpleData, error: simpleError } = await supabase.from('clicks').select('*');
      if (simpleError) throw simpleError;
      
      const mappedData = simpleData.map(c => ({
        ...c,
        productId: c.product_id,
        productTitle: 'Unknown Product',
        productSource: 'JFORCE',
        referredBy: c.referred_by
      }));
      return res.json(mappedData);
    }
    
    const mappedData = data.map(c => ({
      ...c,
      productId: c.product_id,
      productTitle: c.products?.title || 'Unknown Product',
      productSource: c.products?.source || 'JFORCE',
      referredBy: c.referred_by
    }));
    
    res.json(mappedData);
  } catch (err: any) {
    console.error('[Server Error] clicks API:', err);
    res.status(500).json({ error: err.message });
  }
});

// Edit category (Admin)
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('categories')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete category (Admin)
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Edit FAQ (Admin)
app.put('/api/faqs/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('faqs')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create FAQ (Admin)
app.post('/api/faqs', async (req, res) => {
  const newFAQ = {
    question: req.body.question,
    answer: req.body.answer,
    active: req.body.active !== false
  };
  const { data, error } = await supabase.from('faqs').insert([newFAQ]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Delete FAQ (Admin)
app.delete('/api/faqs/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Edit Banner (Admin)
app.put('/api/banners/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('banners')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create Banner (Admin)
app.post('/api/banners', async (req, res) => {
  const newBanner = {
    image: req.body.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
    title: req.body.title || 'Untitled Banner',
    subtitle: req.body.subtitle || '',
    link: req.body.link || '/catalog',
    active: req.body.active !== false
  };
  const { data, error } = await supabase.from('banners').insert([newBanner]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Delete Banner (Admin)
app.delete('/api/banners/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Subscribers signup
app.post('/api/subscribers', async (req, res) => {
  const { email } = req.body;
  if (email) {
    await supabase.from('subscribers').upsert([{ email }]);
  }
  res.json({ success: true });
});

// Simulated referer logic
app.post('/api/referrals/signup', async (req, res) => {
  const { code, email } = req.body;
  // This would typically involve a referrals table
  res.json({ success: true });
});

// Restore/Reset demo data trigger
app.post('/api/import-demo', async (req, res) => {
  // This could be implemented to seed Supabase with DEFAULT_ constants
  res.json({ success: true, message: 'Seed logic triggered. Use schema.sql to setup tables first.' });
});

// Dynamic AI Shopping Assistant Route
app.post('/api/assistant', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // Fetch products for context
  const { data: products } = await supabase.from('products').select('*');
  const catalog = products || [];
  
  if (!aiClient) {
    // Elegant system fallback if API key is absent
    const budgetPhones = catalog.filter(p => p.price < 25000 && p.category === 'phones');
    const tecno = budgetPhones.find(p => p.title.toLowerCase().includes('spark 20'));
    const redmi = budgetPhones.find(p => p.title.toLowerCase().includes('redmi note 13'));
    const samsung = budgetPhones.find(p => p.title.toLowerCase().includes('galaxy a15'));
    
    let fallbackText = '';
    
    if (message.toLowerCase().includes('under 25') || message.toLowerCase().includes('under 25000') || message.toLowerCase().includes('budget')) {
      fallbackText = `Here are the top budget recommendations under KES 25,000 available on **Dealy KE**:
      
1.  **${redmi?.title || 'Xiaomi Redmi Note 13'}**
    *   **Price:** KES ${redmi?.price?.toLocaleString() || '23,499'} (Original: KES ${redmi?.original_price?.toLocaleString() || '26,999'})
    *   **Source:** JForce Reseller (Manual Fulfillment on Dealy KE)
    *   **Why Buy:** Exceptional 108MP camera paired with deep blacks of a 120Hz super AMOLED display. Robust 5000mAh battery supporting 33W logistics charging.
    
2.  **${samsung?.title || 'Samsung Galaxy A15 LTE'}**
    *   **Price:** KES ${samsung?.price?.toLocaleString() || '21,999'}
    *   **Source:** JForce Reseller
    *   **Why Buy:** Offers premium brand presence, superb AMOLED screen, long battery management and Knox Vault safety.
    
3.  **${tecno?.title || 'Tecno Spark 20 Pro'}**
    *   **Price:** KES ${tecno?.price?.toLocaleString() || '19,800'}
    *   **Source:** Twiva Affiliate (Instant Direct Buy)
    *   **Why Buy:** Extremely economic option pairing elegant speaker boxes with Helio G99 and 256GB secure storage.
    
*We can assist you to request delivery requests on these items immediately. Let me know if you want the JForce or Twiva link!*`;
    } else if (message.toLowerCase().includes('jforce') || message.toLowerCase().includes('jumia')) {
      fallbackText = `**JForce** is our manual fulfillment logistics network on Dealy KE. 
      
When you discover items flagged as **JFORCE** (like the *Xiaomi Redmi Note 13* or the *Sony Subwoofer*):
*   Click **"Request Order"** on the catalog detail page.
*   Provide your delivery location, phone number and additional notes.
*   Our administrative partners manually place the order through Jumia JForce and manage door-to-door delivery in Nairobi, passing discounts directly down.`;
    } else {
      fallbackText = `Welcome to **Dealy KE Assistant!** I am here to help you navigate our JForce deals and Twiva affiliate selections.
      
Ask me queries such as:
*   *"What are the best phones under KES 25,000?"*
*   *"Tell me how JForce manual delivery operates"*
*   *"Suggest a TV or Sound system deal on Dealy KE"*
      
Currently viewing **${catalog.length} catalog items** across JForce and Twiva.`;
    }
    
    res.json({ text: fallbackText });
    return;
  }
  
  try {
    // Construct rich context summarizing current deals
    const productsContext = catalog.map(p => {
      return `Product ID: ${p.id}, Title: ${p.title}, Category: ${p.category}, Price: KES ${p.price}, Source: ${p.source}, Rating: ${p.rating}, Specs: ${p.specifications?.join(' | ') || ''}`;
    }).join('\n');
    
    const prompt = `You are the Dealy KE AI Shopping Assistant, a polite, experienced Kenyan commerce advisor helping users find aggregation deals spanning the manual JForce network and Twiva affiliate lines.
    
We currently house the following active deals in our live catalog database:
${productsContext}

User Query: "${message}"

Rules:
1. Recommend actual products from our current list above where matching. If are talking about specific pricing constraints (e.g., under KES 25,000), list the products clearly with prices and source network (JFORCE vs TWIVA).
2. For JFORCE products, clarify that Dealy KE offers Jumia manual ordering with friendly door-to-door support.
3. For TWIVA products, mention they can complete the checkout directly on the affiliate partner platform.
4. Keep the tone friendly, polite, highlighting budget benefits and localized Kenyan shopping terms (like Nairobi delivery, KES pricing). Keep recommendations scannable!`;

    const chatHistory = history ? history.map((chat: any) => ({
      role: chat.role === 'user' ? 'user' : 'model',
      parts: [{ text: chat.text }]
    })) : [];

    const response = await aiClient.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini assistant integration error:', error);
    res.status(500).json({ error: 'AI Assistant was temporarily unable to generate advice. Fallback to offline advice rules.' });
  }
});

// Complete requested Prisma DB Schema Endpoint
app.get('/api/database/prisma-schema', (req, res) => {
  const prismaSchema = `// Prisma Database Schema Definition for Dealy KE
// Persists Deal aggregation, Affiliate Commerce click tracking & User Workspaces

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  GUEST
  CUSTOMER
  PARTNER
  ADMIN
}

enum ProductSource {
  JFORCE
  TWIVA
  MERCHANT
  AFFILIATE
}

enum OrderStatus {
  NEW
  CONTACTED
  PROCESSING
  ORDERED
  SHIPPED
  DELIVERED
  CANCELLED
}

model User {
  id             String         @id @default(uuid())
  email          String         @unique
  name           String
  passwordHash   String
  role           Role           @default(CUSTOMER)
  referralCode   String?        @unique @default(dbgenerated("concat('ref-', substring(md5(random()::text), 1, 6))"))
  referredBy     String?        // Code of the user who referred this customer
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  orders         Order[]
  reviews        Review[]
  wishlists      Wishlist[]
  referralsMade  Referral[]     @relation("Referrer")
  referralsRecv  Referral[]     @relation("ReferredUser")
  clicks         AffiliateClick[]
  notifications  Notification[]
  auditLogs      AuditLog[]
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  icon        String    @default("Category")
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
}

model Product {
  id             String         @id @default(uuid())
  title          String
  description    String
  specifications String[]
  price          Float
  originalPrice  Float?
  imageUrl       String
  source         ProductSource  @default(JFORCE)
  jforceSku      String?
  affiliateUrl   String?
  availability   Boolean        @default(true)
  featured       Boolean        @default(false)
  trending       Boolean        @default(false)
  topSeller      Boolean        @default(false)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  categoryId     String
  category       Category       @relation(fields: [categoryId], references: [id])
  orders         Order[]
  reviews        Review[]
  wishlists      Wishlist[]
  clicks         AffiliateClick[]
}

model Order {
  id               String       @id @default(uuid())
  quantity         Int          @default(1)
  customerName     String
  customerPhone    String
  deliveryLocation String
  notes            String?
  status           OrderStatus  @default(NEW)
  referredBy       String?      // Affiliate link tracker code
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  userId           String?
  user             User?        @relation(fields: [userId], references: [id])
  productId        String
  product          Product      @relation(fields: [productId], references: [id])
}

model Review {
  id          String   @id @default(uuid())
  rating      Int      @default(5)
  comment     String
  createdAt   DateTime @default(now())

  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  userName    String   @default("Guest Visitor")
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
}

model Wishlist {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

model AffiliateClick {
  id           String   @id @default(uuid())
  referredBy   String?  // Partner tag code
  timestamp    DateTime @default(now())

  userId       String?
  user         User?    @relation(fields: [userId], references: [id])
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
}

model Referral {
  id             String   @id @default(uuid())
  referralCode   String
  createdAt      DateTime @default(now())

  referrerId     String
  referrer       User     @relation("Referrer", fields: [referrerId], references: [id])
  referredUserId String   @unique
  referredUser   User     @relation("ReferredUser", fields: [referredUserId], references: [id])
}

model Blog {
  id             String   @id @default(uuid())
  title          String
  slug           String   @unique
  summary        String
  content        String
  author         String   @default("Dealy KE Admin")
  imageUrl       String   @default("https://images.unsplash.com/photo-1542751371-adc38448a05e")
  tags           String[]
  seoTitle       String?
  seoDescription String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Notification {
  id        String   @id @default(uuid())
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

model Settings {
  id        String   @id @default(uuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}

model Analytics {
  id        String   @id @default(uuid())
  date      DateTime @unique @default(dbgenerated("CURRENT_DATE"))
  clicks    Int      @default(0)
  orders    Int      @default(0)
  revenue   Float    @default(0.0)
  signups   Int      @default(0)
}

model AuditLog {
  id        String   @id @default(uuid())
  action    String
  details   String
  createdAt DateTime @default(now())

  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
}
`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(prismaSchema);
});

// Set up server-side routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only start listening if not in Vercel/serverless environment
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`[Dealy KE] Running on http://localhost:${PORT}`);
    });
  }
}

startServer();
