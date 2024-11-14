// Set dimensions and margins
const width = 1000;  
const height = 400;
const margin = { top: 20, right: 50, bottom: 60, left: 50 };  

// Data for the movie's narrative arc
const data = [
    { timestamp: "00:00:00", description: "Introduction to characters and Gotham City.", stage: "Exposition" },
    { timestamp: "00:15:00", description: "The Joker’s first crime (bank robbery).", stage: "Rising Action" },
    { timestamp: "00:30:00", description: "Joker's plan begins to unfold with chaos.", stage: "Rising Action" },
    { timestamp: "01:00:00", description: "Batman confronts the Joker in a climactic battle.", stage: "Climax" },
    { timestamp: "01:30:00", description: "Aftermath of battle; Harvey Dent becomes Two-Face.", stage: "Falling Action" },
    { timestamp: "02:00:00", description: "Batman takes the fall to protect Gotham's hope.", stage: "Denouement/Resolution" }
];

// Parse timestamp and assign numeric values to narrative stages
const parseTime = d3.timeParse("%H:%M:%S");
data.forEach(d => {
    d.timestamp = parseTime(d.timestamp);
    d.stageValue = {
        "Exposition": 1,
        "Rising Action": 2,
        "Climax": 3,
        "Falling Action": 2,
        "Denouement/Resolution": 1
    }[d.stage];
});

// Set up scales
const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.timestamp))
    .range([margin.left, width - margin.right]);

const yScale = d3.scaleLinear()
    .domain([0, 3])
    .range([height - margin.bottom, margin.top]);

// Set up SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

// Draw grid lines
svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(-height + margin.top + margin.bottom)
        .tickFormat(""));

svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat(""));

// Draw line connecting stages
const line = d3.line()
    .x(d => xScale(d.timestamp))
    .y(d => yScale(d.stageValue));

svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

// Draw interactive nodes (circles) and labels
svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("cx", d => xScale(d.timestamp))
    .attr("cy", d => yScale(d.stageValue))
    .attr("r", 8) // Increased radius for better visibility
    .attr("fill", d => {
        switch (d.stage) {
            case "Exposition": return "#ffcc00"; // Yellow
            case "Rising Action": return "#ff6600"; // Orange
            case "Climax": return "#ff0000"; // Red
            case "Falling Action": return "#ffcc00"; // Yellow
            case "Denouement/Resolution": return "#66ccff"; // Light Blue
        }
    })
    .on("mouseover", function(event, d) {
        d3.select(this)
            .interrupt()
            .transition()
            .duration(200)
            .ease(d3.easeLinear)
            .attr("r", 12)
            .attr("fill", "darkorange");

        tooltip.style("visibility", "visible")
            .html(`<strong>${d.stage}</strong><br>${d.description}`)
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
            .interrupt()
            .transition()
            .duration(200)
            .ease(d3.easeLinear)
            .attr("r", 8)
            .attr("fill", d => {
                switch (d.stage) {
                    case "Exposition": return "#ffcc00";
                    case "Rising Action": return "#ff6600";
                    case "Climax": return "#ff0000";
                    case "Falling Action": return "#ffcc00";
                    case "Denouement/Resolution": return "#66ccff";
                }
            });

        tooltip.style("visibility", "hidden");
    })
    .on("click", function(event, d) {
        // Display modal with description on click
    });

// Add narrative stage labels near each dot
svg.selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => xScale(d.timestamp))
    .attr("y", d => yScale(d.stageValue) - 15) // Adjusted for better alignment
    .text(d => d.stage)
    .attr("font-size", "12px")
    .attr("fill", "black")
    .attr("text-anchor", "middle"); // Center the text

// X-axis with Beginning, Middle, and End labels
svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickValues([
        parseTime("00:00:00"),
        parseTime("01:00:00"),
        parseTime("02:00:00")
    ]).tickFormat((d, i) => ["Beginning", "Middle", "End"][i]))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 50)
    .attr("fill", "black")
    .style("font-size", "14px")
    .style("text-anchor", "middle")
    .text("Plot Progression");

// Tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

// Modal functionality
function showModal(stage, description) {
    let modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal(this)">&times;</span>
            <h3>${stage}</h3>
            <p>${description}</p>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = "block";
}

function closeModal(element) {
    element.closest(".modal").remove();
}

// Guess the movie logic
function checkGuess() {
    const userGuess = document.getElementById("guess-input").value.trim().toLowerCase();
    const correctAnswer = "the dark knight";

    if (userGuess === correctAnswer) {
        document.getElementById("guess-result").textContent = "Correct Answer!";
        document.getElementById("guess-result").style.color = "green";
    } else {
        document.getElementById("guess-result").textContent = "Try Again!";
        document.getElementById("guess-result").style.color = "red";
    }
}
