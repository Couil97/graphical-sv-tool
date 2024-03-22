function toggleDraw() {
    if(draw_stopped) {
        draw();
        draw_stopped = false;
    } else {
        clearInterval(stop_interval);
        draw_stopped = true;
    }
}

function setTimescale(input) {
    timeScale = parseFloat(input);
    toggleDraw();
    toggleDraw();
}

function calculateWindowHeight() {
    let display = document.querySelector('.display');
    let receptor = document.querySelector('.mania-receptor');

    windowHeight = display.scrollHeight - (receptor.offsetHeight / 2) - 20;

    return windowHeight;
}

function applyHeight(res, length = frameCount) {
    let breakpoint = res[1].time;
    let multi = res[0].multi;
    let j = 1;

    for(let i = 0; i < length; i++) {
        if(i > breakpoint) {
            if(j+1 >= res.length) {
                breakpoint = 99999999;
                multi = res[j].multi;
            }
            else {
                j++;
                breakpoint = res[j].time;
                multi = res[j-1].multi;
            }
        }

        let lastFrame = frameArray[i-1] || 0;
        frameArray.push((windowHeight / frameCount) * multi * multip + lastFrame);
    }
}

function renderSVManipulation() {
    let svManipulationCanvas = document.querySelector('.sv-manipulation');
    svManipulationCanvas.innerHTML = '';

    calculateWindowHeight();

    switch(document.querySelector('#svType').value) {
        case 'linear':
            renderLinear(svManipulationCanvas);
            break;
        case 'teleport':
            renderTeleport(svManipulationCanvas);
            break;
        case 'exponential':
            renderExponential(svManipulationCanvas);
            break;
        case 'stutter':
            renderStutter(svManipulationCanvas);
            break;
        case 'square-root':
            renderSquareRoot(svManipulationCanvas);
            break;
        case 'power':
            renderPower(svManipulationCanvas);
            break;
        case 'stop':
            renderStop(svManipulationCanvas);
            break;
    }

    calculateHeight(document.querySelector('#svType').value);
}