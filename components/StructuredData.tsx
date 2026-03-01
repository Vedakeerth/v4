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
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com'}/images/logo.png`,
    '@id': process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://vaelinsa.com',
    telephone: '+91-XXX-XXX-XXXX',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Add coordinates when available
      // latitude: 0,
      // longitude: 0,
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
