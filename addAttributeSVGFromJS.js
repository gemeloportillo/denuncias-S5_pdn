const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Define las rutas a los archivos
const jsonFile = 'imgs/estados/jsonFiles/municipios_cdmx.json'; // Cambia esto al archivo JSON que quieras procesar
const svgFile = 'imgs/estados/svg/09_CDMX.svg'; // Cambia esto al archivo SVG que quieras procesar
const processedDirectory = 'imgs/estados/yaProcesados';

// Lee el archivo JSON
const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

// Convierte el JSON en un objeto con los IDs como claves para acceso rápido
const municipiosMap = {};
jsonData.forEach(item => {
    municipiosMap[item.id] = item.municipio;
});

// Imprime los datos del JSON para verificar
console.log('Datos del JSON:', municipiosMap);

// Lee el archivo SVG
fs.readFile(svgFile, 'utf8', (err, data) => {
    if (err) {
        console.error('No se pudo leer el archivo SVG:', err);
        return;
    }

    // Crea un DOM a partir del SVG
    const dom = new JSDOM(data, { contentType: 'image/svg+xml' });
    const document = dom.window.document;

    // Selecciona todos los elementos <path> y <g>
    const paths = document.querySelectorAll('path, g');

    // Agrega los atributos a cada elemento al principio
    paths.forEach((path) => {
        const id = path.getAttribute('id');
        const municipio = municipiosMap[id] || '';
        
        // Mensaje de depuración
        console.log(`ID: ${id}, Municipio: ${municipio}`);

        // Agrega los atributos directamente al elemento existente
        path.setAttribute('data-bs-toggle', 'tooltip');
        path.setAttribute('data-bs-title', municipio);
    });

    // Escribe el SVG modificado en el directorio de procesados
    const processedPath = path.join(processedDirectory, path.basename(svgFile));
    fs.writeFile(processedPath, document.querySelector('svg').outerHTML, (err) => {
        if (err) {
            console.error('No se pudo escribir en el archivo:', err);
        } else {
            console.log('SVG modificado con éxito:', path.basename(svgFile));
        }
    });
});