import TableResizer from './resizer.js';

window.addEventListener('DOMContentLoaded', () => {
    const csv_preview = document.getElementById('csvPreview');
    const csv_table = document.getElementById('csvTable');
    const close_preview_btn = document.getElementById('closePreview');
    const file_input = document.getElementById('fileInput');

    let current_page = 1;
    const rows_per_page = 20;
    let table_data = [];

    let sort_column = null;
    let sort_direction = 'asc';

    /**
     * Processes a CSV file and initiates the display process
     * @function process_csv_file
     * @param {File} file - The CSV file object to be processed
     * @returns {void}
     */
    function process_csv_file(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            const data = parse_csv_content(text);
            display_table(data);
        };
        reader.readAsText(file);
    }




    /**
     * Parses CSV content with support for quoted fields and special characters
     * @function parse_csv_content
     * @param {string} text - Raw CSV content to be parsed
     * @returns {Array<Array<string>>} 2D array containing parsed CSV data
     */
    function parse_csv_content(text) {
        const lines = text.split('\n');
        return lines.map(line => {
            const row = [];
            let inside_quotes = false;
            let current_value = '';

            for (let char of line) {
                if (char === '"') {
                    inside_quotes = !inside_quotes;
                } else if (char === ',' && !inside_quotes) {
                    row.push(current_value.trim());
                    current_value = '';
                } else {
                    current_value += char;
                }
            }
            row.push(current_value.trim());
            return row;
        }).filter(row => row.length > 1 || row[0] !== '');
    }




    /**
     * Displays the parsed CSV data in a formatted table with pagination
     * @function display_table
     * @param {Array<Array<string>>} data - Parsed CSV data to display
     * @returns {void}
     */
    function display_table(data) {
        if (data.length === 0) return;

        const upload_area = document.getElementById('uploadArea');
        upload_area.classList.add('hidden');

        setTimeout(() => {
            table_data = data;
            render_table(1);
            render_pagination();
            csv_preview.classList.add('show');
        }, 300);
    }

    /**
     * Ordena los datos de la tabla
     * @function sort_data
     * @param {number} column_index - Índice de la columna a ordenar
     * @returns {void}
     */
    function sort_data(column_index) {
        const headers = table_data[0];
        const rows = table_data.slice(1);

        if (sort_column === column_index) {
            sort_direction = sort_direction === 'asc' ? 'desc' : 'asc';
        } else {
            sort_column = column_index;
            sort_direction = 'asc';
        }

        // Ordenar los datos
        rows.sort((a, b) => {
            let valueA = a[column_index]?.trim() || '';
            let valueB = b[column_index]?.trim() || '';

            if (!isNaN(valueA) && !isNaN(valueB)) {
                valueA = parseFloat(valueA);
                valueB = parseFloat(valueB);
            }

            if (valueA === valueB) return 0;

            if (sort_direction === 'asc') {
                return valueA < valueB ? -1 : 1;
            } else {
                return valueA > valueB ? -1 : 1;
            }
        });

        table_data = [headers, ...rows];
        render_table(current_page);
        render_pagination();
    }

    /**
     * Renderiza la tabla con soporte para ordenamiento
     * @function render_table
     * @param {number} page - Número de página a mostrar
     * @returns {void}
     */
    function render_table(page) {
        current_page = page;
        const headers = table_data[0];
        const rows = table_data.slice(1);

        const start = (page - 1) * rows_per_page;
        const end = start + rows_per_page;
        const page_rows = rows.slice(start, end);

        // Creamos el contenedor de scroll si no existe
        const table_container = csv_table.closest('.table-container');
        if (!table_container.querySelector('.table-scroll')) {
            const scroll_div = document.createElement('div');
            scroll_div.className = 'table-scroll';
            table_container.appendChild(scroll_div);
            scroll_div.appendChild(csv_table);
        }

        // Renderizamos la tabla
        let table_html = '<thead><tr>';
        headers.forEach((header, index) => {
            const sort_class = sort_column === index ?
                ` class="sort-${sort_direction}"` : '';
            table_html += `<th${sort_class} data-index="${index}">${header || '<span class="null-value">NULL</span>'}</th>`;
        });
        table_html += '</tr></thead><tbody>';

        table_html += page_rows.map(row => {
            let row_html = '<tr>';
            row.forEach(cell => {
                const cell_content = cell.trim() === '' ?
                    '<span class="null-value">NULL</span>' :
                    cell;
                row_html += `<td>${cell_content}</td>`;
            });
            row_html += '</tr>';
            return row_html;
        }).join('');

        table_html += '</tbody>';
        csv_table.innerHTML = table_html;

        // Inicializamos el redimensionamiento
        const resizer = new TableResizer('csvTable');
        resizer.initialize();

        // Agregamos los event listeners para ordenamiento
        csv_table.querySelectorAll('th').forEach((th, index) => {
            th.addEventListener('click', () => sort_data(index));
        });
    }

    /**
     * Renders the pagination controls
     * @function render_pagination
     * @returns {void}
     */
    function render_pagination() {
        // Primero removemos la paginación existente si hay alguna
        const existing_pagination = document.querySelector('.pagination');
        if (existing_pagination) {
            existing_pagination.remove();
        }

        const total_rows = table_data.length - 1;
        const total_pages = Math.ceil(total_rows / rows_per_page);

        const pagination_html = `
            <div class="pagination">
                <button class="pagination-btn" id="prevPageBtn">
                    <i class="fas fa-angle-left"></i>
                </button>
                <span class="pagination-info">
                    Página ${current_page} de ${total_pages}
                </span>
                <button class="pagination-btn" id="nextPageBtn">
                    <i class="fas fa-angle-right"></i>
                </button>
            </div>
        `;

        const pagination_container = document.createElement('div');
        pagination_container.innerHTML = pagination_html;
        csv_table.parentNode.appendChild(pagination_container);

        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');

        prevBtn.addEventListener('click', () => {
            if (current_page > 1) {
                render_table(current_page - 1);
                render_pagination();
            }
        });

        nextBtn.addEventListener('click', () => {
            const total_pages = Math.ceil((table_data.length - 1) / rows_per_page);
            if (current_page < total_pages) {
                render_table(current_page + 1);
                render_pagination();
            }
        });

        prevBtn.disabled = current_page === 1;
        nextBtn.disabled = current_page === total_pages;
    }

    file_input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file?.name.endsWith('.csv')) {
            process_csv_file(file);
        }
    });



    const upload_area = document.getElementById('uploadArea');
    upload_area.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file?.name.endsWith('.csv')) {
            process_csv_file(file);
        }
    });




    close_preview_btn.addEventListener('click', () => {
        csv_preview.classList.remove('show');
        setTimeout(() => {
            document.getElementById('uploadArea').classList.remove('hidden');
        }, 300);
    });
}); 