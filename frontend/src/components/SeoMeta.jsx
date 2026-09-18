import {useEffect} from 'react';

const DEFAULT_TITLE = 'Sen Xinh Garden - Cửa Hàng Sen Đá & Cây Cảnh Nghệ Thuật';
const DEFAULT_DESCRIPTION = 'Mua sen đá, xương rồng, chậu cảnh và phụ kiện cây xanh chất lượng tại Sen Xinh Garden. Giao hàng toàn quốc, tư vấn chăm sóc chuyên nghiệp.';

function setMetaTag(selector, attributes, content) {
    let element = document.querySelector(selector);

    if (!element) {
        element = document.createElement('meta');
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        document.head.appendChild(element);
    }

    element.setAttribute('content', content);
}

function setCanonicalUrl(pathname) {
    const url = new URL(pathname || '/', window.location.origin).toString();
    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical)
        canonical.setAttribute('href', url);
    }

}

export default function SeoMeta({title, description, path, image}) {
    useEffect(() => {
        const finalTitle = title ? `${title} | Sen Xinh Garden` : DEFAULT_TITLE;
        const finalDescription = description || DEFAULT_DESCRIPTION;
        const finalPath = path || '/';
        const finalImage = image || 'https://senxinhgarden.com/og-image.jpg';

        document.title = finalTitle;

        setMetaTag('meta[name="description"]', {name: 'description'}, finalDescription);
        setMetaTag('meta[property="og:title"]', {property: 'og:title'}, finalTitle);
        setMetaTag('meta[property="og:description"]', {property: 'og:description'}, finalDescription);
        setMetaTag('meta[property="og:type"]', {property: 'og:type'}, 'website');
        setMetaTag('meta[property="og:image"]', {property: 'og:image'}, finalImage);
        setMetaTag('meta[property="og:url"]', {property: 'og:url'}, new URL(finalPath, window.location.origin).toString());
        setMetaTag('meta[property="og:site_name"]', {property: 'og:site_name'}, 'Sen Xinh Garden');
        setMetaTag('meta[name="twitter:card"]', {name: 'twitter:card'}, 'summary_large_image');
        setMetaTag('meta[name="twitter:title"]', {name: 'twitter:title'}, finalTitle);
        setMetaTag('meta[name="twitter:description"]', {name: 'twitter:description'}, finalDescription);
        setMetaTag('meta[name="twitter:image"]', {name: 'twitter:image'}, finalImage);
        setMetaTag('meta[name="theme-color"]', {name: 'theme-color'}, '#2d5a3f');

        setCanonicalUrl(finalPath);
    }, [title, description, path, image]);

    return null;
}

