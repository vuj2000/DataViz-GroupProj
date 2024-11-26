function selectMode(button) {
    if (button.dataset.mode === 'timed') {
        showTimedModeSettingsPreview();
    } else if (button.dataset.mode === 'threeLives') {
        showThreeLivesModeSettingsPreview();
    } else if (button.dataset.mode === 'infinite') {
        showInfinitePlayModeSettingsPreview();
    }
    // Reset styles for all buttons in the same mode
    const allModeContainers = document.querySelectorAll('.quiz-modes');
    allModeContainers.forEach(modeContainer => {
        const buttons = modeContainer.querySelectorAll('.mode-button');
        buttons.forEach(btn => {
            btn.classList.remove('selected-mode');
            btn.style.backgroundColor = ''; // Reset button style
            btn.style.borderColor = ''; 
            btn.style.color = '';
            btn.style.boxShadow = ''; 
        });
    });
    
    // Apply selected styles to the clicked button
    button.classList.add('selected-mode');
    button.style.backgroundColor = '#4CAF50'; // Green background for selected
    button.style.borderColor = '#2e7d32'; // Darker green border
    button.style.color = 'white'; // White text
    button.style.boxShadow = '0px 0px 15px rgba(76, 175, 80, 0.6)'; // Glow effect
}

// Function to show timed mode settings preview
function showTimedModeSettingsPreview() {
    const previewBox = document.getElementById('settings-preview-box');
    setFixedSettingsPreviewStyles(previewBox);
    previewBox.innerHTML = `
        <p>1-Min Timer Mode</p>
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
            <div id="timer-display" style="flex: 1; text-align: center;">60</div>
            <button style="flex: 1;" onclick="startOrResetTimer()">Start/Reset</button>
        </div>
    `;
}

let timer;
let timerRunning = false;
let score = 0;
let quizStarted = false;
let lives = 3;

function startOrResetTimer() {
    if (timerRunning) {
        clearInterval(timer);
        timerRunning = false;
        document.getElementById('timer-display').innerText = `60`;
        resetQuizDisplay();
    } else {
        if (!quizStarted) {
            startQuiz();
        }
        startTimer();
    }
}

