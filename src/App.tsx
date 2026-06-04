/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ArrowRight, ChevronRight, ChevronLeft, Check, X, Heart, Share2, Star, 
  MessageSquare, Plus, Edit, Trash2, Users, TrendingUp, Coins, 
  ArrowUpRight, BookOpen, AlertCircle, ThumbsUp, Compass, Filter, 
  SlidersHorizontal, Bot, Send, RefreshCw, Clock, User, MapPin, 
  Phone, Globe, FileJson, CheckCircle2, ShoppingBag, Eye,
  ChevronDown, CheckSquare, Calendar, Award, Copy, HelpCircle, EyeOff
} from 'lucide-react';
import { UserRole, ProductSource, OrderStatus, Product, Category, Order, Review, Blog, HomepageBanner, FAQ, Testimonial, AppNotification, AffiliateClick } from './types';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabase';

export default function App() {
  // Roles & Tab states
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.GUEST);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('landing');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [clicks, setClicks] = useState<AffiliateClick[]>([]);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<Partial<FAQ> | null>(null);
  const [editingBanner, setEditingBanner] = useState<Partial<HomepageBanner> | null>(null);
  
  // Filtering & Sorting status
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(100000);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Active/Detail views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);
  
  // Forms & Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalAdminMode, setLoginModalAdminMode] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    qty: 1,
    name: 'Moses Mwai',
    email: 'mosesmwai@gmail.com',
    phone: '0712345678',
    location: 'Milimani, Nairobi',
    notes: 'Please expedite logistics. Calling on reach.'
  });
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    name: 'Jane Wambui'
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [orderStatusFeedback, setOrderStatusFeedback] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // AI assistant state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiHistory, setAiHistory] = useState<Array<{role: string; text: string; linkProduct?: Product}>>([
    { role: 'model', text: 'Jambo! I am your Kenyan Curated Shopping assistant. Ask me to find "cheap phones under KES 25,000" or compare JForce logistics & Twiva bargains instantly!' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Admin Editing Modes
  const [adminPanel, setAdminPanel] = useState<'products' | 'orders' | 'blogs' | 'categories' | 'faqs' | 'banners' | 'seo' | 'notifications' | 'analytics'>('products');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);
  const [seoViewingProduct, setSeoViewingProduct] = useState<Product | null>(null);
  const [orderDateFilter, setOrderDateFilter] = useState<'today' | 'weekly' | 'all'>('today');
  
  // Partner custom redirect link builder
  const [partnerProductChoice, setPartnerProductChoice] = useState<string>('');
  const [partnerRefCode, setPartnerRefCode] = useState<string>('moses');
  const [demoResetMsg, setDemoResetMsg] = useState(false);
  
  // SEO Deep Link Parsing on mount/update
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product');
      const blogSlug = params.get('blog');
      const ref = params.get('ref');

      if (ref) {
        setPartnerRefCode(ref);
      }

      if (prodId) {
        const found = products.find(p => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setActiveTab('catalog');
        }
      } else if (blogSlug && blogs.length > 0) {
        const found = blogs.find(b => b.slug === blogSlug);
        if (found) {
          setActiveBlog(found);
          setActiveTab('blogs');
        }
      }
    }
  }, [products, blogs]);

  // Sync state variables back to browser search query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let changed = false;

    if (selectedProduct) {
      if (params.get('product') !== selectedProduct.id) {
        params.set('product', selectedProduct.id);
        params.delete('blog');
        changed = true;
      }
    } else {
      if (params.has('product')) {
        params.delete('product');
        changed = true;
      }
    }

    if (activeBlog) {
      if (params.get('blog') !== activeBlog.slug) {
        params.set('blog', activeBlog.slug);
        params.delete('product');
        changed = true;
      }
    } else {
      if (params.has('blog')) {
        params.delete('blog');
        changed = true;
      }
    }

    if (partnerRefCode && partnerRefCode !== 'moses') {
      if (params.get('ref') !== partnerRefCode) {
        params.set('ref', partnerRefCode);
        changed = true;
      }
    }

    if (changed) {
      const newSearch = params.toString() ? `?${params.toString()}` : '';
      const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`;
      window.history.replaceState({ ...window.history.state }, '', newUrl);
    }
  }, [selectedProduct, activeBlog, partnerRefCode]);

  // Dynamic SEO Metadata & JSON-LD structured schema script injector
  useEffect(() => {
    const siteBaseUrl = window.location.origin;
    let seoTitle = "Dealy KE - Discover Premium Jumia & Twiva Affiliate Deals Kenya";
    let seoDesc = "Compare amazing product discounts on hot smartphones, electronics, smart hubs, and fashion drops in Kenya. Discover local partner logistical benefits today with Dealy KE.";
    let seoKeywords = "Jumia discounts Kenya, Twiva affiliates Nairobi, cheap phones Nairobi, online electronics shopping, reseller dropshipping Kenya";
    let seoImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"; // standard tech / retail banner
    let currentUrl = window.location.href;
    let schemaMarkup: any = null;

    // Determine metadata based on active page or selected item
    if (selectedProduct) {
      const formattedPrice = `KES ${selectedProduct.price.toLocaleString()}`;
      seoTitle = `${selectedProduct.title} for ${formattedPrice} | Jumia & Twiva Affiliate Deals - Dealy KE`;
      seoDesc = `Buy ${selectedProduct.title} online at best price: ${formattedPrice} in Nairobi. Features include: ${selectedProduct.specifications.slice(0, 3).join(', ')}. Read customer ratings (${selectedProduct.rating}/5) and live shipping tracking comments.`;
      seoKeywords = `${selectedProduct.title}, buy ${selectedProduct.title} Kenya, cheap ${selectedProduct.category}, Jumia online deals Nairobi, ${selectedProduct.specifications.join(', ')}`;
      seoImage = selectedProduct.imageUrl;
      currentUrl = `${siteBaseUrl}/?product=${selectedProduct.id}`;
      
      schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": selectedProduct.title,
        "image": selectedProduct.imageUrl,
        "description": selectedProduct.description,
        "sku": selectedProduct.jforceSku || `TWIVA-PROD-${selectedProduct.id}`,
        "mpn": selectedProduct.id,
        "category": selectedProduct.category,
        "brand": {
          "@type": "Brand",
          "name": selectedProduct.source === 'JFORCE' ? "Jumia" : "Twiva Merchant Affiliate"
        },
        "offers": {
          "@type": "Offer",
          "url": currentUrl,
          "priceCurrency": "KES",
          "price": selectedProduct.price,
          "itemCondition": "https://schema.org/NewCondition",
          "availability": selectedProduct.availability ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "priceValidUntil": "2027-12-31"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": selectedProduct.rating,
          "reviewCount": selectedProduct.reviewsCount || 15,
          "bestRating": "5",
          "worstRating": "1"
        }
      };
    } else if (activeBlog) {
      seoTitle = `${activeBlog.seoTitle || activeBlog.title} | Smart Nairobi Shopper Guide - Dealy KE`;
      seoDesc = activeBlog.seoDescription || activeBlog.summary || `Read expert shopping guide on ${activeBlog.title}. Author: ${activeBlog.author}. Find shopping shortcuts, reseller tips, and hot bargains in Kenya.`;
      seoKeywords = `${activeBlog.tags.join(', ')}, shopping advice Kenya, Nairobi buying guide, dropshipping secrets Jumia`;
      seoImage = activeBlog.imageUrl;
      currentUrl = `${siteBaseUrl}/?blog=${activeBlog.slug}`;

      schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": activeBlog.title,
        "description": activeBlog.seoDescription || activeBlog.summary,
        "image": activeBlog.imageUrl,
        "author": {
          "@type": "Person",
          "name": activeBlog.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Dealy KE",
          "logo": {
            "@type": "ImageObject",
            "url": `${siteBaseUrl}/icon.png`
          }
        },
        "datePublished": activeBlog.createdAt,
        "dateModified": activeBlog.createdAt,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": currentUrl
        }
      };
    } else {
      // General Tab based metadata
      switch(activeTab) {
        case 'catalog':
          seoTitle = "Official Product Discount Catalog | Cheap Smartphone Bargains Nairobi - Dealy KE";
          seoDesc = "Browse the absolute lowest prices on verified Jumia exclusive phone models and Twiva network drop catalog items in Kenya. Compare features and reviews instantly.";
          seoKeywords = "Jumia catalog Kenya, cheap smartphones Nairobi, online reseller mall, Twiva affiliate catalog, verified discount electronics";
          break;
        case 'blogs':
          seoTitle = "Smart Buyer Guides & Dropshipping Tips Kenya - Dealy KE Editorial";
          seoDesc = "Read premium buyer reviews, side-by-side technology comparisons, and tutorial articles detailing how to generate reseller commissions using Jumia/Twiva affiliate programs.";
          seoKeywords = "shopping blogs Nairobi, buy tips Kenya, ecommerce guides, Twiva instructions, Jumia agent commission guides";
          break;
        case 'customer-desk':
          seoTitle = "Help Center, Courier Delivery Status & AI Shopping Agent - Dealy KE";
          seoDesc = "Track active shipping workflows, register logistics notes, ask our interactive AI assistant about budget phones, and check customer feedback queues.";
          seoKeywords = "track Jumia package Nairobi, Kenya logistics tracker, AI customer bot, delivery partner customer care";
          break;
        case 'partner-desk':
          seoTitle = "Affiliate Reseller Dashboard & Custom Tracking Generator - Dealy KE";
          seoDesc = "Generate premium customized referral links, monitor client click logs, study estimated commissions, and scale your automated social media reseller workflow in Nairobi.";
          seoKeywords = "make money online Kenya, dropship partner Nairobi, Twiva custom link builder, affiliate commissions tracker";
          break;
        case 'admin-desk':
          seoTitle = "Master CMS Panel & Live Analytics Logs - Dealy KE Admin";
          seoDesc = "Secure backend interface to add products, modify shopping blog postings, edit FAQ lists, and monitor live affiliate conversions.";
          seoKeywords = "cms panel, shop backend, database analytics, admin control logs";
          break;
        default: // landing
          seoTitle = "Dealy KE - Discover Premium Jumia & Twiva Affiliate Deals Kenya";
          seoDesc = "Compare amazing product discounts on hot smartphones, electronics, smart hubs, and fashion drops in Kenya. Discover local partner logistical benefits today with Dealy KE.";
          break;
      }

      // FAQ and website JSON-LD schema combination
      const activeFaqs = faqs.filter(f => f.active);
      const faqSchema = activeFaqs.length > 0 ? {
        "@type": "FAQPage",
        "mainEntity": activeFaqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      } : null;

      schemaMarkup = [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Dealy KE",
          "url": siteBaseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteBaseUrl}/?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Dealy KE",
          "image": seoImage,
          "priceRange": "KES 500 - KES 100000",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Moi Avenue, CBD",
            "addressLocality": "Nairobi",
            "addressRegion": "Nairobi County",
            "postalCode": "00100",
            "addressCountry": "KE"
          },
          "telephone": "+254700000000"
        }
      ];
      if (faqSchema) {
        schemaMarkup.push(faqSchema);
      }
    }

    // Apply updates
    document.title = seoTitle;

    // Helper functions
    const setMetaTag = (attr: string, val: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLinkTag = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Standard SEO Tags
    setMetaTag('name', 'description', seoDesc);
    setMetaTag('name', 'keywords', seoKeywords);
    
    // Open Graph / Social Tags
    setMetaTag('property', 'og:title', seoTitle);
    setMetaTag('property', 'og:description', seoDesc);
    setMetaTag('property', 'og:image', seoImage);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', selectedProduct ? 'music.song' : (activeBlog ? 'article' : 'website'));

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seoTitle);
    setMetaTag('name', 'twitter:description', seoDesc);
    setMetaTag('name', 'twitter:image', seoImage);

    // Canonical link tag
    setLinkTag('canonical', currentUrl);

    // JSON-LD dynamic injector
    let scriptEl = document.getElementById('seo-json-ld');
    if (scriptEl) {
      scriptEl.remove();
    }
    scriptEl = document.createElement('script');
    scriptEl.id = 'seo-json-ld';
    scriptEl.setAttribute('type', 'application/ld+json');
    scriptEl.innerHTML = JSON.stringify(schemaMarkup, null, 2);
    document.head.appendChild(scriptEl);

  }, [activeTab, selectedProduct, activeBlog, faqs, products]);

  // Load database arrays and setup auth listeners
  useEffect(() => {
    fetchData();

    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        // Don't downgrade admin if already set
        setCurrentRole((prev) => prev === UserRole.ADMIN ? prev : ((session.user.user_metadata?.role as UserRole) || UserRole.CUSTOMER));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        // Only update current role from metadata if it's not already ADMIN
        setCurrentRole((prev) => prev === UserRole.ADMIN ? prev : ((session.user.user_metadata?.role as UserRole) || UserRole.CUSTOMER));
      } else {
        setUser(null);
        setCurrentRole(UserRole.GUEST);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle Admin routing separately based on currentRole and window location
  useEffect(() => {
    const checkAdminPath = () => {
      if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
        if (currentRole !== UserRole.ADMIN) {
          setLoginModalAdminMode(true);
          setIsLoginModalOpen(true);
        } else {
          setIsLoginModalOpen(false);
          setActiveTab('admin-desk');
        }
      }
    };

    checkAdminPath();
    
    // Also listen for popstate if user uses back/forward buttons
    window.addEventListener('popstate', checkAdminPath);
    return () => window.removeEventListener('popstate', checkAdminPath);
  }, [currentRole]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiHistory]);

  // Slideshow auto-advance timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    const fetchSafe = async (url: string, setter: (data: any) => void) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
        const data = await res.json();
        setter(data);
      } catch (e) {
        console.error(`[Fetch Error] ${url}:`, e);
      }
    };

    await Promise.all([
      fetchSafe('/api/products', setProducts),
      fetchSafe('/api/categories', setCategories),
      fetchSafe('/api/blogs', setBlogs),
      fetchSafe('/api/faqs', setFaqs),
      fetchSafe('/api/testimonials', setTestimonials),
      fetchSafe('/api/orders', setOrders),
      fetchSafe('/api/reviews', setReviews),
      fetchSafe('/api/notifications', setNotifications),
      fetchSafe('/api/banners', setBanners),
      fetchSafe('/api/clicks', (data) => data && setClicks(data)),
      fetchSafe(`/api/wishlist/${user?.id || 'GUEST'}`, setWishlist)
    ]);
  };

  const syncReviews = async () => {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    setReviews(data);
  };

  const syncOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const syncNotifications = async () => {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    setNotifications(data);
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleWishlist = async (prodId: string) => {
    if (!user) {
      setLoginModalAdminMode(false);
      setIsLoginModalOpen(true);
      showToast('Please sign in to save items to your wishlist.');
      return;
    }

    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId: prodId })
      });
      const data = await res.json();
      setWishlist(data);
      if (data.includes(prodId)) {
        showToast('Successfully saved item to your curated wishlist!');
      } else {
        showToast('Removed item from your wishlist.');
      }
    } catch (e) {
      showToast('Please register or log in to customize wishlists.');
    }
  };

  // Click tracking (Twiva Affiliate)
  const trackClick = async (product: Product) => {
    try {
      await fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, referredBy: partnerRefCode })
      });
      fetchData(); // reload clicks Count
      showToast(`Redirecting to affiliate URL for: ${product.title}`);
      
      // Open Twiva link in new Tab beautifully
      if (product.affiliateUrl) {
        window.open(product.affiliateUrl, '_blank');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit JForce manually requested order
  const handleJforceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (currentRole === UserRole.GUEST) {
      setIsOrderModalOpen(false);
      setLoginModalAdminMode(false);
      setIsLoginModalOpen(true);
      showToast('Please sign in to place an order request.');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: orderForm.qty,
          customerName: orderForm.name,
          customerPhone: orderForm.phone,
          customerEmail: orderForm.email,
          deliveryLocation: orderForm.location,
          notes: orderForm.notes,
          referredBy: partnerRefCode || undefined
        })
      });
      
      if (response.ok) {
        // Construct detailed WhatsApp message including parameters and URL
        const productUrl = `${window.location.origin}/?product=${selectedProduct.id}`;
        const skuInfo = selectedProduct.jforceSku ? `*SKU Code:* ${selectedProduct.jforceSku}\n` : '';
        const partnerInfo = partnerRefCode ? `*Referred By (Partner):* ${partnerRefCode}\n` : '';
        
        const messageText = `*Dealy KE - New Order Request*\n` +
          `===========================\n\n` +
          `Greetings Dealy KE Team,\n` +
          `I would like to place an order request with the following details:\n\n` +
          `• *Selected Product:* ${selectedProduct.title}\n` +
          `• *Estimated Price:* KES ${selectedProduct.price.toLocaleString()}\n` +
          `• *Quantity Required:* ${orderForm.qty} pcs\n` +
          `• *Total Estimated Value:* KES ${(selectedProduct.price * orderForm.qty).toLocaleString()}\n` +
          skuInfo +
          partnershipInfo(partnerInfo) +
          `\n*CUSTOMER DETAILS*\n` +
          `---------------------------\n` +
          `• *Name:* ${orderForm.name || 'Moses Mwai'}\n` +
          `• *Email:* ${orderForm.email || 'mosesmwai609@gmail.com'}\n` +
          `• *WhatsApp Phone:* ${orderForm.phone}\n` +
          `• *Delivery Location:* ${orderForm.location}\n` +
          `• *Special Instructions:* ${orderForm.notes || 'N/A'}\n\n` +
          `*App Product Link:* ${productUrl}`;

        const encodedMessage = encodeURIComponent(messageText);
        const whatsappUrl = `https://wa.me/254755442515?text=${encodedMessage}`;

        setOrderStatusFeedback('success');
        syncOrders();
        syncNotifications();
        showToast('Your order has been recorded! Opening WhatsApp to details transfer...');
        
        // Open WhatsApp directly
        window.open(whatsappUrl, '_blank');

        setTimeout(() => {
          setIsOrderModalOpen(false);
          setOrderStatusFeedback(null);
        }, 4000);
      }
    } catch (e) {
      showToast('Could not record order. Please retry.');
    }
  };

  // Helper inside helper
  function partnershipInfo(info: string) {
    return info || '';
  }

  // Review Submissions
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          userName: reviewForm.name,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment
        })
      });
      
      if (response.ok) {
        setReviewForm({ rating: 5, comment: '', name: 'Jane Wambui' });
        syncReviews();
        showToast('Review shared successfully!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Client side search and category filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSource = selectedSource === 'all' || p.source === selectedSource;
    const matchesPrice = p.price <= priceMax;
    return matchesSearch && matchesCategory && matchesSource && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'popularity') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'price-low-high') return a.price - b.price;
    if (sortBy === 'price-high-low') return b.price - a.price;
    return 0;
  });

  // AI assistant integration
  const askAIAgent = async () => {
    if (!aiInput.trim()) return;
    const userText = aiInput;
    setAiHistory(prev => [...prev, { role: 'user', text: userText }]);
    setAiInput('');
    setAiLoading(true);
    
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: aiHistory.map(h => ({ role: h.role === 'model' ? 'model' : 'user', text: h.text }))
        })
      });
      const data = await response.json();
      
      // Match if assistant is discussing some active product
      let linkProductObj: Product | undefined = undefined;
      const lowerReply = data.text.toLowerCase();
      const matchedProd = products.find(p => lowerReply.includes(p.title.toLowerCase()) || lowerReply.includes(p.id.toLowerCase()));
      if (matchedProd) {
        linkProductObj = matchedProd;
      }
      
      setAiHistory(prev => [...prev, { role: 'model', text: data.text, linkProduct: linkProductObj }]);
    } catch (e) {
      setAiHistory(prev => [...prev, { role: 'model', text: 'Sorry, I am having basic server lag. Re-submit your shopping query!' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Newsletter Submit
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      setNewsletterSubscribed(true);
      showToast('Jambo! Thank you for joining Dealy KE Curations.');
    } catch (e) {
      console.error(e);
    }
  };

  // Platform admin reset trigger
  const triggerDemoImport = async () => {
    try {
      const res = await fetch('/api/import-demo', { method: 'POST' });
      if (res.ok) {
        setDemoResetMsg(true);
        fetchData();
        setTimeout(() => setDemoResetMsg(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin CRUD for Products
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const isNew = !editingProduct.id;
    const url = isNew ? '/api/products' : `/api/products/${editingProduct.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        showToast(`Product ${isNew ? 'created' : 'modified'} smoothly!`);
        setEditingProduct(null);
        fetchData();
      }
    } catch (e) {
      showToast('Error saving product parameters.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this curated deal permanently?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Curated item deleted successfully.');
        fetchData();
      }
    } catch (e) {
      showToast('Error deleting item.');
    }
  };

  // Admin Order Status Shifts
  const handleOrderStatusShift = async (id: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Order status updated to: ${newStatus}`);
        syncOrders();
      }
    } catch (e) {
      showToast('Failed to shift JForce state.');
    }
  };

  // Blog creation CMS
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBlog)
      });
      if (res.ok) {
        showToast('Beautiful comparison buying guide has been spawned!');
        setEditingBlog(null);
        fetchData();
      }
    } catch (e) {
      showToast('Error saving blog article.');
    }
  };

  // Category management CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const isNew = !editingCategory.id;
    const url = isNew ? '/api/categories' : `/api/categories/${editingCategory.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      });
      if (res.ok) {
        showToast(`Category ${isNew ? 'registered' : 'modified'} successfully.`);
        setEditingCategory(null);
        fetchData();
      }
    } catch (e) {
      showToast('Error saving category coordinates.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this product category permanently?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Category deleted successfully.');
        fetchData();
      } else {
        showToast('Could not delete category. Please check dependency products.');
      }
    } catch (e) {
      showToast('Error deleting category.');
    }
  };

  // FAQ management CRUD
  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFAQ) return;
    const isNew = !editingFAQ.id;
    const url = isNew ? '/api/faqs' : `/api/faqs/${editingFAQ.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFAQ)
      });
      if (res.ok) {
        showToast(`FAQ ${isNew ? 'created' : 'modified'} successfully.`);
        setEditingFAQ(null);
        fetchData();
      }
    } catch (e) {
      showToast('Error saving FAQ item.');
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!window.confirm('Delete this active FAQ entry?')) return;
    try {
      const res = await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('FAQ deleted successfully.');
        fetchData();
      }
    } catch (e) {
      showToast('Error deleting FAQ.');
    }
  };

  // Banner management CRUD
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    const isNew = !editingBanner.id;
    const url = isNew ? '/api/banners' : `/api/banners/${editingBanner.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner)
      });
      if (res.ok) {
        showToast(`Homepage banner ${isNew ? 'loaded' : 'updated'} successfully.`);
        setEditingBanner(null);
        fetchData();
      }
    } catch (e) {
      showToast('Error saving banner values.');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Remove this promotional banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Banner deleted successfully.');
        fetchData();
      }
    } catch (e) {
      showToast('Error deleting banner.');
    }
  };

  // Quick statistics for Partners
  const getPartnerMetrics = () => {
    // filter clicks and orders attributed to partner tag
    const matchingClicks = orders.length * 3 + wishlist.length; // simulated clicks index
    const matchingSignups = wishlist.length + 1;
    const matchingOrders = orders.filter(o => o.notes?.includes('Ref') || o.referredBy === partnerRefCode);
    const estCommission = (matchingOrders.length * 1200) + (matchingClicks * 15);
    
    return {
      clicks: matchingClicks,
      signups: matchingSignups,
      orders: matchingOrders.length || 1,
      commission: estCommission || 2450
    };
  };

  const partnerStats = getPartnerMetrics();

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBFA] text-[#121212] font-sans antialiased">
      {/* Toast Feedback popup */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-[#121212] text-white py-3.5 px-6 rounded-none shadow-xl border border-zinc-700 animate-slide-in font-mono text-xs">
          <span className="h-2 w-2 rounded-full bg-[#D9411E] animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global curated navigation header styled under Editorial Guidelines */}
      <Header 
        currentRole={currentRole}
        onRoleChange={async (role) => {
          if (role === UserRole.GUEST) {
            await supabase.auth.signOut();
            showToast('Signed out successfully.');
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        onSearch={(term) => {
          setSearchTerm(term);
          setActiveTab('catalog');
        }}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProduct(null);
          setActiveBlog(null);
        }}
        wishlistCount={wishlist.length}
        onOpenAssistant={() => setAiOpen(true)}
        onOpenLogin={() => {
          setLoginModalAdminMode(false);
          setIsLoginModalOpen(true);
        }}
      />

      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginModalAdminMode(false);
        }} 
        initialAdminMode={loginModalAdminMode}
        onAuthSuccess={(user, role) => {
          setUser(user);
          setCurrentRole(role);
          if (role === UserRole.ADMIN) {
            setActiveTab('admin-desk');
          } else {
            setActiveTab('catalog');
          }
          showToast(`Welcome back, ${user.user_metadata?.full_name || user.email}!`);
        }}
      />

      {/* Dynamic Main Viewport area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* TAB 1: LANDING PAGE PORT */}
        {activeTab === 'landing' && (
          <div className="space-y-16">
            
            {/* Elegant Asymmetric Hero Banner (Editorial Blueprint) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-[#121212]/15 pb-10">
              <div className="lg:col-span-3 space-y-6">
                <div>
                  <p className="font-sans text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#D9411E] italic">
                    Kenyan Commerce Aggregator
                  </p>
                  <p className="font-serif text-xs text-zinc-400 mt-1 uppercase tracking-wider font-bold">
                    Dealy KE Spotlight
                  </p>
                </div>
                
                {/* Embedded quick search & Assistant call */}
                <div className="space-y-3">
                  <p className="text-[11px] text-zinc-650 font-sans leading-normal font-medium">
                    Search curated catalog items:
                  </p>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search phones, soundbars, fashion..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setActiveTab('catalog')}
                      className="w-full bg-white border border-[#121212]/20 px-3 py-2 text-xs focus:outline-none focus:border-[#D9411E] rounded-none font-sans"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-450 text-zinc-400" />
                  </div>
                  <button 
                    onClick={() => setActiveTab('catalog')}
                    className="w-full bg-[#121212] hover:bg-opacity-80 text-white py-2 text-xs font-mono tracking-widest uppercase transition-all select-none cursor-pointer"
                  >
                    Explore drops
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 pt-1 text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-[#D9411E] shrink-0" /> JUMIA PARTNER COURIER</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-[#D9411E] shrink-0" /> TWIVA CORRELATING LOGS</span>
                </div>

                {/* SMALL BOX DISPLAY FOR ADS */}
                <div className="pt-4 border-t border-[#121212]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono leading-none tracking-widest text-[#D9411E] font-extrabold bg-red-50 px-1.5 py-0.5 border border-red-200">
                      SPONSORED AD
                    </span>
                    <span className="text-[8px] font-mono text-zinc-400">PARTNER CAMPAIGN</span>
                  </div>
                  
                  <div 
                    onClick={() => {
                      setSelectedCategory('phones');
                      setActiveTab('catalog');
                      showToast('Redirected to sponsored Tecno Phantom deal catalog!');
                    }}
                    className="group/ad bg-gradient-to-br from-amber-50/50 to-orange-50/50 hover:from-orange-50 hover:to-amber-50 border border-amber-200 hover:border-[#D9411E] py-5 px-3 text-left transition-all duration-300 cursor-pointer relative overflow-hidden"
                  >
                    {/* Tiny decorative watermark */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover/ad:scale-110 transition duration-500">
                      <ShoppingBag className="h-16 w-16 text-black" />
                    </div>
                    
                    <div className="flex items-start gap-2.5">
                      <div className="h-10 w-10 shrink-0 bg-white border border-amber-200 overflow-hidden relative">
                        <img 
                          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100" 
                          alt="Tecno Promotion" 
                          className="w-full h-full object-cover grayscale group-hover/ad:grayscale-0 transition duration-500"
                        />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-serif font-black text-[11px] text-[#121212] tracking-tight truncate flex items-center gap-1">
                          Safaricom 5G + Phantom V Fold
                          <ArrowUpRight className="h-2.5 w-2.5 text-[#D9411E] opacity-0 group-hover/ad:opacity-100 transition duration-300" />
                        </h4>
                        <p className="text-[10px] text-zinc-500 leading-tight font-sans text-ellipsis line-clamp-2">
                          Get complimentary 50GB local JForce data bundle with active serial keying validations.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between text-[9px] font-mono border-t border-amber-200/50 pt-2 text-[#D9411E] font-bold">
                      <span className="uppercase tracking-tighter">CLAIM AIRTIME BONUS</span>
                      <span className="bg-[#D9411E] text-white px-1 py-0.2 text-[8px] uppercase tracking-wider font-extrabold group-hover/ad:bg-[#121212] transition duration-300">
                        KES 0.00 SIM
                      </span>
                    </div>
                  </div>
                </div>

                {/* DEALY KE BRANDED SHOWCASE BANNER */}
                <div className="pt-4 border-t border-[#121212]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono leading-none tracking-widest text-zinc-500 font-extrabold px-1 py-0.5 bg-zinc-100 border border-zinc-250">
                      PARTNER HIGHLIGHT
                    </span>
                    <span className="text-[8px] font-mono text-[#D9411E] font-bold animate-pulse">● LIVE VERIFIED</span>
                  </div>
                  <div className="border border-[#121212]/10 bg-[#FCFBFA] p-1.5 hover:border-black transition-all">
                    <img 
                      src="/src/assets/images/herodealy.png" 
                      alt="DealyKE - Your Smart Way to Shop & Save" 
                      className="w-full h-auto object-cover border border-[#121212]/5"
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                </div>

              </div>

              {/* Banner Carousel image side with Slide View (Hero Slideshow for Deals, Offers, Promotions) */}
              <div id="hero-slide-view-container" className="lg:col-span-9 relative flex flex-col bg-white border border-[#121212]/15 selection:bg-[#D9411E]/10 overflow-hidden group">
                {/* Image Container with navigation overlays */}
                <div className="aspect-[4/3] bg-zinc-50 relative overflow-hidden">
                  {/* Map over the slides with active index display for elegant crossfade */}
                  {[
                    {
                      tag: "DEAL OF THE WEEK",
                      title: banners[0]?.title || "Nairobi Technology Specials",
                      subtitle: banners[0]?.subtitle || "Compare manual JForce price reductions and affiliate Twiva bargains instantly.",
                      image: banners[0]?.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
                      badge: "3,000 KES OFF",
                      themeBg: "text-rose-700 bg-rose-50 border-rose-200/50",
                      code: "DEALY20"
                    },
                    {
                      tag: "FLASH OFFER",
                      title: banners[1]?.title || "Kenyan Technology Drops",
                      subtitle: "Compare premium electronics, smart TVs, and active appliances under partner cost.",
                      image: banners[1]?.image || "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800",
                      badge: "UP TO 30% OFF",
                      themeBg: "text-[#D9411E] bg-orange-50 border-orange-200/50",
                      code: "JFORCE30"
                    },
                    {
                      tag: "NEW PROMOTION",
                      title: "Home Broadband & Smart Hubs",
                      subtitle: "Enterprise-grade 4G/5G receivers and neon power packs custom aggregation.",
                      image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&q=80&w=800",
                      badge: "SPECIAL SCHEME",
                      themeBg: "text-emerald-700 bg-emerald-50 border-emerald-200/50",
                      code: "NEONBNDL"
                    },
                    {
                      tag: "EXPIRED DEAL EXTENSION",
                      title: "Boutique Fashion & Accessories",
                      subtitle: "Handpicked premium apparel drops sourced from Twiva shopper partner channels.",
                      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
                      badge: "TWIVA AGGREGATE",
                      code: "STYLEPORTAL",
                      themeBg: "text-indigo-700 bg-indigo-50 border-indigo-200/50"
                    }
                  ].map((slide, idx) => (
                    <div 
                      key={idx}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        idx === currentSlideIndex 
                          ? "opacity-100 scale-100 pointer-events-auto z-10" 
                          : "opacity-0 scale-95 pointer-events-none z-0"
                      }`}
                    >
                      <img 
                        src={slide.image} 
                        alt={slide.title} 
                        className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-110"
                      />
                      {/* Interactive Offer Sticker */}
                      <div className="absolute top-4 right-4 z-20">
                        <span className="text-[9px] font-mono font-extrabold uppercase bg-black text-white px-2.5 py-1 border border-white/20 shadow-lg tracking-wider">
                          {slide.badge}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Manual Arrow Controls */}
                  <button 
                    onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + 4) % 4)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-black p-1.5 rounded-none shadow-md border border-[#121212]/10 transition-all hover:scale-105 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Previous Deal"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button 
                    onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % 4)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-black p-1.5 rounded-none shadow-md border border-[#121212]/10 transition-all hover:scale-105 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Next Deal"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Indicator Dots overlay */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {[0, 1, 2, 3].map((dot) => (
                      <button
                        key={dot}
                        onClick={() => setCurrentSlideIndex(dot)}
                        className={`h-1.5 transition-all duration-300 rounded-none cursor-pointer ${
                          dot === currentSlideIndex ? "w-6 bg-[#D9411E]" : "w-1.5 bg-white/60 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Info and Details Area below */}
                <div className="p-3 border-t border-[#121212]/10 bg-white flex justify-center items-center">
                  {(() => {
                    const activeSlide = [
                      { tag: "phones" },
                      { tag: "electronics" },
                      { tag: "electronics" },
                      { tag: "fashion" }
                    ][currentSlideIndex];

                    return (
                      <button
                        onClick={() => {
                          setSelectedCategory(activeSlide.tag);
                          setActiveTab('catalog');
                          showToast(`Loaded promotional category channel!`);
                        }}
                        className="bg-black hover:bg-[#D9411E] text-white py-2.5 px-4 text-[10px] uppercase font-mono tracking-widest font-bold transition text-center select-none cursor-pointer w-full text-center"
                      >
                        Claim Promotional Deal
                      </button>
                    );
                  })()}
                </div>
              </div>
            </section>

            {/* Micro Category Tag Grid */}
            <section className="space-y-4">
              <div className="flex justify-between items-baseline border-b border-[#121212]/15 pb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#D9411E] font-bold">COMMERCE SHELVES</span>
                <span className="text-xs text-zinc-500 font-sans italic">Curated catalog tags</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-3">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.slug);
                      setActiveTab('catalog');
                    }}
                    className="border border-[#121212]/10 bg-white hover:border-[#D9411E] px-3 py-3 text-center transition group rounded-none"
                  >
                    <span className="block text-xs uppercase font-bold tracking-tight text-[#111] group-hover:text-[#D9411E]">
                      {c.name}
                    </span>
                    <span className="block text-[8px] tracking-widest uppercase text-zinc-400 mt-0.5 font-mono">
                      VIEW DRIPS
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Curated Drops & Curated Deals grid */}
            <section className="space-y-6">
              <div className="flex justify-between items-end border-b border-[#121212]/15 pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#D9411E] font-extrabold">LIMITED STOCK DEALS</p>
                  <h2 className="font-serif text-3xl font-bold mt-1 text-[#121212]">Trending Curation</h2>
                </div>
                <button 
                  onClick={() => setActiveTab('catalog')} 
                  className="font-mono text-[10px] font-bold uppercase tracking-widest border-b border-[#121212] pb-0.5 hover:text-[#D9411E]"
                >
                  View All Drops
                </button>
              </div>

              {/* Showcase 4 premium visual cards displaying different sources */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {products.filter(p => p.featured).slice(0, 4).map((product) => (
                  <div 
                    key={product.id}
                    className="group flex flex-col border border-[#121212]/10 bg-white self-stretch tracking-tight relative cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Upper badge matching source network */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`text-[8px] font-mono tracking-widest font-extrabold uppercase px-2 py-1 shadow-sm border ${
                        product.source === ProductSource.JFORCE 
                          ? 'bg-white text-zinc-900 border-zinc-900' 
                          : 'bg-[#D9411E] text-white border-[#D9411E]'
                      }`}>
                        {product.source === ProductSource.JFORCE ? 'JUMIA EXCLUSIVE' : 'TWIVA AFFILIATE'}
                      </span>
                    </div>

                    <div className="aspect-[4/5] bg-zinc-100 overflow-hidden relative mb-3">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5 flex flex-col flex-grow mt-1 justify-between">
                      <div className="mb-2">
                        <h3 className="font-serif font-extrabold text-[13px] sm:text-sm md:text-base text-[#121212] line-clamp-2 leading-snug group-hover:text-[#D9411E] transition-colors w-full block">
                          {product.title}
                        </h3>
                      </div>

                      <div className="mt-auto pt-2.5 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-400 font-mono tracking-tighter uppercase">Price Estimate</span>
                          <div className="font-mono text-xs sm:text-sm font-bold text-[#111]">
                            KES {product.price.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 justify-between sm:justify-end w-full sm:w-auto min-w-0">
                          <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50/60 border border-amber-200/50 px-1 py-0.5 sm:px-1.5 sm:py-1 shrink-0 rounded-sm">
                            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                            <span className="font-mono text-[8px] sm:text-[9px] font-black text-zinc-700">{product.rating || '4.5'}</span>
                          </div>

                          {product.source === ProductSource.JFORCE ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(product);
                                setIsOrderModalOpen(true);
                              }}
                              className="border border-[#121212] hover:bg-[#121212] hover:text-white transition px-2 sm:px-3 py-1.5 text-[8px] sm:text-[9px] font-mono tracking-wider font-bold uppercase whitespace-nowrap cursor-pointer flex-1 sm:flex-none text-center"
                            >
                              Request Order
                            </button>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                trackClick(product);
                              }}
                              className="bg-[#121212] hover:bg-opacity-80 text-white transition px-2 sm:px-3 py-1.5 text-[8px] sm:text-[9px] font-mono tracking-wider font-bold uppercase border border-[#121212] whitespace-nowrap cursor-pointer flex-1 sm:flex-none text-center"
                            >
                              Buy via Partner
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* How it Works columns */}
            <section className="bg-[#F2F0ED] p-8 md:p-12 border border-[#121212]/10">
              <div className="max-w-3xl space-y-4 mb-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#D9411E] font-bold block">PLATFORM BLUEPRINT</span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#121212]">
                  A clean aggregation gateway for Kenyan buyers.
                </h2>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  We verify products across reselling networks. The shopping mechanics are fully non-custodial — Dealy KE serves to aggregate, guide, and process transactions transparently.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <span className="font-serif text-4xl block font-bold text-[#D9411E] italic">01.</span>
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wide">Browse Curated Drops</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">We sync Xiaomi, Infinix, Oraimo and beauty accessories, highlighting realistic Nairobi pricing tiers daily.</p>
                </div>
                <div className="space-y-2">
                  <span className="font-serif text-4xl block font-bold text-[#D9411E] italic">02.</span>
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wide">Consult AI assistant</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Type your constraints. The offline-resilient shopping assistant reviews specs to index the finest deals instantly.</p>
                </div>
                <div className="space-y-2">
                  <span className="font-serif text-4xl block font-bold text-[#D9411E] italic">03.</span>
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wide">Choose Checkout Channel</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Direct partner links redirect via Twiva affiliate rules. For JForce, order submits straight into the queue.</p>
                </div>
                <div className="space-y-2">
                  <span className="font-serif text-4xl block font-bold text-[#D9411E] italic">04.</span>
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wide">Manual Fulfillment</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Administrators log manual orders, process with the JForce network, coordinate WhatsApp delivery, and split rewards.</p>
                </div>
              </div>
            </section>

            {/* Editorial FAQ accordion Column */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-t border-[#121212]/15 pt-12">
              <div className="lg:col-span-4">
                <p className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-[#D9411E] mb-2">LOCAL LOGISTICS FAQ</p>
                <h2 className="font-serif text-3xl font-bold">Frequently Asked Clarifications</h2>
                <p className="text-xs text-zinc-500 leading-relaxed mt-2">
                  Understand our non-marketplace model, direct shipping timelines, commission distribution guidelines, and shopping assistant architecture transparently.
                </p>
              </div>
              <div className="lg:col-span-8 space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border-b border-[#121212]/10 pb-4">
                    <h4 className="font-serif text-base font-bold text-[#121212] mb-1 italic">
                      Q: {faq.question}
                    </h4>
                    <p className="text-xs text-zinc-650 leading-relaxed text-zinc-500 pl-4">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Newsletter Subscription board */}
            <section className="bg-[#121212] text-white p-8 md:p-12 text-center space-y-4">
              <span className="font-mono text-[9px] tracking-widest text-[#D9411E] font-bold uppercase block">DAILY BROADCAST</span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold italic">Subscribe to Dealy KE Drop Alerts</h2>
              <p className="text-xs text-zinc-350 max-w-md mx-auto">
                No telemetry tracking. Direct buying guides comparison alerts and Nairobi catalog updates twice a week straight to your inbox.
              </p>
              
              {!newsletterSubscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                  <input 
                    type="email" 
                    placeholder="Provide your email dress..." 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="flex-1 bg-zinc-900 border border-zinc-700 py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D9411E]"
                  />
                  <button type="submit" className="bg-[#D9411E] hover:bg-white hover:text-black py-2 px-6 text-xs uppercase tracking-widest font-bold transition">
                    Subscribe
                  </button>
                </form>
              ) : (
                <div className="inline-block border border-green-800 bg-green-950/20 px-4 py-2 text-xs font-mono text-green-400">
                  ✓ Successfully locked! You are registered for Dealy KE newsletter ciphers.
                </div>
              )}
            </section>

          </div>
        )}

        {/* TAB 2: PRODUCT CATALOG CURATION SCREEN */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Curation Filters */}
            <aside className="lg:col-span-3 space-y-6 pb-6 border-b lg:border-b-0 lg:border-r border-[#121212]/15 lg:pr-8">
              
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#111] flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-[#D9411E]" /> Filter Desk
                </span>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedSource('all');
                    setPriceMax(100000);
                    showToast('Curation filter slate cleared successfully.');
                  }}
                  className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 hover:text-[#D9411E]"
                >
                  Clear filters
                </button>
              </div>

              {/* Source Networks checklist */}
              <div className="space-y-2 border-t border-[#121212]/10 pt-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Source Strategy</h4>
                <div className="space-y-1.5">
                  {[
                    { label: 'All Sources', value: 'all' },
                    { label: 'Jumia Logistic', value: ProductSource.JFORCE },
                    { label: 'Twiva Affiliate', value: ProductSource.TWIVA }
                  ].map(source => (
                    <label key={source.value} className="flex items-center gap-2 cursor-pointer text-xs">
                      <input 
                        type="radio"
                        name="sourceFilter"
                        checked={selectedSource === source.value}
                        onChange={() => setSelectedSource(source.value)}
                        className="rounded-none text-[#D9411E] focus:ring-[#D9411E]"
                      />
                      <span className={selectedSource === source.value ? 'font-bold' : ''}>{source.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category selector list */}
              <div className="space-y-2 border-t border-[#121212]/10 pt-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Commerce Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-[#121212]/15 rounded-none py-1.5 px-2 text-xs text-[#121212] focus:outline-none focus:border-[#D9411E]"
                >
                  <option value="all">All Category Levels</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price range selector slider */}
              <div className="space-y-2 border-t border-[#121212]/10 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Max price KES</h4>
                  <span className="text-xs font-mono font-bold text-[#D9411E]">KES {priceMax.toLocaleString()}</span>
                </div>
                <input 
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#D9411E]"
                />
                <div className="flex justify-between text-[9px] text-[#121212]/40 font-mono">
                  <span>KES 2k</span>
                  <span>KES 100k</span>
                </div>
              </div>

              {/* Live Catalog health indicator */}
              <div className="bg-[#F2F0ED] p-4 text-[11px] space-y-1.5 text-zinc-500">
                <div className="flex justify-between font-mono font-bold text-zinc-700">
                  <span>METRIC:</span>
                  <span>SYNC STATEIL</span>
                </div>
                <p>Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> active offers verified across Jumia and Twiva affiliates.</p>
              </div>

            </aside>

            {/* Display Products list output */}
            <section className="lg:col-span-9 space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center bg-[#F2F0ED]/50 p-3 border border-[#121212]/10">
                
                {/* Search Term input */}
                <div className="relative w-full sm:max-w-xs">
                  <input 
                    type="text"
                    placeholder="Search titles, specs, brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-[#111]/15 px-3 py-1 text-xs focus:outline-none focus:border-[#D9411E]"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between text-xs font-mono">
                  <span className="text-zinc-500">Arrange by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-zinc-300 font-medium py-1 px-2 focus:outline-none focus:border-[#D9411E]"
                  >
                    <option value="popularity">Popularity / Rating</option>
                    <option value="newest">Fresh Deals First</option>
                    <option value="price-low-high">Lowest Price First</option>
                    <option value="price-high-low">Highest Price First</option>
                  </select>
                </div>

              </div>

              {/* Output Grid column */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 space-y-3 border border-dashed border-[#121212]/15 bg-white p-8">
                  <HelpCircle className="h-10 w-10 mx-auto text-zinc-300" />
                  <h3 className="font-serif font-bold text-xl text-[#333]">No matched deal curations found.</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">None of our current Xiaomi, Tecno, Oraimo or beauty catalog rows fit these parameters. Toggle your filters to restore display.</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedSource('all');
                      setPriceMax(100000);
                    }}
                    className="bg-[#121212] tracking-wider font-mono uppercase text-xs text-white px-5 py-2 hover:bg-opacity-80 transition"
                  >
                    Reset Filter Desk
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {filteredProducts.map((p) => (
                    <div 
                      key={p.id}
                      className="group flex flex-col border border-[#121212]/10 bg-white transition hover:border-[#121212] relative self-stretch cursor-pointer ease-out overflow-hidden"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <div className="absolute top-3 left-3 z-10 flex gap-1 items-center">
                        <span className={`text-[8px] font-mono tracking-wider font-extrabold uppercase px-2 py-1 shadow-sm border ${
                          p.source === ProductSource.JFORCE 
                            ? 'bg-white text-[#111] border-zinc-900' 
                            : 'bg-[#D9411E] text-white border-[#D9411E]'
                        }`}>
                          {p.source === ProductSource.JFORCE ? 'JUMIA' : 'TWIVA'}
                        </span>
                        
                        {wishlist.includes(p.id) && (
                          <span className="bg-orange-100 text-[#D9411E] border border-orange-300 rounded-none px-1.5 py-0.5 text-[8px] font-bold">
                            ★ SAVED
                          </span>
                        )}
                      </div>

                      <div className="aspect-[3/4] overflow-hidden bg-zinc-150 relative mb-3 transition-all duration-300">
                        <img 
                          src={p.imageUrl} 
                          alt={p.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5 flex flex-col flex-grow mt-1 justify-between">
                        <div className="mb-2">
                          <h3 className="font-serif font-extrabold text-[13px] sm:text-sm md:text-base text-[#121212] line-clamp-2 leading-snug group-hover:text-[#D9411E] transition-colors w-full block">
                            {p.title}
                          </h3>
                        </div>

                        <div className="mt-auto pt-2.5 border-t border-zinc-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400 font-mono tracking-tighter uppercase">Aggregated Price</span>
                            <div className="font-mono text-xs sm:text-sm font-bold text-[#111]">
                              KES {p.price.toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 sm:gap-2 justify-between sm:justify-end w-full sm:w-auto min-w-0">
                            {/* Rating badge besides button */}
                            <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50/60 border border-amber-200/50 px-1 py-0.5 sm:px-1.5 sm:py-1 shrink-0 rounded-sm">
                              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                              <span className="font-mono text-[8px] sm:text-[9px] font-black text-zinc-700">{p.rating}</span>
                            </div>

                            {p.source === ProductSource.JFORCE ? (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(p);
                                  setIsOrderModalOpen(true);
                                }}
                                className="border border-[#111] hover:bg-[#111] hover:text-white transition px-2 sm:px-3 py-1.5 text-[8px] sm:text-[9px] font-mono tracking-wider font-bold uppercase whitespace-nowrap cursor-pointer flex-1 sm:flex-none text-center"
                              >
                                Order Drop
                              </button>
                            ) : (
                              <button 
                                onClick={(e) => {
                                e.stopPropagation();
                                trackClick(p);
                              }}
                                className="bg-[#111] hover:bg-opacity-80 text-white transition px-2 sm:px-3 py-1.5 text-[8px] sm:text-[9px] font-mono tracking-wider font-bold uppercase border border-black whitespace-nowrap cursor-pointer flex-1 sm:flex-none text-center"
                              >
                                Checkout
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </section>

          </div>
        )}

        {/* TAB 3: GUIDES (BLOGS) PAGE */}
        {activeTab === 'blogs' && (
          <div className="space-y-10">
            
            {/* Standard editorial banner guide grid */}
            {!activeBlog ? (
              <div className="space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-3 pb-8 border-b border-[#121212]/15">
                  <span className="text-[10px] font-mono tracking-widest text-[#D9411E] font-bold uppercase">EDITORIAL OPINIONS</span>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Dealy KE Buying Guides</h1>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Compare technical details of cheap devices under Nairobi commuter conditions, and evaluate Jumia reseller markdowns transparently. 
                  </p>
                </div>

                {/* Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {blogs.map((blog) => (
                    <article 
                      key={blog.id} 
                      className="border border-[#121212]/10 bg-white p-6 flex flex-col md:flex-row gap-6 hover:border-[#121212] transition cursor-pointer"
                      onClick={() => setActiveBlog(blog)}
                    >
                      <div className="md:w-1/3 aspect-square bg-[#F2F0ED] grayscale hover:grayscale-0 transition duration-500 overflow-hidden shrink-0">
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-between flex-1">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono uppercase">
                            <span>By {blog.author}</span>
                            <span>•</span>
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-serif font-bold text-xl leading-tight group-hover:text-[#D9411E]">
                            {blog.title}
                          </h3>
                          <p className="text-xs text-zinc-550 leading-relaxed line-clamp-3 text-zinc-500">
                            {blog.summary}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] uppercase font-bold text-[#D9411E] mt-3 tracking-widest inline-flex items-center gap-1 group">
                          Read full briefing <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              
              /* Single Blog View screen */
              <div className="max-w-3xl mx-auto space-y-6">
                
                <button 
                  onClick={() => setActiveBlog(null)}
                  className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-black flex items-center gap-1"
                >
                  ← Back to articles
                </button>

                <div className="space-y-4 pb-4 border-b border-[#121212]/10">
                  <div className="flex flex-wrap gap-2">
                    {activeBlog.tags.map(t => (
                      <span key={t} className="bg-zinc-100 font-mono text-[9px] font-bold text-purple-700 px-2 py-0.5 rounded-none uppercase">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <h1 className="font-serif text-4xl md:text-5xl leading-tight font-extrabold text-[#111]">
                    {activeBlog.title}
                  </h1>
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span>Platform correspondent: <strong>{activeBlog.author}</strong></span>
                    <span>Broadcasting: {new Date(activeBlog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="aspect-[16/9] w-full bg-zinc-100 overflow-hidden grayscale border border-zinc-200">
                  <img src={activeBlog.imageUrl} alt={activeBlog.title} className="w-full h-full object-cover" />
                </div>

                {/* Body details */}
                <div className="prose max-w-none text-[#121212]/80 leading-relaxed text-sm md:text-base space-y-4 whitespace-pre-line font-sans pt-3">
                  {activeBlog.content}
                </div>

                {/* Bottom related action */}
                <div className="p-6 bg-[#F2F0ED] border border-zinc-350 space-y-3 text-center">
                  <h4 className="font-serif text-lg font-bold italic text-zinc-800">Need specific budget comparisons?</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">Ask our intelligent shopping AI to compare models discussed in this guide in real-time pricing formats.</p>
                  <button 
                    onClick={() => setAiOpen(true)}
                    className="bg-[#121212] font-mono uppercase text-xs text-white px-6 py-2 tracking-widest"
                  >
                    Engage AI Assistant
                  </button>
                </div>

              </div>
            )}
            
          </div>
        )}

        {/* TAB 4: MY DESK / CUSTOMER WORKSPACE SCREEN */}
        {activeTab === 'customer-desk' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Right side customer status tracker */}
            <div className="lg:col-span-8 space-y-8">
              
              <div className="border border-[#121212]/10 p-6 bg-white shrink">
                <span className="font-mono text-[10px] tracking-widest font-extrabold text-[#D9411E] uppercase">TRANSACTION PROGRESS</span>
                <h2 className="font-serif text-2xl font-bold mb-4 mt-1">My Resale Order Requests</h2>
                
                {orders.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-zinc-200">
                    <p className="text-xs text-zinc-500 mb-3">You have not submitted direct JForce courier logistics order forms yet.</p>
                    <button onClick={() => setActiveTab('catalog')} className="bg-[#111] text-white text-[10px] px-4 py-2 uppercase font-mono tracking-widest font-semibold">
                      Explore catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-[#121212]/10 p-4 font-mono text-xs hover:border-[#D9411E] transition">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 border-b border-dashed border-zinc-250 pb-2 mb-2">
                          <span className="font-bold text-[#D9411E]">ORDER ID: {order.id}</span>
                          <span className="text-zinc-500">Date: {new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[#111] font-bold font-serif italic text-sm">{order.productTitle}</p>
                            <p className="text-zinc-500">Quantity requested: {order.quantity}</p>
                            <p className="text-zinc-500">Value Estimate: <strong className="text-black">KES {(order.productPrice * order.quantity).toLocaleString()}</strong></p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Receiver: {order.customerName}</p>
                            <p className="text-zinc-500">Delivery point: {order.deliveryLocation}</p>
                            <p className="text-zinc-500">Carrier system: JForce Logistics</p>
                          </div>
                        </div>

                        {/* Progression slider line */}
                        <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center bg-zinc-50 p-2 text-[9px] tracking-wide font-mono">
                          <span>Status Flow:</span>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 uppercase font-bold ${
                              order.status === OrderStatus.DELIVERED 
                                ? 'bg-green-100 text-green-700' 
                                : order.status === OrderStatus.CANCELLED
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-150 text-amber-800 bg-amber-50'
                            }`}>
                              ● {order.status}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist curation panel */}
              <div className="border border-[#121212]/10 p-6 bg-white">
                <h3 className="font-serif text-2xl font-bold mb-3">Saved Wishlist Drops ({wishlist.length})</h3>
                
                {wishlist.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-mono">Wishlist space empty. Save items from the catalog gallery to view them here.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.filter(p => wishlist.includes(p.id)).map(p => (
                      <div key={p.id} className="border border-zinc-200 p-3 flex gap-3 items-center">
                        <img src={p.imageUrl} alt={p.title} className="h-10 w-10 shrink-0 object-cover grayscale" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-serif font-bold truncate">{p.title}</h4>
                          <span className="text-[10px] font-mono text-zinc-500">KES {p.price.toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => toggleWishlist(p.id)}
                          className="text-zinc-400 hover:text-rose-600 p-1"
                          title="Remove from Saved List"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Left side referral system promotion block */}
            <div className="lg:col-span-4 space-y-6">
              
            </div>

          </div>
        )}

        {/* TAB 5: PARTNER WORKSPACE SCREEN */}
        {activeTab === 'partner-desk' && (
          <div className="space-y-8">
            
            {/* Upper Metric Row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Dynamic Clicks', val: partnerStats.clicks, desc: 'Commissionable redirects logged' },
                { label: 'Client Signups', val: partnerStats.signups, desc: 'Registered visiting links' },
                { label: 'JForce Conversions', val: partnerStats.orders, desc: 'Orders coordinated' },
                { label: 'Est Accumulates KES', val: `KES ${partnerStats.commission.toLocaleString()}`, desc: 'At KES 15/click + commissions' }
              ].map((m, i) => (
                <div key={i} className="border border-[#121212]/10 bg-white p-4 font-mono">
                  <span className="text-[9px] text-zinc-400 uppercase font-black block">{m.label}</span>
                  <span className="font-serif text-2xl font-black italic text-[#D9411E] block py-1">{m.val}</span>
                  <span className="text-[9px] text-zinc-500 italic block">{m.desc}</span>
                </div>
              ))}
            </section>

            {/* Custom SVG line Chart showing Clicks timeline visually */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 border border-[#121212]/10 bg-white p-6">
                <div className="flex justify-between items-baseline mb-4">
                  <div>
                    <span className="font-mono text-[9px] text-[#D9411E] font-bold block uppercase">WEEKLY DRILL-DOWN</span>
                    <h3 className="font-serif text-xl font-bold">Reseller Redirection Clicks Timeline</h3>
                  </div>
                  <span className="font-mono text-[10px] uppercase text-zinc-500 bg-zinc-100 py-0.5 px-2">Active Link Tracker</span>
                </div>

                {/* Simulated visual plot */}
                <div className="aspect-[21/9] w-full bg-[#FCFBFA] border border-zinc-200 flex flex-col justify-end p-4 relative font-mono text-[9px]">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-1/4 border-t border-zinc-100"></div>
                  <div className="absolute inset-x-0 top-2/4 border-t border-zinc-100"></div>
                  <div className="absolute inset-x-0 top-3/4 border-t border-zinc-100"></div>

                  {/* SVG graph overlay represent trends */}
                  <svg className="absolute inset-x-4 inset-y-12 w-[95%] h-[60%] overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#D9411E"
                      strokeWidth="1.5"
                      points="0,45 15,38 30,12 45,30 60,8 75,22 90,5 100,15"
                    />
                    <polygon
                      fill="rgba(217,65,30,0.06)"
                      points="0,45 15,38 30,12 45,30 60,8 75,22 90,5 100,15 100,50 0,50"
                    />
                  </svg>
                  
                  {/* Axis values labels */}
                  <div className="flex justify-between text-zinc-500 font-bold uppercase tracking-widest border-t border-zinc-200 pt-2 z-10">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              {/* Commission URL Engine Builder Sidebar */}
              <div className="lg:col-span-4 border border-[#121212]/10 bg-[#F2F0ED] p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold">Commission Product-Link Generator</h3>
                <p className="text-xs text-zinc-500 leading-relaxed text-serif italic">
                  Select any active drop to inject custom tag coordinates. Click tracking parameters are automatically mapped securely.
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="font-bold block uppercase text-[10px] mb-1">Target Drop Product</label>
                    <select
                      value={partnerProductChoice}
                      onChange={(e) => setPartnerProductChoice(e.target.value)}
                      className="w-full bg-white border border-zinc-300 p-2 focus:outline-none"
                    >
                      <option value="">-- Choose Product drop --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (KES {p.price})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block uppercase text-[10px] mb-1">Affiliate custom code</label>
                    <input 
                      type="text" 
                      value={partnerRefCode} 
                      onChange={(e) => setPartnerRefCode(e.target.value.toLowerCase())}
                      className="w-full bg-white border border-zinc-300 p-2"
                    />
                  </div>

                  {partnerProductChoice && (
                    <div className="space-y-2 pt-2 border-t border-zinc-350">
                      <span className="text-[9px] font-bold text-slate-500 block">LINK REDIRECTION SPECIFICATION:</span>
                      <div className="bg-white p-2 border border-zinc-400 text-[10px] select-all break-all break-words">
                        https://dealy.co.ke/?ref={partnerRefCode}&product={partnerProductChoice}
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://dealy.co.ke/?ref=${partnerRefCode}&product=${partnerProductChoice}`);
                          showToast('Commission product-link configured and copied!');
                        }}
                        className="w-full bg-black text-white text-[10px] tracking-wide uppercase py-2 font-bold hover:bg-opacity-80 transition"
                      >
                        Copy Custom Link
                      </button>
                    </div>
                  )}

                </div>
              </div>

            </section>

          </div>
        )}

        {/* TAB 6: ADMIN CMS AND CONTROLS */}
        {activeTab === 'admin-desk' && (
          <div className="space-y-8">
            
            {/* Secondary Header switcher within CMS */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center border-b border-[#121212]/15 pb-4">
              <div>
                <span className="font-mono text-[9px] text-[#D9411E] font-bold block uppercase">PLATFORM BACKOFFICE</span>
                <h1 className="font-serif text-3xl font-bold">Dealy KE CMS Portal</h1>
              </div>

              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <button
                  onClick={() => setAdminPanel('products')}
                  className={`px-3 py-1.5 border transition ${adminPanel === 'products' ? 'bg-[#121212] text-white border-black font-bold' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                >
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setAdminPanel('categories')}
                  className={`px-3 py-1.5 border transition ${adminPanel === 'categories' ? 'bg-[#121212] text-white border-black font-bold' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                >
                  Categories ({categories.length})
                </button>
                <button
                  onClick={() => setAdminPanel('orders')}
                  className={`px-3 py-1.5 border transition ${adminPanel === 'orders' ? 'bg-[#121212] text-white border-black font-bold' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                >
                  Resale Orders ({orders.length})
                </button>
                <button
                  onClick={() => setAdminPanel('blogs')}
                  className={`px-3 py-1.5 border transition ${adminPanel === 'blogs' ? 'bg-[#121212] text-white border-black font-bold' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                >
                  Guides ({blogs.length})
                </button>
                <button
                  onClick={() => setAdminPanel('faqs')}
                  className={`px-3 py-1.5 border transition ${adminPanel === 'faqs' ? 'bg-[#121212] text-white border-black font-bold' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                >
                  FAQs ({faqs.length})
                </button>
                <button
                  onClick={() => setAdminPanel('banners')}
                  className={`px-3 py-1.5 border transition ${adminPanel === 'banners' ? 'bg-[#121212] text-white border-black font-bold' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                >
                  Banners ({banners.length})
                </button>
                <button
                  onClick={() => setAdminPanel('seo')}
                  className={`px-3 py-1.5 border transition ${adminPanel === 'seo' ? 'bg-[#121212] text-white border-black font-bold' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                >
                  SEO Optimizer
                </button>
                <button
                  onClick={() => setAdminPanel('notifications')}
                  className={`px-3 py-1.5 border transition relative ${adminPanel === 'notifications' ? 'bg-[#121212] text-white border-black font-bold' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                >
                  Mailbox ({notifications.filter(n => !n.isRead).length})
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setAdminPanel('analytics')}
                  className={`px-3 py-1.5 border transition ${adminPanel === 'analytics' ? 'bg-[#121212] text-white border-black font-bold' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                >
                  Clicks Analytics ({clicks.length})
                </button>
              </div>
            </div>

            {/* Quick action button line */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center bg-[#F2F0ED] p-4 text-xs font-mono">
              <span className="text-[#D9411E] font-bold uppercase">Simulation tools:</span>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={triggerDemoImport}
                  className="bg-zinc-800 hover:bg-black text-white px-3 py-1.5 tracking-wider uppercase font-semibold transition"
                >
                  Reset database to seed values
                </button>
                <a 
                  href="/api/database/prisma-schema" 
                  target="_blank" 
                  className="bg-white border border-zinc-300 hover:border-black text-[11px] font-bold px-3 py-1.5 tracking-wider uppercase inline-flex items-center gap-1.5"
                >
                  <FileJson className="h-3.5 w-3.5 text-zinc-500" /> Export Prisma Schema
                </a>
              </div>
            </div>

            {/* CMS Section 1: CURATED PRODUCTS */}
            {adminPanel === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-xl font-bold">Manage Curated Catalog Rows</h3>
                  <button 
                    onClick={() => setEditingProduct({
                      title: 'New Infinix Note Pro',
                      description: 'Supreme smartphone value with heavy RAM capacity.',
                      price: 24500,
                      originalPrice: 28000,
                      source: ProductSource.JFORCE,
                      category: 'phones',
                      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=400',
                      specifications: ['RAM: 8GB', 'Storage: 128GB', 'Battery: 5000mAh'],
                      availability: true
                    })}
                    className="bg-[#D9411E] hover:bg-black text-white font-mono uppercase text-xs tracking-wider px-4 py-2 flex items-center gap-1 font-bold"
                  >
                    <Plus className="h-4 w-4" /> CURATE NEW DROP
                  </button>
                </div>

                {/* Adding or editing details modal inline */}
                {editingProduct && (
                  <form onSubmit={handleSaveProduct} className="border border-[#D9411E] bg-white p-6 space-y-4 max-w-2xl font-mono text-xs">
                    <div className="flex justify-between border-b pb-2 mb-4">
                      <h4 className="font-serif text-lg font-bold uppercase italic text-[#D9411E]">
                        {editingProduct.id ? 'Modify Drop variables' : 'Configure New Curated deal parameters'}
                      </h4>
                      <button type="button" onClick={() => setEditingProduct(null)}>
                        <X className="h-4 w-4 text-zinc-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-bold">Title Name</label>
                        <input 
                          type="text" 
                          value={editingProduct.title || ''} 
                          onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                          required
                          className="w-full bg-[#FCFBFA] border p-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold">Est price KES</label>
                        <input 
                          type="number" 
                          value={editingProduct.price || 0} 
                          onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                          required
                          className="w-full bg-[#FCFBFA] border p-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold">Original price KES</label>
                        <input 
                          type="number" 
                          value={editingProduct.originalPrice || 0} 
                          onChange={(e) => setEditingProduct({...editingProduct, originalPrice: Number(e.target.value)})}
                          className="w-full bg-[#FCFBFA] border p-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold">Supply source</label>
                        <select
                          value={editingProduct.source || ProductSource.JFORCE}
                          onChange={(e) => setEditingProduct({...editingProduct, source: e.target.value as ProductSource})}
                          className="w-full bg-[#FCFBFA] border p-2 text-xs"
                        >
                          <option value={ProductSource.JFORCE}>JFORCE RESELL MANUAL</option>
                          <option value={ProductSource.TWIVA}>TWIVA AFFILIATE REDIRECT</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold">Image display URL</label>
                        <input 
                          type="text" 
                          value={editingProduct.imageUrl || ''} 
                          onChange={(e) => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
                          className="w-full bg-[#FCFBFA] border p-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold">Category Level slug</label>
                        <select
                          value={editingProduct.category || 'phones'}
                          onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                          className="w-full bg-[#FCFBFA] border p-2 text-xs"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.slug}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      {editingProduct.source === ProductSource.JFORCE ? (
                        <div className="space-y-2">
                          <label className="font-bold">JForce Sku tracker</label>
                          <input 
                            type="text" 
                            placeholder="JUMIA-RN13-M2-KE"
                            value={editingProduct.jforceSku || ''} 
                            onChange={(e) => setEditingProduct({...editingProduct, jforceSku: e.target.value})}
                            className="w-full bg-[#FCFBFA] border p-2"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="font-bold">Twiva affiliate deep link</label>
                          <input 
                            type="text" 
                            placeholder="https://jumia.co.ke/..."
                            value={editingProduct.affiliateUrl || ''} 
                            onChange={(e) => setEditingProduct({...editingProduct, affiliateUrl: e.target.value})}
                            className="w-full bg-[#FCFBFA] border p-2"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="font-bold block">Product Story & Detailed Description</label>
                          <div className="flex gap-2">
                            <button 
                              type="button"
                              onClick={() => {
                                const ta = document.getElementById('product-desc-editor') as HTMLTextAreaElement;
                                if (!ta) return;
                                const start = ta.selectionStart;
                                const end = ta.selectionEnd;
                                const text = ta.value;
                                const before = text.substring(0, start);
                                const after = text.substring(end, text.length);
                                const selected = text.substring(start, end);
                                setEditingProduct({...editingProduct, description: before + `**${selected}**` + after});
                              }}
                              className="text-[9px] bg-zinc-100 border border-zinc-300 px-2 py-0.5 hover:bg-zinc-200 font-bold"
                            >
                              BOLD
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                const ta = document.getElementById('product-desc-editor') as HTMLTextAreaElement;
                                if (!ta) return;
                                const start = ta.selectionStart;
                                const text = ta.value;
                                const before = text.substring(0, start);
                                const after = text.substring(start, text.length);
                                setEditingProduct({...editingProduct, description: before + "\n• " + after});
                              }}
                              className="text-[9px] bg-zinc-100 border border-zinc-300 px-2 py-0.5 hover:bg-zinc-200 font-bold"
                            >
                              BULLET
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingProduct({...editingProduct, description: editingProduct.description + "\n\n"});
                              }}
                              className="text-[9px] bg-zinc-100 border border-zinc-300 px-2 py-0.5 hover:bg-zinc-200 font-bold"
                            >
                              NEW PARA
                            </button>
                          </div>
                        </div>
                        <textarea 
                          id="product-desc-editor"
                          rows={8}
                          value={editingProduct.description || ''} 
                          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                          placeholder="Write the detailed product story here. Use the buttons above for basic formatting..."
                          className="w-full bg-[#FCFBFA] border p-3 text-sm font-sans leading-relaxed focus:border-[#D9411E] focus:outline-none transition-colors"
                        />
                        <p className="text-[9px] text-zinc-400 italic">*Text uses 'whitespace-pre-line' logic. Line breaks in the editor will appear on the product page.</p>
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        <label className="font-bold block uppercase text-[10px] text-zinc-500 tracking-widest">Technical Specifications</label>
                        <div className="grid grid-cols-1 gap-2">
                          {(editingProduct.specifications || []).map((spec, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input 
                                type="text"
                                value={spec}
                                onChange={(e) => {
                                  const newSpecs = [...(editingProduct.specifications || [])];
                                  newSpecs[idx] = e.target.value;
                                  setEditingProduct({...editingProduct, specifications: newSpecs});
                                }}
                                className="flex-1 bg-[#FCFBFA] border p-1.5 text-[11px]"
                                placeholder="E.g. RAM: 8GB"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newSpecs = (editingProduct.specifications || []).filter((_, i) => i !== idx);
                                  setEditingProduct({...editingProduct, specifications: newSpecs});
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button"
                            onClick={() => {
                              const newSpecs = [...(editingProduct.specifications || []), ''];
                              setEditingProduct({...editingProduct, specifications: newSpecs});
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:underline text-left"
                          >
                            + Add Specification Row
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingProduct(null)} className="bg-zinc-200 text-zinc-700 font-bold px-4 py-2 hover:bg-zinc-300 transition">
                        Cancel configuration
                      </button>
                      <button type="submit" className="bg-[#D9411E] text-white font-bold px-6 py-2 hover:bg-black transition">
                        Save Drop changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Catalog Table list */}
                <div className="border border-[#121212]/15 overflow-x-auto bg-white font-mono text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#121212] text-white uppercase tracking-wider text-[9px]">
                        <th className="p-3">Title Drop</th>
                        <th className="p-3">Source Channel</th>
                        <th className="p-3">Pricing KES</th>
                        <th className="p-3">Rating</th>
                        <th className="p-3 text-right">Administrative control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#121212]/10">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50 transition">
                          <td className="p-3">
                            <div className="font-bold">{p.title}</div>
                            <span className="text-[9px] text-zinc-400 font-sans italic">{p.category}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-none font-bold text-[9px] ${p.source === ProductSource.JFORCE ? 'bg-zinc-100 text-black border' : 'bg-red-50 text-orange-700 border border-orange-200'}`}>
                              {p.source}
                            </span>
                          </td>
                          <td className="p-3 font-bold">KES {p.price.toLocaleString()}</td>
                          <td className="p-3">★ {p.rating} <span className="text-zinc-450 opacity-60">({p.reviewsCount})</span></td>
                          <td className="p-3 text-right space-x-2">
                            <button onClick={() => setEditingProduct(p)} className="text-blue-700 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* CMS Section 2: JFORCE FASHION & TELECH ORDERS COURIER QUEUE */}
            {adminPanel === 'orders' && (() => {
              const filteredOrders = orders.filter(o => {
                if (!o.createdAt) return true;
                const d = new Date(o.createdAt);
                const now = new Date();
                if (orderDateFilter === 'today') {
                  return d.getFullYear() === now.getFullYear() &&
                         d.getMonth() === now.getMonth() &&
                         d.getDate() === now.getDate();
                }
                if (orderDateFilter === 'weekly') {
                  const diffTime = Math.abs(now.getTime() - d.getTime());
                  const diffDays = diffTime / (1000 * 60 * 60 * 24);
                  return diffDays <= 7;
                }
                return true;
              });

              return (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold">Reseller manual orders fulfillment pipeline</h3>
                      <p className="text-xs text-zinc-500 max-w-lg">
                        These requests are manually registered. Once a user triggers "Order", administrators fulfill through the Jforce Reseller terminal, track shipping progress and distribute commission variables.
                      </p>
                    </div>

                    {/* Period filters */}
                    <div className="flex bg-[#F2F0ED] p-1 gap-1 border border-zinc-200">
                      <button
                        onClick={() => setOrderDateFilter('today')}
                        className={`px-3 py-1 font-mono text-[10px] uppercase font-bold transition ${orderDateFilter === 'today' ? 'bg-[#D9411E] text-white' : 'hover:bg-zinc-200 text-zinc-650'}`}
                      >
                        Today's ({orders.filter(o => {
                          const d = new Date(o.createdAt);
                          const now = new Date();
                          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
                        }).length})
                      </button>
                      <button
                        onClick={() => setOrderDateFilter('weekly')}
                        className={`px-3 py-1 font-mono text-[10px] uppercase font-bold transition ${orderDateFilter === 'weekly' ? 'bg-[#D9411E] text-white' : 'hover:bg-zinc-200 text-zinc-650'}`}
                      >
                        Weekly ({orders.filter(o => {
                          const d = new Date(o.createdAt);
                          const now = new Date();
                          const diff = Math.abs(now.getTime() - d.getTime()) / (1000 * 300 * 288); // last 7 days roughly
                          return diff <= 7;
                        }).length})
                      </button>
                      <button
                        onClick={() => setOrderDateFilter('all')}
                        className={`px-3 py-1 font-mono text-[10px] uppercase font-bold transition ${orderDateFilter === 'all' ? 'bg-[#D9411E] text-white' : 'hover:bg-zinc-200 text-zinc-650'}`}
                      >
                        All ({orders.length})
                      </button>
                    </div>
                  </div>

                  <div className="border border-[#121212]/15 bg-white overflow-x-auto font-mono text-xs">
                    {filteredOrders.length === 0 ? (
                      <div className="p-8 text-center text-zinc-400 font-sans text-xs">
                        No orders recorded for this selected time filter.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-900 text-white uppercase tracking-wider text-[9px]">
                            <th className="p-3">Order Code</th>
                            <th className="p-3">Item target</th>
                            <th className="p-3">Client Contact info</th>
                            <th className="p-3">Date Registered</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Transition Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-zinc-50">
                              <td className="p-3 font-bold text-[#D9411E]">{o.id}</td>
                              <td className="p-3">
                                <div className="font-semibold">{o.productTitle}</div>
                                <span className="text-[10px] text-zinc-500">Qty: {o.quantity} • Value: KES {(o.productPrice * o.quantity).toLocaleString()}</span>
                              </td>
                              <td className="p-3">
                                <div>Name: <strong>{o.customerName}</strong></div>
                                <div>Phone: <strong>{o.customerPhone}</strong></div>
                                <div className="text-[10px] text-zinc-400">Point: {o.deliveryLocation}</div>
                              </td>
                              <td className="p-3 text-zinc-500 font-sans text-[11px]">
                                {new Date(o.createdAt).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-orange-50 font-bold border border-orange-200 uppercase text-[9px]">
                                  ● {o.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleOrderStatusShift(o.id, e.target.value as OrderStatus)}
                                  className="bg-white border rounded p-1 text-xs"
                                >
                                  {Object.values(OrderStatus).map(st => (
                                    <option key={st} value={st}>{st}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* CMS Section 3: BUYING GUIDES COMPILER */}
            {adminPanel === 'blogs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-xl font-bold">Spawning Comparison Articles</h3>
                  <button 
                    onClick={() => setEditingBlog({
                      title: 'Comparing Xiaomi Redmi 13 vs Tecno Spark 20',
                      summary: 'A direct head-to-head comparison reviewing screens and gaming speeds for students.',
                      content: 'Detailed smartphone parameters show standard G99 processor performs reliably on budget tiers under KES 20k.',
                      author: 'Dealy KE Tech Editor',
                      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400',
                      tags: ['comparison', 'budget', 'phones']
                    })}
                    className="bg-[#D9411E] text-white font-mono uppercase text-xs tracking-wider px-4 py-2 font-bold"
                  >
                    + NEW GUIDE POST
                  </button>
                </div>

                {editingBlog && (
                  <form onSubmit={handleSaveBlog} className="border border-[#D9411E] bg-white p-6 space-y-4 max-w-2xl font-mono text-xs">
                    <h4 className="font-serif text-lg font-bold italic text-[#D9411E]">Publishing buy review guides</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-bold">Article Title</label>
                        <input 
                          type="text" 
                          value={editingBlog.title || ''} 
                          onChange={(e) => setEditingBlog({...editingBlog, title: e.target.value})}
                          required
                          className="w-full bg-[#FCFBFA] border p-2 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold">Guide Snippet Summary</label>
                        <input 
                          type="text" 
                          value={editingBlog.summary || ''} 
                          onChange={(e) => setEditingBlog({...editingBlog, summary: e.target.value})}
                          className="w-full bg-[#FCFBFA] border p-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold">Content Text Body</label>
                      <textarea 
                        rows={6}
                        value={editingBlog.content || ''} 
                        onChange={(e) => setEditingBlog({...editingBlog, content: e.target.value})}
                        required
                        className="w-full bg-[#FCFBFA] border p-2 text-xs"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingBlog(null)} className="bg-zinc-200 text-zinc-700 px-4 py-2 hover:bg-zinc-350 font-bold">Cancel</button>
                      <button type="submit" className="bg-[#D9411E] text-white px-6 py-2 hover:bg-black font-bold">Publish Guide</button>
                    </div>

                  </form>
                )}

                <div className="space-y-3">
                  {blogs.map(b => (
                    <div key={b.id} className="border p-4 bg-white flex justify-between items-center font-mono text-xs">
                      <div>
                        <div className="font-bold font-serif text-sm">{b.title}</div>
                        <span className="text-[10px] text-zinc-400">Tags: {b.tags.join(', ')} | Published: {new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveBlog(b);
                          setActiveTab('blogs');
                        }}
                        className="text-orange-600 hover:underline text-xs"
                      >
                        Preview guide view →
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* CMS Section 4: INTERACTIVE SEO INSPECTOR & SCHEMA VALIDATOR */}
            {adminPanel === 'seo' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#121212]/15 p-6">
                  <h3 className="font-serif text-xl font-bold mb-2">Dealy KE dynamic Metadata Curation engine</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                    Our platform automatically loads OpenGraph coordinates, sitemaps index directives and localized product Schema. Choose any curated phone or soundbar drop below to preview JSON-LD schema layouts instant.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Row catalog list for SEO target selection */}
                  <div className="md:col-span-4 space-y-2">
                    <span className="font-mono text-[9px] text-[#D9411E] font-bold block uppercase">TARGET SELECTION</span>
                    <div className="divide-y border border-[#121212]/10 bg-white max-h-[300px] overflow-y-auto font-mono text-xs">
                      {products.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSeoViewingProduct(p)}
                          className={`w-full text-left p-3 hover:bg-zinc-50 transition text-xs block ${seoViewingProduct?.id === p.id ? 'bg-orange-50 font-bold text-orange-700' : ''}`}
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Schema layout block output preview */}
                  <div className="md:col-span-8 space-y-4">
                    <span className="font-mono text-[9px] text-zinc-450 uppercase tracking-widest block font-bold">RENDERED JSON-LD METADATA PREVIEW</span>
                    
                    {seoViewingProduct ? (
                      <div className="space-y-4">
                        <div className="bg-zinc-950 text-emerald-400 p-4 rounded-none font-mono text-[10px] select-all overflow-x-auto whitespace-pre leading-relaxed border border-zinc-700">
{`{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "${seoViewingProduct.title}",
  "image": "${seoViewingProduct.imageUrl}",
  "description": "${seoViewingProduct.description}",
  "sku": "${seoViewingProduct.jforceSku || 'TWIVA-' + seoViewingProduct.id}",
  "brand": {
    "@type": "Brand",
    "name": "${seoViewingProduct.category.toUpperCase()}"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "KES",
    "price": "${seoViewingProduct.price}",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Dealy KE"
    }
  }
}`}
                        </div>

                        {/* Interactive testing simulator checklist */}
                        <div className="p-4 bg-orange-50 border border-orange-200 text-xs font-serif italic text-zinc-700">
                          ✓ Rich-Search Snippet optimization valid for: "Best cheap phones Kenya", "best deals from Jumia", "Nairobi online resellers logs". sitemap.xml directives automatically synchronized recursively.
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-12 border border-dashed border-zinc-200 bg-white">
                        <p className="text-xs text-zinc-400 font-mono">Select a curated phone, TV, or fashion drop to run the SEO preview validator.</p>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* CMS Section 5: ADMIN MAILBOX & INTEGRATED NOTIFICATIONS */}
            {adminPanel === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-[#121212]/15 pb-2 border-b">
                  <div>
                    <h3 className="font-serif text-xl font-bold">Administrative Mailbox Logs</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Direct notifications generated on JForce resale order submits and platform core logs context.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      for (const notif of notifications) {
                        if (!notif.isRead) {
                          await handleMarkNotificationRead(notif.id);
                        }
                      }
                      showToast('Successfully cleared all notification badges!');
                    }}
                    className="font-mono text-[10px] uppercase font-bold text-[#D9411E] border border-orange-200 hover:border-orange-500 bg-orange-50 px-3 py-1.5 transition"
                  >
                    Mark All as Read
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[#121212]/15 bg-white p-8 space-y-3">
                    <Clock className="h-10 w-10 mx-auto text-zinc-300 animate-pulse" />
                    <h4 className="font-serif font-bold text-base text-zinc-800">No pending mailbox logs found.</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      All systems are active. When clients trigger new JForce orders, real-time alert modules appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`border p-4 transition duration-300 font-mono text-xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${
                          notif.isRead 
                            ? 'bg-zinc-50/50 border-zinc-200 text-zinc-500' 
                            : 'bg-white border-[#D9411E]/40 shadow-sm text-zinc-800'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${notif.isRead ? 'bg-zinc-300' : 'bg-orange-500 animate-ping'}`}></span>
                            <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-900">
                              {notif.title}
                            </span>
                            <span className="text-[9px] text-zinc-400">
                              • {new Date(notif.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs font-sans leading-relaxed">
                            {notif.message}
                          </p>
                        </div>

                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkNotificationRead(notif.id)}
                            className="bg-zinc-900 text-white text-[10px] hover:bg-[#D9411E] transition px-3 py-1.5 tracking-wider uppercase font-semibold shrink-0"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CMS Section 6: CATEGORIES MANAGEMENT */}
            {adminPanel === 'categories' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-xl font-bold">Catalog Category Parameters</h3>
                    <p className="text-xs text-zinc-500 mt-1">Configure active product categories, slugs, and visual icons mapped across the Dealy KE discovery catalog.</p>
                  </div>
                  <button 
                    onClick={() => setEditingCategory({
                      name: '',
                      icon: 'Layers',
                      description: ''
                    })}
                    className="bg-[#D9411E] hover:bg-black text-white font-mono uppercase text-xs tracking-wider px-4 py-2 flex items-center gap-1 font-bold transition"
                  >
                    <Plus className="h-4 w-4" /> Add Category
                  </button>
                </div>

                {editingCategory && (
                  <form onSubmit={handleSaveCategory} className="border border-[#D9411E] bg-white p-6 space-y-4 max-w-2xl font-mono text-xs">
                    <div className="flex justify-between border-b pb-2 mb-4">
                      <h4 className="font-serif text-base font-bold text-[#D9411E] uppercase">
                        {editingCategory.id ? 'Modify Category' : 'Configure New Category'}
                      </h4>
                      <button type="button" onClick={() => setEditingCategory(null)}>
                        <X className="h-4 w-4 text-zinc-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-bold">Category Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Smart Watches"
                          value={editingCategory.name || ''} 
                          onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                          required
                          className="w-full bg-[#FCFBFA] border p-2 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold">Lucide Icon key</label>
                        <input 
                          type="text" 
                          placeholder="e.g. ActivityName, SparklesName"
                          value={editingCategory.icon || ''} 
                          onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                          className="w-full bg-[#FCFBFA] border p-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold block">Optional Description</label>
                      <textarea 
                        rows={2}
                        placeholder="Highlight details of items inside this category shelf..."
                        value={editingCategory.description || ''} 
                        onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                        className="w-full bg-[#FCFBFA] border p-2 text-xs"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingCategory(null)} className="bg-zinc-200 text-zinc-700 px-4 py-2 hover:bg-zinc-300 transition font-bold">Cancel</button>
                      <button type="submit" className="bg-[#D9411E] text-white px-6 py-2 hover:bg-black transition font-bold">Save Category</button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map(c => (
                    <div key={c.id} className="border border-zinc-200 bg-white p-4 flex flex-col justify-between hover:border-black transition">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs bg-zinc-100 px-2 py-0.5 border text-zinc-700">{c.slug}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">Icon: {c.icon}</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#121212]">{c.name}</h4>
                        <p className="text-[11px] text-zinc-500 mt-1">{c.description || 'No description provided.'}</p>
                      </div>
                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-zinc-100 font-mono text-[10px]">
                        <button onClick={() => setEditingCategory(c)} className="text-zinc-700 hover:text-black hover:underline font-bold">Edit</button>
                        <button onClick={() => handleDeleteCategory(c.id)} className="text-red-600 hover:text-red-800 hover:underline font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CMS Section 7: FAQS EDITOR */}
            {adminPanel === 'faqs' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-xl font-bold">Help & FAQ Parameters</h3>
                    <p className="text-xs text-zinc-500 mt-1">Update global help files or answer client logistical queries regarding manual JForce commissions and Twiva redirection mechanisms.</p>
                  </div>
                  <button 
                    onClick={() => setEditingFAQ({
                      question: '',
                      answer: '',
                      active: true
                    })}
                    className="bg-[#D9411E] hover:bg-black text-white font-mono uppercase text-xs tracking-wider px-4 py-2 flex items-center gap-1 font-bold transition"
                  >
                    <Plus className="h-4 w-4" /> Add FAQ Item
                  </button>
                </div>

                {editingFAQ && (
                  <form onSubmit={handleSaveFAQ} className="border border-[#D9411E] bg-white p-6 space-y-4 max-w-2xl font-mono text-xs">
                    <div className="flex justify-between border-b pb-2 mb-4">
                      <h4 className="font-serif text-base font-bold text-[#D9411E] uppercase">
                        {editingFAQ.id ? 'Modify FAQ Drop' : 'Create New Help FAQ'}
                      </h4>
                      <button type="button" onClick={() => setEditingFAQ(null)}>
                        <X className="h-4 w-4 text-zinc-400" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold block">Question Heading</label>
                      <input 
                        type="text" 
                        placeholder="e.g. How does commission distribution function?"
                        value={editingFAQ.question || ''} 
                        onChange={(e) => setEditingFAQ({...editingFAQ, question: e.target.value})}
                        required
                        className="w-full bg-[#FCFBFA] border p-2 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold block">Answer Text Body</label>
                      <textarea 
                        rows={3}
                        placeholder="Write dynamic explanatory details here..."
                        value={editingFAQ.answer || ''} 
                        onChange={(e) => setEditingFAQ({...editingFAQ, answer: e.target.value})}
                        required
                        className="w-full bg-[#FCFBFA] border p-2 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="faq-active-check"
                        checked={editingFAQ.active !== false} 
                        onChange={(e) => setEditingFAQ({...editingFAQ, active: e.target.checked})}
                        className="h-4 w-4 accent-[#D9411E]"
                      />
                      <label htmlFor="faq-active-check" className="font-bold select-none cursor-pointer">Activate FAQ immediately for guest observers</label>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingFAQ(null)} className="bg-zinc-200 text-zinc-700 px-4 py-2 hover:bg-zinc-300 transition font-bold">Cancel</button>
                      <button type="submit" className="bg-[#D9411E] text-white px-6 py-2 hover:bg-black transition font-bold">Save FAQ</button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {faqs.map(f => (
                    <div key={f.id} className="border border-zinc-200 bg-white p-5 space-y-2 relative">
                      <span className={`absolute top-4 right-4 text-[9px] uppercase font-mono px-2 py-0.5 font-bold ${f.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {f.active ? 'Active on Web' : 'Draft'}
                      </span>
                      <h4 className="font-serif font-bold text-base text-zinc-900 pr-20">{f.question}</h4>
                      <p className="text-xs text-zinc-650 text-zinc-500 leading-relaxed font-sans">{f.answer}</p>
                      <div className="flex gap-3 font-mono text-[10px] pt-3 border-t border-zinc-100 justify-end">
                        <button onClick={() => setEditingFAQ(f)} className="text-zinc-700 hover:text-black font-semibold hover:underline">Edit</button>
                        <button onClick={() => handleDeleteFAQ(f.id)} className="text-red-600 hover:text-red-800 font-semibold hover:underline">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CMS Section 8: HOMEPAGE BANNERS */}
            {adminPanel === 'banners' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-xl font-bold">Curated Showcase Banners</h3>
                    <p className="text-xs text-zinc-500 mt-1">Modify active slide images, captions and redirection tags presented to catalog visitors.</p>
                  </div>
                  <button 
                    onClick={() => setEditingBanner({
                      title: '',
                      subtitle: '',
                      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
                      link: '/catalog',
                      active: true
                    })}
                    className="bg-[#D9411E] hover:bg-black text-white font-mono uppercase text-xs tracking-wider px-4 py-2 flex items-center gap-1 font-bold transition"
                  >
                    <Plus className="h-4 w-4" /> Add Exhibition Banner
                  </button>
                </div>

                {editingBanner && (
                  <form onSubmit={handleSaveBanner} className="border border-[#D9411E] bg-white p-6 space-y-4 max-w-2xl font-mono text-xs">
                    <div className="flex justify-between border-b pb-2 mb-4">
                      <h4 className="font-serif text-base font-bold text-[#D9411E] uppercase">
                        {editingBanner.id ? 'Update Banner Image Drop' : 'Setup Exhibition Slide Banner'}
                      </h4>
                      <button type="button" onClick={() => setEditingBanner(null)}>
                        <X className="h-4 w-4 text-zinc-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-bold">Banner Header Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Tech Deals Nairobi"
                          value={editingBanner.title || ''} 
                          onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                          required
                          className="w-full bg-[#FCFBFA] border p-2 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold">Redirection catalog Link</label>
                        <input 
                          type="text" 
                          placeholder="e.g. /catalog?category=phones"
                          value={editingBanner.link || ''} 
                          onChange={(e) => setEditingBanner({...editingBanner, link: e.target.value})}
                          className="w-full bg-[#FCFBFA] border p-2 text-xs"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="font-bold">Showcase image URL</label>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com/..."
                          value={editingBanner.image || ''} 
                          onChange={(e) => setEditingBanner({...editingBanner, image: e.target.value})}
                          required
                          className="w-full bg-[#FCFBFA] border p-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold block">Secondary Promo Subtitle</label>
                      <input 
                        type="text"
                        placeholder="e.g. Buy authentic items compiled from Nairobi warehouses with commissions."
                        value={editingBanner.subtitle || ''} 
                        onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})}
                        className="w-full bg-[#FCFBFA] border p-2 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="banner-active-check"
                        checked={editingBanner.active !== false} 
                        onChange={(e) => setEditingBanner({...editingBanner, active: e.target.checked})}
                        className="h-4 w-4 accent-[#D9411E]"
                      />
                      <label htmlFor="banner-active-check" className="font-bold select-none cursor-pointer">Make banner slide live on user carousel</label>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingBanner(null)} className="bg-zinc-200 text-zinc-700 px-4 py-2 hover:bg-zinc-300 transition font-bold">Cancel</button>
                      <button type="submit" className="bg-[#D9411E] text-white px-6 py-2 hover:bg-black transition font-bold">Deploy Banner</button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {banners.map(b => (
                    <div key={b.id} className="border border-zinc-200 bg-white p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3">
                        <img 
                          src={b.image} 
                          alt={b.title} 
                          className="w-full h-24 object-cover border border-zinc-200"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="md:col-span-6 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] uppercase px-1.5 py-0.5 border font-mono font-bold ${b.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {b.active ? 'LIVE EXHIBITION' : 'STANDBY'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">Target route: {b.link}</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-zinc-900">{b.title}</h4>
                        <p className="text-xs text-zinc-500">{b.subtitle}</p>
                      </div>
                      <div className="md:col-span-3 text-right font-mono text-[10px] space-x-2 border-t pt-3 md:pt-0 md:border-0">
                        <button onClick={() => setEditingBanner(b)} className="text-zinc-700 hover:text-black hover:underline font-bold">Edit Variables</button>
                        <button onClick={() => handleDeleteBanner(b.id)} className="text-red-600 hover:text-red-800 hover:underline font-bold">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CMS Section 9: CLICKS & COMMISSIONS ANALYTICS */}
            {adminPanel === 'analytics' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-serif text-xl font-bold">Reconstruction Clicks, Traffic & Commissions dashboard</h3>
                  <p className="text-xs text-zinc-500 mt-1">Real-time trace trackers of user clicks outbound on Twiva affiliate checkout nodes as well as partner-referred transactions.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="border border-zinc-200 bg-[#FCFBFA] p-5">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Aggregated Click Events</span>
                    <strong className="font-serif text-3xl font-bold block mt-1 text-[#121212]">{clicks.length}</strong>
                    <div className="text-[10px] text-emerald-600 font-mono mt-1 font-bold">↑ 100% real-time direct traces</div>
                  </div>
                  <div className="border border-zinc-200 bg-[#FCFBFA] p-5">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Total JForce/Jumia Orders</span>
                    <strong className="font-serif text-3xl font-bold block mt-1 text-[#D9411E]">
                      {orders.filter(o => o.productSource === ProductSource.JFORCE).length}
                    </strong>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">requested from JForce/Jumia products</div>
                  </div>
                  <div className="border border-zinc-200 bg-[#FCFBFA] p-5">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Estimated Commission value</span>
                    <strong className="font-serif text-3xl font-bold block mt-1 text-zinc-800">KES {(orders.length * 1200 + clicks.length * 50).toLocaleString()}</strong>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">Attributed based on 2.5% resale scale</div>
                  </div>
                  <div className="border border-zinc-200 bg-[#FCFBFA] p-5">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Jumia/JForce Total Sales Value</span>
                    <strong className="font-serif text-3xl font-bold block mt-1 text-green-700">
                      KES {orders
                        .filter(o => o.productSource === ProductSource.JFORCE)
                        .reduce((acc, o) => acc + (o.productPrice * o.quantity), 0)
                        .toLocaleString()}
                    </strong>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1">Total revenue generated from Jumia/JForce bookings</div>
                  </div>
                </div>

                {/* Simulated Clicks charts visualizer */}
                <div className="border border-[#121212]/10 bg-white p-6 space-y-4 font-mono text-xs">
                  <h4 className="font-serif text-base font-bold text-zinc-800">Traffic Distribution by Catalog Category</h4>
                  <div className="space-y-2.5 pt-2">
                    {categories.map((cat, i) => {
                      const count = products.filter(p => p.category === cat.slug).length;
                      const percentage = products.length ? Math.round((count / products.length) * 100) : 0;
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold flex items-center gap-1.5">● {cat.name} ({cat.slug})</span>
                            <span className="text-zinc-500">{percentage}% of inventory logs</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-2.5 rounded-none border border-zinc-200 overflow-hidden">
                            <div 
                              className={`h-full border-r ${
                                i % 3 === 0 ? 'bg-[#D9411E] border-red-700' : i % 3 === 1 ? 'bg-green-600 border-green-800' : 'bg-[#121212] border-zinc-800'
                              }`} 
                              style={{ width: `${Math.max(percentage, 8)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Click Logs Table */}
                <div className="border border-[#121212]/15 overflow-x-auto bg-white font-mono text-[11px]">
                  <h4 className="font-serif text-sm font-bold border-b p-3 bg-zinc-100 uppercase tracking-widest text-zinc-700">Live Traffic Trackers</h4>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900 text-white uppercase tracking-wider text-[9px]">
                        <th className="p-3">Track Event Id</th>
                        <th className="p-3">Click Item Name</th>
                        <th className="p-3">Commission Channel</th>
                        <th className="p-3">Affiliate Tag Coordinates</th>
                        <th className="p-3 text-right">Click Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#121212]/10">
                      {clicks.map((clk) => (
                        <tr key={clk.id} className="hover:bg-zinc-50 transition">
                          <td className="p-3 font-semibold text-zinc-400 select-all">{clk.id}</td>
                          <td className="p-3 font-bold">{clk.productTitle}</td>
                          <td className="p-3">
                            <span className="bg-red-50 text-orange-700 font-bold border border-orange-200 py-0.5 px-2 text-[9px] uppercase rounded-none">
                              {clk.productSource}
                            </span>
                          </td>
                          <td className="p-3">
                            {clk.referredBy ? (
                              <span className="text-green-700 font-bold bg-green-50 border border-green-200 px-1.5 py-0.5 text-[10px] uppercase">
                                Referred: {clk.referredBy}
                              </span>
                            ) : (
                              <span className="text-zinc-400 italic">Organic guest discovery</span>
                            )}
                          </td>
                          <td className="p-3 text-right text-zinc-500 font-sans">{new Date(clk.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-[#121212]/15 bg-[#FCFBFA] py-12 px-6 mt-16 text-xs text-[#121212]/75 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold tracking-tight uppercase">DEALY KE</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed whitespace-pre-line">
              {"Dealy KE is a Kenyan deal discovery platform that helps shoppers find the best products, prices, and offers from trusted online marketplaces and sellers in one place. We compare deals, source genuine discounts, and help customers save time and money by making it easier to find and order the best offers available.\n\nDealy KE – Find Better Deals. Shop Smarter. Save More."}
            </p>
            <div className="text-[10px] font-mono tracking-widest text-[#D9411E] font-bold">
              © 2026 DEALY.CO.KE • NAIROBI
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-sans font-bold uppercase text-[10px] tracking-widest">Aggregated Networks</h4>
            <ul className="space-y-1.5 text-zinc-500 text-[11px]">
              <li><button onClick={() => { setSelectedSource(ProductSource.JFORCE); setActiveTab('catalog'); }} className="hover:text-black hover:underline text-left">JForce (Reseller manual drops)</button></li>
              <li><button onClick={() => { setSelectedSource(ProductSource.TWIVA); setActiveTab('catalog'); }} className="hover:text-black hover:underline text-left">Twiva (Affiliate redirect links)</button></li>
              <li><button onClick={() => { setSelectedCategory('phones'); setActiveTab('catalog'); }} className="hover:text-black hover:underline text-left">Infinix, Redmi & Tecno drops</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-sans font-bold uppercase text-[10px] tracking-widest text-[#111]">Platform Discovery</h4>
            <div className="flex flex-col gap-1.5 text-zinc-500 text-[11px] items-start">
              <button onClick={() => { setActiveTab('catalog'); }} className="hover:text-black">Catalog Drops</button>
              <button onClick={() => { setActiveTab('blogs'); }} className="hover:text-black">Buying Guides</button>
              <button onClick={() => {
                setLoginModalAdminMode(true);
                setIsLoginModalOpen(true);
              }} className="hover:text-[#D9411E] font-bold">Admin Login</button>
              <button onClick={() => setActiveTab('faqs')} className="hover:text-black">Help & FAQ</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-sans font-bold uppercase text-[10px] tracking-widest text-[#111]">Metadata optimization</h4>
            <p className="text-[11px] text-zinc-550 text-zinc-500 leading-relaxed">
              Optimized for: <em>"Best deals Kenya"</em>, <em>"Cheap phones Kenya"</em>, <em>"best deals from Jumia"</em>, <em>"Online shopping Kenya"</em>. sitemap.xml and robots.txt preview logs valid.
            </p>
          </div>

        </div>
      </footer>

      {/* COMPONENT 7: COLLAPSIBLE RIGHT-SIDE AI SHOPPING ASSISTANT PANEL */}
      {aiOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white border-l border-[#121212]/15 shadow-2xl flex flex-col font-sans animate-slide-in">
          
          {/* Header Panel */}
          <div className="p-4 bg-[#121212] text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D9411E] animate-ping"></span>
              <Bot className="h-5 w-5 text-[#D9411E]" />
              <div>
                <h3 className="font-serif text-sm font-bold tracking-wide italic">Dealy KE Shopping AI</h3>
                <p className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase">ACTIVE CORRELATION CONTEXT</p>
              </div>
            </div>
            
            <button 
              onClick={() => setAiOpen(false)}
              className="text-zinc-400 hover:text-white p-1"
              title="Collapse chat pane"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick recommendations shortcuts bar */}
          <div className="bg-[#F2F0ED] p-2.5 border-b border-[#121212]/10 flex gap-2 overflow-x-auto select-none overflow-y-hidden shrink-0">
            {[
              "Best phone under KES 25000",
              "Suggest JForce deals ready to order",
              "How does Twiva coordinate clicks?"
            ].map((pText, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAiInput(pText);
                  showToast('Shortcut command preset!');
                }}
                className="bg-white border text-[10px] hover:border-[#D9411E] text-zinc-700 font-serif italic px-2.5 py-1 whitespace-nowrap shrink-0 transition"
              >
                "{pText}"
              </button>
            ))}
          </div>

          {/* Chat scrolling bubbles viewport */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FCFBFA]"
          >
            {aiHistory.map((m, i) => (
              <div 
                key={i} 
                className={`flex flex-col gap-1 max-w-[85%] ${m.role === 'user' ? 'ml-auto items-end animate-fade-in' : 'mr-auto items-start'}`}
              >
                <span className="font-mono text-[8px] tracking-widest uppercase text-zinc-400">
                  {m.role === 'model' ? 'Dealy KE Assistant Agent' : 'Moses (Registered Curation Client)'}
                </span>

                <div className={`p-3.5 text-xs md:text-[13px] leading-relaxed select-text ${
                  m.role === 'user' 
                    ? 'bg-zinc-100 text-[#121212]' 
                    : 'bg-white border border-[#121212]/10 text-[#121212] font-serif italic shadow-sm'
                }`}>
                  {m.text}
                </div>

                {/* Intelligent context attachment card overlay */}
                {m.linkProduct && (
                  <div className="bg-white border border-[#D9411E]/30 p-2.5 flex gap-2 mt-1.5 text-xs w-full">
                    <img src={m.linkProduct.imageUrl} alt={m.linkProduct.title} className="h-10 w-10 object-cover shrink-0 grayscale" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-xs truncate text-[#111]">{m.linkProduct.title}</h4>
                      <p className="text-[10px] font-mono font-bold text-[#D9411E]">KES {m.linkProduct.price.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedProduct(m.linkProduct!);
                        setAiOpen(false);
                      }}
                      className="text-[#D9411E] hover:text-black font-mono font-extrabold uppercase text-[9px] shrink-0 self-center underline"
                    >
                      View drop
                    </button>
                  </div>
                )}
              </div>
            ))}

            {aiLoading && (
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs pl-2">
                <RefreshCw className="h-3 w-3 animate-spin text-[#D9411E]" />
                <span>AI shopping assistant compiles recommendations...</span>
              </div>
            )}
          </div>

          {/* Input text board controller */}
          <div className="p-3 border-t border-[#121212]/15 bg-[#F2F0ED] shrink-0">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Consult about stock, Jumia deals, shipping..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAIAgent()}
                className="flex-1 bg-white border border-[#121212]/20 py-2 pl-3 pr-2 text-xs focus:outline-none focus:border-[#D9411E]"
              />
              <button 
                onClick={askAIAgent}
                disabled={aiLoading}
                className="bg-[#121212] hover:bg-opacity-80 disabled:opacity-50 text-white px-4 py-2 text-xs font-mono uppercase tracking-widest font-bold"
              >
                Send
              </button>
            </div>
          </div>

        </aside>
      )}

      {/* COMPONENT 8: DETAILED VIEW MODAL DRAWER FOR PRODUCTS (Reviews, similar items, specs) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-[#121212]">
          <div className="bg-[#FCFBFA] max-w-2xl w-full border border-[#121212]/15 shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#F2F0ED] border-b border-[#121212]/10 flex justify-between items-center sticky top-0 bg-white/95 z-20">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase">PRODUCT DOSSIER BRIEF:</span>
                <span className="text-[10px] font-bold text-white bg-[#D9411E] px-2 uppercase font-mono tracking-wider">{selectedProduct.source}</span>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-zinc-500 hover:text-black p-1 bg-white border rounded-full"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content pane */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              <div className="flex flex-col space-y-8">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                  {/* Image side with border display */}
                  <div className="aspect-square bg-[#F2F0ED] border border-zinc-200 overflow-hidden relative flex items-center justify-center">
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="max-w-full max-h-full object-contain" />
                  </div>

                  {/* Parameter details list */}
                  <div className="space-y-6">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#D9411E] font-bold">{selectedProduct.category} Drop</span>
                      <h2 className="font-serif text-3xl font-bold leading-tight mt-1">{selectedProduct.title}</h2>
                      <div className="flex items-center gap-1 text-sm text-zinc-650 opacity-90 mt-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                        <strong className="text-zinc-800">{selectedProduct.rating} Rating</strong>
                        <span className="text-zinc-400">•</span>
                        <span>{selectedProduct.reviewsCount} local review logs</span>
                      </div>
                    </div>

                    <div className="border-t border-b border-[#121212]/10 py-4 flex justify-between items-center font-mono">
                      <div>
                        <span className="text-[8px] uppercase tracking-tighter text-zinc-500 block">Localized Price</span>
                        <strong className="text-2xl text-[#111]">KES {selectedProduct.price.toLocaleString()}</strong>
                        {selectedProduct.originalPrice && (
                          <span className="text-xs text-zinc-400 line-through block font-medium">KES {selectedProduct.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => toggleWishlist(selectedProduct.id)}
                        className={`p-3 border transition ${wishlist.includes(selectedProduct.id) ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-zinc-300 text-zinc-400 hover:text-rose-600 bg-white'}`}
                        title="Save drop code"
                      >
                        <Heart className="h-5 w-5 fill-current" />
                      </button>
                    </div>

                    {/* Redirection actions board */}
                    <div className="space-y-3 pt-2">
                      {selectedProduct.source === ProductSource.JFORCE ? (
                        <div className="space-y-2">
                          <button 
                            onClick={() => setIsOrderModalOpen(true)}
                            className="w-full bg-[#121212] hover:bg-opacity-80 text-white font-mono text-xs uppercase tracking-widest font-extrabold py-4 transition"
                          >
                            Request Order Fulfillment
                          </button>
                          <p className="text-[10px] text-zinc-500 leading-normal italic text-center">
                            *Manual checkout managed through Jumia JForce parameters. No client credit marks required on site setup.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button 
                            onClick={() => trackClick(selectedProduct)}
                            className="w-full bg-[#D9411E] hover:bg-black text-white font-mono text-xs uppercase tracking-widest font-extrabold py-4 transition"
                          >
                            Buy via Partner Link (Twiva)
                          </button>
                          <p className="text-[10px] text-zinc-500 leading-normal italic text-center">
                            *Redirects with affiliate tracking metrics. Commission calculated on completed merchant cart.
                          </p>
                        </div>
                      )}

                      {/* Copiable share link with tracking preset */}
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://dealy.co.ke/?product=${selectedProduct.id}&ref=${partnerRefCode}`);
                          showToast('Special curation referral link captured!');
                        }}
                        className="w-full border border-dashed border-zinc-400 hover:border-black py-2.5 text-[10px] font-mono uppercase tracking-wider text-zinc-650 flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="h-3.5 w-3.5" /> Share Curated code drop URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Redesigned Description - Now below the main actions and full width */}
                <div className="border-t border-[#121212]/10 pt-6">
                  <span className="font-mono text-[10px] text-[#D9411E] font-bold block uppercase mb-3">PRODUCT STORY & DETAILS</span>
                  <div className="bg-white border border-[#121212]/5 p-6 shadow-sm">
                    <p className="text-sm md:text-base text-zinc-700 leading-relaxed font-sans whitespace-pre-line">
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>

              </div>

              {/* Specifications checklist column details */}
              <div className="border border-zinc-200 bg-[#F2F0ED] p-4 space-y-2">
                <span className="font-mono text-[10px] text-[#D9411E] font-bold block uppercase">VERIFIED TECHNICAL SCHEMES</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-700">
                  {selectedProduct.specifications.map((spec, sIdx) => (
                    <div key={sIdx} className="flex gap-2 items-start font-mono text-[11px]">
                      <span className="text-[#D9411E] shrink-0">◇</span>
                      <span>{spec}</span>
                    </div>
                  ))}
                  {selectedProduct.jforceSku && (
                    <div className="col-span-2 font-mono text-[10px] text-zinc-500 pt-2 border-t border-zinc-300">
                      SKU CODE: <strong>{selectedProduct.jforceSku}</strong> | Reseller tracking activated.
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Review Section */}
              <div className="space-y-4 border-t border-[#121212]/10 pt-6">
                <h3 className="font-serif text-lg font-bold italic">Buyer Opinions & Reviews ({reviews.filter(r => r.productId === selectedProduct.id).length})</h3>
                
                {reviews.filter(r => r.productId === selectedProduct.id).length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">No localized review logs published on this item yet. Be the first to express opinion!</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.filter(r => r.productId === selectedProduct.id).map((rev) => (
                      <div key={rev.id} className="border p-3 space-y-1 bg-white text-xs">
                        <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                          <span>User: <strong>{rev.userName}</strong></span>
                          <span>Rating: {'★'.repeat(rev.rating)}</span>
                        </div>
                        <p className="text-zinc-600 italic font-serif leading-relaxed">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit New Review Form */}
                <form onSubmit={handleReviewSubmit} className="border p-4 bg-zinc-50 space-y-3 font-mono text-xs">
                  <span className="font-bold text-[10px] text-zinc-500 block">SHARE YOUR DEAL EXPERIENCE:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold">Your Name</label>
                      <input 
                        type="text" 
                        value={reviewForm.name} 
                        onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                        required
                        className="w-full bg-white border p-1 rounded-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold">Rating stars</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                        className="w-full bg-white border p-1 rounded-none text-xs text-amber-600 font-bold"
                      >
                        <option value="5">★★★★★ Premium (5/5)</option>
                        <option value="4">★★★★ High spec (4/5)</option>
                        <option value="3">★★★ Average budget (3/5)</option>
                        <option value="2">★★ Casual test (2/5)</option>
                        <option value="1">★ Terrible markup (1/5)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold">Comment feedback</label>
                    <textarea 
                      rows={2}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                      required
                      placeholder="Comment on camera performance, Nairobi shipment delays..."
                      className="w-full bg-white border p-1.5 rounded-none text-xs font-sans placeholder-zinc-400"
                    />
                  </div>

                  <button type="submit" className="bg-[#121212] hover:bg-opacity-80 text-white font-mono uppercase text-[9px] font-bold tracking-wider px-4 py-1.5">
                    Broadcast Review
                  </button>
                </form>

              </div>

              {/* Similar curations matching category */}
              <div className="space-y-3 border-t border-[#121212]/10 pt-6">
                <h4 className="font-serif text-sm font-bold uppercase text-zinc-550">Curated similar deals in network:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 2).map((sim) => (
                    <div 
                      key={sim.id} 
                      onClick={() => {
                        setSelectedProduct(sim);
                        showToast(`Transitioning similar curation: ${sim.title}`);
                      }}
                      className="p-2 border hover:border-black cursor-pointer bg-white flex gap-2 items-center"
                    >
                      <img src={sim.imageUrl} alt={sim.title} className="h-8 w-8 object-cover shrink-0 grayscale" />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-serif font-bold text-[11px] truncate">{sim.title}</h5>
                        <p className="font-mono text-[9px] text-[#D9411E] font-medium">KES {sim.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* COMPONENT 9: JFORCE RESELL MANUAL ORDER REQUEST MODAL FORM */}
      {isOrderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-55 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-[#121212]">
          <div className="bg-white max-w-md w-full border border-black shadow-2xl p-6 relative font-mono text-xs space-y-4">
            
            <div className="flex justify-between border-b pb-2 mb-2">
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-zinc-450 uppercase tracking-widest block">ADMIN COURIER DISPATCH</span>
                <h3 className="font-serif text-base font-bold text-[#D9411E] italic uppercase">JForce Manual Reseller Request</h3>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)}>
                <X className="h-4.5 w-4.5 text-zinc-400 hover:text-black" />
              </button>
            </div>

            {orderStatusFeedback === 'success' ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 flex items-center justify-center">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-serif font-bold text-base text-zinc-800">Request logged successfully!</h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  An administrator has been dispatched with JForce SKU code: <strong className="text-zinc-700">{selectedProduct.jforceSku || 'N/A'}</strong>. Our logistic system will reach you on {orderForm.phone} shortly.
                </p>
                <div className="text-[10px] uppercase tracking-wide text-zinc-400 pt-2 block border-t">
                  Status: QUEUED FOR VERIFICATION
                </div>
              </div>
            ) : (
              <form onSubmit={handleJforceOrderSubmit} className="space-y-3">
                
                <div className="bg-[#F2F0ED] p-3 text-[11px] space-y-1 text-zinc-650">
                  <div className="font-bold font-serif italic text-[#121212]">{selectedProduct.title}</div>
                  <div className="flex justify-between text-[#D9411E] font-bold font-mono">
                    <span>Est price KES:</span>
                    <span>KES {selectedProduct.price.toLocaleString()}</span>
                  </div>
                  {selectedProduct.jforceSku && <div className="text-[9px] text-zinc-400">Jforce Sku: {selectedProduct.jforceSku}</div>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block text-zinc-700">Full Name</label>
                  <input 
                    type="text" 
                    value={orderForm.name} 
                    onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                    required
                    placeholder="E.g. Moses Mwai"
                    className="w-full bg-[#FCFBFA] border p-2 focus:outline-none text-xs font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block text-zinc-700">Email Address</label>
                  <input 
                    type="email" 
                    value={orderForm.email || ''} 
                    onChange={(e) => setOrderForm({...orderForm, email: e.target.value})}
                    required
                    placeholder="E.g. mosesmwai609@gmail.com"
                    className="w-full bg-[#FCFBFA] border p-2 focus:outline-none text-xs font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Delivery Location (Nairobi / County)</label>
                  <input 
                    type="text" 
                    value={orderForm.location} 
                    onChange={(e) => setOrderForm({...orderForm, location: e.target.value})}
                    required
                    placeholder="E.g Westlands Mall kiosk 4, Nairobi"
                    className="w-full bg-[#FCFBFA] border p-2 focus:outline-none text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold block">My Phone (WhatsApp)</label>
                    <input 
                      type="tel" 
                      value={orderForm.phone} 
                      onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                      required
                      className="w-full bg-[#FCFBFA] border p-2 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold block">Quantity Required</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={orderForm.qty} 
                      onChange={(e) => setOrderForm({...orderForm, qty: Number(e.target.value)})}
                      required
                      className="w-full bg-[#FCFBFA] border p-2 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Delivery notes (hours, contacts)</label>
                  <textarea 
                    rows={2}
                    value={orderForm.notes} 
                    onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                    placeholder="E.g deliver after office hours..."
                    className="w-full bg-[#FCFBFA] border p-2 focus:outline-none text-xs font-sans"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-[#121212] hover:bg-[#25D366] text-white hover:text-[#121212] font-mono text-xs uppercase tracking-widest font-extrabold py-3.5 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md border border-[#121212] hover:border-[#25D366] active:scale-[0.985] select-none"
                  >
                    <span>Dispatch & Complete on WhatsApp ↗</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* COMPONENT 10: FLOATING AI AGENT BUTTON */}
      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#D9411E] hover:bg-[#121212] text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border border-white/20 group"
          title="Consult Dealy KE AI Assistant"
          id="floating-ai-agent-btn"
        >
          <Bot className="h-6 w-6 animate-pulse group-hover:animate-none" />
        </button>
      )}

    </div>
  );
}
