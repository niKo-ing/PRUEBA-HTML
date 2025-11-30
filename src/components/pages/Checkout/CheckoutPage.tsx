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
import type { Product } from '@domain/types';
import { fetchProducts } from '../../../services/products.service';
import type { CartItem } from '@domain/types';
import { useAuth } from '../../../domain/auth/auth.context';
import { createPaymentGateway, formatCardNumber, formatExpiryDate, detectCardType } from '../../../services/payment.service';
import AddressAutocomplete from '@molecules/AddressAutocomplete/AddressAutocomplete';
import type { ParsedAddress } from '@molecules/AddressAutocomplete/AddressAutocomplete';
import MapPreview from '@molecules/AddressAutocomplete/MapPreview';

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  // Evita redirección al carrito mientras se está procesando el pago
  const isProcessingRef = useRef(false);
  const [direccionParsed, setDireccionParsed] = useState<ParsedAddress | null>(null);
  const [formData, setFormData] = useState<CheckoutForm>({
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
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});

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
      .then((data) => { if (!alive) return; setCatalog(Array.isArray(data) ? data : []); })
      .catch(() => void 0);
    return () => { alive = false; };
  }, []);

  // Valida campos indispensables y también la tarjeta usando el "gateway" mock
  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};

    if (!formData.email) newErrors.email = 'Email es requerido';
    if (!formData.firstName) newErrors.firstName = 'Nombre es requerido';
    if (!formData.lastName) newErrors.lastName = 'Apellido es requerido';
    // Dirección: exigir selección desde Google Autocomplete con placeId y lat/lng
    if (!formData.address) {
      newErrors.address = 'Dirección es requerida';
    }
    if (!formData.city) newErrors.city = 'Ciudad es requerida';
    if (!formData.phone) newErrors.phone = 'Teléfono es requerido';

    // Código postal: exactamente 7 dígitos numéricos (Chile)
    const postalDigits = (formData.postalCode || '').replace(/\D/g, '');
    if (!postalDigits || !/^\d{7}$/.test(postalDigits)) {
      newErrors.postalCode = 'Código postal debe tener 7 dígitos';
    }
    
    // Validar número de tarjeta usando el servicio
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Número de tarjeta es requerido';
    } else {
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      const paymentGateway = createPaymentGateway();
      if (!paymentGateway.validateCard(cardNumber)) {
        newErrors.cardNumber = 'Número de tarjeta inválido';
      }
    }
    
    if (!formData.cardName) newErrors.cardName = 'Nombre en la tarjeta es requerido';
    
    // Validar fecha de expiración usando el servicio
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Fecha de expiración es requerida';
    } else {
      const paymentGateway = createPaymentGateway();
      if (!paymentGateway.validateExpiry(formData.expiryDate)) {
        newErrors.expiryDate = 'Fecha de expiración inválida';
      }
    }
    
    // Validar CVV usando el servicio
    if (!formData.cvv) {
      newErrors.cvv = 'CVV es requerido';
    } else {
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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
          const detalles = items.map((it: CartItem) => {
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
        } catch {}

        // Navega a éxito primero y luego limpia el carrito para evitar
        // que el efecto de carrito vacío redirija de vuelta al carrito.
        navigate(`/compra-exitosa?order=${orderNumber}`);
        clear();
      } else {
        // Redirige a pantalla de error con información del gateway
        navigate(`/error-compra?error=${paymentResponse.errorCode}&message=${encodeURIComponent(paymentResponse.message)}`);
        // Permite reintentar pago si seguimos en checkout
        isProcessingRef.current = false;
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      navigate('/error-compra?error=PROCESSING_ERROR&message=Error al procesar el pago');
      // Permite reintentar pago si seguimos en checkout
      isProcessingRef.current = false;
    } finally {
      setLoading(false);
      // No liberar isProcessing aquí para evitar carreras antes de desmontar en éxito
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name as keyof CheckoutForm]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name as keyof CheckoutForm];
        return next;
      });
    }
  };

  // Restringe código postal a solo números y máximo 7 dígitos
  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  // Formatea la fecha de expiración mientras se escribe
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData(prev => ({ ...prev, expiryDate: formatted }));
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <h2 className="mb-4">Finalizar Compra</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Información de Contacto</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Información de Envío</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">Nombre</label>
                    <input
                      type="text"
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">Apellido</label>
                    <input
                      type="text"
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                  </div>
                </div>
                <div className="mb-3">
                  <AddressAutocomplete
                    label="Dirección"
                    value={formData.address}
                    onTextChange={(v) => {
                      setFormData(prev => ({ ...prev, address: v }));
                      if (errors.address) {
                        setErrors(prev => {
                          const { address, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    onAddressSelected={(addr) => {
                      setDireccionParsed(addr);
                      const postalDigits = (addr.postalCode || '').replace(/\D/g, '').slice(0, 7);
                      setFormData(prev => ({
                        ...prev,
                        address: addr.fullText || prev.address,
                        city: addr.comuna || addr.city || prev.city,
                        region: addr.region || prev.region,
                        postalCode: postalDigits || prev.postalCode,
                      }));
                    }}
                    error={errors.address ?? null}
                    isInvalid={!!errors.address}
                    isValid={!!direccionParsed?.placeId && typeof direccionParsed?.lat === 'number' && typeof direccionParsed?.lng === 'number'}
                  />
                  <div className="mt-2">
                    {typeof direccionParsed?.lat === 'number' && typeof direccionParsed?.lng === 'number' ? (
                      <MapPreview lat={direccionParsed.lat} lng={direccionParsed.lng} />
                    ) : (
                      <div
                        className="bg-light rounded-4 d-flex align-items-center justify-content-center"
                        style={{ height: 180 }}
                      >
                        <small className="text-body-secondary">Escribe y selecciona una dirección para ver el mapa…</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="city" className="form-label">Ciudad</label>
                    <input
                      type="text"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="region" className="form-label">Región</label>
                    <input
                      type="text"
                      className="form-control"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="postalCode" className="form-label">Código Postal</label>
                    <input
                      type="text"
                      className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handlePostalChange}
                      inputMode="numeric"
                      maxLength={7}
                      required
                    />
                    {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Información de Pago</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="cardNumber" className="form-label">Número de Tarjeta</label>
                  <input
                    type="text"
                    className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                  {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="cardName" className="form-label">Nombre en la Tarjeta</label>
                  <input
                    type="text"
                    className={`form-control ${errors.cardName ? 'is-invalid' : ''}`}
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.cardName && <div className="invalid-feedback">{errors.cardName}</div>}
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="expiryDate" className="form-label">Fecha de Expiración</label>
                    <input
                    type="text"
                    className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/AA"
                    maxLength={5}
                    required
                  />
                    {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="cvv" className="form-label">CVV</label>
                    <input
                      type="text"
                      className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                      placeholder="123"
                      maxLength={3}
                      required
                    />
                    {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={loading || isProcessingRef.current}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                'Completar Compra'
              )}
            </button>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Resumen del Pedido</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>Productos ({items.length})</h6>
                {items.map((it: CartItem) => {
                  const prod = catalog.find(p => p.id === it.id);
                  const nombre = prod?.nombre ?? 'Producto';
                  const img = prod?.images?.[0] ?? prod?.img ?? '/assets/img/placeholder.png';
                  const precio = Number(prod?.precio) || 0;
                  const qty = Number(it.qty) || 1;
                  const subtotal = precio * qty;
                  return (
                    <div key={it.id} className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <img
                          src={img}
                          alt={nombre}
                          className="img-thumbnail me-2"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                        <div>
                          <small className="d-block">{nombre}</small>
                          <small className="text-muted">Cantidad: {qty}</small>
                        </div>
                      </div>
                      <span className="fw-bold">${subtotal.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío:</span>
                <span>$3.990</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>IVA (19%):</span>
                <span>${Math.round(total * 0.19).toLocaleString()}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>${(total + 3990 + Math.round(total * 0.19)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
