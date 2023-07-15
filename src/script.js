var timerInterval;
var startTime;
var elapsedTime = 0;
var isPaused = false;
var hourlyRate = 10;

function startTimer() {
    if (!timerInterval) {
        if (elapsedTime === 0) {
            startTime = Date.now();
        } else {
            startTime = Date.now() - elapsedTime;
        }
        timerInterval = setInterval(updateTimer, 10);
    }
}

function updateTimer() {
    if (!isPaused) {
        var currentTime = Date.now();
        elapsedTime = currentTime - startTime;
        var formattedTime = formatTime(elapsedTime);
        document.getElementById("timer").textContent = formattedTime;
        document.getElementById("elapsed-time-value").textContent = formattedTime;
        calculatePaymentAmount();
        saveElapsedTimeToStorage();
    }
}

function togglePause() {
    isPaused = !isPaused;
    var pauseButton = document.getElementById("pause");
                pauseButton.textContent = isPaused ? "Reprendre" : "Pause";
    if (isPaused) {
        clearInterval(timerInterval);
        timerInterval = null;
        saveElapsedTimeToStorage();
    } else {
        startTimer();
    }
}

function resetTimer() {
    var confirmReset = confirm("Êtes-vous sûr de vouloir réinitialiser le chronomètre ?");
    if (confirmReset) {
        clearInterval(timerInterval);
        timerInterval = null;
        elapsedTime = 0;
        document.getElementById("timer").textContent = "00:00:00";
        document.getElementById("elapsed-time-value").textContent = "00:00:00";
        document.getElementById("payment-amount-value").textContent = "0 €";
        isPaused = false;
        document.getElementById("pause").textContent = "Pause";
        saveElapsedTimeToStorage();
    }
}

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

function pad(value, length) {
    return value.toString().padStart(length, "0");
}

function saveElapsedTimeToStorage() {
    localStorage.setItem("elapsedTime", elapsedTime);
}

function loadElapsedTimeFromStorage() {
    var storedElapsedTime = localStorage.getItem("elapsedTime");
    if (storedElapsedTime) {
        elapsedTime = parseInt(storedElapsedTime);
        document.getElementById("timer").textContent = formatTime(elapsedTime);
        document.getElementById("elapsed-time-value").textContent = formatTime(elapsedTime);
        calculatePaymentAmount();
    }
}

function calculatePaymentAmount() {
    var paymentAmount = (elapsedTime / 1000 / 60 / 60) * hourlyRate; 
    document.getElementById("payment-amount-value").textContent = paymentAmount.toFixed(2) + " €";
}

function updateHourlyRate() {
    hourlyRate = parseFloat(document.getElementById("hourly-rate-input").value);
    calculatePaymentAmount();
}

document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", togglePause);
document.getElementById("reset").addEventListener("click", resetTimer);
document.getElementById("hourly-rate-input").addEventListener("input", updateHourlyRate);

loadElapsedTimeFromStorage();