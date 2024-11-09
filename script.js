const API_KEY = '3be2bc8a9d8fab379812442e317a4a99'; // Replace with your TMDb API key
let currentStage = 1;
let currentMovie = null;
let genreList = [];
let correctGenreGuessed = false;
let correctYearGuessed = false;
let originalImageUrl = ''; // To store the original image URL

// Function to fetch genres
async function fetchGenres() {
    const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(genreUrl);
    const data = await response.json();
    genreList = data.genres;
}

// Function to fetch the top 2000 popular movies (100 pages, 20 movies per page)
async function getTop2000Movies() {
    let topMovies = [];
    let page = 1;
    const maxPages = 100; // 2000 movies / 20 per page = 100 pages

    while (page <= maxPages) {
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
            topMovies = [...topMovies, ...data.results]; // Add the results to the array
        }

        page++;
    }

    return topMovies;
}

// Function to get a random movie from the top 2000 popular movies
async function getRandomMovie() {
    const topMovies = await getTop2000Movies();
    return topMovies[Math.floor(Math.random() * topMovies.length)];
}

// Function to update movie info and show a blurred image
async function updateMovieInfo() {
    if (genreList.length === 0) {
        await fetchGenres();
    }

    const movie = await getRandomMovie();
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

    if (!movieStill) {
        // If no suitable image found, try using any available image
        movieStill = imagesData.backdrops[0]; // Use the first available backdrop
    }

    if (movieStill) {
        // Store the original backdrop URL
        originalImageUrl = `https://image.tmdb.org/t/p/original${movieStill.file_path}`;

        // Show the blurred version initially
        const backdropHTML = `<img src="https://image.tmdb.org/t/p/w780${movieStill.file_path}" alt="${movie.title} Still" class="blurred-image" id="movie-backdrop" />`;
        document.getElementById('movie-info').innerHTML = backdropHTML;
        updateChoices();
    } else {
        // Handle case when no image is found after fallback
        alert("No suitable movie still found after several attempts. Retrying...");
        updateMovieInfo(); // Retry fetching movie info
    }
}

// Function to update choices for each stage (genre stage)
function updateChoices() {
    if (currentStage === 1) {
        // Randomly select four genres
        const shuffledGenres = genreList.sort(() => 0.5 - Math.random()).slice(0, 4);
        const genreChoices = shuffledGenres.map(
            genre => `<button onclick="checkAnswer(this, '${genre.name}')">${genre.name}</button>`
        ).join('');
        document.getElementById('choices').innerHTML = genreChoices;
    }
}

// Proceed to the next stage or show the unblurred image at the end
async function proceedToNextStage() {
    currentStage++;

    if (currentStage === 2) {
        document.getElementById('stage-instruction').innerText = 'Stage 2: Guess the year';
        updateChoicesForYear();
    } else if (currentStage === 3) {
        document.getElementById('stage-instruction').innerText = 'Final Stage: Guess the movie';
        updateChoicesForTitle(); // Update title choices only when moving to final stage
    } else {
        document.getElementById('stage-instruction').innerText = `Quiz Finished! The movie is "${currentMovie.title}"!`;

        // Show the unblurred version by replacing the image source
        const movieBackdrop = document.getElementById('movie-backdrop');
        movieBackdrop.src = `https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`;
        movieBackdrop.classList.remove('blurred-image'); // Remove blur class for a clear view

        // Add "Retry?" button
        document.getElementById('choices').innerHTML = `
            <button onclick="resetQuiz()">Retry?</button>
        `;
    }
}

// Function to reset the quiz
function resetQuiz() {
    currentStage = 1;
    currentMovie = null;
    correctGenreGuessed = false;
    correctYearGuessed = false;
    document.getElementById('stage-instruction').innerText = 'Stage 1: Guess the genre';
    document.getElementById('choices').innerHTML = '';
    updateMovieInfo();
}

// Check the user's answer and provide feedback with color and text
function checkAnswer(button, selectedAnswer) {
    let isCorrect = false;
    let feedbackGenreText = "";
    let feedbackYearText = "";

    if (currentStage === 1) {
        // Genre stage
        isCorrect = genreList.some(genre => genre.name === selectedAnswer && currentMovie.genre_ids.includes(genre.id));
        correctGenreGuessed = isCorrect;

        feedbackGenreText = isCorrect 
            ? `The genre is ${selectedAnswer}` 
            : `The genre is NOT ${selectedAnswer}`;

        // Update the genre feedback
        const feedbackGenreDiv = document.getElementById('feedback-genre');
        feedbackGenreDiv.innerHTML = feedbackGenreText;

    } else if (currentStage === 2) {
        // Year stage
        const selectedYear = selectedAnswer;
        const correctYear = currentMovie.release_date.split('-')[0];
        isCorrect = selectedYear === correctYear;
        correctYearGuessed = isCorrect;

        feedbackYearText = isCorrect 
            ? `It was released in ${selectedYear}` 
            : `It was NOT released in ${selectedYear}`;

        // Update the year feedback (display below the genre feedback)
        const feedbackYearDiv = document.getElementById('feedback-year');
        feedbackYearDiv.innerHTML = feedbackYearText;
    } else if (currentStage === 3) {
        // Movie title stage
        isCorrect = selectedAnswer === currentMovie.title;
        feedbackText = isCorrect 
            ? `Correct! The movie was "${selectedAnswer}".` 
            : `Incorrect! The movie is not "${selectedAnswer}".`;
    }

    // Change button color based on whether the answer is correct or incorrect
    button.style.backgroundColor = isCorrect ? '#ccfff2' : '#ffeaea';
    button.style.borderColor = isCorrect ? '#339999' : '#ea696c';

    // Move to the next stage after a 1-second delay
    setTimeout(() => {
        button.style.backgroundColor = ''; // Reset color
        proceedToNextStage();
    }, 1000);
}

// Function to update choices for the year stage
function updateChoicesForYear() {
    const correctYear = currentMovie.release_date.split('-')[0];
    // Ensure random year choices and shuffle them
    const years = [correctYear, '1990', '2005', '2010'].sort(() => 0.5 - Math.random());

    const yearChoices = years.map(
        year => `<button onclick="checkAnswer(this, '${year}')">${year}</button>`
    ).join('');
    document.getElementById('choices').innerHTML = yearChoices;
}


// Function to update choices for the movie title stage
async function updateChoicesForTitle() {
    // Fetch top 2000 popular movies instead of similar ones
    const topMovies = await getTop2000Movies();

    // Randomly pick 3 other movies + current movie to display
    const titleChoices = [currentMovie.title, ...topMovies.slice(0, 3).map(movie => movie.title)];

    // Shuffle the title choices
    const sortedTitleChoices = titleChoices.sort(() => 0.5 - Math.random());
    
    // Generate the buttons for title choices
    const titleButtons = sortedTitleChoices.map(
        title => `<button onclick="checkAnswer(this, '${title}')">${title}</button>`
    ).join('');
    
    document.getElementById('choices').innerHTML = titleButtons;
}

// Start the quiz initially
updateMovieInfo();
