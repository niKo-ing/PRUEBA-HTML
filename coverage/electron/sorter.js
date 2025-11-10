/* eslint-disable */
// Función autoinvocada que añade la capacidad de ordenar y filtrar a la tabla de cobertura
var addSorting = (function() {
    'use strict';
    // Variable que almacena la definición de las columnas
    var cols,
        // Estado actual de ordenación: índice de columna y si es descendente
        currentSort = {
            index: 0,
            desc: false
        };

    // Devuelve el elemento tabla con clase coverage-summary
    function getTable() {
        return document.querySelector('.coverage-summary');
    }
    // Devuelve la fila del thead de la tabla resumen
    function getTableHeader() {
        return getTable().querySelector('thead tr');
    }
    // Devuelve el tbody de la tabla resumen
    function getTableBody() {
        return getTable().querySelector('tbody');
    }
    // Devuelve el th de la columna n-ésima
    function getNthColumn(n) {
        return getTableHeader().querySelectorAll('th')[n];
    }

    // Manejador del input de búsqueda: filtra filas según texto o regex
    function onFilterInput() {
        const searchValue = document.getElementById('fileSearch').value;
        const rows = document.getElementsByTagName('tbody')[0].children;

        // Intenta crear una RegExp a partir del valor. Si falla, se usa búsqueda de texto plano
        let searchRegex;
        try {
            searchRegex = new RegExp(searchValue, 'i'); // 'i' para insensible a mayúsculas
        } catch (error) {
            searchRegex = null;
        }

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            let isMatch = false;

            if (searchRegex) {
                // Si la regex es válida, úsala para comparar
                isMatch = searchRegex.test(row.textContent);
            } else {
                // Si no, búsqueda normal en minúsculas
                isMatch = row.textContent
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());
            }

            row.style.display = isMatch ? '' : 'none';
        }
    }

    // Inserta la caja de búsqueda en el DOM
    function addSearchBox() {
        var template = document.getElementById('filterTemplate');
        var templateClone = template.content.cloneNode(true);
        templateClone.getElementById('fileSearch').oninput = onFilterInput;
        template.parentElement.appendChild(templateClone);
    }

    // Carga la configuración de cada columna (clave, ordenable, tipo)
    function loadColumns() {
        var colNodes = getTableHeader().querySelectorAll('th'),
            colNode,
            cols = [],
            col,
            i;

        for (i = 0; i < colNodes.length; i += 1) {
            colNode = colNodes[i];
            col = {
                key: colNode.getAttribute('data-col'),
                sortable: !colNode.getAttribute('data-nosort'),
                type: colNode.getAttribute('data-type') || 'string'
            };
            cols.push(col);
            if (col.sortable) {
                // Por defecto, las columnas numéricas se ordenan descendentemente
                col.defaultDescSort = col.type === 'number';
                // Añade el icono de ordenación
                colNode.innerHTML =
                    colNode.innerHTML + '<span class="sorter"></span>';
            }
        }
        return cols;
    }
    // Extrae los datos de una fila y los guarda en un objeto con claves según columna
    function loadRowData(tableRow) {
        var tableCols = tableRow.querySelectorAll('td'),
            colNode,
            col,
            data = {},
            i,
            val;
        for (i = 0; i < tableCols.length; i += 1) {
            colNode = tableCols[i];
            col = cols[i];
            val = colNode.getAttribute('data-value');
            if (col.type === 'number') {
                val = Number(val);
            }
            data[col.key] = val;
        }
        return data;
    }
    // Carga los datos de todas las filas
    function loadData() {
        var rows = getTableBody().querySelectorAll('tr'),
            i;

        for (i = 0; i < rows.length; i += 1) {
            rows[i].data = loadRowData(rows[i]);
        }
    }
    // Ordena la tabla según la columna index y el sentido desc
    function sortByIndex(index, desc) {
        var key = cols[index].key,
            sorter = function(a, b) {
                a = a.data[key];
                b = b.data[key];
                return a < b ? -1 : a > b ? 1 : 0;
            },
            finalSorter = sorter,
            tableBody = document.querySelector('.coverage-summary tbody'),
            rowNodes = tableBody.querySelectorAll('tr'),
            rows = [],
            i;

        if (desc) {
            finalSorter = function(a, b) {
                return -1 * sorter(a, b);
            };
        }

        // Desconecta las filas del DOM
        for (i = 0; i < rowNodes.length; i += 1) {
            rows.push(rowNodes[i]);
            tableBody.removeChild(rowNodes[i]);
        }

        // Ordena el array
        rows.sort(finalSorter);

        // Vuelve a insertar las filas en el nuevo orden
        for (i = 0; i < rows.length; i += 1) {
            tableBody.appendChild(rows[i]);
        }
    }
    // Quita las clases de ordenación de la columna actual
    function removeSortIndicators() {
        var col = getNthColumn(currentSort.index),
            cls = col.className;

        cls = cls.replace(/ sorted$/, '').replace(/ sorted-desc$/, '');
        col.className = cls;
    }
    // Añade las clases de ordenación a la columna actual
    function addSortIndicators() {
        getNthColumn(currentSort.index).className += currentSort.desc
            ? ' sorted-desc'
            : ' sorted';
    }
    // Activa los eventos click en los encabezados para ordenar
    function enableUI() {
        var i,
            el,
            ithSorter = function ithSorter(i) {
                var col = cols[i];

                return function() {
                    var desc = col.defaultDescSort;

                    if (currentSort.index === i) {
                        desc = !currentSort.desc;
                    }
                    sortByIndex(i, desc);
                    removeSortIndicators();
                    currentSort.index = i;
                    currentSort.desc = desc;
                    addSortIndicators();
                };
            };
        for (i = 0; i < cols.length; i += 1) {
            if (cols[i].sortable) {
                // Añade el listener al th completo, no solo a la flecha
                el = getNthColumn(i).querySelector('.sorter').parentElement;
                if (el.addEventListener) {
                    el.addEventListener('click', ithSorter(i));
                } else {
                    el.attachEvent('onclick', ithSorter(i));
                }
            }
        }
    }
    // Función pública que inicializa toda la funcionalidad
    return function() {
        if (!getTable()) {
            return;
        }
        cols = loadColumns();
        loadData();
        addSearchBox();
        addSortIndicators();
        enableUI();
    };
})();

// Cuando el DOM esté listo, activa la ordenación
window.addEventListener('load', addSorting);
