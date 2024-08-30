const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Define las rutas a los archivos
const jsonFile = 'imgs/estados/jsonFiles/municipios_zacatecas.json'; // Cambia esto al archivo JSON que quieras procesar
const svgFile = 'imgs/estados/porProcesar/32_zacatecas.svg'; // Cambia esto al archivo SVG que quieras procesar
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
    const dom = new JSDOM(data);
    const document = dom.window.document;

    // Selecciona todos los elementos <path> y <g>
    const paths = document.querySelectorAll('path, g');

    // Agrega los atributos a cada elemento al principio
    paths.forEach((path) => {
        const id = path.getAttribute('id');
        const municipio = municipiosMap[id] || '';
        
        // Mensaje de depuración
        console.log(`ID: ${id}, Municipio: ${municipio}`);

        const attributes = {
            'id': id || '',
            'data-bs-toggle': 'tooltip',
            'data-bs-title': municipio
        };

        // Elimina los atributos si existen
        Object.keys(attributes).forEach(attr => path.removeAttribute(attr));

        // Crea un nuevo elemento con los atributos al principio
        const newPath = document.createElement(path.tagName);
        Object.keys(attributes).forEach(attr => newPath.setAttribute(attr, attributes[attr]));

        // Copia todos los atributos restantes
        Array.from(path.attributes).forEach(attr => newPath.setAttribute(attr.name, attr.value));

        // Copia el contenido del elemento original
        newPath.innerHTML = path.innerHTML;

        // Reemplaza el elemento original con el nuevo
        path.replaceWith(newPath);
    });

    // Escribe el SVG modificado en el directorio de procesados
    const processedPath = path.join(processedDirectory, path.basename(svgFile));
    fs.writeFile(processedPath, dom.serialize(), (err) => {
        if (err) {
            console.error('No se pudo escribir en el archivo:', err);
        } else {
            console.log('SVG modificado con éxito:', path.basename(svgFile));
        }
    });
});