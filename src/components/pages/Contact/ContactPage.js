import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
const RECIPIENTS = [
    "nic.estefania@duocuc.cl",
    "al.rosales@duocuc.cl",
];
function buildMailto(subject, body) {
    const to = RECIPIENTS.join(",");
    const encSubject = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body.replace(/\n/g, "\r\n"));
    return `mailto:${to}?subject=${encSubject}&body=${encBody}`;
}
function buildGmail(subject, body) {
    const to = RECIPIENTS.join(",");
    const encTo = encodeURIComponent(to);
    const encSubject = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body.replace(/\n/g, "\r\n"));
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSubject}&body=${encBody}`;
}
export default function ContactPage() {
    return (_jsxs("div", { className: "contact-page", children: [_jsx("section", { className: "bg-light border-bottom py-4", children: _jsx(Container, { children: _jsx(Row, { className: "align-items-center", children: _jsxs(Col, { children: [_jsx("h1", { className: "h3 mb-2", children: "C\u00F3mo contactarnos" }), _jsx("p", { className: "text-body-secondary mb-0", children: "Escr\u00EDbenos y te responderemos lo antes posible." })] }) }) }) }), _jsx("section", { className: "container-xxl py-4", children: _jsx(Row, { className: "g-4", children: _jsx(Col, { lg: { span: 8, offset: 2 }, children: _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { children: [_jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "fw-semibold mb-1", children: "Correos" }), _jsx("div", { className: "d-flex flex-column gap-1", children: RECIPIENTS.map((mail) => (_jsx("a", { href: `mailto:${mail}`, className: "link-primary", children: mail }, mail))) })] }), _jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "fw-semibold mb-1", children: "Accesos r\u00E1pidos" }), _jsxs("div", { className: "d-flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline-secondary", onClick: async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(RECIPIENTS.join(", "));
                                                                alert("Correos copiados al portapapeles.");
                                                            }
                                                            catch {
                                                                const blob = new Blob([RECIPIENTS.join(", ")], { type: "text/plain" });
                                                                const url = URL.createObjectURL(blob);
                                                                const a = document.createElement("a");
                                                                a.href = url;
                                                                a.target = "_blank";
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                document.body.removeChild(a);
                                                                setTimeout(() => URL.revokeObjectURL(url), 5000);
                                                            }
                                                        }, children: "Copiar correos" }), _jsx(Button, { variant: "outline-primary", onClick: () => {
                                                            const href = buildGmail("Consulta", "Hola, tengo una consulta…");
                                                            const a = document.createElement("a");
                                                            a.href = href;
                                                            a.target = "_blank";
                                                            a.rel = "noopener noreferrer";
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            document.body.removeChild(a);
                                                        }, children: "Abrir Gmail" })] })] })] }) }) }) }) })] }));
}
