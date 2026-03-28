// The ALLOWED admin emails (comma-separated list in environment)
export const getAdminEmails = (): string[] => {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || "vaelinsa@gmail.com";
  return emails.split(",").map((e: string) => e.trim().toLowerCase());
};

export const ADMIN_EMAIL = getAdminEmails()[0];