function startTimer() {
    let timeLeft = 60;
    document.getElementById('timer-display').innerText = `${timeLeft}`;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = `${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerRunning = false;
            endQuiz();
        }
    }, 1000);
    timerRunning = true;
}

function startQuiz() {
    if (document.querySelector('.mode-button.selected-mode[data-mode="timed"]')) {
        startTimedQuiz();
    } else if (document.querySelector('.mode-button.selected-mode[data-mode="threeLives"]')) {
        startThreeLivesQuiz();
    }

    // Show quiz elements when starting the quiz
    document.getElementById('movie-info').style.display = 'flex';
    document.getElementById('movie-info').style.justifyContent = 'center';
    document.getElementById('movie-info').style.alignItems = 'center';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('choices').style.display = 'block';
    document.getElementById('feedback-genre').style.display = 'block';
    document.getElementById('feedback-year').style.display = 'block';
    document.getElementById('stage-instruction').style.display = 'block';
}

function startThreeLivesQuiz() {
    score = 0;
    currentStage = 1;
    quizStarted = true;
    lives = 3; // Reset lives for new game
    updateLivesDisplay();
    document.getElementById('movie-info').style.display = 'flex';
    document.getElementById('movie-info').style.justifyContent = 'center';
    document.getElementById('movie-info').style.alignItems = 'center';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('choices').style.display = 'block';
    document.getElementById('feedback-genre').style.display = 'block';
    document.getElementById('feedback-year').style.display = 'block';
    document.getElementById('stage-instruction').style.display = 'block';
    updateMovieInfo();
}

function endQuiz() {
    alert(`Time is up! Your score: ${score}`);
    saveLastRoundResult(score);
    resetQuizDisplay();
}

function resetQuizDisplay() {
    currentStage = 1;
    correctGenreGuessed = false;
    correctYearGuessed = false;
    quizStarted = false;
    document.getElementById('stage-instruction').innerText = 'Stage 1: Guess the genre';
    document.getElementById('choices').innerHTML = '';
    document.getElementById('feedback-genre').innerText = '';
    document.getElementById('feedback-year').innerText = '';
    if (document.getElementById('timer-display')) {
        document.getElementById('timer-display').innerText = '60';
    }
    document.getElementById('movie-info').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('choices').style.display = 'none';
    document.getElementById('feedback-genre').style.display = 'none';
    document.getElementById('feedback-year').style.display = 'none';
    document.getElementById('stage-instruction').style.display = 'none';
    lives = 3;
    updateLivesDisplay();
}

// Function to save the result of the last played round
function saveLastRoundResult(score) {
    localStorage.setItem('lastRoundResult', `Score: ${score}`);
}

// Function to show the last round result in the statistics tab
function showLastRoundResult() {
    const lastRoundResult = localStorage.getItem('lastRoundResult');
    if (lastRoundResult) {
        document.getElementById('last-round-result').innerText = lastRoundResult;
    }
}

// Function to show 3 lives mode settings preview
function showThreeLivesModeSettingsPreview() {
    const previewBox = document.getElementById('settings-preview-box');
    setFixedSettingsPreviewStyles(previewBox);
    previewBox.innerHTML = `
        <p>Three Lives Mode</p>
        <div style="display: flex; width: 100%;">
            <div id="lives-display" style="flex: 1; text-align: center; font-size: 2rem;">❤️❤️❤️</div>
            <button style="flex: 1; width: 50%;" onclick="resetThreeLivesMode()">Start/Reset</button>
        </div>
    `;
}

function resetThreeLivesMode() {
    if (quizStarted) {
        resetQuizDisplay();
    } else {
        startThreeLivesQuiz();
    }
}

function updateLivesDisplay() {
    const livesDisplay = document.getElementById('lives-display');
    if (livesDisplay) {
        let hearts = '❤️'.repeat(lives);
        let brokenHearts = '💔'.repeat(3 - lives);
        livesDisplay.innerText = hearts + brokenHearts;
    }
}

// Function to show infinite play mode settings preview
function showInfinitePlayModeSettingsPreview() {
    const previewBox = document.getElementById('settings-preview-box');
    setFixedSettingsPreviewStyles(previewBox);
    previewBox.innerHTML = `
        <p>Infinite Play Mode</p>
        <div style="display: flex; width: 100%;">
            <select style="flex: 1; width: 50%;" id="rounds-dropdown">
                <option value="1">1 Round</option>
                <option value="3">3 Rounds</option>
                <option value="5">5 Rounds</option>
                <option value="10">10 Rounds</option>
                <option value="25">25 Rounds</option>
                <option value="50">50 Rounds</option>
                <option value="100">100 Rounds</option>
                <option value="infinite">Infinite</option>
            </select>
            <button style="flex: 1; width: 50%;" onclick="resetInfinitePlayMode()">Restart</button>
        </div>
    `;
}

// Function to set fixed settings preview styles
function setFixedSettingsPreviewStyles(previewBox) {
    previewBox.style.width = "450px";
    previewBox.style.height = "100px"; // Fixed height to ensure consistency
    previewBox.style.padding = "20px";
    previewBox.style.marginBottom = "20px";
    previewBox.style.border = "2px solid #333";
    previewBox.style.borderRadius = "10px";
    previewBox.style.backgroundColor = "#ffffff";
    previewBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    previewBox.style.overflow = "hidden";
}

function resetInfinitePlayMode() {
    alert('Infinite Play Mode restarted!');
}

// Function to show different screens based on tab selection
function showScreen(screenName) {
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.nav-tabs a');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    // Add active class to the selected tab button
    const selectedTabButton = document.querySelector(`.nav-tabs a[data-screen='${screenName}']`);
    if (selectedTabButton) {
        selectedTabButton.classList.add('active');
    }
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });

    // Display the chosen screen
    if (screenName === 'play') {
        document.getElementById('screen-play').style.display = 'flex';
        // Hide quiz elements initially for Three Lives Mode
        if (document.querySelector('.mode-button.selected-mode[data-mode="threeLives"]')) {
            resetQuizDisplay();
        }
    } else if (screenName === 'settings') {
        document.getElementById('screen-settings').style.display = 'flex';
        updateSettingsOptions();
    } else if (screenName === 'statistics') {
        document.getElementById('screen-statistics').style.display = 'flex';
        showLastRoundResult();
    }
    // Add active class to the selected tab button
    const selectedButton = document.querySelector(`.nav-tabs a[data-screen='${screenName}']`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
        selectedButton.classList.add('active');
    }
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });

    // Display the chosen screen
    if (screenName === 'play') {
        document.getElementById('screen-play').style.display = 'flex';
    } else if (screenName === 'settings') {
        document.getElementById('screen-settings').style.display = 'flex';
        updateSettingsOptions();
    } else if (screenName === 'statistics') {
        document.getElementById('screen-statistics').style.display = 'flex';
        showLastRoundResult();
    }
    settingsContainer.innerHTML = `
        <h3>Mode 1: Gameplay Variations</h3>
        <div class="quiz-modes">
            <button class="mode-button" onclick="selectMode(this); startTimedMode()">
                <div class="mode-symbol">⏱️</div>
                <div class="mode-title">1-Min Timer Mode</div>
                <div class="mode-subtitle">Race Against Time</div>
            </button>
            <button class="mode-button" onclick="selectMode(this); startThreeLivesMode()">
                <div class="mode-symbol">💔</div>
                <div class="mode-title">Three Lives Mode</div>
                <div class="mode-subtitle">Triple Take</div>
            </button>
            <button class="mode-button" onclick="selectMode(this); startNoLimitMode()">
                <div class="mode-symbol">♾️</div>
                <div class="mode-title">Infinite Play Mode</div>
                <div class="mode-subtitle">Endless Reel</div>
            </button>
        </div>

        <h3>Mode 2: Display Themes</h3>
        <div class="quiz-modes">
            <button class="mode-button" onclick="selectMode(this); selectTheme('dark')">
                <div class="mode-symbol">🌒</div>
                <div class="mode-title">Dark Mode</div>
                <div class="mode-subtitle">Night Screening</div>
            </button>
            <button class="mode-button" onclick="selectMode(this); selectTheme('light')">
                <div class="mode-symbol">☀</div>
                <div class="mode-title">Light Mode</div>
                <div class="mode-subtitle">Day Matinee</div>
            </button>
        </div>

        <h3>Mode 3: Difficulty Levels</h3>
        <div class="quiz-modes">
            <button class="mode-button" onclick="selectMode(this); selectDifficulty('easy')">
                <div class="mode-symbol">🟢</div>
                <div class="mode-title">Easy Mode</div>
                <div class="mode-subtitle">Casual Viewing</div>
            </button>
            <button class="mode-button" onclick="selectMode(this); selectDifficulty('hard')">
                <div class="mode-symbol">🔴</div>
                <div class="mode-title">Hard Mode</div>
                <div class="mode-subtitle">Director’s Cut</div>
            </button>
        </div>
    `;


// Function to select display theme
function selectTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

// Function to select difficulty level
function selectDifficulty(level) {
    if (level === 'easy') {
        console.log('Easy mode selected');
    } else if (level === 'hard') {
        console.log('Hard mode selected');
    }
}

// Quiz Logic Part 1------------------------------------------------------
const API_KEY = '3be2bc8a9d8fab379812442e317a4a99'; 
let currentStage = 1;
let currentMovie = null;
let genreList = [];
let correctGenreGuessed = false;
let correctYearGuessed = false;
let originalImageUrl = ''; 

// Fetch genre list from TMDB
async function fetchGenres() {
    const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(genreUrl);
    const data = await response.json();
    genreList = data.genres;
}

// Fetch the top 2000 movies sorted by rating and filtered by popularity
async function getTop2000RatedPopularMovies() {
    let topRatedPopularMovies = [];
    let page = 1;
    const maxPages = 100; // 2000 movies / 20 per page = 100 pages

    while (page <= maxPages) {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=500&with_watch_monetization_types=flatrate&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
            topRatedPopularMovies = [...topRatedPopularMovies, ...data.results]; 
        }

        page++;
    }

    return topRatedPopularMovies;
}


// Function to get a random movie from the top 2000 rated and popular movies
async function getRandomTopRatedPopularMovie() {
    const topRatedPopularMovies = await getTop2000RatedPopularMovies();
    return topRatedPopularMovies[Math.floor(Math.random() * topRatedPopularMovies.length)];
}

// Function for the movie info and the blurred overlay
async function updateMovieInfo() {
    if (genreList.length === 0) {
        await fetchGenres();
    }

    const movie = await getRandomTopRatedPopularMovie();
    if (!movie) {
        alert("Failed to load movie data. Please try again.");
        return;
    }
    currentMovie = movie;

    const movieImagesUrl = `https://api.themoviedb.org/3/movie/${movie.id}/images?api_key=${API_KEY}`;
    const imagesResponse = await fetch(movieImagesUrl);
    const imagesData = await imagesResponse.json();

// Try to find a suitable backdrop image
    let movieStill = imagesData.backdrops.find(
        image => image.aspect_ratio > 1.7 && image.vote_count > 5
    );

    if (movieStill) {
        // Store the original backdrop URL
        originalImageUrl = `https://image.tmdb.org/t/p/original${movieStill.file_path}`;

        // Show the image
        const backdropHTML = `<img src="https://image.tmdb.org/t/p/w780${movieStill.file_path}" alt="${movie.title} Still" id="movie-backdrop" />`;
        document.getElementById('movie-info').innerHTML = backdropHTML;

        // Set initial blur effect on the overlay
        const overlay = document.getElementById('overlay');
        overlay.style.filter = 'blur(15px)'; 
        updateChoicesForGenre();
    } else {
        updateMovieInfo();
    }
}

