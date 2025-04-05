// Word banks for different modes
const wordBanks = {
    words: ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 
            'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya',
            'quince', 'raspberry', 'strawberry', 'tangerine', 'watermelon'],
    
    quotes: [
        "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
        "Compound interest is the eighth wonder of the world.",
        "Risk comes from not knowing what you're doing.",
        "It's not how much money you make, but how much money you keep.",
        "The four most dangerous words in investing are: 'this time it's different.'"
    ],
    
    numbers: [
        "3.14159 26535 89793 23846 26433 83279 50288",
        "1.61803 39887 49894 84820 45868 34365 63811",
        "2.71828 18284 59045 23536 02874 71352 66249",
        "1.41421 35623 73095 04880 16887 24209 69807",
        "0.57721 56649 01532 86060 65120 90082 40243"
    ]
};

let currentMode = 'words';
let words = [];
let currentWordIndex = 0;
let startTime;
let timer;
let errors = 0;
let correctChars = 0;
let totalTyped = 0;
let testActive = false;
let testStarted = false;
let correctWords = 0;
let incorrectWords = 0;
let lastUpdateTime = 0;
let liveStatsInterval;

// DOM elements
const wordContainer = document.getElementById('wordContainer');
const inputField = document.getElementById('inputField');
const resultsDiv = document.getElementById('results');
const timeDisplay = document.getElementById('time');
const modeButtons = document.querySelectorAll('.mode-btn');
const restartBtn = document.getElementById('restartBtn');

// Initialize the test
function initTest() {
    // Select content based on current mode
    if (currentMode === 'quotes' || currentMode === 'numbers') {
        words = shuffle(wordBanks[currentMode]);
        // Split into words while preserving some formatting
        words = words.join(' ').split(/(\s+)/).filter(word => word.trim().length > 0);
    } else {
        words = shuffle(wordBanks.words).slice(0, 50);
    }
    
    currentWordIndex = 0;
    wordContainer.innerHTML = words.map((word, index) => `
        <div class="word" id="word${index}">
            ${[...word].map(letter => `<span class="letter">${letter}</span>`).join('')}
        </div>
    `).join('');
    
    document.getElementById(`word${currentWordIndex}`).classList.add('current');
}

// Start the test
function startTest() {
     // Clear any existing intervals
    if (timer) clearInterval(timer);
    if (liveStatsInterval) clearInterval(liveStatsInterval);
    testActive = true;
    testStarted = false;
    resultsDiv.style.display = 'none';
    timeDisplay.textContent = '30';
    currentWordIndex = 0;
    errors = 0;
    correctChars = 0;
    totalTyped = 0;
    correctWords = 0;
    incorrectWords = 0;
    
    initTest();
    inputField.value = '';
    inputField.focus();
    
    // Reset live stats
    document.getElementById('liveWpm').textContent = '0';
    document.getElementById('liveAccuracy').textContent = '0';
    
    clearInterval(liveStatsInterval);
}

// Update timer and live stats
function updateTimer() {
    if (!testActive) return; // Add this check
    
    const now = Date.now();
    const timeElapsed = Math.floor((now - startTime) / 1000);
    const timeLeft = 30 - timeElapsed;
    timeDisplay.textContent = timeLeft;
    
    // Update live stats every 500ms
    if (now - lastUpdateTime > 500 || timeLeft <= 0) {
        updateLiveStats(timeElapsed);
        lastUpdateTime = now;
    }
    
    if (timeLeft <= 0) {
        endTest();
    }
}

// Update live WPM and accuracy
function updateLiveStats(timeElapsed) {
    if (!testActive || timeElapsed === 0) return; // Add testActive check
    
    const minutes = timeElapsed / 60;
    const wpm = Math.round((correctChars / 5) / minutes) || 0;
    const accuracy = Math.round((correctChars / totalTyped) * 100) || 0;
    
    document.getElementById('liveWpm').textContent = wpm;
    document.getElementById('liveAccuracy').textContent = accuracy;
}

// End the test
function endTest() {
    if (!testActive) return; // Prevent multiple calls
    
    testActive = false;
    clearInterval(timer);
    clearInterval(liveStatsInterval);
    
    // Calculate final stats
    const timeElapsed = 30;
    const minutes = timeElapsed / 60;
    const wpm = Math.round((correctChars / 5) / minutes) || 0;
    const accuracy = Math.round((correctChars / totalTyped) * 100) || 0;
    
    // Update results display
    document.getElementById('wpm').textContent = wpm;
    document.getElementById('accuracy').textContent = accuracy;
    document.getElementById('correct').textContent = correctWords;
    document.getElementById('incorrect').textContent = incorrectWords;
    document.getElementById('charsTyped').textContent = totalTyped;
    
    resultsDiv.style.display = 'block';
    inputField.blur();
    
    // Reset intervals to null to prevent memory leaks
    timer = null;
    liveStatsInterval = null;
}

// Shuffle array
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Handle input
inputField.addEventListener('input', (e) => {
    if (!testActive) {
        e.target.value = ''; // Clear input if test isn't active
        return;
    }
    
    if (!testStarted) {
        testStarted = true;
        startTime = Date.now();
        timer = setInterval(updateTimer, 1000);
        liveStatsInterval = setInterval(() => updateLiveStats(Math.floor((Date.now() - startTime) / 1000)), 500);
    }

    const input = e.target.value;
    const currentWord = words[currentWordIndex];
    const currentWordElement = document.getElementById(`word${currentWordIndex}`);
    const letters = currentWordElement.querySelectorAll('.letter');

    // Remove all active classes
    letters.forEach(letter => {
        letter.classList.remove('active', 'correct', 'incorrect');
    });

    // Handle spacebar submission
    if (input.endsWith(' ')) {
        // Process current word
        const userInput = input.trim();
        let wordCorrect = true;
        
        for (let i = 0; i < currentWord.length; i++) {
            const letter = letters[i];
            if (i < userInput.length) {
                if (userInput[i] === currentWord[i]) {
                    letter.classList.add('correct');
                    correctChars++;
                } else {
                    letter.classList.add('incorrect');
                    errors++;
                    wordCorrect = false;
                }
            } else {
                letter.classList.add('incorrect');
                errors++;
                wordCorrect = false;
            }
            totalTyped++;
        }
        
        // Update word counts
        if (wordCorrect) {
            correctWords++;
        } else {
            incorrectWords++;
        }

        // Move to next word
        if (currentWordIndex < words.length - 1) {
            currentWordElement.classList.remove('current');
            currentWordIndex++;
            document.getElementById(`word${currentWordIndex}`).classList.add('current');
            e.target.value = '';
        } else {
            endTest();
        }
        return;
    }

    // Normal typing without space
    for (let i = 0; i < input.length; i++) {
        const letter = letters[i];
        if (!letter) break; // Handle overflow
        
        if (input[i] === currentWord[i]) {
            letter.classList.add('correct');
            correctChars++;
        } else {
            letter.classList.add('incorrect');
            errors++;
        }
        totalTyped++;
    }

    // Set active cursor
    if (input.length < currentWord.length) {
        letters[input.length].classList.add('active');
    }
});

// Mode selection
modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentMode = button.dataset.mode;
        startTest();
    });
});

// Restart button
restartBtn.addEventListener('click', startTest);

// Focus input field when any key is pressed
document.addEventListener('keydown', (e) => {
    if (resultsDiv.style.display !== 'none') return;
    if (!inputField.matches(':focus')) {
        inputField.focus();
    }
});

// Start the test initially
startTest();