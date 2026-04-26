"use client";

import React, { useState, useRef } from "react";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, Linkedin, Twitter, Youtube, Loader2, CheckCircle2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const captchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = captchaRef.current?.getValue();
    if (!token) {
      setStatus('error');
      setErrorMessage("Please verify that you are not a robot.");
      return;
    }

    setStatus('loading');
    setErrorMessage("");

    try {
      // Backend Captcha Verification
      const verifyRes = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        throw new Error("Captcha verification failed. Please try again.");
      }

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
        captchaRef.current?.reset();
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Failed to send message. Please check your connection.");
      captchaRef.current?.reset();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
      <div className="dynamic-container px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Touch</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Ready to start your next project or have questions about our services?
              Our team of engineers is here to help you bring your ideas to life.
            </p>
            <div className="h-1.5 w-20 bg-cyan-500 mx-auto mt-8 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors group">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <span className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-500 transition-colors duration-300">
                    <MapPin className="h-5 w-5" />
                  </span>
                  Office
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  Thudilyuar, coimbatore - 641034.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors group">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <span className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors duration-300">
                    <Phone className="h-5 w-5" />
                  </span>
                  WhatsApp Only
                </h2>
                <div className="space-y-2 text-sm">
                  <a href="https://wa.me/918903595542" target="_blank" rel="noopener noreferrer" className="block text-slate-700 dark:text-slate-300 hover:text-cyan-400 transition-colors">+91 89035 95542</a>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors group">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <span className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:bg-purple-500/10 group-hover:text-purple-500 transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                  </span>
                  Email
                </h2>
                <div className="space-y-2 text-sm">
                  <a href="mailto:support@vaelinsa.com" className="block text-slate-700 dark:text-slate-300 hover:text-cyan-400 transition-colors">support@vaelinsa.com</a>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors group">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <span className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors duration-300">
                    <Clock className="h-5 w-5" />
                  </span>
                  Hours
                </h2>
                <div className="text-slate-700 dark:text-slate-300 text-sm space-y-1">
                  <p>Mon - Sat</p>
                  <p className="text-slate-900 dark:text-white font-medium">9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10 rounded-full"></div>

                {status === 'success' ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Message Sent!</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">Thank you for reaching out. Our team will get back to you shortly.</p>
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
                        <label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXX-XXX-XXXX"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">Your Message</label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project..."
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none"
                      ></textarea>
                    </div>

                    {status === 'error' && (
                      <p className="text-red-400 text-sm ml-1">{errorMessage}</p>
                    )}

                    <div className="flex justify-center py-2">
                        {/* IMPORTANT: Use reCAPTCHA v2 Checkbox keys for this component */}
                        {!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                            <div className="w-full max-w-sm p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
                                ⚠️ reCAPTCHA Site Key Missing!
                                <br/>Add NEXT_PUBLIC_RECAPTCHA_SITE_KEY (v2 Checkbox) to .env.local
                            </div>
                        ) : (
                            <ReCAPTCHA
                                ref={captchaRef}
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                            />
                        )}
                    </div>

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
                { icon: Instagram, url: "https://instagram.com/vaelinsa", label: "Instagram", hoverClass: "hover:text-pink-500 hover:border-pink-500/50" },
                { icon: Facebook, url: "https://facebook.com/vaelinsa", label: "Facebook", hoverClass: "hover:text-blue-600 hover:border-blue-600/50" },
                { icon: Linkedin, url: "https://linkedin.com/company/vaelinsa", label: "LinkedIn", hoverClass: "hover:text-blue-500 hover:border-blue-500/50" },
                { icon: Twitter, url: "https://twitter.com/vaelinsa", label: "Twitter", hoverClass: "hover:text-sky-500 hover:border-sky-500/50" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 transition-all hover:-translate-y-1 ${social.hoverClass}`}
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
