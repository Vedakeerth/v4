import React from "react";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";
import ContactClient from "./ContactClient";

export const revalidate = 0; // Dynamic rendering for latest configurations

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata('Contact', '/contact');
}

export default function ContactPage() {
  return <ContactClient />;
}
