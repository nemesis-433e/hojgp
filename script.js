// Add these variables at the top
let chaptersMap = new Map();
let minChapter = 8;  // Assuming your first chapter is part0008.html
let maxChapter = 1094; // Assuming your last chapter is part1094.html

// Utility to get URL query parameters
function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

// Format chapter number with leading zeros, e.g., 9 → "part0009.html"
function formatChapterFilename(num) {
    const formatted = num.toString().padStart(4, '0');
    return `part${formatted}.html`;
}

// Load chapter content and update URL if specified
function loadChapter(chapterUrl, pushState = true) {
    if (pushState) {
        const newUrl = `${window.location.pathname}?chapter=${chapterUrl}`;
        history.pushState(null, '', newUrl);
    }

    const [file, anchor] = chapterUrl.split('#');

    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(html => {
            document.getElementById('content-container').innerHTML = html;
            updateTranslations();
            updateNavigationButtons(chapterUrl);
            if (anchor) {
                setTimeout(() => {
                    const target = document.getElementById(anchor);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                }, 50);
            }
        })
        .catch(err => {
            console.error("Failed to load chapter:", err);
            document.getElementById('content-container').innerHTML = "<p>Error loading chapter.</p>";
        });
}

// Initialize chapter on page load
window.addEventListener('load', async () => {
    try {
        // load
        const response = await fetch('chapters.json');
        const chapters = await response.json();
        
        // Create a map for quick lookups and find min/max chapters
        chapters.forEach(chapter => {
            const fileName = chapter.link.split('#')[0];
            chaptersMap.set(fileName, chapter.title);
        });
        
        // Get chapter numbers from the map keys
        const chapterNumbers = Array.from(chaptersMap.keys()).map(k => 
            parseInt(k.match(/part(\d+)\.html/)[1], 10)
        );
        minChapter = Math.min(...chapterNumbers);
        maxChapter = Math.max(...chapterNumbers);

        // Continue with initialization
        let chapter = getQueryParam('chapter') || 'part0007.html';
        if (window.location.hash) chapter += window.location.hash;
        loadChapter(chapter, false);
        updateNavigationButtons(chapter);
    } catch (error) {
        console.error('Error loading chapters:', error);
    }
});
window.addEventListener('popstate', () => {
    // Get chapter from query params with correct default
    let chapter = getQueryParam('chapter') || 'part0007.html';
    
    // Append current hash if it exists
    if (window.location.hash) {
        chapter += window.location.hash;
    }
    
    // Load the chapter without creating new history entry
    loadChapter(chapter, false);
});
// Update next/previous buttons based on current chapter
// Modified updateNavigationButtons function
function updateNavigationButtons(currentChapter) {
    const [currentFile] = currentChapter.split('#');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // Hide buttons for index page
    if (currentFile === 'part0007.html') {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    // Get current chapter number
    const currentNum = parseInt(currentFile.match(/part(\d+)\.html/)[1], 10);
    const prevNum = currentNum - 1;
    const nextNum = currentNum + 1;

    // Update previous button
    if (prevNum >= 7) { // 7 is the index
        const prevFile = prevNum === 7 ? 'index.html' : formatChapterFilename(prevNum);
        const prevTitle = prevNum === 7 ? 'Index' : chaptersMap.get(prevFile);
        
        prevBtn.style.display = 'inline-block';
        prevBtn.innerHTML = `←${prevTitle || 'Previous'}`;
        prevBtn.onclick = () => {
            loadChapter(prevFile);
            updateNavigationButtons(prevFile);
        };
    } else {
        prevBtn.style.display = 'none';
    }

    // Update next button
    if (nextNum <= maxChapter) {
        const nextFile = formatChapterFilename(nextNum);
        const nextTitle = chaptersMap.get(nextFile);
        
        nextBtn.style.display = 'inline-block';
        nextBtn.innerHTML = `${nextTitle || 'Next'}→`;
        nextBtn.onclick = () => {
            loadChapter(nextFile);
            updateNavigationButtons(nextFile);
        };
    } else {
        nextBtn.style.display = 'none';
    }
}

// ================ SEARCH =================
fetch('chapters.json')
    .then(response => response.json())
    .then(data => grammarData = data)
    .catch(error => console.error('Error loading grammar data:', error));

// get elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const closeBtn = document.createElement('span');
closeBtn.innerHTML = '×';
closeBtn.className = 'close-search';
searchInput.parentNode.insertBefore(closeBtn, searchInput.nextSibling);

// functionality
function performSearch(query) {
    if (!query) {
        closeSearchResults();
        return;
    }

    const results = grammarData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    displayResults(results);
}

function displayResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
    } else {
        results.forEach(item => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = item.title;
            div.onclick = () => {
                loadChapter(item.link);
                closeSearchResults();
            };
            searchResults.appendChild(div);
        });
    }
    
    searchResults.style.display = 'block';
}

function closeSearchResults() {
    searchResults.style.display = 'none';
    searchInput.value = '';
    closeBtn.style.display = 'none';
}

// event listeners
searchInput.addEventListener('input', (e) => {
    closeBtn.style.display = e.target.value ? 'block' : 'none';
    performSearch(e.target.value);
});
closeBtn.addEventListener('click', closeSearchResults);
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && 
        !searchResults.contains(e.target)) {
        closeSearchResults();
    }
});

// scroll 
searchResults.addEventListener('wheel', (e) => {
    e.stopPropagation();
});


// ================ TRANSLATION =================
function toggleTranslation() {
    var translationElements = document.querySelectorAll('.translation');
    translationElements.forEach(function (element) {
        if (element.style.display === 'none' || element.style.display === '') {
            element.style.display = 'block';

        } else {
            element.style.display = 'none';
        }
    });
    if (localStorage.getItem('translations') === 'on') {
        localStorage.setItem('translations', 'off');
    } else {
        localStorage.setItem('translations', 'on');
    }
}
function updateTranslations() {
    if (!localStorage.getItem('translations')) {
        localStorage.setItem('translations', 'on');
    }
    var translationElements = document.querySelectorAll('.translation');
    var translationState = localStorage.getItem('translations') || 'on';

    translationElements.forEach(el => {
        el.style.display = translationState === 'on' ? 'block' : 'none';
    });
}

// ================ THEME =================
(function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    const storedTheme = localStorage.getItem('theme') || 'dark';
    
    // initial theme and icon
    html.setAttribute('data-theme', storedTheme);
    themeToggle.innerHTML = storedTheme === 'dark' 
        ? '<i class="fa-solid fa-moon nav-btn"></i>' 
        : '<i class="fa-solid fa-sun nav-btn"></i>'; 

    // toggle theme function
    function toggleTheme() {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' 
            ? '<i class="fa-solid fa-moon nav-btn"></i>'
            : '<i class="fa-solid fa-sun nav-btn"></i>';
    }

    // toggle button
    themeToggle.addEventListener('click', toggleTheme);
})();
