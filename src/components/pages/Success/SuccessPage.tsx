import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = '/';
    }
  }, [countdown]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3">
                  <svg 
                    width="64" 
                    height="64" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-success"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h1 className="text-success mb-2">¡Compra Exitosa!</h1>
                <p className="text-muted fs-5">
                  Tu pedido ha sido procesado correctamente. Gracias por tu compra.
                </p>
              </div>

              <div className="bg-light rounded p-4 mb-4">
                <div className="row text-center">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="fs-2 fw-bold text-primary">{orderNumber}</div>
                    <div className="text-muted">Número de Orden</div>
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="fs-2 fw-bold text-primary">24-48h</div>
                    <div className="text-muted">Tiempo de Entrega</div>
                  </div>
                  <div className="col-md-4">
                    <div className="fs-2 fw-bold text-primary">Gratis</div>
                    <div className="text-muted">Envío</div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info mb-4">
                <div className="d-flex align-items-center">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="me-2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <div>
                    <strong>¿Qué sigue?</strong> Recibirás un correo de confirmación con los detalles de tu pedido.
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="mb-3">Próximos Pasos</h5>
                <div className="row text-center">
                  <div className="col-md-3 mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div className="small">Confirmación</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="9.5" cy="9.5" r="1.5"></circle>
                        <polyline points="7 4 7 1 17 1 17 4"></polyline>
                      </svg>
                    </div>
                    <div className="small">Preparación</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div className="small">Envío</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                    </div>
                    <div className="small">Entrega</div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                <Link to="/" className="btn btn-primary btn-lg">
                  Volver al Inicio
                </Link>
                <Link to="/products" className="btn btn-outline-primary btn-lg">
                  Seguir Comprando
                </Link>
              </div>

              <div className="mt-4 text-muted">
                <small>
                  Redirigiendo a la página de inicio en {countdown} segundos...
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;