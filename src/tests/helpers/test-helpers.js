// Test helpers for React components
import React from 'react';
// Mock para LocalStorage
export const mockLocalStorage = () => {
    const localStorageMock = {
        getItem: jasmine.createSpy('getItem').and.callFake((key) => {
            return localStorageMock[key] || null;
        }),
        setItem: jasmine.createSpy('setItem').and.callFake((key, value) => {
            localStorageMock[key] = value;
        }),
        removeItem: jasmine.createSpy('removeItem').and.callFake((key) => {
            delete localStorageMock[key];
        }),
        clear: jasmine.createSpy('clear').and.callFake(() => {
            Object.keys(localStorageMock).forEach(key => {
                if (typeof localStorageMock[key] === 'string') {
                    delete localStorageMock[key];
                }
            });
        })
    };
    global.localStorage = localStorageMock;
    return localStorageMock;
};
// Mock para fetch
export const mockFetch = (response) => {
    const mockResponse = {
        json: () => Promise.resolve(response),
        ok: true,
        status: 200
    };
    global.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(mockResponse));
    return global.fetch;
};
// Mock para React Router
export const mockReactRouter = () => {
    const mockNavigate = jasmine.createSpy('navigate');
    const mockUseNavigate = () => mockNavigate;
    const mockUseLocation = () => ({ pathname: '/test' });
    const mockUseParams = () => ({});
    return {
        navigate: mockNavigate,
        useNavigate: mockUseNavigate,
        useLocation: mockUseLocation,
        useParams: mockUseParams
    };
};
// Utilidad para crear un componente de prueba
export const createTestComponent = (Component, props = {}) => {
    return React.createElement(Component, props);
};
// Utilidad para simular eventos
export const simulateEvent = (element, event, value) => {
    const eventMap = {
        change: new Event('change', { bubbles: true }),
        click: new Event('click', { bubbles: true }),
        submit: new Event('submit', { bubbles: true })
    };
    if (value !== undefined) {
        element.value = value;
    }
    element.dispatchEvent(eventMap[event] || new Event(event, { bubbles: true }));
};
// Utilidad para esperar a que se actualice el DOM
export const waitFor = (callback, timeout = 1000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkCondition = () => {
            try {
                const result = callback();
                if (result) {
                    resolve(result);
                }
                else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for condition'));
                }
                else {
                    setTimeout(checkCondition, 50);
                }
            }
            catch (error) {
                if (Date.now() - startTime > timeout) {
                    reject(error);
                }
                else {
                    setTimeout(checkCondition, 50);
                }
            }
        };
        checkCondition();
    });
};
