let multip = document.querySelector('#songBpm').value / document.querySelector('#currentBpm').value;
multip *= document.querySelector('#currentMulti').value;
multip = roundDecimal(multip);

draw();
    
document.querySelector('#svType').addEventListener('change', renderSVManipulation);
renderSVManipulation()

document.querySelectorAll('.song-info-inputs').forEach(element => {
    element.addEventListener('change', function (e) {
        e.preventDefault();

        multip = document.querySelector('#songBpm').value / document.querySelector('#currentBpm').value;
        multip *= document.querySelector('#currentMulti').value;
        multip = roundDecimal(multip);

        calculateHeight(document.querySelector('#svType').value);
    })
});