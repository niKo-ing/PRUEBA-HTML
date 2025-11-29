import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: BlogPostPage
 * Propósito: Renderizar el detalle de un artículo de blog según `slug` y mejorar SEO.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; usa parámetro de ruta `slug`.
 *
 * Métodos/funciones:
 * - Ninguno propio; actualiza `document.title` y meta tags.
 *
 * Hooks utilizados:
 * - useParams: leer `slug`.
 * - useNavigate: navegación a listados y atrás.
 * - useEffect: setear título y meta/OG tags cuando `post` existe.
 *
 * Ejemplo de uso:
 * ```tsx
 * <Route path="/blog/:slug" element={<BlogPostPage />} />
 * ```
 */
import { Container, Row, Col, Badge, Button } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { blogPosts } from "./blogData";
import { useEffect } from "react";
import "@/styles/blog.css";
export default function BlogPostPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const post = blogPosts.find(p => p.slug === slug);
    useEffect(() => {
        if (post) {
            document.title = `${post.title} - Todobarato Blog`;
            // Add meta tags for SEO
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', post.excerpt);
            }
            // Add Open Graph tags
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
                ogTitle.setAttribute('content', post.title);
            }
            const ogDescription = document.querySelector('meta[property="og:description"]');
            if (ogDescription) {
                ogDescription.setAttribute('content', post.excerpt);
            }
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage && post.cover) {
                ogImage.setAttribute('content', window.location.origin + post.cover);
            }
        }
    }, [post]);
    if (!post) {
        return (_jsx(Container, { className: "py-5", children: _jsx(Row, { children: _jsxs(Col, { className: "text-center", children: [_jsx("h1", { className: "display-4", children: "Blog no encontrado" }), _jsx("p", { className: "lead", children: "El art\u00EDculo que buscas no existe o ha sido movido." }), _jsx(Link, { to: "/blogs", className: "text-decoration-none", children: _jsx(Button, { variant: "primary", children: "Volver a todos los blogs" }) })] }) }) }));
    }
    const relatedPosts = blogPosts
        .filter(p => p.id !== post.id && (p.tag === post.tag || Math.random() > 0.5))
        .slice(0, 2);
    return (_jsxs("div", { className: "blog-post-page", children: [_jsx("section", { className: "blog-hero bg-light border-bottom", children: _jsx(Container, { children: _jsx(Row, { className: "align-items-center min-vh-25", children: _jsxs(Col, { lg: 8, className: "mx-auto text-center", children: [_jsxs("div", { className: "mb-3", children: [_jsx(Badge, { bg: "dark", className: "me-2", children: post.tag }), _jsx("small", { className: "text-muted", children: new Date(post.date).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            }) })] }), _jsx("h1", { className: "display-4 fw-bold mb-3", children: post.title }), _jsx("p", { className: "lead text-muted mb-4", children: post.excerpt }), _jsxs("div", { className: "d-flex justify-content-center align-items-center text-muted", children: [_jsxs("span", { className: "me-3", children: [_jsx("i", { className: "bi bi-person me-1" }), post.author] }), _jsxs("span", { children: [_jsx("i", { className: "bi bi-clock me-1" }), post.readTime, " de lectura"] })] })] }) }) }) }), post.cover && (_jsx("section", { className: "blog-cover", children: _jsx(Container, { fluid: true, className: "px-0", children: _jsxs("div", { className: "position-relative", children: [_jsx("img", { src: post.cover, alt: post.title, className: "img-fluid w-100", style: { maxHeight: '500px', objectFit: 'cover' }, onError: (e) => {
                                    e.currentTarget.src = '/assets/img/icono.png';
                                } }), _jsx("div", { className: "position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25" })] }) }) })), _jsx("section", { className: "blog-content py-5", children: _jsx(Container, { children: _jsx(Row, { children: _jsxs(Col, { lg: 8, className: "mx-auto", children: [_jsx("article", { className: "blog-article", dangerouslySetInnerHTML: { __html: post.content } }), post.keywords && post.keywords.length > 0 && (_jsxs("div", { className: "mt-5 pt-4 border-top", children: [_jsx("h6", { className: "text-muted mb-3", children: "Temas relacionados:" }), _jsx("div", { className: "d-flex flex-wrap gap-2", children: post.keywords.map((keyword, index) => (_jsx(Badge, { bg: "secondary", className: "px-3 py-2", children: keyword }, index))) })] })), _jsxs("div", { className: "mt-5 pt-4 border-top", children: [_jsx("h6", { className: "text-muted mb-3", children: "Compartir art\u00EDculo:" }), _jsxs("div", { className: "d-flex gap-2", children: [_jsxs(Button, { variant: "outline-primary", size: "sm", onClick: () => {
                                                        const url = encodeURIComponent(window.location.href);
                                                        const text = encodeURIComponent(post.title);
                                                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                                                    }, children: [_jsx("i", { className: "bi bi-facebook me-1" }), "Facebook"] }), _jsxs(Button, { variant: "outline-info", size: "sm", onClick: () => {
                                                        const url = encodeURIComponent(window.location.href);
                                                        const text = encodeURIComponent(post.title);
                                                        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                                                    }, children: [_jsx("i", { className: "bi bi-twitter me-1" }), "Twitter"] }), _jsxs(Button, { variant: "outline-success", size: "sm", onClick: () => {
                                                        const url = encodeURIComponent(window.location.href);
                                                        window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' - ' + url)}`, '_blank');
                                                    }, children: [_jsx("i", { className: "bi bi-whatsapp me-1" }), "WhatsApp"] }), _jsxs(Button, { variant: "outline-secondary", size: "sm", onClick: () => {
                                                        navigator.clipboard.writeText(window.location.href);
                                                        alert('Enlace copiado al portapapeles');
                                                    }, children: [_jsx("i", { className: "bi bi-link-45deg me-1" }), "Copiar enlace"] })] })] })] }) }) }) }), relatedPosts.length > 0 && (_jsx("section", { className: "related-posts bg-light py-5", children: _jsx(Container, { children: _jsx(Row, { children: _jsxs(Col, { lg: 8, className: "mx-auto", children: [_jsx("h3", { className: "mb-4", children: "Art\u00EDculos relacionados" }), _jsx(Row, { className: "g-4", children: relatedPosts.map((relatedPost) => (_jsx(Col, { md: 6, children: _jsxs("div", { className: "card h-100 shadow-sm related-post-card", children: [relatedPost.cover && (_jsx("img", { src: relatedPost.cover, alt: relatedPost.title, className: "card-img-top", style: { height: '180px', objectFit: 'cover' }, onError: (e) => {
                                                        e.currentTarget.src = '/assets/img/icono.png';
                                                    } })), _jsxs("div", { className: "card-body", children: [_jsx(Badge, { bg: "dark", className: "mb-2", children: relatedPost.tag }), _jsx("h5", { className: "card-title", children: relatedPost.title }), _jsx("p", { className: "card-text text-muted", children: relatedPost.excerpt }), _jsx(Link, { to: `/blog/${relatedPost.slug}`, className: "text-decoration-none", children: _jsx(Button, { variant: "outline-primary", size: "sm", children: "Leer m\u00E1s" }) })] })] }) }, relatedPost.id))) })] }) }) }) })), _jsx("section", { className: "blog-navigation py-4", children: _jsx(Container, { children: _jsx(Row, { children: _jsxs(Col, { className: "text-center", children: [_jsxs(Button, { variant: "outline-secondary", className: "me-3", onClick: () => navigate('/blogs'), children: [_jsx("i", { className: "bi bi-arrow-left me-1" }), "Volver a todos los blogs"] }), _jsx(Button, { variant: "primary", onClick: () => navigate(-1), children: "Volver atr\u00E1s" })] }) }) }) })] }));
}
