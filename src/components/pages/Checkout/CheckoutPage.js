import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Nombre del componente: CheckoutPage
 * Propósito: Flujo de checkout con validación, procesamiento de pago (mock) y persistencia de orden.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; usa `useCart` y `useAuth` para completar campos.
 *
 * Métodos/funciones:
 * - validateForm(): valida campos del formulario y tarjeta.
 * - handleSubmit(e): procesa pago, genera orden y navega a éxito/error.
 * - handleInputChange(e), handleCardNumberChange(e), handleExpiryDateChange(e): formateo/validación onChange.
 *
 * Hooks utilizados:
 * - useEffect: redirige si el carrito está vacío.
 * - useState: maneja estado del formulario, errores y loading.
 * - useCart: obtiene items y total.
 * - useAuth: datos del usuario autenticado.
 * - useNavigate: navegación entre pantallas de checkout.
 *
 * Ejemplo de uso:
 * ```tsx
 * <CheckoutPage />
 * ```
 */
// Página de Checkout: valida el formulario, procesa el pago (mock)
// y guarda una orden detallada en localStorage para que el admin
// pueda ver e imprimir la boleta.
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@domain/cart/cart.context';
import { fetchProducts } from '../../../services/products.service';
import { useAuth } from '../../../domain/auth/auth.context';
import { createPaymentGateway, formatCardNumber, formatExpiryDate, detectCardType } from '../../../services/payment.service';
import AddressAutocomplete from '@molecules/AddressAutocomplete/AddressAutocomplete';
import MapPreview from '@molecules/AddressAutocomplete/MapPreview';
const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { items, total, clear } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [catalog, setCatalog] = useState([]);
    // Evita redirección al carrito mientras se está procesando el pago
    const isProcessingRef = useRef(false);
    const [direccionParsed, setDireccionParsed] = useState(null);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        firstName: user?.nombre || '',
        lastName: user?.apellido || '',
        address: '',
        city: '',
        region: '',
        postalCode: '',
        phone: '',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    // Mapa de errores por campo: mensaje de error por cada clave del formulario
    const [errors, setErrors] = useState({});
    useEffect(() => {
        // Si el carrito está vacío y NO estamos procesando pago, redirigimos al carrito
        // Solo aplica cuando estamos en la página de checkout para evitar redirecciones indeseadas
        if (!isProcessingRef.current && items.length === 0 && location.pathname === '/checkout') {
            navigate('/carrito');
        }
    }, [items, navigate, location.pathname]);
    // Cargar catálogo desde backend para mostrar nombres/precios correctos
    useEffect(() => {
        let alive = true;
        fetchProducts()
            .then((data) => { if (!alive)
            return; setCatalog(Array.isArray(data) ? data : []); })
            .catch(() => void 0);
        return () => { alive = false; };
    }, []);
    // Valida campos indispensables y también la tarjeta usando el "gateway" mock
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email)
            newErrors.email = 'Email es requerido';
        if (!formData.firstName)
            newErrors.firstName = 'Nombre es requerido';
        if (!formData.lastName)
            newErrors.lastName = 'Apellido es requerido';
        // Dirección: exigir selección desde Google Autocomplete con placeId y lat/lng
        if (!formData.address) {
            newErrors.address = 'Dirección es requerida';
        }
        if (!formData.city)
            newErrors.city = 'Ciudad es requerida';
        if (!formData.phone)
            newErrors.phone = 'Teléfono es requerido';
        // Código postal: exactamente 7 dígitos numéricos (Chile)
        const postalDigits = (formData.postalCode || '').replace(/\D/g, '');
        if (!postalDigits || !/^\d{7}$/.test(postalDigits)) {
            newErrors.postalCode = 'Código postal debe tener 7 dígitos';
        }
        // Validar número de tarjeta usando el servicio
        if (!formData.cardNumber) {
            newErrors.cardNumber = 'Número de tarjeta es requerido';
        }
        else {
            const cardNumber = formData.cardNumber.replace(/\s/g, '');
            const paymentGateway = createPaymentGateway();
            if (!paymentGateway.validateCard(cardNumber)) {
                newErrors.cardNumber = 'Número de tarjeta inválido';
            }
        }
        if (!formData.cardName)
            newErrors.cardName = 'Nombre en la tarjeta es requerido';
        // Validar fecha de expiración usando el servicio
        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Fecha de expiración es requerida';
        }
        else {
            const paymentGateway = createPaymentGateway();
            if (!paymentGateway.validateExpiry(formData.expiryDate)) {
                newErrors.expiryDate = 'Fecha de expiración inválida';
            }
        }
        // Validar CVV usando el servicio
        if (!formData.cvv) {
            newErrors.cvv = 'CVV es requerido';
        }
        else {
            const paymentGateway = createPaymentGateway();
            if (!paymentGateway.validateCVV(formData.cvv)) {
                newErrors.cvv = 'CVV inválido';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Maneja el envío del formulario: procesa el pago, crea y persiste la orden,
    // limpia el carrito y redirige a compra exitosa o error.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        isProcessingRef.current = true;
        setLoading(true);
        try {
            // Inicializa el gateway de pago (servicio mock con validaciones)
            const paymentGateway = createPaymentGateway();
            // Prepara la data del pago con el total actual del carrito
            const paymentData = {
                cardNumber: formData.cardNumber.replace(/\s/g, ''),
                expiryDate: formData.expiryDate,
                cvv: formData.cvv,
                cardholderName: formData.cardName,
                amount: total,
                currency: 'CLP',
                description: `Compra en TodoBaratisimo - ${items.length} producto(s)`
            };
            // Procesa el pago: si success, generamos la orden; si no, redirigimos a error
            const paymentResponse = await paymentGateway.processPayment(paymentData);
            if (paymentResponse.success) {
                // Generate order number
                const orderNumber = paymentResponse.transactionId || 'ORD-' + Date.now();
                // Persiste la orden con detalles para que el admin pueda imprimir boleta
                try {
                    const now = new Date().toISOString();
                    const cliente = `${formData.firstName} ${formData.lastName}`.trim() || formData.email;
                    // Calcular totales completos para la boleta
                    const subtotal = total;
                    const shipping = 3990;
                    const iva = Math.round(subtotal * 0.19);
                    const grandTotal = subtotal + shipping + iva;
                    // Detalles por ítem del carrito (nombre, precio, cantidad, subtotal)
                    const detalles = items.map((it) => {
                        const prod = catalog.find(p => p.id === it.id);
                        const nombre = prod?.nombre ?? `Producto ${it.id}`;
                        const precio = Number(prod?.precio) || 0;
                        const qty = Number(it.qty) || 1;
                        const lineTotal = precio * qty;
                        return {
                            id: it.id,
                            nombre,
                            precio,
                            qty,
                            total: lineTotal,
                        };
                    });
                    const order = {
                        id: orderNumber,
                        cliente,
                        email: formData.email,
                        total: grandTotal,
                        subtotal,
                        iva,
                        shipping,
                        fecha: now,
                        estado: 'pendiente',
                        items: items.reduce((acc, it) => acc + (Number(it.qty) || 1), 0),
                        detalles,
                    };
                    const prev = JSON.parse(localStorage.getItem('admin_orders') || '[]');
                    const arr = Array.isArray(prev) ? prev : [];
                    localStorage.setItem('admin_orders', JSON.stringify([order, ...arr]));
                }
                catch { }
                // Navega a éxito primero y luego limpia el carrito para evitar
                // que el efecto de carrito vacío redirija de vuelta al carrito.
                navigate(`/compra-exitosa?order=${orderNumber}`);
                clear();
            }
            else {
                // Redirige a pantalla de error con información del gateway
                navigate(`/error-compra?error=${paymentResponse.errorCode}&message=${encodeURIComponent(paymentResponse.message)}`);
                // Permite reintentar pago si seguimos en checkout
                isProcessingRef.current = false;
            }
        }
        catch (error) {
            console.error('Payment processing error:', error);
            navigate('/error-compra?error=PROCESSING_ERROR&message=Error al procesar el pago');
            // Permite reintentar pago si seguimos en checkout
            isProcessingRef.current = false;
        }
        finally {
            setLoading(false);
            // No liberar isProcessing aquí para evitar carreras antes de desmontar en éxito
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };
    // Restringe código postal a solo números y máximo 7 dígitos
    const handlePostalChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 7);
        setFormData(prev => ({ ...prev, postalCode: digits }));
        if (errors.postalCode) {
            setErrors(prev => {
                const { postalCode, ...rest } = prev;
                return rest;
            });
        }
    };
    // Formatea el número de tarjeta mientras se escribe
    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setFormData(prev => ({ ...prev, cardNumber: formatted }));
    };
    // Formatea la fecha de expiración mientras se escribe
    const handleExpiryDateChange = (e) => {
        const formatted = formatExpiryDate(e.target.value);
        setFormData(prev => ({ ...prev, expiryDate: formatted }));
    };
    return (_jsx("div", { className: "container py-5", children: _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-lg-8", children: [_jsx("h2", { className: "mb-4", children: "Finalizar Compra" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "card mb-4", children: [_jsx("div", { className: "card-header", children: _jsx("h5", { className: "mb-0", children: "Informaci\u00F3n de Contacto" }) }), _jsx("div", { className: "card-body", children: _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "email", className: "form-label", children: "Email" }), _jsx("input", { type: "email", className: `form-control ${errors.email ? 'is-invalid' : ''}`, id: "email", name: "email", value: formData.email, onChange: handleInputChange, required: true }), errors.email && _jsx("div", { className: "invalid-feedback", children: errors.email })] }), _jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "phone", className: "form-label", children: "Tel\u00E9fono" }), _jsx("input", { type: "tel", className: `form-control ${errors.phone ? 'is-invalid' : ''}`, id: "phone", name: "phone", value: formData.phone, onChange: handleInputChange, required: true }), errors.phone && _jsx("div", { className: "invalid-feedback", children: errors.phone })] })] }) })] }), _jsxs("div", { className: "card mb-4", children: [_jsx("div", { className: "card-header", children: _jsx("h5", { className: "mb-0", children: "Informaci\u00F3n de Env\u00EDo" }) }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "firstName", className: "form-label", children: "Nombre" }), _jsx("input", { type: "text", className: `form-control ${errors.firstName ? 'is-invalid' : ''}`, id: "firstName", name: "firstName", value: formData.firstName, onChange: handleInputChange, required: true }), errors.firstName && _jsx("div", { className: "invalid-feedback", children: errors.firstName })] }), _jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "lastName", className: "form-label", children: "Apellido" }), _jsx("input", { type: "text", className: `form-control ${errors.lastName ? 'is-invalid' : ''}`, id: "lastName", name: "lastName", value: formData.lastName, onChange: handleInputChange, required: true }), errors.lastName && _jsx("div", { className: "invalid-feedback", children: errors.lastName })] })] }), _jsxs("div", { className: "mb-3", children: [_jsx(AddressAutocomplete, { label: "Direcci\u00F3n", value: formData.address, onTextChange: (v) => {
                                                                setFormData(prev => ({ ...prev, address: v }));
                                                                if (errors.address) {
                                                                    setErrors(prev => {
                                                                        const { address, ...rest } = prev;
                                                                        return rest;
                                                                    });
                                                                }
                                                            }, onAddressSelected: (addr) => {
                                                                setDireccionParsed(addr);
                                                                const postalDigits = (addr.postalCode || '').replace(/\D/g, '').slice(0, 7);
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    address: addr.fullText || prev.address,
                                                                    city: addr.comuna || addr.city || prev.city,
                                                                    region: addr.region || prev.region,
                                                                    postalCode: postalDigits || prev.postalCode,
                                                                }));
                                                            }, error: errors.address ?? null, isInvalid: !!errors.address, isValid: !!direccionParsed?.placeId && typeof direccionParsed?.lat === 'number' && typeof direccionParsed?.lng === 'number' }), _jsx("div", { className: "mt-2", children: typeof direccionParsed?.lat === 'number' && typeof direccionParsed?.lng === 'number' ? (_jsx(MapPreview, { lat: direccionParsed.lat, lng: direccionParsed.lng })) : (_jsx("div", { className: "bg-light rounded-4 d-flex align-items-center justify-content-center", style: { height: 180 }, children: _jsx("small", { className: "text-body-secondary", children: "Escribe y selecciona una direcci\u00F3n para ver el mapa\u2026" }) })) })] }), _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("label", { htmlFor: "city", className: "form-label", children: "Ciudad" }), _jsx("input", { type: "text", className: `form-control ${errors.city ? 'is-invalid' : ''}`, id: "city", name: "city", value: formData.city, onChange: handleInputChange, required: true }), errors.city && _jsx("div", { className: "invalid-feedback", children: errors.city })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("label", { htmlFor: "region", className: "form-label", children: "Regi\u00F3n" }), _jsx("input", { type: "text", className: "form-control", id: "region", name: "region", value: formData.region, onChange: handleInputChange })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("label", { htmlFor: "postalCode", className: "form-label", children: "C\u00F3digo Postal" }), _jsx("input", { type: "text", className: `form-control ${errors.postalCode ? 'is-invalid' : ''}`, id: "postalCode", name: "postalCode", value: formData.postalCode, onChange: handlePostalChange, inputMode: "numeric", maxLength: 7, required: true }), errors.postalCode && _jsx("div", { className: "invalid-feedback", children: errors.postalCode })] })] })] })] }), _jsxs("div", { className: "card mb-4", children: [_jsx("div", { className: "card-header", children: _jsx("h5", { className: "mb-0", children: "Informaci\u00F3n de Pago" }) }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "cardNumber", className: "form-label", children: "N\u00FAmero de Tarjeta" }), _jsx("input", { type: "text", className: `form-control ${errors.cardNumber ? 'is-invalid' : ''}`, id: "cardNumber", name: "cardNumber", value: formData.cardNumber, onChange: handleCardNumberChange, placeholder: "1234 5678 9012 3456", maxLength: 19, required: true }), errors.cardNumber && _jsx("div", { className: "invalid-feedback", children: errors.cardNumber })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "cardName", className: "form-label", children: "Nombre en la Tarjeta" }), _jsx("input", { type: "text", className: `form-control ${errors.cardName ? 'is-invalid' : ''}`, id: "cardName", name: "cardName", value: formData.cardName, onChange: handleInputChange, required: true }), errors.cardName && _jsx("div", { className: "invalid-feedback", children: errors.cardName })] }), _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "expiryDate", className: "form-label", children: "Fecha de Expiraci\u00F3n" }), _jsx("input", { type: "text", className: `form-control ${errors.expiryDate ? 'is-invalid' : ''}`, id: "expiryDate", name: "expiryDate", value: formData.expiryDate, onChange: handleExpiryDateChange, placeholder: "MM/AA", maxLength: 5, required: true }), errors.expiryDate && _jsx("div", { className: "invalid-feedback", children: errors.expiryDate })] }), _jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "cvv", className: "form-label", children: "CVV" }), _jsx("input", { type: "text", className: `form-control ${errors.cvv ? 'is-invalid' : ''}`, id: "cvv", name: "cvv", value: formData.cvv, onChange: (e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') })), placeholder: "123", maxLength: 3, required: true }), errors.cvv && _jsx("div", { className: "invalid-feedback", children: errors.cvv })] })] })] })] }), _jsx("button", { type: "submit", className: "btn btn-primary btn-lg w-100", disabled: loading || isProcessingRef.current, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Procesando..."] })) : ('Completar Compra') })] })] }), _jsx("div", { className: "col-lg-4", children: _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsx("h5", { className: "mb-0", children: "Resumen del Pedido" }) }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "mb-3", children: [_jsxs("h6", { children: ["Productos (", items.length, ")"] }), items.map((it) => {
                                                const prod = catalog.find(p => p.id === it.id);
                                                const nombre = prod?.nombre ?? 'Producto';
                                                const img = prod?.images?.[0] ?? prod?.img ?? '/assets/img/placeholder.png';
                                                const precio = Number(prod?.precio) || 0;
                                                const qty = Number(it.qty) || 1;
                                                const subtotal = precio * qty;
                                                return (_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-2", children: [_jsxs("div", { className: "d-flex align-items-center", children: [_jsx("img", { src: img, alt: nombre, className: "img-thumbnail me-2", style: { width: '50px', height: '50px', objectFit: 'cover' } }), _jsxs("div", { children: [_jsx("small", { className: "d-block", children: nombre }), _jsxs("small", { className: "text-muted", children: ["Cantidad: ", qty] })] })] }), _jsxs("span", { className: "fw-bold", children: ["$", subtotal.toLocaleString()] })] }, it.id));
                                            })] }), _jsx("hr", {}), _jsxs("div", { className: "d-flex justify-content-between mb-2", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { children: ["$", total.toLocaleString()] })] }), _jsxs("div", { className: "d-flex justify-content-between mb-2", children: [_jsx("span", { children: "Env\u00EDo:" }), _jsx("span", { children: "$3.990" })] }), _jsxs("div", { className: "d-flex justify-content-between mb-2", children: [_jsx("span", { children: "IVA (19%):" }), _jsxs("span", { children: ["$", Math.round(total * 0.19).toLocaleString()] })] }), _jsx("hr", {}), _jsxs("div", { className: "d-flex justify-content-between fw-bold", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: ["$", (total + 3990 + Math.round(total * 0.19)).toLocaleString()] })] })] })] }) })] }) }));
};
export default CheckoutPage;
