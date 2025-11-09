import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { render, screen } from '../helpers/test-helpers';
import SuccessPage from '../../../components/pages/Success/SuccessPage';
import { useLocation } from 'react-router-dom';
// Mock useLocation
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn()
}));
describe('SuccessPage', () => {
    const mockNavigate = jest.fn();
    beforeEach(() => {
        useLocation.mockReturnValue({
            state: {
                orderNumber: 'ORD-12345',
                orderDetails: {
                    items: [
                        { name: 'Product 1', price: 10000, quantity: 2 },
                        { name: 'Product 2', price: 15000, quantity: 1 }
                    ],
                    total: 45000,
                    shipping: 3990,
                    tax: 6650
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
    it('should display success message with order number', () => {
        render(_jsx(SuccessPage, {}));
        expect(screen.getByText('¡Pago Exitoso!')).toBeInTheDocument();
        expect(screen.getByText('Tu orden #ORD-12345 ha sido procesada exitosamente')).toBeInTheDocument();
    });
    it('should display order summary with items', () => {
        render(_jsx(SuccessPage, {}));
        expect(screen.getByText('Resumen de tu Orden')).toBeInTheDocument();
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Quantity for Product 1
        expect(screen.getByText('1')).toBeInTheDocument(); // Quantity for Product 2
    });
    it('should display correct pricing breakdown', () => {
        render(_jsx(SuccessPage, {}));
        expect(screen.getByText('$35.000')).toBeInTheDocument(); // Subtotal
        expect(screen.getByText('$3.990')).toBeInTheDocument(); // Shipping
        expect(screen.getByText('$6.650')).toBeInTheDocument(); // Tax
        expect(screen.getByText('$45.640')).toBeInTheDocument(); // Total
    });
    it('should show delivery timeline', () => {
        render(_jsx(SuccessPage, {}));
        expect(screen.getByText('Tiempo de Entrega')).toBeInTheDocument();
        expect(screen.getByText('3-5 días hábiles')).toBeInTheDocument();
    });
    it('should show next steps information', () => {
        render(_jsx(SuccessPage, {}));
        expect(screen.getByText('¿Qué Sigue?')).toBeInTheDocument();
        expect(screen.getByText('Recibirás un correo de confirmación con los detalles de tu pedido')).toBeInTheDocument();
        expect(screen.getByText('Podrás hacer seguimiento de tu envío desde tu cuenta')).toBeInTheDocument();
    });
    it('should have continue shopping button', () => {
        render(_jsx(SuccessPage, {}));
        const continueButton = screen.getByText('Continuar Comprando');
        expect(continueButton).toBeInTheDocument();
    });
    it('should handle missing order data gracefully', () => {
        useLocation.mockReturnValue({ state: null });
        render(_jsx(SuccessPage, {}));
        expect(screen.getByText('¡Pago Exitoso!')).toBeInTheDocument();
        expect(screen.getByText('Tu orden ha sido procesada exitosamente')).toBeInTheDocument();
    });
    it('should have correct styling classes', () => {
        render(_jsx(SuccessPage, {}));
        const successContainer = screen.getByRole('main');
        expect(successContainer).toHaveClass('min-h-screen', 'bg-gray-50', 'py-12');
    });
    it('should display success icon', () => {
        render(_jsx(SuccessPage, {}));
        const successIcon = screen.getByRole('img', { name: /success/i });
        expect(successIcon).toBeInTheDocument();
        expect(successIcon).toHaveClass('w-16', 'h-16');
    });
});
