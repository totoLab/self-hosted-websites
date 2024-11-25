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

function processContent(content) {
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
}

var file;
function update() {
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            let content = e.target.result;

            orocessContent(content);
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
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    file = e.dataTransfer.files[0];
    update();
});



const files = ["Altri.json", "Grande è il Signore.json", "Inni di Lode.json", "Canta con noi.json", "rcyouth.json"];
const fileList = document.getElementById('fileList');

files.forEach(file => {
    const listItem = document.createElement('li');
    listItem.textContent = file;
    
    listItem.onclick = () => {
        fetch(`${file}`) 
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${file}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(content => {
                processContent(content);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert(`Could not load file: ${error.message}`);
            });
    };

    fileList.appendChild(listItem);
});
