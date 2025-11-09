import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Offcanvas } from "react-bootstrap";
import { useCart } from "@domain/cart/useCart";
import { productos } from "@domain/data";
function formatCLP(v) {
    return (Number(v) || 0).toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    });
}
export default function CartDrawer({ show, onHide }) {
    // tu contexto expone: items, change, remove, clear, total, count
    const { items = [], total = 0, change, remove, clear } = useCart();
    return (_jsxs(Offcanvas, { placement: "end", show: show, onHide: onHide, backdrop: true, scroll: true, children: [_jsx(Offcanvas.Header, { closeButton: true, children: _jsx(Offcanvas.Title, { children: "Tu carrito" }) }), _jsx(Offcanvas.Body, { children: items.length === 0 ? (_jsxs("div", { className: "text-center text-body-secondary py-5", children: [_jsx("i", { className: "bi bi-bag fs-1 d-block mb-2" }), _jsx("p", { children: "Tu carrito est\u00E1 vac\u00EDo." })] })) : (_jsxs(_Fragment, { children: [_jsx("ul", { className: "list-unstyled d-grid gap-3 mb-4", children: items.map((it) => {
                                const prod = productos.find((p) => p.id === it.id);
                                const nombre = prod?.nombre ?? "Producto";
                                const img = prod?.images?.[0] ?? prod?.img ?? "/assets/img/placeholder.png";
                                const precio = Number(prod?.precio) || 0;
                                const qty = Number(it.qty) || 1;
                                const subtotal = precio * qty;
                                return (_jsxs("li", { className: "d-flex gap-3 align-items-center", children: [_jsx("img", { src: img, alt: nombre, width: 72, height: 72, style: { objectFit: "cover", borderRadius: 12 } }), _jsxs("div", { className: "flex-grow-1", children: [_jsx("div", { className: "fw-semibold", children: nombre }), _jsx("div", { className: "text-body-secondary small", children: formatCLP(precio) }), _jsxs("div", { className: "d-flex align-items-center gap-2 mt-2", children: [_jsx("button", { type: "button", className: "btn btn-outline-secondary btn-sm", onClick: () => change(it.id, -1), "aria-label": "Disminuir", children: _jsx("i", { className: "bi bi-dash" }) }), _jsx("span", { className: "px-2", children: qty }), _jsx("button", { type: "button", className: "btn btn-outline-secondary btn-sm", onClick: () => change(it.id, +1), "aria-label": "Aumentar", children: _jsx("i", { className: "bi bi-plus" }) }), _jsx("button", { type: "button", className: "btn btn-outline-danger btn-sm ms-auto", onClick: () => remove(it.id), "aria-label": "Eliminar", children: _jsx("i", { className: "bi bi-trash" }) })] })] }), _jsx("div", { className: "fw-semibold", children: formatCLP(subtotal) })] }, it.id));
                            }) }), _jsxs("div", { className: "d-flex justify-content-between border-top pt-3", children: [_jsx("div", { className: "fw-semibold", children: "Total" }), _jsx("div", { className: "fs-5 fw-bold", children: formatCLP(total) })] }), _jsxs("div", { className: "d-grid gap-2 mt-3", children: [_jsxs("button", { className: "btn btn-warning btn-lg", children: [_jsx("i", { className: "bi bi-credit-card me-2" }), "Pagar"] }), _jsx("button", { className: "btn btn-outline-secondary", onClick: () => clear(), children: "Vaciar carrito" })] })] })) })] }));
}
