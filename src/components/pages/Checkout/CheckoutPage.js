import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@domain/cart/cart.context';
import { productos } from '@domain/data';
import { useAuth } from '../../../domain/auth/auth.context';
import { createPaymentGateway, formatCardNumber, formatExpiryDate, detectCardType } from '../../../services/payment.service';
const CheckoutPage = () => {
    const navigate = useNavigate();
    const { items, total, clear } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
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
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart');
        }
    }, [items, navigate]);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email)
            newErrors.email = 'Email es requerido';
        if (!formData.firstName)
            newErrors.firstName = 'Nombre es requerido';
        if (!formData.lastName)
            newErrors.lastName = 'Apellido es requerido';
        if (!formData.address)
            newErrors.address = 'Dirección es requerida';
        if (!formData.city)
            newErrors.city = 'Ciudad es requerida';
        if (!formData.phone)
            newErrors.phone = 'Teléfono es requerido';
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setLoading(true);
        try {
            // Initialize payment gateway
            const paymentGateway = createPaymentGateway();
            // Prepare payment data
            const paymentData = {
                cardNumber: formData.cardNumber.replace(/\s/g, ''),
                expiryDate: formData.expiryDate,
                cvv: formData.cvv,
                cardholderName: formData.cardName,
                amount: total,
                currency: 'CLP',
                description: `Compra en TodoBaratisimo - ${items.length} producto(s)`
            };
            // Process payment
            const paymentResponse = await paymentGateway.processPayment(paymentData);
            if (paymentResponse.success) {
                // Generate order number
                const orderNumber = paymentResponse.transactionId || 'ORD-' + Date.now();
                // Persist order for admin/reportes
                try {
                    const now = new Date().toISOString();
                    const cliente = `${formData.firstName} ${formData.lastName}`.trim() || formData.email;
                    const order = {
                        id: orderNumber,
                        cliente,
                        email: formData.email,
                        total,
                        fecha: now,
                        estado: 'pendiente',
                        items: items.reduce((acc, it) => acc + (Number(it.qty) || 1), 0),
                    };
                    const prev = JSON.parse(localStorage.getItem('admin_orders') || '[]');
                    const arr = Array.isArray(prev) ? prev : [];
                    localStorage.setItem('admin_orders', JSON.stringify([order, ...arr]));
                }
                catch { }
                // Clear cart
                clear();
                // Redirect to success page
                navigate(`/compra-exitosa?order=${orderNumber}`);
            }
            else {
                // Redirect to error page with error details
                navigate(`/error-compra?error=${paymentResponse.errorCode}&message=${encodeURIComponent(paymentResponse.message)}`);
            }
        }
        catch (error) {
            console.error('Payment processing error:', error);
            navigate('/error-compra?error=PROCESSING_ERROR&message=Error al procesar el pago');
        }
        finally {
            setLoading(false);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };
    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setFormData(prev => ({ ...prev, cardNumber: formatted }));
    };
    const handleExpiryDateChange = (e) => {
        const formatted = formatExpiryDate(e.target.value);
        setFormData(prev => ({ ...prev, expiryDate: formatted }));
    };
    return (_jsx("div", { className: "container py-5", children: _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-lg-8", children: [_jsx("h2", { className: "mb-4", children: "Finalizar Compra" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "card mb-4", children: [_jsx("div", { className: "card-header", children: _jsx("h5", { className: "mb-0", children: "Informaci\u00F3n de Contacto" }) }), _jsx("div", { className: "card-body", children: _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "email", className: "form-label", children: "Email" }), _jsx("input", { type: "email", className: `form-control ${errors.email ? 'is-invalid' : ''}`, id: "email", name: "email", value: formData.email, onChange: handleInputChange, required: true }), errors.email && _jsx("div", { className: "invalid-feedback", children: errors.email })] }), _jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "phone", className: "form-label", children: "Tel\u00E9fono" }), _jsx("input", { type: "tel", className: `form-control ${errors.phone ? 'is-invalid' : ''}`, id: "phone", name: "phone", value: formData.phone, onChange: handleInputChange, required: true }), errors.phone && _jsx("div", { className: "invalid-feedback", children: errors.phone })] })] }) })] }), _jsxs("div", { className: "card mb-4", children: [_jsx("div", { className: "card-header", children: _jsx("h5", { className: "mb-0", children: "Informaci\u00F3n de Env\u00EDo" }) }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "firstName", className: "form-label", children: "Nombre" }), _jsx("input", { type: "text", className: `form-control ${errors.firstName ? 'is-invalid' : ''}`, id: "firstName", name: "firstName", value: formData.firstName, onChange: handleInputChange, required: true }), errors.firstName && _jsx("div", { className: "invalid-feedback", children: errors.firstName })] }), _jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "lastName", className: "form-label", children: "Apellido" }), _jsx("input", { type: "text", className: `form-control ${errors.lastName ? 'is-invalid' : ''}`, id: "lastName", name: "lastName", value: formData.lastName, onChange: handleInputChange, required: true }), errors.lastName && _jsx("div", { className: "invalid-feedback", children: errors.lastName })] })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "address", className: "form-label", children: "Direcci\u00F3n" }), _jsx("input", { type: "text", className: `form-control ${errors.address ? 'is-invalid' : ''}`, id: "address", name: "address", value: formData.address, onChange: handleInputChange, required: true }), errors.address && _jsx("div", { className: "invalid-feedback", children: errors.address })] }), _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("label", { htmlFor: "city", className: "form-label", children: "Ciudad" }), _jsx("input", { type: "text", className: `form-control ${errors.city ? 'is-invalid' : ''}`, id: "city", name: "city", value: formData.city, onChange: handleInputChange, required: true }), errors.city && _jsx("div", { className: "invalid-feedback", children: errors.city })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("label", { htmlFor: "region", className: "form-label", children: "Regi\u00F3n" }), _jsx("input", { type: "text", className: "form-control", id: "region", name: "region", value: formData.region, onChange: handleInputChange })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("label", { htmlFor: "postalCode", className: "form-label", children: "C\u00F3digo Postal" }), _jsx("input", { type: "text", className: "form-control", id: "postalCode", name: "postalCode", value: formData.postalCode, onChange: handleInputChange })] })] })] })] }), _jsxs("div", { className: "card mb-4", children: [_jsx("div", { className: "card-header", children: _jsx("h5", { className: "mb-0", children: "Informaci\u00F3n de Pago" }) }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "cardNumber", className: "form-label", children: "N\u00FAmero de Tarjeta" }), _jsx("input", { type: "text", className: `form-control ${errors.cardNumber ? 'is-invalid' : ''}`, id: "cardNumber", name: "cardNumber", value: formData.cardNumber, onChange: handleCardNumberChange, placeholder: "1234 5678 9012 3456", maxLength: 19, required: true }), errors.cardNumber && _jsx("div", { className: "invalid-feedback", children: errors.cardNumber })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "cardName", className: "form-label", children: "Nombre en la Tarjeta" }), _jsx("input", { type: "text", className: `form-control ${errors.cardName ? 'is-invalid' : ''}`, id: "cardName", name: "cardName", value: formData.cardName, onChange: handleInputChange, required: true }), errors.cardName && _jsx("div", { className: "invalid-feedback", children: errors.cardName })] }), _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "expiryDate", className: "form-label", children: "Fecha de Expiraci\u00F3n" }), _jsx("input", { type: "text", className: `form-control ${errors.expiryDate ? 'is-invalid' : ''}`, id: "expiryDate", name: "expiryDate", value: formData.expiryDate, onChange: handleExpiryDateChange, placeholder: "MM/AA", maxLength: 5, required: true }), errors.expiryDate && _jsx("div", { className: "invalid-feedback", children: errors.expiryDate })] }), _jsxs("div", { className: "col-md-6 mb-3", children: [_jsx("label", { htmlFor: "cvv", className: "form-label", children: "CVV" }), _jsx("input", { type: "text", className: `form-control ${errors.cvv ? 'is-invalid' : ''}`, id: "cvv", name: "cvv", value: formData.cvv, onChange: (e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') })), placeholder: "123", maxLength: 3, required: true }), errors.cvv && _jsx("div", { className: "invalid-feedback", children: errors.cvv })] })] })] })] }), _jsx("button", { type: "submit", className: "btn btn-primary btn-lg w-100", disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Procesando..."] })) : ('Completar Compra') })] })] }), _jsx("div", { className: "col-lg-4", children: _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsx("h5", { className: "mb-0", children: "Resumen del Pedido" }) }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "mb-3", children: [_jsxs("h6", { children: ["Productos (", items.length, ")"] }), items.map((it) => {
                                                const prod = productos.find(p => p.id === it.id);
                                                const nombre = prod?.nombre ?? 'Producto';
                                                const img = prod?.images?.[0] ?? prod?.img ?? '/assets/img/placeholder.png';
                                                const precio = Number(prod?.precio) || 0;
                                                const qty = Number(it.qty) || 1;
                                                const subtotal = precio * qty;
                                                return (_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-2", children: [_jsxs("div", { className: "d-flex align-items-center", children: [_jsx("img", { src: img, alt: nombre, className: "img-thumbnail me-2", style: { width: '50px', height: '50px', objectFit: 'cover' } }), _jsxs("div", { children: [_jsx("small", { className: "d-block", children: nombre }), _jsxs("small", { className: "text-muted", children: ["Cantidad: ", qty] })] })] }), _jsxs("span", { className: "fw-bold", children: ["$", subtotal.toLocaleString()] })] }, it.id));
                                            })] }), _jsx("hr", {}), _jsxs("div", { className: "d-flex justify-content-between mb-2", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { children: ["$", total.toLocaleString()] })] }), _jsxs("div", { className: "d-flex justify-content-between mb-2", children: [_jsx("span", { children: "Env\u00EDo:" }), _jsx("span", { children: "$3.990" })] }), _jsxs("div", { className: "d-flex justify-content-between mb-2", children: [_jsx("span", { children: "IVA (19%):" }), _jsxs("span", { children: ["$", Math.round(total * 0.19).toLocaleString()] })] }), _jsx("hr", {}), _jsxs("div", { className: "d-flex justify-content-between fw-bold", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: ["$", (total + 3990 + Math.round(total * 0.19)).toLocaleString()] })] })] })] }) })] }) }));
};
export default CheckoutPage;
