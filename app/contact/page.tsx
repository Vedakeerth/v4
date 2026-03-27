"use client";

import React, { useState } from "react";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, Linkedin, Twitter, Youtube, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage("");

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus('error');
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage("Failed to send message. Please check your connection.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen bg-slate-950 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Touch</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Ready to start your next project or have questions about our services?
              Our team of engineers is here to help you bring your ideas to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors group">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <MapPin className="h-5 w-5" />
                  </span>
                  Office
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Thudilyuar, coimbatore - 641034.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors group">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Phone className="h-5 w-5" />
                  </span>
                  Phone
                </h2>
                <div className="space-y-2 text-sm">
                  <a href="tel:+918903595542" className="block text-slate-300 hover:text-cyan-400 transition-colors">+91 89035 95542</a>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors group">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  Email
                </h2>
                <div className="space-y-2 text-sm">
                  <a href="mailto:support@vaelinsa.com" className="block text-slate-300 hover:text-cyan-400 transition-colors">support@vaelinsa.com</a>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors group">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="p-2 bg-green-500/10 rounded-lg text-green-400">
                    <Clock className="h-5 w-5" />
                  </span>
                  Hours
                </h2>
                <div className="text-slate-300 text-sm space-y-1">
                  <p>Mon - Sat</p>
                  <p className="text-white font-medium">9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900/50 border border-slate-800 p-8 md:p-10 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10 rounded-full"></div>

                {status === 'success' ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Message Sent!</h3>
                    <p className="text-slate-400 mb-8">Thank you for reaching out. Our team will get back to you shortly.</p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-400 ml-1">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-slate-400 ml-1">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXX-XXX-XXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-slate-400 ml-1">Your Message</label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none"
                      ></textarea>
                    </div>

                    {status === 'error' && (
                      <p className="text-red-400 text-sm ml-1">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {status === 'loading' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Send Message
                          <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-20 text-center">
            <h3 className="text-slate-500 font-semibold mb-8 uppercase tracking-[0.2em] text-xs">Stay Connected</h3>
            <div className="flex justify-center gap-4 md:gap-8">
              {[
                { icon: Instagram, url: "https://instagram.com/vaelinsa", label: "Instagram" },
                { icon: Facebook, url: "https://facebook.com/vaelinsa", label: "Facebook" },
                { icon: Linkedin, url: "https://linkedin.com/company/vaelinsa", label: "LinkedIn" },
                { icon: Twitter, url: "https://twitter.com/vaelinsa", label: "Twitter" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all hover:-translate-y-1"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
