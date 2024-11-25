function processJsonContent(content) {
    content = content.replace(/({|,|\n)([a-zA-Z]+)(:|,)/g, '$1"$2"$3');

    const pattern = /"Text":"(.*?)"}/gs;

    function replaceNewlinesAndEscapeQuotes(match, p1) {
        let content = p1;

        content = content.replace(/(?<!\\)"/g, '\\"');

        content = content.replace(/\n/g, '\\n');

        return `"Text":"${content}"}`;
    }

    content = content.replace(pattern, replaceNewlinesAndEscapeQuotes);

    content = content.replace(/\t/g, '');

    return content;
}

function displaySongs(title, songs) {
    const songListTitle = document.getElementById('songListTitle');
    songListTitle.textContent = title;
    const songListItems = document.getElementById('songListItems');
    songListItems.innerHTML = ''; 
    
    songs.forEach(song => {
        const listItem = document.createElement('li');
        listItem.classList.add('songItem');

        const songName = document.createElement('div');
        songName.classList.add('songName');
        songName.textContent = `${song.ID}. ${song.Text}`;  
        
        const songLyrics = document.createElement('div');
        songLyrics.classList.add('songLyrics');
        
        var lyrics = "";
        song.Verses.forEach(verse => {
            lyrics += verse.Text.replace(/\n/g, '<br>') + "<br><br>";
        });
        songLyrics.innerHTML = lyrics;

        listItem.appendChild(songName);
        listItem.appendChild(songLyrics);

        songListItems.appendChild(listItem);
    });
}

var file;
function update() {
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            let content = e.target.result;

            content = processJsonContent(content);

            try {
                const parsed_content = JSON.parse(content);
                const title = parsed_content["Text"];
                const songs = parsed_content["Songs"];

                if (Array.isArray(songs)) {
                    displaySongs(title, songs);
                } else {
                    alert('Invalid song data format.');
                }
            } catch (error) {
                alert('Error parsing JSON: ' + error.message);
            }
        };

        reader.readAsText(file);
    } else {
        alert('Please select a valid file.');
    }
}

document.getElementById('fileInput').addEventListener('change', function(event) {
    file = event.target.files[0];
    update();
});

// Handling drag and drop events
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', function(event) {
    event.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', function() {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', function(event) {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        file = files[0];
        update();
    }
});

// Trigger file picker when drop zone is clicked
dropZone.addEventListener('click', function() {
    document.getElementById('fileInput').click();
});
