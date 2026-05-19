import React from 'react';

interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VAELINSA',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com'}/images/logo.png`,
    description: 'Premium 3D printing, product design, and rapid prototyping services for engineering and industrial applications.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'sales@vaelinsa.com',
      availableLanguage: ['English'],
    },
    sameAs: [
      // Add social media links when available
      // 'https://www.facebook.com/vaelinsa',
      // 'https://www.linkedin.com/company/vaelinsa',
      // 'https://twitter.com/vaelinsa',
    ],
  };

  return <StructuredData data={schema} />;
}

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'VAELINSA',
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com'}/images/social-preview.png`,
    '@id': process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com',
    telephone: '+91 89035 95542',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Avinashi Road',
      addressLocality: 'Coimbatore',
      addressRegion: 'Tamil Nadu',
      postalCode: '641018',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 11.0168,
      longitude: 76.9558,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [],
  };

  return <StructuredData data={schema} />;
}

export function ServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: '3D Printing Services',
    provider: {
      '@type': 'Organization',
      name: 'VAELINSA',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '3D Printing Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'FDM 3D Printing',
            description: 'High-strength functional parts using PLA, PETG, ABS, and Carbon Fiber composites.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'SLA / Resin Printing',
            description: 'Ultra-high resolution prints for detailed prototypes, miniatures, and dental applications.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Product Design',
            description: 'End-to-end mechanical design and CAD engineered for manufacturability.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Rapid Prototyping',
            description: 'Iterate faster with quick-turnaround functional prototypes to validate your designs.',
          },
        },
      ],
    },
  };

  return <StructuredData data={schema} />;
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VAELINSA',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com'}/quote?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <StructuredData data={schema} />;
}

interface ProductSchemaProps {
  product: {
    id: string | number;
    name: string;
    description: string;
    image: string;
    category?: string;
    price: string | number;
    availabilityStatus?: string;
  };
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com';
  const priceStr = String(product.price || '0');
  const numericPrice = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image.startsWith('/') ? `${baseUrl}${product.image}` : product.image,
    description: product.description,
    sku: `VL-${product.id}`,
    category: product.category || '3D Printed Parts',
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/gallery`,
      priceCurrency: 'INR',
      price: numericPrice,
      availability: product.availabilityStatus === 'Out of Stock' 
        ? 'https://schema.org/OutOfStock' 
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'VAELINSA',
      },
    },
  };

  return <StructuredData data={schema} />;
}

interface BlogPostingSchemaProps {
  blog: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    author: string;
    date: string;
  };
}

export function BlogPostingSchema({ blog }: BlogPostingSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${blog.id}`,
    },
    headline: blog.title,
    image: blog.image.startsWith('/') ? `${baseUrl}${blog.image}` : blog.image,
    datePublished: blog.date,
    dateModified: blog.date,
    author: {
      '@type': 'Person',
      name: blog.author || 'VAELINSA Engineering',
    },
    publisher: {
      '@type': 'Organization',
      name: 'VAELINSA',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
      },
    },
    description: blog.excerpt,
    articleBody: blog.content ? blog.content.replace(/[#*`_]/g, '') : '',
  };

  return <StructuredData data={schema} />;
}

interface BreadcrumbSchemaProps {
  items: {
    name: string;
    item: string;
  }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item.startsWith('/') ? `${baseUrl}${item.item}` : item.item,
    })),
  };

  return <StructuredData data={schema} />;
}
