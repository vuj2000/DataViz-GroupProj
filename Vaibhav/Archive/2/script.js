function selectMode() {
    const modeSelector = document.getElementById('mode-selector');
    const modeSettings = document.getElementById('settings-content');
    const selectedMode = modeSelector.value;

    if (selectedMode === 'none') {
        modeSettings.innerHTML = '';
    } else if (selectedMode === 'timer') {
        modeSettings.innerHTML = `
            <div style="text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <button onclick="startTimer()" style="padding: 10px 20px; font-size: 1rem; border-radius: 5px; border: none; background-color: #5cb85c; color: white; cursor: pointer;">Start</button>
                <button onclick="resetGame()" style="padding: 10px 20px; font-size: 1rem; border-radius: 5px; border: none; background-color: #d9534f; color: white; cursor: pointer;">Play Again</button>
                <div id="timer-display" style="font-size: 2rem; font-weight: bold; color: #d9534f; padding: 10px; background-color: #f0f0f0; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: fit-content; margin: 20px auto;">⏳ Time Remaining: 60 seconds</div>
            </div>
        `;
    } else if (selectedMode === 'three-lives') {
        modeSettings.innerHTML = `
            <div style="text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <div id="lives-container">
                    <span id="life-1" style="font-size: 2rem;">❤️</span>
                    <span id="life-2" style="font-size: 2rem;">❤️</span>
                    <span id="life-3" style="font-size: 2rem;">❤️</span>
                </div>
            </div>
        `;
    } else if (selectedMode === 'infinite-play') {
        modeSettings.innerHTML = `
            <div style="text-align: center; padding: 20px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <label for="rounds" style="font-size: 1.2rem; font-weight: bold; color: #333;">Select Number of Rounds:</label>
                    <select id="rounds" style="padding: 10px; font-size: 1rem; border-radius: 10px; border: 2px solid #333; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 100%; max-width: 300px;">
                        <option value="1">1 Round</option>
                        <option value="3">3 Rounds</option>
                        <option value="5">5 Rounds</option>
                        <option value="10">10 Rounds</option>
                        <option value="25">25 Rounds</option>
                        <option value="50">50 Rounds</option>
                        <option value="100">100 Rounds</option>
                        <option value="infinite">Infinite Rounds</option>
                    </select>
                </div>
            </div>
        `;
    }
}

function startTimer() {
    let timeRemaining = 60;
    const timerDisplay = document.getElementById('timer-display');
    timerDisplay.innerText = `Time Remaining: ${timeRemaining}s`;

    const timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.innerText = `Time Remaining: ${timeRemaining}s`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Game Over.");  // Fixed the unescaped quote
            resetGame();
        }
    }, 1000);
}

function resetGame() {
    selectMode(); // Reset settings content to current mode
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
    const imagesData = await imagesResponse.json();  // Fixed incorrect reference

    // Try to find a suitable backdrop image
    let movieStill = imagesData.backdrops.find(
        image => image.aspect_ratio > 1.7 && image.vote_count > 5
    );

    if (movieStill) {
        originalImageUrl = `https://image.tmdb.org/t/p/original${movieStill.file_path}`;

        const backdropHTML = `<img src="https://image.tmdb.org/t/p/w780${movieStill.file_path}" alt="${movie.title} Still" id="movie-backdrop" />`;
        document.getElementById('movie-info').innerHTML = backdropHTML;

        const overlay = document.getElementById('overlay');
        overlay.style.filter = 'blur(15px)'; 
        updateChoicesForGenre();
    } else {
        updateMovieInfo();
    }
}
