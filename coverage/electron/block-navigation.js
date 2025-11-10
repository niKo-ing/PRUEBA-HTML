
/*
 * Función que permite navegar entre elementos sin cobertura en un reporte de cobertura de código.
 * Se ejecuta al presionar ciertas teclas y se encarga de resaltar y desplazarse a los elementos
 * que indican líneas, ramas o funciones sin cubrir.
 */
var jumpToCode = (function init() {
    // Clases CSS que identifican elementos sin cobertura en la vista de archivos
    // .cbranch-no: ramas no cubiertas
    // .cstat-no: declaraciones no cubiertas
    // .fstat-no: funciones no cubiertas
    var missingCoverageClasses = ['.cbranch-no', '.cstat-no', '.fstat-no'];

    // Elementos a resaltar en la vista de listado de archivos (porcentaje bajo de cobertura)
    var fileListingElements = ['td.pct.low'];

    /*
     * Construimos un selector que evita seleccionar elementos que son hijos directos
     * de otro elemento que ya coincide con las clases de missingCoverageClasses.
     * Esto previene que se resalten elementos redundantes.
     */
    var notSelector = ':not(' + missingCoverageClasses.join('):not(') + ') > '; // resulta en `:not(a):not(b) > `

    /*
     * Selector final que combina:
     * - Elementos del listado de archivos con baja cobertura
     * - Elementos sin cobertura que no sean hijos directos de otros elementos sin cobertura
     */
    var selector =
        fileListingElements.join(', ') +
        ', ' +
        notSelector +
        missingCoverageClasses.join(', ' + notSelector); // resulta en `:not(a):not(b) > a, :not(a):not(b) > b`

    // NodeList con todos los elementos que coinciden con el selector
    var missingCoverageElements = document.querySelectorAll(selector);

    // Índice del elemento actualmente resaltado
    var currentIndex;

    /*
     * Alterna la clase 'highlighted' entre el elemento actual y el nuevo.
     * @param {number} index - Índice del nuevo elemento a resaltar
     */
    function toggleClass(index) {
        // Quita el resaltado del elemento actual
        missingCoverageElements
            .item(currentIndex)
            .classList.remove('highlighted');
        // Añade el resaltado al nuevo elemento
        missingCoverageElements.item(index).classList.add('highlighted');
    }

    /*
     * Hace que un elemento sea el actualmente resaltado y lo desplaza a la vista.
     * @param {number} index - Índice del elemento a resaltar y mostrar
     */
    function makeCurrent(index) {
        toggleClass(index);
        currentIndex = index;
        // Desplazamiento suave centrando el elemento en la ventana
        missingCoverageElements.item(index).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }

    /*
     * Navega al elemento anterior en la lista circular.
     * Si estamos en el primero, va al último.
     */
    function goToPrevious() {
        var nextIndex = 0;
        if (typeof currentIndex !== 'number' || currentIndex === 0) {
            // Si no hay elemento actual o estamos en el primero, ir al último
            nextIndex = missingCoverageElements.length - 1;
        } else if (missingCoverageElements.length > 1) {
            // En otro caso, retroceder uno
            nextIndex = currentIndex - 1;
        }

        makeCurrent(nextIndex);
    }

    /*
     * Navega al siguiente elemento en la lista.
     * Si estamos en el último, vuelve al primero.
     */
    function goToNext() {
        var nextIndex = 0;

        if (
            typeof currentIndex === 'number' &&
            currentIndex < missingCoverageElements.length - 1
        ) {
            // Si hay un siguiente elemento, avanzar
            nextIndex = currentIndex + 1;
        }
        // Si estamos en el último o no hay currentIndex, nextIndex seguirá siendo 0

        makeCurrent(nextIndex);
    }

    /*
     * Manejador del evento de teclado.
     * Ejecuta la navegación solo si el foco no está en el campo de búsqueda.
     * @param {KeyboardEvent} event - Evento de teclado
     */
    return function jump(event) {
        // Si el foco está en el input de búsqueda, no hacemos nada
        if (
            document.getElementById('fileSearch') === document.activeElement &&
            document.activeElement != null
        ) {
            // Si el foco está en el campo de búsqueda, no navegamos
            return;
        }

        // Mapeo de teclas:
        // n o j -> siguiente
        // b, k o p -> anterior
        switch (event.which) {
            case 78: // n
            case 74: // j
                goToNext();
                break;
            case 66: // b
            case 75: // k
            case 80: // p
                goToPrevious();
                break;
        }
    };
})();

// Registramos el manejador de eventos para que se ejecute al presionar teclas
window.addEventListener('keydown', jumpToCode);
