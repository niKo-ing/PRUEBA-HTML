# Services

Propósito
- Proveer servicios de infraestructura (pago simulado), formatos y utilidades.

Contenido
- `payment.service.ts`: gateway simulado con validaciones y latencia controlada.

Relación con la arquitectura
- Consumido por UI y dominio para procesar pagos; no depende de backend real.

Flujos
- Validar tarjeta/expiración/CVV → retraso → procesar → respuesta `PaymentResponse`.

Ejemplos
```ts
const gw = createPaymentGateway();
await gw.processPayment({ cardNumber:"4111 1111 1111 1111", expiryDate:"12/29", cvv:"123", cardholderName:"John Doe", amount:10000 });
```

