const delay = async (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

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