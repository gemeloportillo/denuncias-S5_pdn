const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Define la ruta al archivo SVG que deseas procesar
const svgFilePath = 'imgs/estados/porProcesar/07_chiapas.svg';

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
    const dom = new JSDOM(data, { contentType: 'image/svg+xml' });
    const document = dom.window.document;

    // Selecciona todos los elementos <path> y <g>
    const paths = document.querySelectorAll('path, g');

    // Agrega los atributos a cada elemento al principio
    paths.forEach((path) => {
        const id = path.getAttribute('id') || '';
        const municipio = 'Calkiní'; // Puedes cambiar esto según sea necesario

        // Mensaje de depuración
        console.log(`ID: ${id}, Municipio: ${municipio}`);

        // Elimina los atributos si existen
        path.removeAttribute('data-bs-toggle');
        path.removeAttribute('data-bs-title');

        // Crea un nuevo elemento con los atributos en el orden correcto
        const newPath = document.createElementNS(path.namespaceURI, path.tagName);
        newPath.setAttribute('id', id);
        newPath.setAttribute('data-bs-toggle', 'tooltip');
        newPath.setAttribute('data-bs-title', municipio);

        // Copia todos los atributos restantes, excepto xmlns
        Array.from(path.attributes).forEach(attr => {
            if (attr.name !== 'xmlns') {
                newPath.setAttribute(attr.name, attr.value);
            }
        });

        // Copia el contenido del elemento original
        newPath.innerHTML = path.innerHTML;

        // Reemplaza el elemento original con el nuevo
        path.replaceWith(newPath);
    });

    // Define la ruta completa del archivo de salida
    const outputFilePath = path.join(outputDirectory, path.basename(svgFilePath));

    // Escribe el SVG modificado en el archivo de salida
    fs.writeFile(outputFilePath, document.querySelector('svg').outerHTML, function(err) {
        if (err) {
            console.error('No se pudo escribir en el archivo:', err);
        } else {
            console.log('SVG modificado con éxito:', outputFilePath);
        }
    });
});
