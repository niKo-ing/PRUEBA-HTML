/**
 * Nombre del componente: OffersPage
 * Propósito: Mostrar ofertas especiales con cálculo de descuentos y ahorro.
 * Autor: Equipo Todobaratisimo
 * Fecha de creación: 2025-11-10
 * Última modificación: 2025-11-10
 *
 * Props:
 * - No recibe props; calcula ofertas desde el catálogo en memoria.
 *
 * Métodos/funciones:
 * - calculateSavings(original, discounted): número — Retorna ahorro.
 *
 * Hooks utilizados:
 * - useState: estado de ofertas y loading.
 * - useEffect: simula carga y cálculo de descuentos.
 *
 * Ejemplo de uso:
 * ```tsx
 * <OffersPage />
 * ```
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productos } from '../../../domain/data';
import type { Product } from '../../../domain/types';

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Array<Product & { discount: number; originalPrice: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de ofertas
    setTimeout(() => {
      const offersWithDiscount = productos
        .slice(0, 4) // Tomar primeros 4 productos para ofertas
        .map(product => {
          const discount = Math.floor(Math.random() * 30) + 10; // 10-40% descuento
          const originalPrice = product.precio;
          const discountedPrice = Math.round(originalPrice * (1 - discount / 100));
          
          return {
            ...product,
            precio: discountedPrice,
            discount,
            originalPrice
          };
        });
      
      setOffers(offersWithDiscount);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateSavings = (original: number, discounted: number) => {
    return original - discounted;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="mb-3">🎯 Ofertas Especiales</h1>
          <p className="text-muted">No te pierdas estas increíbles ofertas por tiempo limitado</p>
        </div>
        
        <div className="row">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100 placeholder-glow">
                <div className="placeholder" style={{ height: '200px' }}></div>
                <div className="card-body">
                  <h5 className="card-title placeholder col-6"></h5>
                  <p className="card-text placeholder col-8"></p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-3"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="mb-3">🎯 Ofertas Especiales</h1>
        <p className="text-muted">No te pierdas estas increíbles ofertas por tiempo limitado</p>
        <div className="badge bg-danger fs-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ¡Ofertas por tiempo limitado!
        </div>
      </div>

      {/* Countdown Banner */}
      <div className="alert alert-warning alert-dismissible fade show mb-5" role="alert">
        <div className="d-flex align-items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <div>
            <strong>¡Ofertas especiales!</strong> Estas ofertas terminan en 24 horas.
          </div>
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>

      {/* Offers Grid */}
      <div className="row">
        {offers.map((offer) => (
          <div key={offer.id} className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100 shadow-sm border-0 overflow-hidden">
              {/* Discount Badge */}
              <div className="position-absolute top-0 start-0 m-2">
                <span className="badge bg-danger fs-6">
                  -{offer.discount}%
                </span>
              </div>
              
              {/* Product Image */}
              <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                <img 
                  src={offer.img} 
                  alt={offer.nombre}
                  className="card-img-top w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-0 hover-overlay"></div>
              </div>
              
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-2">{offer.nombre}</h5>
                <p className="card-text text-muted small mb-3">{offer.descripcion}</p>
                
                {/* Price Section */}
                <div className="mt-auto">
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-decoration-line-through text-muted me-2">
                      ${offer.originalPrice.toLocaleString()}
                    </span>
                    <span className="badge bg-success">
                      Ahorra ${calculateSavings(offer.originalPrice, offer.precio).toLocaleString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="h4 text-primary mb-0">
                      ${offer.precio.toLocaleString()}
                    </span>
                    <Link 
                      to={`/product/${offer.slug}`}
                      className="btn btn-primary btn-sm"
                    >
                      Ver Oferta
                    </Link>
                  </div>
                </div>
                
                {/* Stock Warning */}
                {offer.stock < 10 && (
                  <div className="alert alert-warning mt-3 mb-0 py-2">
                    <small className="d-flex align-items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      ¡Solo quedan {offer.stock} unidades!
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Offers Section */}
      <div className="mt-5">
        <h3 className="text-center mb-4">Más Ofertas Disponibles</h3>
        <div className="row">
          {productos.slice(4, 7).map((product) => (
            <div key={product.id} className="col-md-4 mb-3">
              <div className="card border-0 bg-light">
                <div className="card-body text-center">
                  <h5 className="card-title">{product.nombre}</h5>
                  <p className="card-text text-muted">{product.descripcion}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="h5 text-primary">${product.precio.toLocaleString()}</span>
                    <Link to={`/product/${product.slug}`} className="btn btn-outline-primary">
                      Ver Producto
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="mt-5">
        <div className="card bg-primary text-white text-center border-0">
          <div className="card-body p-5">
            <h4 className="mb-3">¿No quieres perderte más ofertas?</h4>
            <p className="mb-4">Suscríbete a nuestro newsletter y recibe las mejores ofertas directamente en tu correo</p>
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="input-group">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Ingresa tu email"
                    aria-label="Ingresa tu email"
                  />
                  <button className="btn btn-light" type="button">
                    Suscribirse
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
