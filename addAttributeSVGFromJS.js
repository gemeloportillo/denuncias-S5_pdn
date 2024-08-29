const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Define la ruta al directorio que contiene tus archivos SVG
const svgDirectory = 'imgs/estados/porProcesar';

// Define la ruta al archivo JSON
const jsonFile = 'municipios.json';

// Lee el archivo JSON
const municipios = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

// Lee el directorio
fs.readdir(svgDirectory, function(err, files) {
    if (err) {
        console.error('No se pudo leer el directorio:', err);
        return;
    }

    // Filtra los archivos SVG
    const svgFiles = files.filter(file => path.extname(file).toLowerCase() === '.svg');

    // Procesa cada archivo SVG
    svgFiles.forEach(function(svgFile) {
        // Lee el archivo SVG
        fs.readFile(path.join(svgDirectory, svgFile), 'utf8', function(err, data) {
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
                const id = path.getAttribute('id');
                const municipio = municipios[id] ? municipios[id].municipio : '';
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

            // Escribe el SVG modificado de nuevo al archivo
            fs.writeFile(path.join(svgDirectory, svgFile), dom.serialize(), function(err) {
                if (err) {
                    console.error('No se pudo escribir en el archivo:', err);
                } else {
                    console.log('SVG modificado con éxito:', svgFile);
                }
            });
        });
    });
});