// Updating Choices for Each Stage
function updateChoicesForGenre() {
    if (currentStage === 1) {
        const shuffledGenres = genreList.sort(() => 0.5 - Math.random()).slice(0, 4);
        const genreChoices = shuffledGenres.map(
            genre => `<button onclick="checkAnswer(this, '${genre.name}')">${genre.name}</button>`
        ).join('');
        document.getElementById('choices').innerHTML = genreChoices;
    }
}

function updateChoicesForYear() {
    const correctYear = currentMovie.release_date.split('-')[0];
    const yearAfter2000s = Math.floor(Math.random() * 20) + 2000;

    const possibleYears = [correctYear, yearAfter2000s, '1990', '2005', '2010', '2020'].sort(() => 0.5 - Math.random());

    const years = [correctYear, ...possibleYears.filter(year => year !== correctYear).slice(0, 3)];

    const yearChoices = years.map(
        year => `<button onclick="checkAnswer(this, '${year}')">${year}</button>`
    ).join('');
    
    document.getElementById('choices').innerHTML = yearChoices;
}

async function updateChoicesForTitle() {
    const topMovies = await getTop2000RatedPopularMovies();

    const otherMovies = topMovies.filter(movie => movie.id !== currentMovie.id);
    const randomOtherMovies = otherMovies.sort(() => 0.5 - Math.random()).slice(0, 3);

    const titleChoices = [currentMovie.title, ...randomOtherMovies.map(movie => movie.title)];
    const shuffledTitleChoices = titleChoices.sort(() => 0.5 - Math.random());

    const titleButtons = shuffledTitleChoices.map(
        title => `<button onclick="checkAnswer(this, '${title}')">${title}</button>`
    ).join('');

    document.getElementById('choices').innerHTML = titleButtons;
}

