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

    content = content.replace(/[\x00-\x1F\x7F\xFEFF]/g, '');
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
            verseText = verse.Text;
            if (verseText) {
                lyrics += verseText.replace(/\n/g, '<br>') + "<br><br>";
            }
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
        var title = parsed_content["Text"];
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

function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j],     // Deletion
                    dp[i][j - 1],     // Insertion
                    dp[i - 1][j - 1]  // Substitution
                ) + 1;
            }
        }
    }

    return dp[len1][len2];
}

function searchSongs(searchTerm) {
    const listItems = Array.from(document.querySelectorAll('.songItem'));
    const results = [];

    listItems.forEach(item => {
        const songNameElement = item.querySelector('.songName');
        const songLyricsElement = item.querySelector('.songLyrics');

        const songName = songNameElement ? songNameElement.textContent : '';
        const songLyrics = songLyricsElement ? songLyricsElement.textContent : '';

        const distanceToName = levenshteinDistance(searchTerm, songName);
        const distanceToLyrics = levenshteinDistance(searchTerm, songLyrics);

        const score = Math.min(distanceToName, distanceToLyrics);

        if (songName || songLyrics) {
            results.push({ item, score });
        }
    });

    results.sort((a, b) => a.score - b.score);

    const songListItems = document.getElementById('songListItems');
    songListItems.innerHTML = ''; 

    results.forEach(result => {
        if (result.score < Infinity) {
            songListItems.appendChild(result.item);
            result.item.style.display = '';
        }
    });
}

const search = document.getElementById('search');
search.addEventListener('input', () => {
    const query = document.getElementById('search').value;
    searchSongs(query);
});

let file;

function update() {
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            let content = e.target.result;

            search_box.style.display = 'block';
            processContent(content);
        };

        reader.readAsText(file);
    } else {
        alert('Please select a valid file.');
    }
}

document.getElementById('fileInput').addEventListener('change', function (event) {
    file = event.target.files[0];
    update();
});

const search_box = document.getElementById('search-box');

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

dropZone.addEventListener('click', () => {
    fileInput.click();
})

const files = ["Altri.json", "Grande è il Signore.json", "Inni di Lode.json", "Canta con noi.json", "rcyouth.json"];
const fileList = document.getElementById('fileList');

files.forEach(file => {
    const listItem = document.createElement('li');    
    const fileName = document.createElement('span');
    fileName.textContent = file;
    const image = document.createElement('img');
    image.src = "icon.png";
    image.alt = "File Icon";
    image.width = 40;
    image.height = 40;
    listItem.appendChild(image);
    listItem.appendChild(fileName);

    listItem.onclick = () => {
        fetch(`${file}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${file}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(content => {
                search_box.style.display = 'block';

                processContent(content);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert(`Could not load file: ${error.message}`);
            });
    };

    fileList.appendChild(listItem);
});
