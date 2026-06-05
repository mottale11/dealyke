/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  GUEST = 'GUEST',
  CUSTOMER = 'CUSTOMER',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN'
}

export enum ProductSource {
  JFORCE = 'JFORCE',
  TWIVA = 'TWIVA',
  MERCHANT = 'MERCHANT',
  AFFILIATE = 'AFFILIATE'
}

export enum OrderStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  PROCESSING = 'PROCESSING',
  ORDERED = 'ORDERED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  referralCode?: string;
  referredBy?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  specifications: string[]; // key: value pairs or lists
  price: number; // in KES
  originalPrice?: number; // for discount calculation
  imageUrl: string;
  imageGallery: string[]; // support for multiple images
  source: ProductSource;
  category: string;
  affiliateUrl?: string; // for Twiva/Affiliate redirect
  jforceSku?: string; // for administrative JForce track-back
  rating: number;
  reviewsCount: number;
  availability: boolean;
  featured: boolean;
  trending: boolean;
  topSeller: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  description?: string;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productSource: ProductSource;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryLocation: string;
  notes?: string;
  status: OrderStatus;
  referredBy?: string; // affiliate referral tracking
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AffiliateClick {
  id: string;
  productId: string;
  productTitle: string;
  productSource: ProductSource;
  referredBy?: string; // partner referral code
  timestamp: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  author: string;
  imageUrl: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface HomepageBanner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  active: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
}

export interface ReferralStat {
  clicksCount: number;
  signupsCount: number;
  ordersCount: number;
  commissionsEstimated: number; // percentage of Delivered orders
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'order' | 'system' | 'general';
  createdAt: string;
}
