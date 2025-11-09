// Lightweight test helpers for Jasmine/Karma without React Testing Library
export const render = (element: any) => {
  // In simple cases, just append to document body
  if (typeof element === 'string') {
    const container = document.createElement('div');
    container.innerHTML = element;
    document.body.appendChild(container);
    return container;
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  return container;
};

export const screen = {
  getByText: (text: string) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if ((node as Text).data.includes(text)) {
        return (node as Text).parentElement;
      }
    }
    throw new Error(`Text not found: ${text}`);
  },
  getByRole: (role: string, opts?: { name?: RegExp }) => {
    const elements = Array.from(document.querySelectorAll('*'));
    const found = elements.find((el) => {
      const matchesRole = role === 'img' ? el.tagName.toLowerCase() === 'img' : true;
      const matchesName = opts?.name ? opts.name.test(el.getAttribute('alt') || el.textContent || '') : true;
      return matchesRole && matchesName;
    });
    if (!found) throw new Error(`Role not found: ${role}`);
    return found as HTMLElement;
  }
};