import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us - Get in Touch with VAELINSA",
    description: "Contact VAELINSA for 3D printing services, custom quotes, and engineering solutions. Reach out for your additive manufacturing needs.",
    keywords: ["contact VAELINSA", "3D printing contact", "get quote", "engineering services contact"],
    openGraph: {
        title: "Contact Us | VAELINSA",
        description: "Contact VAELINSA for 3D printing services, custom quotes, and engineering solutions.",
        type: "website",
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
