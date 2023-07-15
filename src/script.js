// Declare variables
var timerInterval; // Holds the interval ID for the timer
var startTime; // Stores the start time of the timer
var elapsedTime = 0; // Tracks the elapsed time in milliseconds
var isPaused = false; // Indicates whether the timer is paused or running
var hourlyRate = 10; // The hourly rate for calculating payment

// Starts the timer
function startTimer() {
    if (!timerInterval) {
        if (elapsedTime === 0) {
            startTime = Date.now(); // Set the start time if the timer is starting from 0
        } else {
            startTime = Date.now() - elapsedTime; // Adjust the start time if the timer is being resumed
        }
        timerInterval = setInterval(updateTimer, 10); // Update the timer every 10 milliseconds
    }
}

// Updates the timer display and calculates payment amount
function updateTimer() {
    if (!isPaused) {
        var currentTime = Date.now();
        elapsedTime = currentTime - startTime;
        var formattedTime = formatTime(elapsedTime);
        document.getElementById("timer").textContent = formattedTime; // Update the timer display
        document.getElementById("elapsed-time-value").textContent = formattedTime; // Update the elapsed time display
        calculatePaymentAmount(); // Recalculate the payment amount
        saveElapsedTimeToStorage(); // Save the elapsed time to local storage
    }
}

// Toggles between pausing and resuming the timer
function togglePause() {
    isPaused = !isPaused; // Invert the pause state
    var pauseButton = document.getElementById("pause");
    pauseButton.textContent = isPaused ? "Continue" : "Pause"; // Change the button text based on the pause state

    if (isPaused) {
        clearInterval(timerInterval); // Pause the timer by clearing the interval
        timerInterval = null;
        saveElapsedTimeToStorage(); // Save the elapsed time to local storage
    } else {
        startTimer(); // Resume the timer
    }
}

// Resets the timer to 0 and clears stored data
function resetTimer() {
    var confirmReset = confirm("Are you sure you want to start over?");
    if (confirmReset) {
        clearInterval(timerInterval); // Clear the interval
        timerInterval = null;
        elapsedTime = 0; // Reset the elapsed time
        document.getElementById("timer").textContent = "00:00:00"; // Reset the timer display
        document.getElementById("elapsed-time-value").textContent = "00:00:00"; // Reset the elapsed time display
        document.getElementById("payment-amount-value").textContent = "0 €"; // Reset the payment amount display
        isPaused = false; // Reset the pause state
        document.getElementById("pause").textContent = "Pause"; // Reset the pause button text
        saveElapsedTimeToStorage(); // Save the elapsed time to local storage
    }
}

// Formats the time in HH:MM:SS format
function formatTime(time) {
    var milliseconds = Math.floor(time % 1000 / 10);
    var seconds = Math.floor(time / 1000 % 60);
    var minutes = Math.floor(time / 1000 / 60 % 60);
    var hours = Math.floor(time / 1000 / 60 / 60);
    return (
        pad(hours, 2) +
        ":" +
        pad(minutes, 2) +
        ":" +
        pad(seconds, 2) +
        "." +
        pad(milliseconds, 2)
    );
}

// Pads a value with leading zeros to a specified length
function pad(value, length) {
    return value.toString().padStart(length, "0");
}

// Saves the elapsed time to local storage
function saveElapsedTimeToStorage() {
    localStorage.setItem("elapsedTime", elapsedTime);
}

// Loads the elapsed time from local storage and updates the display
function loadElapsedTimeFromStorage() {
    var storedElapsedTime = localStorage.getItem("elapsedTime");
    if (storedElapsedTime) {
        elapsedTime = parseInt(storedElapsedTime);
        document.getElementById("timer").textContent = formatTime(elapsedTime);
        document.getElementById("elapsed-time-value").textContent = formatTime(elapsedTime);
        calculatePaymentAmount();
    }
}

// Calculates the payment amount based on the elapsed time and hourly rate
function calculatePaymentAmount() {
    var paymentAmount = (elapsedTime / 1000 / 60 / 60) * hourlyRate; 
    document.getElementById("payment-amount-value").textContent = paymentAmount.toFixed(2) + " €";
}

// Updates the hourly rate and recalculates the payment amount
function updateHourlyRate() {
    hourlyRate = parseFloat(document.getElementById("hourly-rate-input").value);
    calculatePaymentAmount();
}

// Event listeners for buttons and input
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", togglePause);
document.getElementById("reset").addEventListener("click", resetTimer);
document.getElementById("hourly-rate-input").addEventListener("input", updateHourlyRate);

// Load elapsed time from local storage when the page loads
loadElapsedTimeFromStorage();
