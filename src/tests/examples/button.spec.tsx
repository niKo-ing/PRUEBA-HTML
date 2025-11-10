// Ejemplo didáctico: prueba de componente Button con Jasmine + Karma (JSDOM)
import React from 'react';
import { createRoot } from 'react-dom/client';
import Button from '../../components/atoms/Button/Button';

describe('Ejemplo Button (React)', () => {
  it('renderiza el texto y ejecuta el manejador de clic', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const onClick = jasmine.createSpy('onClick');
    const label = 'Comprar';

    root.render(<Button label={label} onClick={onClick} />);

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe(label);

    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClick).toHaveBeenCalled();
  });
});