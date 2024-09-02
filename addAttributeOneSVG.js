const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Define la ruta al archivo SVG que deseas procesar
const svgFilePath = 'imgs/estados/porProcesar/26_sonora.svg';

// Define la ruta al directorio donde deseas guardar el archivo procesado
const outputDirectory = 'imgs/estados/svg/';

// Asegúrate de que el directorio de salida exista
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
}

// Lee el archivo SVG
fs.readFile(svgFilePath, 'utf8', function(err, data) {
    if (err) {
        console.error('No se pudo leer el archivo:', err);
        return;
    }

    // Crea un DOM a partir del SVG
    const dom = new JSDOM(data);
    const document = dom.window.document;

    // Selecciona todos los elementos <path> y <g>
    const paths = document.querySelectorAll('path, g');

    // Agrega los atributos a cada elemento al principio
    paths.forEach((path) => {
        const attributes = {
            'id': path.getAttribute('id') || '',
            'data-bs-toggle': 'tooltip',
            'data-bs-title': 'Calkiní'
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

    // Define la ruta completa del archivo de salida
    const outputFilePath = path.join(outputDirectory, path.basename(svgFilePath));

    // Escribe el SVG modificado en el archivo de salida
    fs.writeFile(outputFilePath, dom.serialize(), function(err) {
        if (err) {
            console.error('No se pudo escribir en el archivo:', err);
        } else {
            console.log('SVG modificado con éxito:', outputFilePath);
        }
    });
});