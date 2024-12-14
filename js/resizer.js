class TableResizer {
    /**
     * @constructor
     * @param {string} table_id - ID del elemento tabla
     * @param {number} min_width - Ancho mínimo de columna en píxeles
     */
    constructor(table_id, min_width = 50) {
        this.table = document.getElementById(table_id);
        this.min_width = min_width;
        this.is_resizing = false;
        this.start_x = 0;
        this.start_width = 0;
        this.current_header = null;
    }

    /**
     * Inicializa el redimensionamiento en todas las columnas
     * @method
     * @returns {void}
     */
    initialize() {
        const headers = this.table.querySelectorAll('th');

        headers.forEach(header => {
            this.setup_resize_handle(header);
        });

        this.setup_global_events();
        this.load_saved_sizes();
    }

    /**
     * Configura el manejador de redimensionamiento para una columna
     * @method
     * @param {HTMLElement} header - Elemento de cabecera de columna
     * @private
     */
    setup_resize_handle(header) {
        const resize_handle = document.createElement('div');
        resize_handle.className = 'resize-handle';
        header.appendChild(resize_handle);

        resize_handle.addEventListener('mousedown', (e) => {
            this.start_resize(e, header);
        });
    }

    /**
     * Configura los eventos globales para el redimensionamiento
     * @method
     * @private
     */
    setup_global_events() {
        document.addEventListener('mousemove', (e) => this.handle_resize(e));
        document.addEventListener('mouseup', () => this.stop_resize());
    }



    /**
     * Inicia el proceso de redimensionamiento
     * @method
     * @param {MouseEvent} e - Evento del mouse
     * @param {HTMLElement} header - Elemento de cabecera
     * @private
     */
    start_resize(e, header) {
        this.is_resizing = true;
        this.current_header = header;
        this.start_x = e.pageX;
        this.start_width = header.offsetWidth;

        this.table.classList.add('table-resizing');
        e.target.classList.add('resizing');

        e.preventDefault();
    }




    /**
     * Maneja el proceso de redimensionamiento
     * @method
     * @param {MouseEvent} e - Evento del mouse
     * @private
     */
    handle_resize(e) {
        if (!this.is_resizing) return;

        const width = this.start_width + (e.pageX - this.start_x);

        if (width >= this.min_width) {
            this.current_header.style.width = `${width}px`;
            this.current_header.style.minWidth = `${width}px`;
        }
    }




    /**
     * Finaliza el proceso de redimensionamiento
     * @method
     * @private
     */
    stop_resize() {
        if (!this.is_resizing) return;

        this.is_resizing = false;
        this.table.classList.remove('table-resizing');
        this.table.querySelectorAll('.resize-handle').forEach(handle => {
            handle.classList.remove('resizing');
        });

        this.save_sizes();
    }



    /**
     * Guarda los tamaños de las columnas
     * @method
     * @private
     */
    save_sizes() {
        const headers = this.table.querySelectorAll('th');
        const sizes = Array.from(headers).map(h => h.style.width);
        localStorage.setItem('column_sizes', JSON.stringify(sizes));
    }


    /**
     * Carga y aplica los tamaños guardados
     * @method
     * @private
     */
    load_saved_sizes() {
        const saved_sizes = localStorage.getItem('column_sizes');
        if (saved_sizes) {
            const sizes = JSON.parse(saved_sizes);
            const headers = this.table.querySelectorAll('th');

            headers.forEach((header, index) => {
                if (sizes[index]) {
                    header.style.width = sizes[index];
                    header.style.minWidth = sizes[index];
                }
            });
        }
    }
}

export default TableResizer; 