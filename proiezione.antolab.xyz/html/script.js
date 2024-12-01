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

    content = content.replace(/[\u001f-\u001f\u007f\uFEFF]/g, '');
    content = content.replace(/[“”‘’‹›«»“”]/g, '\\"');
    content = content.replace(/\u2026/g, '...');
    content = content.replace(/\u0300/g, '\'');
    content = content.replace(/\u00d7/g, 'x');
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

// Global variable to track original items
let originalSongItems = [];

function initializeSearch() {
    // Cache original song items on first load
    if (originalSongItems.length === 0) {
        originalSongItems = Array.from(document.querySelectorAll('.songItem')).map(item => ({
            element: item,
            name: item.querySelector('.songName') ? item.querySelector('.songName').textContent : '',
            lyrics: item.querySelector('.songLyrics') ? item.querySelector('.songLyrics').textContent : ''
        }));
    }
}

function calculateSimilarity(searchTerm, text) {
    // Normalize and trim
    searchTerm = searchTerm.toLowerCase().trim();
    text = text.toLowerCase().trim();

    // Early return for empty search
    if (!searchTerm) return 0;
    
    // Exact match
    if (text === searchTerm) return 1;
    if (text.includes(searchTerm)) return 0.9;

    // Levenshtein-inspired distance calculation
    function levenshteinSimilarity(a, b) {
        const maxLength = Math.max(a.length, b.length);
        
        // Create matrix
        const matrix = Array.from({ length: a.length + 1 }, () => 
            new Array(b.length + 1).fill(0)
        );

        // Initialize first row and column
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

        // Calculate Levenshtein distance
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                if (a[i-1] === b[j-1]) {
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i-1][j] + 1,     // Deletion
                        matrix[i][j-1] + 1,     // Insertion
                        matrix[i-1][j-1] + 1    // Substitution
                    );
                }
            }
        }

        // Calculate similarity based on Levenshtein distance
        const distance = matrix[a.length][b.length];
        
        // Convert distance to similarity score
        // Lower distance means higher similarity
        const similarity = 1 - (distance / maxLength);
        
        return Math.max(0, similarity);
    }

    // Split search term and text into words
    const searchWords = searchTerm.split(/\s+/);
    const textWords = text.split(/\s+/);

    // Calculate overall similarity
    const wordSimilarities = searchWords.map(searchWord => {
        // Find the best match among text words
        const bestWordMatch = textWords.reduce((maxSim, textWord) => {
            const wordSimilarity = levenshteinSimilarity(searchWord, textWord);
            return Math.max(maxSim, wordSimilarity);
        }, 0);

        return bestWordMatch;
    });

    // Average word similarities
    const avgSimilarity = wordSimilarities.reduce((a, b) => a + b, 0) / searchWords.length;

    return Math.min(avgSimilarity * 1.1, 1); // Slight boost, capped at 1
}
function searchSongs(searchTerm) {
    // Ensure original items are cached
    initializeSearch();

    // Get DOM elements
    const searchBox = document.getElementById('search-box');
    const loadingBar = document.getElementById('search-loading-bar');
    const songListItems = document.getElementById('songListItems');

    // Validate search term
    if (searchTerm.trim().length < 2) {
        // Reset to show all original items
        songListItems.innerHTML = '';
        originalSongItems.forEach(item => {
            songListItems.appendChild(item.element);
            item.element.style.display = '';
        });
        loadingBar.style.width = '0%';
        return;
    }

    // Start loading animation
    loadingBar.style.transition = 'width 0.3s ease';
    loadingBar.style.width = '30%';

    // Use setTimeout to prevent blocking
    setTimeout(() => {
        const results = [];

        // Search through original items
        originalSongItems.forEach(item => {
            const nameScore = calculateSimilarity(searchTerm, item.name);
            const lyricsScore = calculateSimilarity(searchTerm, item.lyrics);

            // Combine scores with preference to name matches
            const score = Math.max(nameScore * 1.2, lyricsScore);

            if (score > 0.3) { // Adjust threshold as needed
                results.push({ item: item.element, score });
            }
        });

        // Sort results by score in descending order
        results.sort((a, b) => b.score - a.score);

        // Clear previous results
        songListItems.innerHTML = '';

        // Render results
        results.forEach(result => {
            songListItems.appendChild(result.item);
            result.item.style.display = '';
        });

        // Complete loading bar
        loadingBar.style.width = '100%';
        
        // Reset loading bar after a short delay
        setTimeout(() => {
            loadingBar.style.width = '0%';
        }, 300);
    }, 0);
}

// Debounce function to prevent excessive searching
function debounce(func, delay) {
    let timeoutId;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

// Setup search input
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce(function() {
    const query = this.value;
    searchSongs(query);
}, 300)); // 300ms debounce delay

// Initialize search on page load
document.addEventListener('DOMContentLoaded', initializeSearch);

let file;
function update() {
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            let content = e.target.result;
            originalSongItems = [];

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

const fileList = document.getElementById('fileList');
const dir = `songbooks`;
fetch(`${dir}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to list dir ${dir}: ${response.statusText}`);
        }
        response.forEach(block => {
            const file = block.name;
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
                fetch(`${dir}/${file}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to load ${file}: ${response.statusText}`);
                        }
                        return response.text();
                    })
                    .then(content => {
                        search_box.style.display = 'block';
                        originalSongItems = [];

                        processContent(content);
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        alert(`Could not load file: ${error.message}`);
                    });
            };

            fileList.appendChild(listItem);
        });
    });