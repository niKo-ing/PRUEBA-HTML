import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: AdminDashboard
 * Propósito: Panel con KPIs del día y últimos pedidos (mock/localStorage).
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; obtiene datos locales.
 *
 * Métodos/funciones:
 * - formatCLP(v: number): string — Formatea números como CLP sin decimales.
 *
 * Hooks utilizados:
 * - useState: estado de pedidos cargados.
 * - useEffect: lectura inicial desde localStorage.
 * - useMemo: derivación de KPIs (pendientes, ventas hoy, recientes).
 *
 * Ejemplo de uso:
 * ```tsx
 * <AdminDashboard />
 * ```
 */
// Dashboard: muestra KPIs del día y últimos pedidos desde localStorage.
import { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Badge, ProgressBar, Table, Button, Form } from "react-bootstrap";
import { adminListProducts, adminDeleteProduct, adminBulkUpsertProducts } from "@/services/admin.service";
import { adminListUsers, adminDeleteUser } from "@/services/admin.service";
// Formatea valores en CLP sin decimales
function formatCLP(v) {
    try {
        return v.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
    }
    catch {
        return `$${Math.round(v)}`;
    }
}
export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [loadingView, setLoadingView] = useState(false);
    const [loadingAdmin, setLoadingAdmin] = useState(false);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [qProd, setQProd] = useState("");
    const [qUser, setQUser] = useState("");
    // Carga pedidos para estadísticas (mock) desde localStorage
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("admin_orders") || "null") || [];
            setOrders(saved);
        }
        catch { }
    }, []);
    const pending = useMemo(() => orders.filter(o => o.estado === "pendiente").length, [orders]);
    // Suma ventas de hoy usando rango horario
    const today = useMemo(() => {
        const t0 = new Date();
        t0.setHours(0, 0, 0, 0);
        const t1 = new Date();
        t1.setHours(23, 59, 59, 999);
        return orders.reduce((acc, o) => {
            const d = new Date(o.fecha).getTime();
            return d >= t0.getTime() && d <= t1.getTime() ? acc + (Number.isFinite(o.total) ? o.total : 0) : acc;
        }, 0);
    }, [orders]);
    const totalProducts = productosPublicados();
    // Obtiene número de productos publicados (mock o desde localStorage)
    function productosPublicados() {
        try {
            // Si en el futuro guardamos productos en localStorage, tomarlos; por ahora estimado
            const raw = localStorage.getItem("admin_products");
            if (raw) {
                const arr = JSON.parse(raw);
                return Array.isArray(arr) ? arr.length : 0;
            }
        }
        catch { }
        return 24; // placeholder visual
    }
    const progressDay = Math.min(100, Math.round((today / 200000) * 100)); // meta visual
    // Tabla de los 5 últimos pedidos
    const recent = useMemo(() => orders.slice(0, 5), [orders]);
    // Carga de datos para vista
    useEffect(() => {
        let alive = true;
        setLoadingView(true);
        Promise.all([adminListProducts(), adminListUsers()])
            .then(([prods, us]) => {
            if (!alive)
                return;
            setProducts(Array.isArray(prods) ? prods : []);
            setUsers(Array.isArray(us) ? us : []);
        })
            .finally(() => alive && setLoadingView(false));
        return () => { alive = false; };
    }, []);
    const filteredProducts = useMemo(() => {
        const ql = qProd.trim().toLowerCase();
        return products.filter((p) => !ql || String(p.nombre).toLowerCase().includes(ql));
    }, [products, qProd]);
    const filteredUsers = useMemo(() => {
        const ql = qUser.trim().toLowerCase();
        return users.filter((u) => !ql || String(u.email).toLowerCase().includes(ql) || String(u.nombre).toLowerCase().includes(ql));
    }, [users, qUser]);
    const deleteProduct = async (id) => {
        if (!confirm(`¿Eliminar producto ${id}?`))
            return;
        setLoadingAdmin(true);
        try {
            await adminDeleteProduct(id);
            setProducts((prev) => prev.filter(p => p.id !== id));
        }
        finally {
            setLoadingAdmin(false);
        }
    };
    const deleteUser = async (email) => {
        if (!confirm(`¿Eliminar usuario ${email}?`))
            return;
        setLoadingAdmin(true);
        try {
            await adminDeleteUser(email);
            setUsers((prev) => prev.filter(u => u.email !== email));
        }
        finally {
            setLoadingAdmin(false);
        }
    };
    // Reportes simples: métricas derivadas
    const totalUsers = users.length;
    const totalProds = products.length;
    const avgPrice = useMemo(() => {
        const nums = products.map((p) => Number(p.precio) || 0);
        const sum = nums.reduce((a, b) => a + b, 0);
        return nums.length ? Math.round(sum / nums.length) : 0;
    }, [products]);
    // Categorías: agrupadas desde productos
    const categories = useMemo(() => {
        const map = new Map();
        products.forEach((p) => {
            const cat = Array.isArray(p.categoria) ? (p.categoria[0] ?? "") : (p.categoria ?? "");
            const k = String(cat || "(sin categoría)");
            map.set(k, (map.get(k) || 0) + 1);
        });
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [products]);
    // Crear producto: formulario simple con validación
    const [newProd, setNewProd] = useState({ nombre: "", precio: "", stock: "", categoria: "", img: "", descripcion: "" });
    const [newProdErrors, setNewProdErrors] = useState({});
    const slugify = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
    const validateNewProd = () => {
        const errs = {};
        if (!newProd.nombre.trim())
            errs.nombre = "Requerido";
        const precio = Number(newProd.precio);
        if (!Number.isFinite(precio) || precio <= 0)
            errs.precio = "Debe ser número > 0";
        const stock = Number(newProd.stock);
        if (!Number.isFinite(stock) || stock < 0)
            errs.stock = "Debe ser número ≥ 0";
        if (!newProd.categoria.trim())
            errs.categoria = "Requerido";
        setNewProdErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const onCreateProduct = async () => {
        if (!validateNewProd())
            return;
        setLoadingAdmin(true);
        try {
            const nextId = products.length ? Math.max(...products.map((p) => Number(p.id) || 0)) + 1 : Date.now();
            const payload = [{
                    id: nextId,
                    nombre: newProd.nombre.trim(),
                    slug: slugify(newProd.nombre.trim()) || String(nextId),
                    precio: Number(newProd.precio),
                    stock: Number(newProd.stock),
                    categoria: newProd.categoria.trim(),
                    img: newProd.img.trim(),
                    images: newProd.img.trim() ? [newProd.img.trim()] : [],
                    descripcion: newProd.descripcion.trim(),
                }];
            await adminBulkUpsertProducts(payload);
            setProducts((prev) => [...prev, payload[0]]);
            setNewProd({ nombre: "", precio: "", stock: "", categoria: "", img: "", descripcion: "" });
            setNewProdErrors({});
            alert("Producto creado");
        }
        catch (e) {
            alert("Error al crear producto");
        }
        finally {
            setLoadingAdmin(false);
        }
    };
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-3", children: "Dashboard" }), _jsxs(Row, { className: "g-3 mb-4", children: [_jsx(Col, { md: 4, children: _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { children: [_jsxs("div", { className: "d-flex justify-content-between align-items-baseline", children: [_jsxs("div", { children: [_jsx("div", { className: "text-body-secondary small", children: "Ventas (hoy)" }), _jsx("div", { className: "h4 mb-1", children: formatCLP(today) })] }), _jsx(Badge, { bg: "success", children: "Meta" })] }), _jsx(ProgressBar, { now: progressDay, variant: "success", className: "mt-2" })] }) }) }), _jsx(Col, { md: 4, children: _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { children: [_jsx("div", { className: "text-body-secondary small", children: "Pedidos pendientes" }), _jsx("div", { className: "h4 mb-1", children: pending }), _jsx("div", { className: "small text-body-secondary", children: "En proceso y por atender" })] }) }) }), _jsx(Col, { md: 4, children: _jsx(Card, { className: "shadow-sm", children: _jsxs(Card.Body, { children: [_jsx("div", { className: "text-body-secondary small", children: "Productos publicados" }), _jsx("div", { className: "h4 mb-1", children: totalProducts }), _jsx("div", { className: "small text-body-secondary", children: "Incluye variaciones" })] }) }) })] }), _jsxs("div", { className: "mt-4 p-3 border rounded", style: { background: "var(--bs-light)" }, children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-2", children: [_jsx("h5", { className: "mb-0", children: "Visualizaci\u00F3n" }), loadingView && _jsx("span", { className: "small text-body-secondary", children: "Cargando\u2026" })] }), _jsxs(Row, { className: "g-3", children: [_jsx(Col, { md: 6, children: _jsxs(Card, { className: "shadow-sm", children: [_jsxs(Card.Header, { className: "d-flex justify-content-between align-items-center", children: [_jsx("div", { className: "fw-semibold", children: "Productos" }), _jsx(Form.Control, { size: "sm", placeholder: "Filtrar\u2026", value: qProd, onChange: (e) => setQProd(e.target.value), style: { maxWidth: 180 } })] }), _jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "Nombre" }), _jsx("th", { children: "Precio" }), _jsx("th", {})] }) }), _jsxs("tbody", { children: [filteredProducts.map((p) => (_jsxs("tr", { children: [_jsx("td", { children: p.id }), _jsx("td", { children: p.nombre }), _jsx("td", { children: formatCLP(Number(p.precio) || 0) }), _jsx("td", { className: "text-end", children: _jsx(Button, { size: "sm", variant: "outline-danger", onClick: () => deleteProduct(p.id), children: "Eliminar" }) })] }, p.id))), filteredProducts.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center text-body-secondary py-3", children: "Sin productos." }) }))] })] }) })] }) }), _jsx(Col, { md: 6, children: _jsxs(Card, { className: "shadow-sm", children: [_jsxs(Card.Header, { className: "d-flex justify-content-between align-items-center", children: [_jsx("div", { className: "fw-semibold", children: "Usuarios" }), _jsx(Form.Control, { size: "sm", placeholder: "Filtrar\u2026", value: qUser, onChange: (e) => setQUser(e.target.value), style: { maxWidth: 180 } })] }), _jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Nombre" }), _jsx("th", { children: "Email" }), _jsx("th", {})] }) }), _jsxs("tbody", { children: [filteredUsers.map((u) => (_jsxs("tr", { children: [_jsx("td", { children: u.nombre }), _jsx("td", { className: "text-body-secondary", children: u.email }), _jsx("td", { className: "text-end", children: _jsx(Button, { size: "sm", variant: "outline-danger", onClick: () => deleteUser(u.email), children: "Eliminar" }) })] }, u.email))), filteredUsers.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 3, className: "text-center text-body-secondary py-3", children: "Sin usuarios." }) }))] })] }) })] }) })] }), _jsxs(Row, { className: "g-3 mt-1", children: [_jsx(Col, { md: 6, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Header, { className: "fw-semibold", children: "Categor\u00EDas" }), _jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Categor\u00EDa" }), _jsx("th", { className: "text-end", children: "Productos" })] }) }), _jsxs("tbody", { children: [categories.map(([name, count]) => (_jsxs("tr", { children: [_jsx("td", { children: name }), _jsx("td", { className: "text-end", children: count })] }, name))), categories.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 2, className: "text-center text-body-secondary py-3", children: "Sin categor\u00EDas." }) }))] })] }) })] }) }), _jsx(Col, { md: 6, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Header, { className: "fw-semibold", children: "Reportes" }), _jsxs(Card.Body, { children: [_jsx("div", { className: "small text-body-secondary mb-2", children: "M\u00E9tricas clave (placeholder visual)" }), _jsxs("div", { className: "mb-2", children: ["Usuarios: ", _jsx("span", { className: "fw-semibold", children: totalUsers })] }), _jsxs("div", { className: "mb-2", children: ["Productos: ", _jsx("span", { className: "fw-semibold", children: totalProds })] }), _jsxs("div", { className: "mb-2", children: ["Precio promedio: ", _jsx("span", { className: "fw-semibold", children: formatCLP(avgPrice) })] }), _jsx("div", { className: "mb-2", children: "Progreso ventas (d\u00EDa):" }), _jsx(ProgressBar, { now: progressDay, variant: "info" })] })] }) })] })] }), _jsxs("div", { className: "mt-4 p-3 border rounded", style: { background: "#fffdf5" }, children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-2", children: [_jsx("h5", { className: "mb-0", children: "Administraci\u00F3n" }), loadingAdmin && _jsx("span", { className: "small text-body-secondary", children: "Procesando\u2026" })] }), _jsxs(Row, { className: "g-3", children: [_jsx(Col, { md: 6, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Header, { className: "fw-semibold", children: "Crear producto" }), _jsxs(Card.Body, { children: [_jsxs(Row, { className: "g-2", children: [_jsxs(Col, { md: 6, children: [_jsx(Form.Label, { className: "small mb-1", children: "Nombre" }), _jsx(Form.Control, { value: newProd.nombre, onChange: (e) => setNewProd({ ...newProd, nombre: e.target.value }), isInvalid: !!newProdErrors.nombre })] }), _jsxs(Col, { md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Precio" }), _jsx(Form.Control, { value: newProd.precio, onChange: (e) => setNewProd({ ...newProd, precio: e.target.value }), isInvalid: !!newProdErrors.precio })] }), _jsxs(Col, { md: 3, children: [_jsx(Form.Label, { className: "small mb-1", children: "Stock" }), _jsx(Form.Control, { value: newProd.stock, onChange: (e) => setNewProd({ ...newProd, stock: e.target.value }), isInvalid: !!newProdErrors.stock })] }), _jsxs(Col, { md: 6, children: [_jsx(Form.Label, { className: "small mb-1", children: "Categor\u00EDa" }), _jsx(Form.Control, { value: newProd.categoria, onChange: (e) => setNewProd({ ...newProd, categoria: e.target.value }), isInvalid: !!newProdErrors.categoria })] }), _jsxs(Col, { md: 6, children: [_jsx(Form.Label, { className: "small mb-1", children: "Imagen" }), _jsx(Form.Control, { value: newProd.img, onChange: (e) => setNewProd({ ...newProd, img: e.target.value }) })] }), _jsxs(Col, { md: 12, children: [_jsx(Form.Label, { className: "small mb-1", children: "Descripci\u00F3n" }), _jsx(Form.Control, { as: "textarea", rows: 2, value: newProd.descripcion, onChange: (e) => setNewProd({ ...newProd, descripcion: e.target.value }) })] })] }), _jsxs("div", { className: "d-flex justify-content-end gap-2 mt-3", children: [_jsx(Button, { variant: "outline-secondary", onClick: () => { setNewProd({ nombre: "", precio: "", stock: "", categoria: "", img: "", descripcion: "" }); setNewProdErrors({}); }, children: "Limpiar" }), _jsx(Button, { variant: "warning", onClick: onCreateProduct, disabled: loadingAdmin, children: "Crear" })] })] })] }) }), _jsx(Col, { md: 6, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Header, { className: "fw-semibold", children: "Crear categor\u00EDa" }), _jsxs(Card.Body, { children: [_jsx("div", { className: "text-body-secondary small", children: "Usa el m\u00F3dulo \u201CCategor\u00EDas\u201D para alta y jerarqu\u00EDa." }), _jsx(Button, { href: "/admin/categories", variant: "warning", children: "Ir a Categor\u00EDas" })] })] }) })] })] })] }));
}
