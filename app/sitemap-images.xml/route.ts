import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
import { getProjects } from "@/lib/projects";
import { getBlogs } from "@/lib/blogs";
import { createSeoSlug } from "@/lib/seo-utils";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vaelinsa.com";
  const products = await getProducts();
  const projects = await getProjects(500);
  const blogs = await getBlogs(500);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // 1. Add Gallery/Product Images
  products.forEach((product) => {
    const slug = createSeoSlug(product.name, product.id);
    const productUrl = `${baseUrl}/gallery/${slug}`;
    const mainImage = product.image.startsWith("/") ? `${baseUrl}${product.image}` : product.image;

    xml += `
  <url>
    <loc>${productUrl}</loc>
    <image:image>
      <image:loc>${escapeXml(mainImage)}</image:loc>
      <image:title>${escapeXml(product.name)} 3D Print</image:title>
      <image:caption>${escapeXml(product.description || "")}</image:caption>
    </image:image>`;

    if (product.images && product.images.length > 0) {
      product.images.forEach((img, idx) => {
        const fullImg = img.startsWith("/") ? `${baseUrl}${img}` : img;
        xml += `
    <image:image>
      <image:loc>${escapeXml(fullImg)}</image:loc>
      <image:title>${escapeXml(product.name)} Angle ${idx + 1}</image:title>
    </image:image>`;
      });
    }

    xml += `
  </url>`;
  });

  // 2. Add Project Images
  projects.forEach((project) => {
    const slug = createSeoSlug(project.title, project.id);
    const projectUrl = `${baseUrl}/projects/${slug}`;
    const mainImage = project.image.startsWith("/") ? `${baseUrl}${project.image}` : project.image;

    xml += `
  <url>
    <loc>${projectUrl}</loc>
    <image:image>
      <image:loc>${escapeXml(mainImage)}</image:loc>
      <image:title>${escapeXml(project.title)} Prototyping Case Study</image:title>
      <image:caption>${escapeXml(project.description || "")}</image:caption>
    </image:image>`;

    if (project.images && project.images.length > 0) {
      project.images.forEach((img, idx) => {
        if (typeof img === "string" && img.length > 0) {
          const fullImg = img.startsWith("/") ? `${baseUrl}${img}` : img;
          xml += `
    <image:image>
      <image:loc>${escapeXml(fullImg)}</image:loc>
      <image:title>${escapeXml(project.title)} Showcase ${idx + 1}</image:title>
    </image:image>`;
        }
      });
    }

    xml += `
  </url>`;
  });

  // 3. Add Blog Images
  blogs.forEach((blog) => {
    const slug = createSeoSlug(blog.title, blog.id);
    const blogUrl = `${baseUrl}/blog/${slug}`;
    const mainImage = blog.image.startsWith("/") ? `${baseUrl}${blog.image}` : blog.image;

    xml += `
  <url>
    <loc>${blogUrl}</loc>
    <image:image>
      <image:loc>${escapeXml(mainImage)}</image:loc>
      <image:title>${escapeXml(blog.title)}</image:title>
      <image:caption>${escapeXml(blog.excerpt || "")}</image:caption>
    </image:image>
  </url>`;
  });

  xml += `
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
