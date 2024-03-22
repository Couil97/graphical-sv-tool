let path = document.querySelector('#data-header').dataset.path;

document.write(`
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${path}style.css">
        <script src="${path}modules/dom-module.js" defer></script>
        <script src="${path}modules/helper-module.js" defer></script>
        <script src="${path}modules/render-module.js" defer></script>
        <script src="${path}modules/sv-module.js" defer></script>
        <script src="${path}main.js" defer></script>
        <title>Graphical SV Tool</title>
`);