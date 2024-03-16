let windowHeight;
let frameArray;

let frameCount = 239;
let timeScale = 1;
let stop_interval;
let draw_stopped = false;

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
            console.log('Accuracy: ' + (windowHeight / frameArray.at(-1)).toFixed(2));
            console.log('Elapsed Time: ' + (Date.now() - time));

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

    let min, max, input, res;
    let j = -1;

    switch(type) {
        case 'linear':
            input = parseFloat(document.querySelector('#input').value);
            for(let i = 0; i < frameCount; i++) {
                let lastFrame = frameArray[i-1] || 0;
                frameArray.push((windowHeight / frameCount) * linearSV(i, input) + lastFrame);
            }
            break;
        case 'teleport':
            min = parseFloat(document.querySelector('#lower').value);

            if(document.querySelector('#urankable').checked) {
                res = instantTPSV(min);
                let breakpoint = res.frames;
                max = res.max;

                for(let i = 0; i < frameCount; i++) {
                    let lastFrame = frameArray[i-1] || 0;
    
                    if(i <= breakpoint) {
                        frameArray.push((windowHeight / frameCount) * (min * multip) + lastFrame);
                    } else {
                        frameArray.push((windowHeight / frameCount) * (max * multip) + lastFrame);
                    }
                }
            } else {
                max = parseFloat(document.querySelector('#upper').value);
    
                res = teleportSV(min, max);
                let c = 0, c1 = 0, c2 = 0;
    
                for(let i = 0; i < frameCount; i++) {
                    let lastFrame = frameArray[i-1] || 0;
                    if(i < res.frames) {
                        frameArray.push((windowHeight / frameCount) * (min * multip) + lastFrame);
                        c++
                    } else {
                        if(i == frameCount - 1 && res.rest != 0) {
                            frameArray.push((windowHeight / frameCount) * (max * res.rest * multip) + lastFrame);
                            c1++;
                        } else {
                            frameArray.push((windowHeight / frameCount) * (max * multip) + lastFrame);
                            c2++;
                        }
                    }
                }

                console.log(`Frames: ${res.frames}\nMin Frames: ${c}\nMax Frames: ${c2}\nEnd Frames: ${c1}\nTotal Frames: ${c+c1+c2}\n\nSum: ${(c * min) + (c2 * max) + (c1 * max * res.rest)}`);
            }
            break;
        case 'exponential': 
            input = parseFloat(document.querySelector('#input').value);
            res = exponentialSV(input, frameCount);

            let breakpoint = res[1].time;
            let multi = res[0].multi;
            let j = 1;

            for(let i = 0; i < frameCount; i++) {
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
                frameArray.push((windowHeight / frameCount) * multi + lastFrame);
            }
            break;
        case 'stutter':
            max = parseFloat(document.querySelector('#input').value);
            let freq = parseInt(document.querySelector('#frequency').value);

            min = 1.11111111111 - (max / 9);
            let length = Math.round(frameCount / freq); 
            c = 0;

            let c1 = 0, c2 = 0, c3 = 0;

            let lengthArr = [];
            let sum = 0;

            let above_half = false;

            let rest = (length % 1);
            if(rest > .5) {
                rest = 1 - rest;
                above_half = true;
            }
            rest = Math.round(1/rest);
            let currentLength = 0;

            for(let i = 0; i < freq; i++) {
                if(!above_half){
                    if(i % rest == 0) {
                        sum += Math.ceil(length)
                        currentLength = Math.ceil(length);
                    } else {
                        sum += Math.floor(length)
                        currentLength = Math.floor(length);
                    }
                } else {
                    if(i % rest == 0) {
                        sum += Math.floor(length);
                        currentLength = Math.floor(length);
                    } else {
                        sum += Math.ceil(length);
                        currentLength = Math.ceil(length);
                    }
                }

                lengthArr.push({sum: sum, length: currentLength});
            }

            res = teleportSV(min, max, lengthArr[0].length);
            breakpoint = res.frames;

            for(let i = 0; i < frameCount; i++) {
                let lastFrame = frameArray[i-1] || 0;
                let idx = lengthArr.findIndex(x => x.sum == i);

                if(idx != -1) {
                    c++;
                    res = teleportSV(min, max, lengthArr[idx].length);
                    breakpoint = i + res.frames;
                }

                if(i < breakpoint) {
                    frameArray.push((windowHeight / frameCount) * (min * multip) + lastFrame);
                    c1++;
                } else {
                    if(i == lengthArr[c].sum - 1 && res.rest != 0) {
                        frameArray.push((windowHeight / frameCount) * (max * res.rest * multip) + lastFrame);
                        c2++;
                    } else if(i == frameCount - 1 && res.rest != 0) {
                        frameArray.push((windowHeight / frameCount) * (max * res.rest * multip) + lastFrame);
                        c2++;
                    } else {
                        frameArray.push((windowHeight / frameCount) * (max * multip) + lastFrame);
                        c3++;
                    }
                }
            }
            
            console.log(`Min Frames: ${c1}\nMax Frames: ${c3}\nEnd Frames: ${c2}\nTotal Frames: ${c1+c2+c3}\n\nSum: ${(c1 * min) + (c3 * max) + (c2 * max * res.rest)}`);

            break;
        default:
            for(let i = 0; i < frameCount; i++) {
                frameArray.push((i * windowHeight) / frameCount);
            }
            break;
    }
}

function linearSV(frame, end) {
    let start = 2 - end;
    let delta = ((end - start) / frameCount);

    if(frameCount % 2 == 0) {
        if(frame >= (frameCount / 2)) frame++; // Skips a frame since frameCount is even
    }

    let adj = start + (delta * frame);

    return adj * multip;
}

function instantTPSV(min) {
    // frames = 239;
    // min = 0.5, framesLeft = 120
    // max = 120

    let framesLeft = frameCount - 1;
    let max = frameCount - (framesLeft * min);

    return {frames: framesLeft-1, max: max}
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

    return { frames: frames, rest: maxFrames % 1 }
}

function exponentialSV(limit, length = frameCount) {
    let t = new Array(16);
    let d = 0.1;
    let change = 0.1;
    let prevD = [];

    let c = 0;

    while (c < 100) {
        let initial_value = Math.log(limit);
        sum = 0;

        for (let i = 0; i < 16; i++) {
            t[i] = Math.exp(initial_value);
            initial_value = initial_value + d;
            sum = sum + t[i];
        }

        prevD.push(d);

        if ((sum / 16) > (multip + (0.0001 * multip))) d = d - change;
        else if ((sum / 16) < (multip - (0.0001 * multip))) d = d + change;
        else break;

        if(d == prevD.at(-2)) change /= 10;

        c++;
    }

    console.log('EXP retry count: ' + c);
    console.log('d: ' + change);

    for(let i = 0; i < t.length; i++) {
        t[i] = {time: Math.floor(i * (length / 16)), multi: t[i]};
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

let multip = document.querySelector('#songBpm').value / document.querySelector('#currentBpm').value;
multip *= document.querySelector('#currentMulti').value;

document.querySelectorAll('.song-info-inputs').forEach(element => {
    element.addEventListener('change', function () {
        multip = document.querySelector('#songBpm').value / document.querySelector('#currentBpm').value;
        multip *= document.querySelector('#currentMulti').value;

        calculateHeight(document.querySelector('#svType').value);
    })
});

document.querySelector('#svType').addEventListener('change', renderSVManipulation);
renderSVManipulation()

// Delays a async function.
const delay = async (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

draw();