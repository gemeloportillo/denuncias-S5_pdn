const jsdom = require('jsdom');
const fs = require('fs');
const path = require('path');
const { JSDOM } = jsdom;

async function extractTableData(url) {
    try {
        // Importar node-fetch dinámicamente
        const fetch = (await import('node-fetch')).default;

        // Obtener el HTML de la página web
        const response = await fetch(url);
        const html = await response.text();

        // Parsear el HTML
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Seleccionar la tabla específica
        const table = document.querySelector('.wikitable');
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');

        // Extraer los datos de los td dentro del tbody
        const data = [];
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 7) { // Asegurarse de que la fila tiene 8 columnas
                const id = cells[0].textContent.trim();
                const municipio = cells[1].textContent.trim();
                data.push({ id, municipio });
            }
        });

        // Crear todas las carpetas necesarias en la ruta
        const carpeta = path.join('imgs', 'estados', 'jsonFiles');
        fs.mkdirSync(carpeta, { recursive: true });

        // Ruta completa del archivo
        const rutaArchivo = path.join(carpeta, 'municipios_oaxaca.json');

        // Guardar los datos en un archivo JSON
        fs.writeFileSync(rutaArchivo, JSON.stringify(data, null, 2));
        console.log(`Datos extraídos y guardados en ${rutaArchivo}`);
    } catch (error) {
        console.error('Error al extraer los datos de la tabla:', error);
    }
}

// URL de la página web que contiene la tabla
const url = 'https://es.wikipedia.org/wiki/Anexo:Municipios_de_Oaxaca';
extractTableData(url);
