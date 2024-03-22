function parseFile(file) {
    let metadata = getMetadata(file);
    let timingPoints = getTimingPoints(file);
    let hitObjects = getHitObjects(file, metadata);

    drawFile(hitObjects);
}

function getMetadata(file) {
    let metadata = file
    .split('[Events]')[0]
    .trim()
    .split('\n');

    let data = {};

    for(let i = 0; i < metadata.length; i++) {
        if(metadata[i].indexOf(':') != -1) {
            [key, value] = metadata[i].split(':');
            data[key] = value.trim();
        }
    }

    return data;
}

function getHitObjects(file, metadata) {
    let hitObjects = file
        .split('[HitObjects]')[1]
        .trim()
        .split('\n');

    let notes = [];
    let cs = parseInt(metadata['CircleSize']);

    for(let i = 0; i < hitObjects.length; i++) {
        let items = hitObjects[i].split(',');

        notes.push({ time: parseInt(items[2]), pos: getNotePosition(items[0], cs) * (100 / cs) });
    }

    return notes;
}

function getTimingPoints(file) {
    let timingPoints = file
        .split('[TimingPoints]')[1]
        .split('[HitObjects]')[0]
        .trim()
        .split('\n');

    for(let [i, point] of timingPoints.entries()) {
        let items = point.split(',');
        let multi = (items[6] == 1) ? document.querySelector('#songBpm').value / (60000 / items[1]) : (-100 / items[1]);
        timingPoints[i] = { time: items[0], multi: multi }
    }

    return timingPoints;
}

function getNotePosition(x, cs) {
    return (x / (512 / cs)) - 0.5;
}

function drawFile(hitObjects) {
    if(stop_interval) {
        clearInterval(stop_interval);

        let notes = document.querySelectorAll('.mania-note') || [];

        for(let note of notes) {
            note.remove();
        }
    }

    let currentFrameCount = 120;
    let currentFrame = 0;
    let currentNote = {note: 0};
    let windowHeight = calculateWindowHeight();

    let track = document.querySelector('.track');

    stop_interval = setInterval(async () => {
        drawNote(track, currentFrame, currentNote, hitObjects);
        updateNote(windowHeight, currentFrameCount);
        
        currentFrame += 1000 / currentFrameCount;

        if(currentFrame % 100 == 0) console.log('frame: ' + currentFrame);
    }, (1000 / currentFrameCount) / timeScale);
}

function drawNote(track, frame, currentNote, hitObjects) {
    while(currentNote.note < hitObjects.length && hitObjects[currentNote.note].time <= frame) {
        let hitNote = document.createElement('img');
        hitNote.src = '/images/mania-note.png';
        hitNote.className = "mania-note";
        
        hitNote.style = `left: ${hitObjects[currentNote.note].pos}%; top: -40px;`;

        track.append(hitNote);

        currentNote.note++;
    }
}

function updateNote(windowHeight, frameCount) {
    let notes = document.querySelectorAll('.mania-note') || [];

    for(let note of notes) {
        let top = parseInt(note.style.top.slice(0, -2));
        note.style.top = top + (windowHeight / frameCount) + 'px';
        if(top + 1 >= windowHeight) note.remove();
    }
}

let fileInput = document.getElementById('fileInput');
let entries;
let audio;

function onArchiveLoaded(archive) {
	let is_error = false;
    const textDecoder = new TextDecoder('utf-8');

    entries = archive.entries;
    let list = [];
    audio = [];

	archive.entries.forEach(function(entry) {
		if (!entry.is_file) return;
		if (is_error) return false;

        if(entry.name.indexOf('.osu') != -1) list.push(entry);
        if(entry.name.indexOf('.mp3') != -1 || entry.name.indexOf('.ogg') != -1) audio.push(entry);

        /* 
        	entry.readData(function(data, err) {
                if (err) {
                    is_error = true;
                    console.log(err);
                    return;
                }

                data = textDecoder.decode(data);

                console.table(entry);
                console.log(data);
		    });
        */
	});

    let select = document.querySelector('#fileSelect');
    select.innerHTML = '';

    for(let item of list) {
        let div = document.createElement('div');
        let name = item.name.match(/\[.*\]/g);
        div.innerHTML = '<span>' + name + '</span>';
        div.className = "file-option";
        div.onclick = function() { toggleHighlight(this); }

        select.append(div);
    }

    let button = document.createElement('button');
    button.textContent = 'Load File';
    button.onclick = function() { loadFile() };

    select.append(button);

    if(list.length > 0) select.style.display = '';
    else select.style.display = 'none;';
}

function toggleHighlight(element) {
    let select = document.querySelector('#fileSelect');
    let children = select.childNodes;

    for(let child of children) {
        child.classList.remove('highlight');
    }

    element.classList.add('highlight');
}

function loadFile() {
    let files = document.querySelectorAll('.file-option');
    let file;

    for(let item of files) {
        if(item.className.includes('highlight')) file = item.childNodes[0].textContent;
    }

    if(!file) {
        alert('No file selected!');
        return 0;
    }

    for(let entry of entries) {
        if(entry.name.indexOf(file) != -1) {
            const textDecoder = new TextDecoder('utf-8');

            entry.readData(function(data, err) {
                if (err) {
                    is_error = true;
                    console.log(err);
                    return;
                }

                data = textDecoder.decode(data);
                parseFile(data);
		    });
        }
    }
}

loadArchiveFormats(['rar', 'zip', 'tar'], function() {
	fileInput.onchange = function() {
		// Just return if there is no file selected
		if (fileInput.files.length === 0) {
			entryList.innerHTML = 'No file selected';
			return;
		}

		// Get the selected file
		let file = fileInput.files[0];

		// Open the file as an archive
		archiveOpenFile(file, null, function(archive, err) {
			if (archive) {
				onArchiveLoaded(archive);
			}
		});
	};

	fileInput.disabled = false;
});