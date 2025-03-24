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
        // Load chapters.json
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
        const prevFile = prevNum === 7 ? 'part0007.html' : formatChapterFilename(prevNum);
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

// =======================================================
// SEARCH
// Optionally, load the full search JSON only when needed.
document.getElementById('search-input').addEventListener('input', function (event) {
    const query = event.target.value.trim().toLowerCase();
    if (query.length < 2) {
        // Optionally hide search results if query is too short.
        return;
    }
    // Load full search index JSON (assume "fullIndex.json")
    fetch('fullIndex.json')
        .then(response => response.json())
        .then(data => {
            // Filter search index (simple case-insensitive search on title)
            const results = data.filter(item => item.title.toLowerCase().includes(query));
            // Display results (for now, just log to console; you might create a dropdown list)
            console.log("Search results:", results);
            // You can add code here to render search results as clickable links.
        })
        .catch(err => console.error("Error loading search index:", err));
});



// ==== TRANSLATION ==== //
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


// ==== THEME ==== //
(function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Get stored theme or default to 'dark'
    const storedTheme = localStorage.getItem('theme') || 'dark';
    
    // Set initial theme and icon
    html.setAttribute('data-theme', storedTheme);
    themeToggle.innerHTML = storedTheme === 'dark' 
        ? '<i class="fa-solid fa-sun nav-btn"></i>'  // Display sun icon to indicate switching to light
        : '<i class="fa-solid fa-moon nav-btn"></i>'; // Display moon icon to indicate switching to dark

    // Toggle theme function
    function toggleTheme() {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' 
            ? '<i class="fa-solid fa-sun nav-btn"></i>'  // When switching back to dark, show sun icon
            : '<i class="fa-solid fa-moon nav-btn"></i>'; // When switching to light, show moon icon
    }

    // Event listener for the theme toggle button
    themeToggle.addEventListener('click', toggleTheme);
})();
