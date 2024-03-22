function reverseSV(array, start, end) {
    let copy = JSON.parse(JSON.stringify(array));
    let j = array.length - 1;
    let rest = end;

    for(let i = 0; i < copy.length; i++) {
        copy[i].time = ((i+1 < copy.length) ? rest -= (array[i+1].time - array[i].time) : start)
        copy[i].time -= start;
        j--;
    }

    copy.sort((a,b) => a.time - b.time);

    return copy;
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

        for (let i = 0; i < MAX_TIMING_POINTS; i++) {
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

        for (let i = 0; i < MAX_TIMING_POINTS; i++) {
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

function powerSV(limit, power = 2, length = frameCount) {
    let t = new Array(MAX_TIMING_POINTS);

    let d = 0.1;
    let change = 0.1;
    let prevD = [];

    let c = 0;

    while(c < 100) {
        let initial_value = Math.pow(limit, 1 / power);
        sum = 0;

        for(let i = 0; i < MAX_TIMING_POINTS; i++) {
            t[i] = Math.pow(initial_value, power);

            t[i] = (isNaN(t[i]) || t[i] < 0.01) ? 0.01 : t[i];
            t[i] = (t[i] > 10) ? 10 : t[i];

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