// Proceeding to the next stage
async function proceedToNextStage() {
    currentStage++;
    if (currentStage === 2) {
        document.getElementById('stage-instruction').innerText = 'Stage 2: Guess the year!';
        updateChoicesForYear();
    } else if (currentStage === 3) {
        document.getElementById('stage-instruction').innerText = 'Final Stage: Guess the movie!';
        updateChoicesForTitle(); 
    } 
}

// Resetting the Quiz
function resetQuiz() {
    currentStage = 1;
    correctGenreGuessed = false;
    correctYearGuessed = false;

    // Reset instructions
    document.getElementById('stage-instruction').innerText = 'Stage 1: Guess the genre';

    // Clear choices
    document.getElementById('choices').innerHTML = '';

    // Reset feedback to tips
    document.getElementById('feedback-genre').innerText = 'Tip 1: Guess the genre of the movie!';
    document.getElementById('feedback-year').innerText = 'Tip 2: Guess the year the movie was released!';

    // Update movie info and choices for the first stage
    updateMovieInfo();
    updateChoicesForGenre();
}

// Track win/loss and remove blur on correct answer
function checkAnswer(button, selectedAnswer) {
    let isCorrect = false;
    let feedbackText = "";

    if (currentStage === 1) {
        // Stage 1: Genre 
        isCorrect = genreList.some(genre => genre.name === selectedAnswer && currentMovie.genre_ids.includes(genre.id));
        correctGenreGuessed = isCorrect;
        feedbackText = isCorrect ? `Tip 1: The genre is ${selectedAnswer}` : `Tip 1: The genre is NOT ${selectedAnswer}`;

        // Update the genre feedback
        const feedbackGenreDiv = document.getElementById('feedback-genre');
        feedbackGenreDiv.innerHTML = feedbackText;

    } else if (currentStage === 2) {
        // Stage 2: Year
        const selectedYear = selectedAnswer;
        const correctYear = currentMovie.release_date.split('-')[0];
        isCorrect = selectedYear === correctYear;
        correctYearGuessed = isCorrect;
        feedbackText = isCorrect ? `Tip 2: It was released in ${selectedYear}` : `Tip 2: It was NOT released in ${selectedYear}`;

        // Update the year feedback
        const feedbackYearDiv = document.getElementById('feedback-year');
        feedbackYearDiv.innerHTML = feedbackText;
    } else if (currentStage === 3) {
        // Final Stage: Title
        isCorrect = selectedAnswer === currentMovie.title;
        const message = isCorrect ? `Congratulations! The movie was "${currentMovie.title}"!` : `Oops! The movie was "${currentMovie.title}".`;

        // Display final result
        document.getElementById('stage-instruction').innerText = message;

        // Add "Retry?" button
        document.getElementById('choices').innerHTML = `
            <button onclick="resetQuiz()">Retry?</button>
        `;
    }

    // Change button colors
    button.style.backgroundColor = isCorrect ? '#ccfff2' : '#ffeaea';
    button.style.borderColor = isCorrect ? '#339999' : '#ea696c';
    button.style.color = isCorrect ? '#339999' : '#ea696c';

    // Blur function for incorrect answers
    if (currentStage !== 3) {
        const overlay = document.getElementById('overlay');
        overlay.style.filter = isCorrect ? 'blur(10px)' : 'blur(15px)';
    }

    // Proceed to the next stage after a delay
    setTimeout(() => {
        button.style.backgroundColor = ''; // Reset button color
        if (currentStage === 3) {
            finishQuiz(isCorrect);
        } else {
            proceedToNextStage(); 
        }
    }, 1000);
}

// When the quiz is complete (final stage/guess)
function finishQuiz(isCorrect) {
    // Update stats based on whether the final guess is correct
    updateStats(isCorrect);
}

// Function to update stats in localStorage
function updateStats(isCorrect) {
    console.log('Is correct:', isCorrect); // Debug line
    const userStats = JSON.parse(localStorage.getItem('userStats')) || { attempts: 0, wins: 0, winRate: 0 };

    // Increment attempts after each quiz attempt (final guess)
    userStats.attempts++;

    // If the final guess is correct, increment wins
    if (isCorrect) {
        userStats.wins++;
    }

    // Calculate win rate
    userStats.winRate = userStats.attempts > 0 ? (userStats.wins / userStats.attempts) * 100 : 0;

    // Save the updated stats back to localStorage
    localStorage.setItem('userStats', JSON.stringify(userStats));

    // Update the displayed stats immediately after the quiz
    document.getElementById('attempts').innerText = userStats.attempts;
    document.getElementById('wins').innerText = userStats.wins;
    document.getElementById('win-rate').innerText = userStats.winRate.toFixed(2);
}
