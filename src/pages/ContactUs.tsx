import React from 'react';
import { Mail, MessageCircle, MapPin, Clock, Send } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="space-y-12 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-[#121212]">Contact Our Team</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Have a question about a deal or need help with an order? Our team is available to assist you through any of our official channels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border border-[#121212]/10 p-8 bg-white space-y-4 text-center group hover:border-[#D9411E] transition-colors">
          <div className="h-12 w-12 bg-orange-50 text-[#D9411E] rounded-full flex items-center justify-center mx-auto group-hover:bg-[#D9411E] group-hover:text-white transition-all">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="font-serif font-bold text-lg">Email Us</h3>
          <div className="space-y-1 text-sm text-zinc-600">
            <p><a href="mailto:hello@dealykenya.shop" className="hover:text-[#D9411E]">hello@dealykenya.shop</a></p>
            <p><a href="mailto:support@dealykenya.shop" className="hover:text-[#D9411E]">support@dealykenya.shop</a></p>
          </div>
        </div>

        <div className="border border-[#121212]/10 p-8 bg-white space-y-4 text-center group hover:border-[#25D366] transition-colors">
          <div className="h-12 w-12 bg-green-50 text-[#25D366] rounded-full flex items-center justify-center mx-auto group-hover:bg-[#25D366] group-hover:text-white transition-all">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h3 className="font-serif font-bold text-lg">WhatsApp</h3>
          <p className="text-sm text-zinc-600">Quick response for orders & queries</p>
          <a 
            href="https://wa.me/254755442515" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#25D366] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
          >
            Chat Now
          </a>
        </div>

        <div className="border border-[#121212]/10 p-8 bg-white space-y-4 text-center group hover:border-[#121212] transition-colors">
          <div className="h-12 w-12 bg-zinc-50 text-zinc-900 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#121212] group-hover:text-white transition-all">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="font-serif font-bold text-lg">Service Hours</h3>
          <div className="space-y-1 text-sm text-zinc-600">
            <p>Mon - Fri: 8AM - 6PM</p>
            <p>Saturday: 9AM - 2PM</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto border border-[#121212]/15 bg-[#F2F0ED] p-8 md:p-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold italic">Send us a direct message</h2>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs">
            <div className="space-y-2">
              <label className="font-bold uppercase tracking-widest text-zinc-500">Your Full Name</label>
              <input type="text" className="w-full bg-white border border-zinc-300 p-3 focus:outline-none focus:border-[#D9411E]" placeholder="Moses Mwai" />
            </div>
            <div className="space-y-2">
              <label className="font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
              <input type="email" className="w-full bg-white border border-zinc-300 p-3 focus:outline-none focus:border-[#D9411E]" placeholder="name@example.com" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="font-bold uppercase tracking-widest text-zinc-500">Message Content</label>
              <textarea rows={5} className="w-full bg-white border border-zinc-300 p-3 focus:outline-none focus:border-[#D9411E]" placeholder="Tell us how we can help..."></textarea>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="w-full bg-[#121212] text-white py-4 font-bold uppercase tracking-[0.2em] hover:bg-[#D9411E] transition-all flex items-center justify-center gap-2">
                <Send className="h-4 w-4" /> Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
