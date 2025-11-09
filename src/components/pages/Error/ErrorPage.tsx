import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3">
                  <svg 
                    width="64" 
                    height="64" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-danger"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h1 className="text-danger mb-2">¡Ups! Algo salió mal</h1>
                <p className="text-muted fs-5">
                  Lo sentimos, ha ocurrido un error al procesar tu pago. No se ha realizado ningún cargo en tu tarjeta.
                </p>
              </div>

              <div className="alert alert-warning mb-4">
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
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <div>
                    <strong>¿Qué puede haber pasado?</strong>
                  </div>
                </div>
                <ul className="mt-2 mb-0">
                  <li>Tarjeta rechazada por fondos insuficientes</li>
                  <li>Tarjeta bloqueada o vencida</li>
                  <li>Error en la conexión con el banco</li>
                  <li>Datos de la tarjeta incorrectos</li>
                </ul>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <div className="bg-light rounded p-3 h-100">
                    <h6 className="mb-2">Posibles soluciones</h6>
                    <ul className="small text-start">
                      <li>Verifica los datos de tu tarjeta</li>
                      <li>Intenta con otro método de pago</li>
                      <li>Contacta a tu banco</li>
                      <li>Intenta más tarde</li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="bg-light rounded p-3 h-100">
                    <h6 className="mb-2">¿Necesitas ayuda?</h6>
                    <p className="small mb-2">
                      Nuestro equipo de soporte está aquí para ayudarte.
                    </p>
                    <div className="small">
                      <strong>Teléfono:</strong> +56 9 1234 5678<br />
                      <strong>Email:</strong> soporte@todobaratisimo.cl<br />
                      <strong>Horario:</strong> Lunes a Viernes 9:00-18:00
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                <Link to="/checkout" className="btn btn-primary btn-lg">
                  Intentar de nuevo
                </Link>
                <Link to="/cart" className="btn btn-outline-secondary btn-lg">
                  Volver al carrito
                </Link>
                <Link to="/contact" className="btn btn-outline-primary btn-lg">
                  Contactar soporte
                </Link>
              </div>

              <div className="mt-4 text-muted">
                <small>
                  Si el problema persiste, por favor contáctanos. Estaremos encantados de ayudarte.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;