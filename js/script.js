/**
 * CSV File Upload Handler Module
 * @module file_uploader
 * @description Handles file upload functionality including drag and drop interactions
 * @version 1.0.0
 * @author Junior Rumiche
 * @license MIT
 */

export function initializeUploader() {
    const upload_area = document.getElementById('uploadArea');
    const file_input = document.getElementById('fileInput');
    const file_name_display = document.getElementById('fileName');
    const upload_button = document.querySelector('.upload-button');
    const upload_progress = document.getElementById('uploadProgress');

    function show_file_name(file) {
        file_name_display.textContent = `Selected file: ${file.name}`;
        file_name_display.classList.remove('show');
        void file_name_display.offsetWidth;
        file_name_display.classList.add('show');
        simulate_upload();
    }

    function simulate_upload() {
        upload_area.classList.add('uploading');
        upload_progress.classList.add('show');

        setTimeout(() => {
            upload_area.classList.remove('uploading');
            upload_progress.classList.remove('show');
            file_name_display.textContent = 'File uploaded successfully!';
            file_name_display.style.color = '#48bb78';
        }, 3000);
    }

    upload_button.addEventListener('click', () => {
        file_input.click();
    });

    file_input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            show_file_name(file);
        }
    });

    upload_area.addEventListener('dragover', (e) => {
        e.preventDefault();
        upload_area.classList.add('dragover');
    });

    upload_area.addEventListener('dragleave', () => {
        upload_area.classList.remove('dragover');
    });

    upload_area.addEventListener('drop', (e) => {
        e.preventDefault();
        upload_area.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file?.name.endsWith('.csv')) {
            file_input.files = e.dataTransfer.files;
            show_file_name(file);
        }
    });
}

// Inicializamos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeUploader);
