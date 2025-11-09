// Página de Checkout: valida el formulario, procesa el pago (mock)
// y guarda una orden detallada en localStorage para que el admin
// pueda ver e imprimir la boleta.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@domain/cart/cart.context';
import { productos } from '@domain/data';
import type { CartItem } from '@domain/types';
import { useAuth } from '../../../domain/auth/auth.context';
import { createPaymentGateway, formatCardNumber, formatExpiryDate, detectCardType } from '../../../services/payment.service';

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
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  useEffect(() => {
    // Si el carrito está vacío, redirigimos al usuario al carrito
    if (items.length === 0) {
      navigate('/carrito');
    }
  }, [items, navigate]);

  // Valida campos indispensables y también la tarjeta usando el "gateway" mock
  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};

    if (!formData.email) newErrors.email = 'Email es requerido';
    if (!formData.firstName) newErrors.firstName = 'Nombre es requerido';
    if (!formData.lastName) newErrors.lastName = 'Apellido es requerido';
    if (!formData.address) newErrors.address = 'Dirección es requerida';
    if (!formData.city) newErrors.city = 'Ciudad es requerida';
    if (!formData.phone) newErrors.phone = 'Teléfono es requerido';
    
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
            const prod = productos.find(p => p.id === it.id);
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

        // Limpia el carrito tras compra exitosa
        clear();

        // Redirige a pantalla de compra exitosa con el id de la orden
        navigate(`/compra-exitosa?order=${orderNumber}`);
      } else {
        // Redirige a pantalla de error con información del gateway
        navigate(`/error-compra?error=${paymentResponse.errorCode}&message=${encodeURIComponent(paymentResponse.message)}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      navigate('/error-compra?error=PROCESSING_ERROR&message=Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name as keyof CheckoutForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
                  <label htmlFor="address" className="form-label">Dirección</label>
                  <input
                    type="text"
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.address && <div className="invalid-feedback">{errors.address}</div>}
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
                      className="form-control"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
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

            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
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
                  const prod = productos.find(p => p.id === it.id);
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