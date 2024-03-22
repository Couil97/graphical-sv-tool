function renderLinear(canvas) {
    let times = getTimeInputs('linear');
    let slider = getInputSlider('SV Limit', 1, 0.01, 2, 1.5, 'input', 'linear');

    canvas.append(times, slider);
}

function renderTeleport(canvas) {
    let times = getTimeInputs('teleport');
    let lower = getInputSlider('Lower Boundry', 0.01, 0.01, 1, 0.5, 'lower', 'teleport');
    let upper = getInputSlider('Upper Boundry', 1, 0.01, 10, 2, 'upper', 'teleport');
    let instant_tp = getCheckbox('Enable Instant Teleport', 'teleport');

    let input_group = document.createElement('div');
    input_group.className = 'input-group';

    input_group.append(lower, upper, instant_tp);

    canvas.append(times, input_group);
}

function renderExponential(canvas) {
    let times = getTimeInputs('exponential');
    let input = getInputSlider('Intensity', 0.01, 0.01, 10, 1.5, 'input', 'exponential');

    let input_group = document.createElement('div');
    input_group.className = 'input-group';

    input_group.append(input);

    canvas.append(times, input_group);
}

function renderSquareRoot(canvas){
    let times = getTimeInputs('square-root');
    let input = getInputSlider('Intensity', 0.01, 0.01, 3, 1.5, 'input', 'square-root');

    let input_group = document.createElement('div');
    input_group.className = 'input-group';

    input_group.append(input);

    canvas.append(times, input_group);
}

function renderPower(canvas){
    let times = getTimeInputs('power');
    
    let min = getInputSlider('Limit', 0.01, 0.01, 1, 0.5, 'lower', 'power');
    let max = getInputSlider('Power', 1, 0.01, 10, 2, 'upper', 'power');

    let input_group = document.createElement('div');
    input_group.className = 'input-group';

    input_group.append(min, max);

    canvas.append(times, input_group);
}

function renderStutter(canvas) {
    let times = getTimeInputs('stutter');
    let lower = getInputSlider('Lower Boundry', 0.01, 0.01, 1, 0.5, 'lower', 'stutter');
    let upper = getInputSlider('Upper Boundry', 1, 0.01, 10, 2, 'upper', 'stutter');
    let frequency = getFrequecySelect();

    let input_group = document.createElement('div');
    input_group.className = 'input-group';

    input_group.append(lower, upper, frequency);

    canvas.append(times, input_group);
}

function getTimeInputs(type) {
    let input_group = document.createElement('div');
    input_group.className = 'input-group';

    let start_div = document.createElement('div');
    start_div.className = "input";

    let start_label = document.createElement('label');
    let start_input = document.createElement('input');

    start_label.textContent = 'Start';
    start_input.id = 'start';
    start_input.onchange = function() { calculateHeight(type) }

    start_div.append(start_label, start_input);

    let end_div = document.createElement('div');
    end_div.className = "input";

    let end_label = document.createElement('label');
    let end_input = document.createElement('input');

    end_label.textContent = 'End';
    end_input.id = 'end';
    end_input.onchange = function() { calculateHeight(type) }

    end_div.append(end_label, end_input);

    input_group.append(start_div, end_div);

    return input_group;
}

function getInputSlider(name, lowerLimit, step, upperLimit, default_value, id, type) {
    let div = document.createElement('div');
    div.className = 'input';

    let slider_label = document.createElement('label');
    slider_label.textContent = name;

    let slider = document.createElement('input');
    slider.id = id;
    slider.type = 'range';
    slider.min = lowerLimit;
    slider.step = step;
    slider.max = upperLimit;
    slider.value = default_value;
    slider.oninput = function() { this.nextElementSibling.textContent = this.value; calculateHeight(type); } 

    let output = document.createElement('div');
    output.className = 'output';
    output.textContent = default_value;
    output.contentEditable = true;
    output.oninput = function() { 
        if(parseFloat(this.textContent) < lowerLimit && parseFloat(this.textContent) != 0) this.textContent = lowerLimit;
        if(parseFloat(this.textContent) > upperLimit) this.textContent = upperLimit;
        this.previousElementSibling.value = this.textContent;
    }

    div.append(slider_label, slider, output);

    return div;
}

function getCheckbox(name, svType, id, type) {
    let div = document.createElement('div');
    div.className = 'input checkbox';

    let checkbox_label = document.createElement('label');
    checkbox_label.textContent = name;
    
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'urankable';
    checkbox.oninput = function () { calculateHeight(svType); }

    if(type == 'urankable') {
        checkbox.onchange = function() { toggle_unrankable(id) }
    }

    div.append(checkbox_label, checkbox);

    return div;
}

function getFrequecySelect() {
    let div = document.createElement('div');
    div.className = 'input frequency';

    let frequency_label = document.createElement('label');
    frequency_label.textContent = 'Frequency';
    
    let frequency = document.createElement('select');
    frequency.id = 'frequency';

    frequency.oninput = function () { 
        calculateHeight('stutter');
    };

    let optionsArray = [2,3,4,6,8,10,12,16,20,24,28,36,44,52,64]; 

    for(let i = 0; i < optionsArray.length; i++) {
        let option = document.createElement('option');
        option.value = optionsArray[i];
        option.textContent = '1/' + optionsArray[i];

        if(i == 7) option.selected = true;

        frequency.append(option);
    }

    div.append(frequency_label, frequency);

    return div;
}

function getFrequecyWrite() {
    let div = document.createElement('div');
    div.className = 'input frequency';

    let frequency_label = document.createElement('label');
    frequency_label.textContent = 'Frequency';

    let span = document.createElement('span');
    
    let frequency = document.createElement('input');
    frequency.type = 'text';
    frequency.value = 2;
    frequency.id = 'frequency'
    frequency.style = 'width: 0.5em; font:inherit; padding-left: 1em;';
    frequency.oninput = function () { 
        if(this.value.length > 1) this.value = this.value.at(-1);
        if(isNaN(this.value) || this.value == 0) this.value = '1';
        calculateHeight('stutter');
    };

    let text = document.createElement('span');
    text.textContent = '1/';
    text.style = 'margin-left:-1.6em; color:black; width: 0; user-select: none; padding-right: 12px;';
    text.onclick = function () { frequency.focus() };

    span.append(frequency, text);

    div.append(frequency_label, span);

    return div;
}

function toggle_unrankable(id) {
    let element = document.querySelector(`#${id}`);

    if(element.max == 10) {
        element.max = 1000;
        element.value = Math.round(element.value);
        element.step = 1;
    }else {
        element.max = 10;
        element.step = 0.01;
    }
}

function toggleInstantTP() {
    let element = document.querySelector('#instantTP');
    if(element.checked) element.checked = false;
    else element.checked = true;
}