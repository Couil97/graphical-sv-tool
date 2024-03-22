let windowHeight;
let frameArray;

let frameCount = 239;
let timeScale = 1;
let stop_interval;
let draw_stopped = false;

const MAX_TIMING_POINTS = 16;

function draw() {
    frame = 0;
    
    let display = document.querySelector('.display');

    let pastHeight = display.scrollHeight;

    let time = Date.now();
    stop_interval = setInterval(async () => {
        
        if(display.scrollHeight != pastHeight) {
            calculateWindowHeight();
            calculateHeight(document.querySelector('#svType').value);
        }

        pastHeight = display.scrollHeight;
        drawNotes(frame);

        frame++;
        if(frame >= frameCount) {
            document.querySelector('#num').textContent = 'Undershoot: ' + ((((windowHeight * multip) / frameArray.at(-1)) - 1) * 100).toFixed(2) + '%' + ', Time: ' + ((Date.now() - time) / 1000).toFixed(2) + 's';
            time = Date.now();
            frame = 0;
        }
    }, (1000 / frameCount) / timeScale);
}

function drawNotes(frame) {
    let maniaNotes = document.querySelectorAll('.mania-note');

    for(let note of maniaNotes){
        note.style.top = `calc(${frameArray[frame]}px)`;
    }
}

function calculateHeight(type = document.querySelector('#svType').value) {
    frameArray = [];

    let min, max, input;

    let start = parseInt(interpString(document.querySelector('#start').value)) || 0;
    let end = parseInt(interpString(document.querySelector('#end').value)) || frameCount;
    switch(type) {
        case 'linear':
            input = parseFloat(document.querySelector('#input').value);

            prepareChanges(linearSV(input),linearSV(input, end - start), start, end)
            break;
        case 'teleport':
            min = parseFloat(document.querySelector('#lower').value);
            max = parseFloat(document.querySelector('#upper').value);

            if(document.querySelector('#urankable').checked) prepareChanges(instantTPSV(min), instantTPSV(min, end - start), start, end)
            else prepareChanges(teleportSV(min, max), teleportSV(min, max, end - start), start, end)
            break;
        case 'exponential': 
            input = parseFloat(document.querySelector('#input').value);

            prepareChanges(exponentialSV(input), exponentialSV(input, end - start), start, end)
            break;
        case 'stutter':
            min = parseFloat(document.querySelector('#lower').value);
            max = parseFloat(document.querySelector('#upper').value);

            let freq = parseInt(document.querySelector('#frequency').value);

            prepareChanges(stutterSV(min, max, freq), stutterSV(min, max, freq, end - start), start, end)
            break;
        case 'square-root':
            input = parseFloat(document.querySelector('#input').value);

            prepareChanges(squareRootSV(input), squareRootSV(input, end - start), start, end)
            break;
        case 'power':
            min = parseFloat(document.querySelector('#lower').value);
            max = parseFloat(document.querySelector('#upper').value);

            prepareChanges(powerSV(min, max), powerSV(min, max, end - start), start, end)
            break;
        default:
            for(let i = 0; i < frameCount; i++) {
                frameArray.push((i * windowHeight) / frameCount);
            }
            break;
    }
}

function prepareChanges(render, timingpoints, start, end) {
    if(document.querySelector('#reverseSV').checked) {
        render = reverseSV(render, 0, frameCount);
        timingpoints = reverseSV(timingpoints, start, end);
    }

    applyHeight(render);
    convertToTimingPoints(timingpoints, start, end);
}