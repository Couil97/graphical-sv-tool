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
            console.log('Undershoot: ' + (((windowHeight / frameArray.at(-1)) - 1) * 100).toFixed(0) + '%' + ', Time: ' + ((Date.now() - time) / 1000).toFixed(2) + 's');
            time = Date.now();
            frame = 0;
        }
    }, (1000 / frameCount) / timeScale);
}

function toggleDraw() {
    if(draw_stopped) {
        draw();
        draw_stopped = false;
    } else {
        clearInterval(stop_interval);
        draw_stopped = true;
    }
}

function drawNotes(frame) {
    let maniaNotes = document.querySelectorAll('.mania-note');

    for(let note of maniaNotes){
        note.style.top = `calc(${frameArray[frame]}px)`;
    }
}

function calculateHeight(type) {
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

function reverseSV(array, start, end) {
    let copy = JSON.parse(JSON.stringify(array));
    let j = array.length - 1;
    let rest = end;

    for(let i = 0; i < copy.length; i++) {
        copy[i].time = ((i+1 < copy.length) ? rest -= (array[i+1].time - array[i].time) : start)
        j--;
    }

    copy.sort((a,b) => a.time - b.time);

    return copy;
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

function convertToTimingPoints(res, start = 0, end = 240) {
    if(isNaN(start)) start = 0;
    if(isNaN(end)) end = 240;

    let timingPoints = '';

    for(let item of res) {
        let multi = roundDecimal(item.multi * multip, 2);

        if(multi > 10) {
            timingPoints += (start + parseInt(item.time)) + ',' + (60000 / parseFloat(document.querySelector('#songBpm').value)) / multi + ',1,1,0,100,1,0\n'
        }
        else {
            timingPoints += (start + parseInt(item.time)) + ',' + (-100 / multi) + ',1,1,0,100,0,0\n'
        }
    }

    if(res.at(-1).multi * multip > 10) {
        timingPoints += end + ',' + (60000 / parseFloat(document.querySelector('#songBpm').value)) + ',1,1,0,100,1,0\n'
        timingPoints += end + ',' + -100 + ',1,1,0,100,0,0\n'
    } else {
        timingPoints += end + ',' + -100 + ',1,1,0,100,0,0\n'
    }

    copy(timingPoints);
    document.querySelector('.sv-output').innerHTML = timingPoints.replace(/\n/g,'<br>');
}

function linearSV(input, length = frameCount) {
    let t = new Array(MAX_TIMING_POINTS);

    let start = 2 - input;
    let delta = ((input - start) / (MAX_TIMING_POINTS - 1));

    for(let i = 0; i < MAX_TIMING_POINTS; i++) {
        let multi = start + (delta * i);
        t[i] = { time: Math.floor(i * (length / MAX_TIMING_POINTS)), multi: (multi >= 2) ? 1.99 : (multi <= 0) ? 0.01 : multi }
    }

    return t;
}

function instantTPSV(min, length = frameCount) {
    let framesLeft = length - 1;
    let max = length - (framesLeft * min);
    
    return [{time: 0, multi: min}, {time: length - 2, multi: max}];
}

function teleportSV(min, max, length = frameCount) {
    let framesLeft = length;
    let minFrames = 0, maxFrames = 0, prevMaxFrames;
    let c = 0;
    
    do {
        minFrames = (framesLeft - maxFrames) * min;
        maxFrames = Math.ceil((length - minFrames) / max);

        if(maxFrames == prevMaxFrames) break;
        prevMaxFrames = maxFrames;

        c++
    } while(c < 10)

    minFrames = (framesLeft - maxFrames) * min;
    maxFrames = (length - minFrames) / max;

    let frames = length - Math.ceil(maxFrames);
    let rest = maxFrames % 1;

    let t = [{time: 0, multi: min}, {time: frames, multi: max}];
    if(rest > 0) {
        t.push({time: length - 1, multi: max * rest});
        if(t[2].time == t[1].time) t.splice(1,1);
    }

    return t;
}

function exponentialSV(limit, length = frameCount) {
    let t = new Array(MAX_TIMING_POINTS);
    let d = 0.1;
    let change = 0.1;
    let prevD = [];

    let c = 0;

    while (c < 100) {
        let initial_value = Math.log(limit);
        sum = 0;

        for (let i = 0; i < 16; i++) {
            t[i] = Math.exp(initial_value)
            t[i] = (t[i] < 0.01) ? 0.01 : t[i]; 
            initial_value = initial_value + d;
            sum = sum + t[i];
        }

        prevD.push(d);

        if ((sum / MAX_TIMING_POINTS) > (multip + (0.0001 * multip))) d = d - change;
        else if ((sum / MAX_TIMING_POINTS) < (multip - (0.0001 * multip))) d = d + change;
        else break;

        if(d == prevD.at(-2)) change /= 10;

        c++;
    }

    for(let i = 0; i < MAX_TIMING_POINTS; i++) {
        t[i] = {time: Math.floor(i * (length / MAX_TIMING_POINTS)), multi: t[i]};
    }

    return t;
}

function squareRootSV(limit, length = frameCount) {
    let t = new Array(MAX_TIMING_POINTS);
    let d = 0.1;
    let change = 0.1;
    let prevD = [];

    let c = 0;

    while (c < 100) {
        let initial_value = limit * limit;
        sum = 0;

        for (let i = 0; i < 16; i++) {
            t[i] = Math.sqrt(initial_value);
            if(isNaN(t[i]) || t[i] < 0.01) t[i] = 0.01;
            initial_value = initial_value + d;
            sum = sum + t[i];
        }

        prevD.push(d);

        if ((sum / MAX_TIMING_POINTS) > (multip + (0.0001 * multip))) d = d - change;
        else if ((sum / MAX_TIMING_POINTS) < (multip - (0.0001 * multip))) d = d + change;
        else break;

        if(d == prevD.at(-2)) change /= 10;

        c++;
    }

    for(let i = 0; i < MAX_TIMING_POINTS; i++) {
        t[i] = {time: Math.floor(i * (length / MAX_TIMING_POINTS)), multi: t[i]};
    }

    console.log(t);

    return t;
}

function stutterSV(min, max, freq, length = frameCount) {
    let res = teleportSV(min, max, Math.round(length / freq));
    let add = 0;

    let t = [];

    for(let i = 0; i < freq; i++) {
        if(t.length > 0) add = t.at(-1).time + 1;

        t.push({ time: Math.round(res[0].time + add), multi: res[0].multi });
        t.push({ time: Math.round(res[1].time + add), multi: res[1].multi });
        if(res.length > 2) t.push({ time: Math.round(res[2].time + add), multi: res[2].multi })
    }

    return t;
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
        case 'stop':
            renderStop(svManipulationCanvas);
            break;
    }

    calculateHeight(document.querySelector('#svType').value);
}

function calculateWindowHeight() {
    let display = document.querySelector('.display');
    let receptor = document.querySelector('.mania-receptor');

    windowHeight = display.scrollHeight - (receptor.offsetHeight / 2) - 20;
}

function setTimescale(input) {
    timeScale = parseFloat(input);
    toggleDraw();
    toggleDraw();
}

function copy(text) {
    var input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}

function interpString(text) {
    text = text.replace(/\D/g, '');
    for (let i = 0; i < text.length; i++)
        if (text[0] == '0') text = text.substring(1);

    return text;
}

function roundDecimal(num, decimals = 1) {
    return Math.round(num * 10**decimals) / 10**decimals;
}

let multip = document.querySelector('#songBpm').value / document.querySelector('#currentBpm').value;
multip *= document.querySelector('#currentMulti').value;
multip = roundDecimal(multip);

document.querySelectorAll('.song-info-inputs').forEach(element => {
    element.addEventListener('change', function () {
        multip = document.querySelector('#songBpm').value / document.querySelector('#currentBpm').value;
        multip *= document.querySelector('#currentMulti').value;
        multip = roundDecimal(multip);

        calculateHeight(document.querySelector('#svType').value);
    })
});

document.querySelector('#svType').addEventListener('change', renderSVManipulation);
renderSVManipulation()

// Delays a async function.
const delay = async (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

draw();