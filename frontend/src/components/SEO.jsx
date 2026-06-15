import { useEffect } from 'react';

const SEO = ({ title, description, keywords, canonicalUrl }) => {
  useEffect(() => {
    // 1. Update Document Title
    if (title) {
      document.title = title;
    }

    // Helper to set or create meta tags
    const setMetaTag = (attributeName, attributeValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Helper to set or create link tags
    const setLinkTag = (rel, href) => {
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (element) {
        element.setAttribute('href', href);
      } else {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        element.setAttribute('href', href);
        document.head.appendChild(element);
      }
    };

    // 2. Update Basic Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);

    // 3. Update Open Graph (OG) tags (for Facebook, WhatsApp, etc.)
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    if (canonicalUrl) {
      setMetaTag('property', 'og:url', canonicalUrl);
      setLinkTag('canonical', canonicalUrl);
    }

    // 4. Update Twitter Card tags
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
  }, [title, description, keywords, canonicalUrl]);

  return null;
};

export default SEO;
