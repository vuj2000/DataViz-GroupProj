// Button States
document.addEventListener('DOMContentLoaded', function () {
    // Get all the links
    const links = document.querySelectorAll('.centered-links-container a');

    // Set the "Guess" link as active on page load
    const defaultActiveLink = document.querySelector('.centered-links-container a[href="#guess"]');
    defaultActiveLink.classList.add('active');

    // Add click event to each link to toggle the active state
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            // Prevent default link behavior
            e.preventDefault();

            // Remove the active class from all links
            links.forEach(link => link.classList.remove('active'));

            // Add the active class to the clicked link
            link.classList.add('active');
        });
    });
});




document.addEventListener('DOMContentLoaded', function () {
    // Get all the links and text elements
    const links = document.querySelectorAll('.centered-links-container a');
    const aboutText = document.querySelectorAll('.about-text'); // About text elements
    const guessText = document.querySelectorAll('.guess-text'); // Guess text elements
    const mapText = document.querySelectorAll('.map-text'); // Map text elements

    // Set the "Guess" link as active by default
    const defaultActiveLink = document.querySelector('a[href="#guess"]');
    defaultActiveLink.classList.add('active');
    // Show the guess text when the "Guess" link is active
    guessText.forEach(text => text.style.display = 'block');
    aboutText.forEach(text => text.style.display = 'none');
    mapText.forEach(text => text.style.display = 'none');

    // Add click event to each link to toggle the active state and show respective text
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            // Prevent default link behavior
            e.preventDefault();

            // Remove the active class from all links
            links.forEach(link => link.classList.remove('active'));

            // Add the active class to the clicked link
            link.classList.add('active');

            // Hide all text sections
            aboutText.forEach(text => text.style.display = 'none');
            guessText.forEach(text => text.style.display = 'none');
            mapText.forEach(text => text.style.display = 'none');

            // Show the relevant text based on the clicked link
            if (link.href.includes('#about')) {
                aboutText.forEach(text => text.style.display = 'block');
            } else if (link.href.includes('#guess')) {
                guessText.forEach(text => text.style.display = 'block');
            } else if (link.href.includes('#map')) {
                mapText.forEach(text => text.style.display = 'block');
            }
        });
    });
});
