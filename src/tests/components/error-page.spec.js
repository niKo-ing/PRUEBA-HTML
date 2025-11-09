import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { render, screen, fireEvent } from '../helpers/test-helpers';
import ErrorPage from '../../../components/pages/Error/ErrorPage';
import { useLocation } from 'react-router-dom';
// Mock useLocation
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn()
}));
describe('ErrorPage', () => {
    const mockNavigate = jest.fn();
    beforeEach(() => {
        useLocation.mockReturnValue({
            state: {
                error: 'Payment declined',
                errorCode: 'PAYMENT_FAILED',
                orderDetails: {
                    items: [
                        { name: 'Product 1', price: 10000, quantity: 2 }
                    ],
                    total: 20000
                }
            }
        });
        // Mock useNavigate
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useNavigate: () => mockNavigate
        }));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should display error title and message', () => {
        render(_jsx(ErrorPage, {}));
        expect(screen.getByText('Error en el Pago')).toBeInTheDocument();
        expect(screen.getByText('Hubo un problema al procesar tu pago')).toBeInTheDocument();
    });
    it('should display specific error message when provided', () => {
        render(_jsx(ErrorPage, {}));
        expect(screen.getByText('Payment declined')).toBeInTheDocument();
    });
    it('should display order summary with items', () => {
        render(_jsx(ErrorPage, {}));
        expect(screen.getByText('Resumen de tu Orden')).toBeInTheDocument();
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Quantity
    });
    it('should display correct pricing', () => {
        render(_jsx(ErrorPage, {}));
        expect(screen.getByText('$20.000')).toBeInTheDocument(); // Total
    });
    it('should show suggested actions', () => {
        render(_jsx(ErrorPage, {}));
        expect(screen.getByText('¿Qué Puedes Hacer?')).toBeInTheDocument();
        expect(screen.getByText('Verifica los datos de tu tarjeta')).toBeInTheDocument();
        expect(screen.getByText('Asegúrate de tener fondos suficientes')).toBeInTheDocument();
        expect(screen.getByText('Intenta con otro método de pago')).toBeInTheDocument();
    });
    it('should have retry payment button', () => {
        render(_jsx(ErrorPage, {}));
        const retryButton = screen.getByText('Reintentar Pago');
        expect(retryButton).toBeInTheDocument();
    });
    it('should have return to cart button', () => {
        render(_jsx(ErrorPage, {}));
        const returnButton = screen.getByText('Volver al Carrito');
        expect(returnButton).toBeInTheDocument();
    });
    it('should handle missing error data gracefully', () => {
        useLocation.mockReturnValue({ state: null });
        render(_jsx(ErrorPage, {}));
        expect(screen.getByText('Error en el Pago')).toBeInTheDocument();
        expect(screen.getByText('Hubo un problema al procesar tu pago')).toBeInTheDocument();
    });
    it('should have correct styling classes', () => {
        render(_jsx(ErrorPage, {}));
        const errorContainer = screen.getByRole('main');
        expect(errorContainer).toHaveClass('min-h-screen', 'bg-gray-50', 'py-12');
    });
    it('should display error icon', () => {
        render(_jsx(ErrorPage, {}));
        const errorIcon = screen.getByRole('img', { name: /error/i });
        expect(errorIcon).toBeInTheDocument();
        expect(errorIcon).toHaveClass('w-16', 'h-16');
    });
    it('should navigate to checkout on retry payment', () => {
        render(_jsx(ErrorPage, {}));
        const retryButton = screen.getByText('Reintentar Pago');
        fireEvent.click(retryButton);
        expect(mockNavigate).toHaveBeenCalledWith('/checkout');
    });
    it('should navigate to cart on return to cart', () => {
        render(_jsx(ErrorPage, {}));
        const returnButton = screen.getByText('Volver al Carrito');
        fireEvent.click(returnButton);
        expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });
});
