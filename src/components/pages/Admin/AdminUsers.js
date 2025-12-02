import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Nombre del componente: AdminUsers
 * Propósito: Administración de usuarios con búsqueda, edición inline y autocompletado de dirección.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; opera sobre un dataset persistido en localStorage.
 *
 * Métodos/funciones:
 * - addUser(): agrega un usuario con valores por defecto.
 * - removeUser(idx): elimina usuario.
 * - onEditInput/onEditSelect: actualiza campos.
 * - onAddressTextChange/onAddressSelected: maneja dirección y validación.
 * - getAddressText(u): obtiene texto actual de dirección considerando legacy.
 * - isAddressValid(u): valida que la dirección tenga placeId y coordenadas.
 *
 * Hooks utilizados:
 * - useEffect: carga y sincroniza textos de dirección desde localStorage.
 * - useState: filas, filtro y estados de dirección/errores.
 * - useMemo: filtrado por búsqueda.
 *
 * Ejemplo de uso:
 * ```tsx
 * <AdminUsers />
 * ```
 */
// Usuarios: administración básica con búsqueda, edición inline y autocompletado de dirección.
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import AddressAutocomplete from "@molecules/AddressAutocomplete/AddressAutocomplete";
import { adminRegisterUser, adminListUsers } from "@/services/admin.service";
const sv = (v) => v ?? "";
export default function AdminUsers() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    // Estado para manejar los campos de dirección de cada usuario
    const [addressTexts, setAddressTexts] = useState({});
    const [addressErrors, setAddressErrors] = useState({});
    const filtered = useMemo(() => {
        const ql = q.trim().toLowerCase();
        return rows.filter((u) => {
            const base = `${sv(u.nombre)} ${sv(u.apellido)} ${sv(u.email)}`.toLowerCase();
            return !ql || base.includes(ql);
        });
    }, [rows, q]);
    // Carga usuarios desde backend (fallback a localStorage si falla) y sincroniza textos
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const usuariosBackend = await adminListUsers();
                const usuarios = Array.isArray(usuariosBackend) && usuariosBackend.length > 0
                    ? usuariosBackend
                    : JSON.parse(localStorage.getItem("usuarios") || "[]");
                if (cancelled)
                    return;
                const initialTexts = {};
                usuarios.forEach(user => {
                    if (user.direccion?.fullText) {
                        initialTexts[user.email] = user.direccion.fullText;
                    }
                    else if (user.ciudad) {
                        initialTexts[user.email] = user.ciudad;
                    }
                });
                setAddressTexts(initialTexts);
                setRows(usuarios);
            }
            catch {
                try {
                    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
                    if (!cancelled)
                        setRows(usuarios);
                }
                catch { }
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);
    const onEditInput = (idx, key) => (e) => {
        const val = e.target.value;
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: sv(val) } : r)));
    };
    const onEditSelect = (idx, key) => (e) => {
        const val = e.target.value;
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: sv(val) } : r)));
    };
    // Agrega un usuario nuevo con valores por defecto
    const addUser = () => {
        const newUser = {
            nombre: "",
            apellido: "",
            email: `user${rows.length + 1}@example.com`,
            telefono: "",
            password: "",
            direccion: undefined,
            role: "user"
        };
        setRows((prev) => [...prev, newUser]);
    };
    const removeUser = (idx) => {
        setRows((prev) => prev.filter((_, i) => i !== idx));
    };
    // Funciones para manejar cambios de dirección
    const onAddressTextChange = (email, value) => {
        setAddressTexts((prev) => ({ ...prev, [email]: value }));
    };
    const onAddressSelected = (email, address) => {
        setRows((prev) => prev.map((user) => user.email === email ? { ...user, direccion: address ?? undefined } : user));
        setAddressErrors((prev) => ({ ...prev, [email]: "" }));
    };
    // Función para obtener el texto de dirección actual
    const getAddressText = (user) => {
        if (user.email && addressTexts[user.email]) {
            return addressTexts[user.email];
        }
        if (user.direccion?.fullText) {
            return user.direccion.fullText;
        }
        // Compatibilidad hacia atrás: si existe ciudad legacy, usarla
        if (user.ciudad) {
            return user.ciudad;
        }
        return "";
    };
    // Función para validar dirección seleccionada
    const isAddressValid = (user) => {
        return !!user.direccion?.placeId && typeof user.direccion?.lat === "number" && typeof user.direccion?.lng === "number";
    };
    // Registro en backend para nuevos usuarios (por ahora, sólo alta)
    const saveAll = async () => {
        try {
            // En esta primera integración, registramos los usuarios que tengan password definido
            const toRegister = rows.filter(u => !!u.password).map(u => ({
                nombre: sv(u.nombre),
                apellido: sv(u.apellido),
                email: sv(u.email),
                telefono: sv(u.telefono),
                password: sv(u.password),
                direccion: u.direccion ?? undefined
            }));
            for (const user of toRegister) {
                try {
                    await adminRegisterUser(user);
                }
                catch (e) { /* continuar */ }
            }
            localStorage.setItem("usuarios", JSON.stringify(rows));
            alert("Usuarios guardados (backend + localStorage)");
        }
        catch (e) {
            alert(`Error al guardar usuarios: ${e?.message || e}`);
        }
    };
    return (_jsxs(Container, { className: "py-4", children: [loading && (_jsx(Row, { className: "mb-3", children: _jsx(Col, { children: _jsx("div", { className: "small text-body-secondary", children: "Cargando usuarios\u2026" }) }) })), _jsxs(Row, { className: "mb-3 align-items-end g-2", children: [_jsxs(Col, { xs: 12, md: 6, children: [_jsx("h2", { className: "mb-0", children: "Administrar usuarios" }), _jsxs("small", { className: "text-body-secondary", children: [rows.length, " \u00EDtems\u00A0|\u00A0", _jsxs(Badge, { bg: "info", children: [filtered.length, " visibles"] })] })] }), _jsxs(Col, { xs: 12, md: 4, children: [_jsx(Form.Label, { className: "small mb-1", children: "Buscar" }), _jsx(Form.Control, { type: "search", value: sv(q), onChange: (e) => setQ(e.target.value), placeholder: "Nombre o email\u2026" })] }), _jsx(Col, { xs: 12, md: 2, className: "d-grid", children: _jsx(Button, { variant: "outline-secondary", onClick: addUser, children: "Nuevo" }) })] }), _jsxs(Card, { className: "shadow-sm", children: [_jsx(Card.Body, { className: "p-0", children: _jsxs(Table, { responsive: true, hover: true, className: "mb-0 align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Nombre" }), _jsx("th", { children: "Apellido" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Tel\u00E9fono" }), _jsx("th", { children: "Password" }), _jsx("th", { children: "Direcci\u00F3n" }), _jsx("th", { children: "Rol" }), _jsx("th", { style: { width: 120 }, children: "Acciones" })] }) }), _jsxs("tbody", { children: [filtered.map((u, idx) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx(Form.Control, { type: "text", value: sv(u.nombre), onChange: onEditInput(idx, "nombre") }) }), _jsx("td", { children: _jsx(Form.Control, { type: "text", value: sv(u.apellido), onChange: onEditInput(idx, "apellido") }) }), _jsx("td", { children: _jsx(Form.Control, { type: "email", value: sv(u.email), onChange: onEditInput(idx, "email") }) }), _jsx("td", { children: _jsx(Form.Control, { type: "text", value: sv(u.telefono), onChange: onEditInput(idx, "telefono") }) }), _jsx("td", { children: _jsx(Form.Control, { type: "password", value: sv(u.password), onChange: onEditInput(idx, "password"), placeholder: "Password (s\u00F3lo alta)" }) }), _jsx("td", { children: _jsx(AddressAutocomplete, { label: "", value: getAddressText(u), onTextChange: (value) => onAddressTextChange(u.email, value), onAddressSelected: (address) => onAddressSelected(u.email, address), required: false, placeholder: "Ej: Av. Apoquindo 1234, Las Condes", error: addressErrors[u.email] || null, isInvalid: !!addressErrors[u.email], isValid: isAddressValid(u) }) }), _jsx("td", { children: _jsxs(Form.Select, { value: sv(u.role), onChange: onEditSelect(idx, "role"), children: [_jsx("option", { value: "user", children: "Usuario" }), _jsx("option", { value: "admin", children: "Administrador" })] }) }), _jsx("td", { children: _jsx("div", { className: "d-flex gap-2", children: _jsx(Button, { variant: "outline-danger", size: "sm", onClick: () => removeUser(idx), children: "Eliminar" }) }) })] }, `${u.email}-${idx}`))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center text-body-secondary py-4", children: "Sin usuarios para los filtros actuales." }) }))] })] }) }), _jsxs(Card.Footer, { className: "d-flex justify-content-end gap-2", children: [_jsx(Button, { variant: "outline-secondary", onClick: () => {
                                    try {
                                        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
                                        // Reinicializar textos de dirección
                                        const initialTexts = {};
                                        usuarios.forEach(user => {
                                            if (user.direccion?.fullText) {
                                                initialTexts[user.email] = user.direccion.fullText;
                                            }
                                            else if (user.ciudad) {
                                                initialTexts[user.email] = user.ciudad;
                                            }
                                        });
                                        setAddressTexts(initialTexts);
                                        setAddressErrors({});
                                        setRows(usuarios);
                                    }
                                    catch { }
                                }, children: "Descartar cambios" }), _jsx(Button, { variant: "warning", onClick: saveAll, children: "Guardar cambios" })] })] })] }));
}
