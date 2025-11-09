import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { render, screen, waitFor, fireEvent } from '../helpers/test-helpers';
import CheckoutPage from '../../../components/pages/Checkout/CheckoutPage';
import { useCart } from '../../../app/cart-ui.context';
import { useAuth } from '../../../domain/auth/auth.context';
// Mock the hooks
jest.mock('../../../app/cart-ui.context');
jest.mock('../../../domain/auth/auth.context');
describe('CheckoutPage', () => {
    const mockNavigate = jest.fn();
    const mockClearCart = jest.fn();
    const mockCartItems = [
        { id: 1, name: 'Product 1', price: 10000, quantity: 2, image: '/img1.jpg' },
        { id: 2, name: 'Product 2', price: 15000, quantity: 1, image: '/img2.jpg' }
    ];
    const mockUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
    };
    beforeEach(() => {
        useCart.mockReturnValue({
            cartItems: mockCartItems,
            getTotalPrice: () => 35000, // 10000*2 + 15000
            clearCart: mockClearCart
        });
        useAuth.mockReturnValue({
            user: mockUser
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
    it('should redirect to cart when cart is empty', () => {
        useCart.mockReturnValue({
            cartItems: [],
            getTotalPrice: () => 0,
            clearCart: mockClearCart
        });
        render(_jsx(CheckoutPage, {}));
        expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });
    it('should render checkout form with user data pre-filled', () => {
        render(_jsx(CheckoutPage, {}));
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    });
    it('should display cart summary with correct totals', () => {
        render(_jsx(CheckoutPage, {}));
        expect(screen.getByText('Productos (2)')).toBeInTheDocument();
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('$35.000')).toBeInTheDocument(); // Subtotal
        expect(screen.getByText('$3.990')).toBeInTheDocument(); // Shipping
        expect(screen.getByText('$6.650')).toBeInTheDocument(); // IVA (19%)
        expect(screen.getByText('$45.640')).toBeInTheDocument(); // Total
    });
    it('should show validation errors for required fields', async () => {
        render(_jsx(CheckoutPage, {}));
        const submitButton = screen.getByText('Completar Compra');
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText('Dirección es requerida')).toBeInTheDocument();
            expect(screen.getByText('Ciudad es requerida')).toBeInTheDocument();
            expect(screen.getByText('Teléfono es requerido')).toBeInTheDocument();
        });
    });
    it('should format card number input', async () => {
        render(_jsx(CheckoutPage, {}));
        const cardNumberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
        fireEvent.change(cardNumberInput, { target: { value: '4111111111111111' } });
        await waitFor(() => {
            expect(cardNumberInput).toHaveValue('4111 1111 1111 1111');
        });
    });
    it('should format expiry date input', async () => {
        render(_jsx(CheckoutPage, {}));
        const expiryDateInput = screen.getByPlaceholderText('MM/AA');
        fireEvent.change(expiryDateInput, { target: { value: '1225' } });
        await waitFor(() => {
            expect(expiryDateInput).toHaveValue('12/25');
        });
    });
    it('should validate card number format', async () => {
        render(_jsx(CheckoutPage, {}));
        const cardNumberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
        const submitButton = screen.getByText('Completar Compra');
        fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } }); // Invalid card
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText('Número de tarjeta inválido')).toBeInTheDocument();
        });
    });
    it('should validate expiry date format', async () => {
        render(_jsx(CheckoutPage, {}));
        const expiryDateInput = screen.getByPlaceholderText('MM/AA');
        const submitButton = screen.getByText('Completar Compra');
        fireEvent.change(expiryDateInput, { target: { value: '13/25' } }); // Invalid month
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText('Fecha de expiración inválida')).toBeInTheDocument();
        });
    });
    it('should validate CVV format', async () => {
        render(_jsx(CheckoutPage, {}));
        const cvvInput = screen.getByPlaceholderText('123');
        const submitButton = screen.getByText('Completar Compra');
        fireEvent.change(cvvInput, { target: { value: '12' } }); // Too short
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText('CVV inválido')).toBeInTheDocument();
        });
    });
    it('should clear field errors when user types', async () => {
        render(_jsx(CheckoutPage, {}));
        const submitButton = screen.getByText('Completar Compra');
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText('Dirección es requerida')).toBeInTheDocument();
        });
        const addressInput = screen.getByLabelText('Dirección');
        fireEvent.change(addressInput, { target: { value: '123 Main St' } });
        await waitFor(() => {
            expect(screen.queryByText('Dirección es requerida')).not.toBeInTheDocument();
        });
    });
    it('should show loading state during form submission', async () => {
        // Mock successful payment
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                transactionId: 'TXN-12345'
            })
        });
        render(_jsx(CheckoutPage, {}));
        // Fill required fields
        fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: '123 Main St' } });
        fireEvent.change(screen.getByLabelText('Ciudad'), { target: { value: 'Santiago' } });
        fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '+56912345678' } });
        fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), { target: { value: '4111111111111111' } });
        fireEvent.change(screen.getByLabelText('Nombre en la Tarjeta'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('MM/AA'), { target: { value: '12/25' } });
        fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });
        const submitButton = screen.getByText('Completar Compra');
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText('Procesando...')).toBeInTheDocument();
            expect(screen.getByRole('status')).toBeInTheDocument();
        });
    });
});
