// Stub implementations for missing server-side libraries
// These are minimal placeholders to allow the admin app to compile in the browser.

// src/lib/seo.ts
export type SEOData = any;
export const getSEOData = async (): Promise<SEOData> => ({} as any);

// src/lib/settings.ts
export type SiteSettings = any;
export const getSettings = async (): Promise<SiteSettings> => ({} as any);
export const saveSettings = async (settings: SiteSettings): Promise<void> => {};

// src/lib/socials.ts
export type SocialLink = any;
export const getSocialLinks = async (): Promise<SocialLink[]> => [];

// src/lib/users.ts
export type User = any;
export type UserRole = any;
export const getUsers = async (): Promise<User[]> => [];

// src/lib/announcements.ts
export type Announcement = any;
export const getAnnouncements = async (): Promise<Announcement[]> => [];

// src/lib/utils.ts
export const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
export const formatINR = (value: number) => `₹${value.toFixed(2)}`;

// src/lib/quote-settings.ts
export type QuoteSettings = any;
export const DEFAULT_QUOTE_SETTINGS: QuoteSettings = {} as any;
export const getQuoteSettings = async (): Promise<QuoteSettings> => DEFAULT_QUOTE_SETTINGS;
export const saveQuoteSettings = async (settings: QuoteSettings): Promise<void> => {};
