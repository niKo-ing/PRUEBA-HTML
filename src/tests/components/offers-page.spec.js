import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { render, screen, waitFor, fireEvent } from '../helpers/test-helpers';
import OffersPage from '../../../components/pages/Offers/OffersPage';
// Mock the fetch API
const mockOffers = [
    {
        id: 1,
        name: 'Smartphone Samsung Galaxy S21',
        price: 499990,
        originalPrice: 699990,
        discount: 29,
        image: '/images/samsung-s21.jpg',
        category: 'Electronics',
        description: 'Latest Samsung smartphone with 5G'
    },
    {
        id: 2,
        name: 'Laptop HP Pavilion',
        price: 599990,
        originalPrice: 799990,
        discount: 25,
        image: '/images/hp-pavilion.jpg',
        category: 'Computers',
        description: 'High-performance laptop for work and gaming'
    }
];
describe('OffersPage', () => {
    beforeEach(() => {
        // Reset fetch mock
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => mockOffers
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should display loading state initially', () => {
        render(_jsx(OffersPage, {}));
        expect(screen.getByText('Cargando ofertas...')).toBeInTheDocument();
    });
    it('should display offers after loading', async () => {
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            expect(screen.getByText('Ofertas Especiales')).toBeInTheDocument();
            expect(screen.getByText('Smartphone Samsung Galaxy S21')).toBeInTheDocument();
            expect(screen.getByText('Laptop HP Pavilion')).toBeInTheDocument();
        });
    });
    it('should display discount percentage badges', async () => {
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            expect(screen.getByText('29% OFF')).toBeInTheDocument();
            expect(screen.getByText('25% OFF')).toBeInTheDocument();
        });
    });
    it('should display original and discounted prices', async () => {
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            expect(screen.getByText('$699.990')).toBeInTheDocument(); // Original price
            expect(screen.getByText('$499.990')).toBeInTheDocument(); // Discounted price
            expect(screen.getByText('$799.990')).toBeInTheDocument(); // Original price
            expect(screen.getByText('$599.990')).toBeInTheDocument(); // Discounted price
        });
    });
    it('should display product descriptions', async () => {
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            expect(screen.getByText('Latest Samsung smartphone with 5G')).toBeInTheDocument();
            expect(screen.getByText('High-performance laptop for work and gaming')).toBeInTheDocument();
        });
    });
    it('should display category information', async () => {
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            expect(screen.getByText('Electronics')).toBeInTheDocument();
            expect(screen.getByText('Computers')).toBeInTheDocument();
        });
    });
    it('should handle API errors gracefully', async () => {
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            expect(screen.getByText('Error al cargar las ofertas')).toBeInTheDocument();
            expect(screen.getByText('Por favor, intenta más tarde')).toBeInTheDocument();
        });
    });
    it('should handle empty offers list', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            expect(screen.getByText('No hay ofertas disponibles en este momento')).toBeInTheDocument();
        });
    });
    it('should have correct styling for offer cards', async () => {
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            const offerCards = screen.getAllByRole('article');
            expect(offerCards.length).toBe(2);
            offerCards.forEach(card => {
                expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden');
            });
        });
    });
    it('should display page header with correct styling', async () => {
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            const header = screen.getByRole('heading', { name: 'Ofertas Especiales' });
            expect(header).toHaveClass('text-3xl', 'font-bold', 'text-gray-900');
        });
    });
    it('should display limited time offer banner', async () => {
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            expect(screen.getByText('¡Ofertas por tiempo limitado!')).toBeInTheDocument();
        });
    });
    it('should make API call to correct endpoint', async () => {
        render(_jsx(OffersPage, {}));
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/offers');
        });
    });
});
