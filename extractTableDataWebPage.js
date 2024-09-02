const jsdom = require('jsdom');
const fs = require('fs');
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
            if (cells.length === 8) { // Asegurarse de que la fila tiene 8 columnas
                const inegiKey = cells[0].textContent.trim();
                const municipio = cells[2].textContent.trim();
                data.push({ inegiKey, municipio });
            }
        });

        // Guardar los datos en un archivo JSON
        fs.writeFileSync('municipios_michoacan.json', JSON.stringify(data, null, 2));
        console.log('Datos extraídos y guardados en municipios_campeche.json');
    } catch (error) {
        console.error('Error al extraer los datos de la tabla:', error);
    }
}

// URL de la página web que contiene la tabla
const url = 'https://es.wikipedia.org/wiki/Anexo:Municipios_de_Michoac%C3%A1n';
extractTableData(url);