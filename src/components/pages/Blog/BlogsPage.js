import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import "@/styles/blog.css";
const posts = [
    {
        id: "blog-1",
        title: "Guía para elegir tu mouse gamer",
        excerpt: "Sensores, DPI, switches y agarres: lo clave para decidir.",
        date: new Date().toISOString(),
        tag: "Guías",
        cover: "/assets/img/blog1.jpg",
    },
    {
        id: "blog-2",
        title: "Teclados mecánicos: ¿switches rojos, azules o marrones?",
        excerpt: "Compara tipos de switch según uso y preferencias.",
        date: new Date(Date.now() - 86400000).toISOString(),
        tag: "Comparativas",
        cover: "/assets/img/blog2.jpg",
    },
    {
        id: "blog-3",
        title: "Setup eficiente para teletrabajo",
        excerpt: "Ergonomía, iluminación y accesorios que realmente aportan.",
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        tag: "Tips",
        cover: "/assets/img/blog3.jpg",
    },
];
export default function BlogsPage() {
    return (_jsxs("div", { className: "blog-page", children: [_jsx("section", { className: "bg-light border-bottom py-4", children: _jsx(Container, { children: _jsx(Row, { className: "align-items-center", children: _jsxs(Col, { children: [_jsx("h1", { className: "h3 mb-2", children: "Blogs" }), _jsx("p", { className: "text-body-secondary mb-0", children: "Novedades, gu\u00EDas y comparativas para ayudarte a elegir." })] }) }) }) }), _jsx("section", { className: "container-xxl py-4", children: _jsx(Row, { className: "g-4", children: posts.map((p) => (_jsx(Col, { md: 4, children: _jsxs(Card, { className: "h-100 shadow-sm", children: [p.cover && (_jsx(Card.Img, { variant: "top", src: p.cover, alt: p.title, className: "object-cover", style: { height: 180 }, onError: (e) => {
                                        e.currentTarget.src = "/assets/img/icono.png";
                                    } })), _jsxs(Card.Body, { className: "d-flex flex-column", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-2", children: [_jsx(Badge, { bg: "dark", children: p.tag || "Blog" }), _jsx("span", { className: "small text-body-secondary", children: new Date(p.date).toLocaleDateString() })] }), _jsx(Card.Title, { className: "h5", children: p.title }), _jsx(Card.Text, { className: "text-body-secondary", children: p.excerpt })] })] }) }, p.id))) }) })] }));
}
