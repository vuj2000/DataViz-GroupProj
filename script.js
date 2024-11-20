// Dark Mode
const darkModeButton = document.getElementById('dark-mode-toggle');

if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
} else {
    document.body.classList.remove('dark-mode');
}

darkModeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const darkModeState = document.body.classList.contains('dark-mode') ? 'true' : 'false';
    localStorage.setItem('dark-mode', darkModeState);
});



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






// Quiz Logic Part 2------------------------------------------------------
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
    // Update movie info and choices for the first stage
    updateMovieInfo();
    updateChoicesForGenre();

    // Reset stage-related variables
    currentStage = 1;
    correctGenreGuessed = false;
    correctYearGuessed = false;

    // Reset instructions and feedback text
    document.getElementById('stage-instruction').innerText = 'Stage 1: Guess the genre!';
    document.getElementById('feedback-genre').innerText = 'Tip 1: Genre';
    document.getElementById('feedback-year').innerText = 'Tip 2: Year';
    
    // Reset the choices container
    document.getElementById('choices').innerHTML = '';

    // Reset any blur effects (optional)
    document.getElementById('overlay').style.filter = 'blur(10px)';

    // Reset feedback sections
    document.getElementById('feedback-genre').innerText = 'Tip 1: Genre';
    document.getElementById('feedback-year').innerText = 'Tip 2: Year';
    
    // Reset additional quiz state
    blurValue = 10;  // Optional: reset blur value to its starting state
    overlay.style.filter = 'blur(10px)';
    
    // Optionally, re-enable any other features like buttons or next steps
    // For example: make sure buttons are active again (if relevant)
    enableButtons();  // This is an example; replace with your button-enabling logic if needed
}

// Function to handle enabling buttons, if you have one
function enableButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = false; // Enable buttons if previously disabled
    });
}



// Track win/loss and remove blur on correct answer
function checkAnswer(button, selectedAnswer) {
    let isCorrect = false;
    let feedbackText = "";

    // Handle Stage 1: Genre
    if (currentStage === 1) {
        isCorrect = genreList.some(genre => genre.name === selectedAnswer && currentMovie.genre_ids.includes(genre.id));
        correctGenreGuessed = isCorrect;
        feedbackText = isCorrect ? `Tip 1: The genre is ${selectedAnswer}` : `Tip 1: The genre is NOT ${selectedAnswer}`;

        // Update the genre feedback
        const feedbackGenreDiv = document.getElementById('feedback-genre');
        feedbackGenreDiv.innerHTML = feedbackText;

    } 
    // Handle Stage 2: Year
    else if (currentStage === 2) {
        const selectedYear = selectedAnswer;
        const correctYear = currentMovie.release_date.split('-')[0];
        isCorrect = selectedYear === correctYear;
        correctYearGuessed = isCorrect;
        feedbackText = isCorrect ? `Tip 2: It was released in ${selectedYear}` : `Tip 2: It was NOT released in ${selectedYear}`;

        // Update the year feedback
        const feedbackYearDiv = document.getElementById('feedback-year');
        feedbackYearDiv.innerHTML = feedbackText;
    } 
    // Handle Stage 3: Movie Title (Final Stage)
    else if (currentStage === 3) {
        const quizFinishedMessages = [
            `Quiz Finished! The movie is "${currentMovie.title}"!`,
            `Congratulations! The movie was "${currentMovie.title}"!`,
            `Well done! The movie was "${currentMovie.title}"!`
        ];

        const incorrectMessages = [
            `Incorrect! The movie is "${currentMovie.title}".`,
            `Oops! The movie was "${currentMovie.title}".`,
            `Wrong guess! The movie is "${currentMovie.title}".`
        ];

        if (selectedAnswer === currentMovie.title) {
            isCorrect = true;
            feedbackText = quizFinishedMessages[Math.floor(Math.random() * quizFinishedMessages.length)];
        } else {
            isCorrect = false;
            feedbackText = incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)];
        }

        // Display the randomly chosen message
        document.getElementById('stage-instruction').innerText = feedbackText;

        // Show "Retry?" button
        document.getElementById('choices').innerHTML = `
            <button onclick="resetQuiz()">Retry?</button>
        `;

        // Optionally, pass isCorrect to finish the quiz
        finishQuiz(isCorrect);  // Assuming you have a function to handle stats or feedback
    }

    // Update button colors based on correctness
    button.style.backgroundColor = isCorrect ? '#ccfff2' : '#ffeaea';
    button.style.borderColor = isCorrect ? '#339999' : '#ea696c';
    button.style.color = isCorrect ? '#339999' : '#ea696c';

    // Update overlay blur effect based on stage and correctness
    const overlay = document.getElementById('overlay');
    if (currentStage === 3) {
        overlay.style.filter = 'blur(0px)'; // No blur in final stage
    } else if (currentStage === 1) {
        overlay.style.filter = isCorrect ? 'blur(10px)' : 'blur(15px)';
    } else if (currentStage === 2) {
        if (isCorrect) {
            overlay.style.filter = overlay.style.filter === 'blur(15px)' ? 'blur(10px)' : 'blur(7px)';
        } else {
            overlay.style.filter = overlay.style.filter || 'blur(15px)';
        }
    }

    // Proceed to next stage after a delay, or finish the quiz
    setTimeout(() => {
        button.style.backgroundColor = ''; // Reset button color
        if (currentStage === 3) {
            finishQuiz(isCorrect); 
        } else {
            proceedToNextStage(); 
        }
    }, 1000);
}







// Stats----------------------------------------------------------
// Function to display the latest stats on page load
function displayStats() {
    const userStats = JSON.parse(localStorage.getItem('userStats')) || { attempts: 0, wins: 0, winRate: 0 };
    
    document.getElementById('attempts').innerText = userStats.attempts;
    document.getElementById('wins').innerText = userStats.wins;
    document.getElementById('win-rate').innerText = userStats.winRate.toFixed(2);
}

// Call displayStats when the page loads to show the latest stats
window.onload = displayStats;

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




// Google Sheets Func.
async function sendStatsToSheet(isCorrect) {
    const userStats = JSON.parse(localStorage.getItem('userStats')) || { attempts: 0, wins: 0, winRate: 0 };

    // Increment attempts and wins based on the result
    userStats.attempts++;
    if (isCorrect) {
        userStats.wins++;
    }
    userStats.winRate = userStats.attempts > 0 ? (userStats.wins / userStats.attempts) * 100 : 0;

    // Update localStorage
    localStorage.setItem('userStats', JSON.stringify(userStats));
``
    // Send stats to Google Sheet
    await fetch('https://script.google.com/macros/s/AKfycbz9AhROOrjBductLVu_GIG33t5z7Zmbja-PwWbVGC0bNHLA_asp4PO3zf7uZxwnzjUe0w/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userStats),
    });
}


// Start the quiz-------------------------------------------
updateMovieInfo();
