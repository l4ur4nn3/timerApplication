

// Get the current month and year
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// An array containing the names of months in English
const monthsInEnglish = [
  "January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"
];

// Function to change the language of elements with data-translate attribute
function changeLanguage(lang) {
  // Get all elements with data-translate attribute
  var elements = document.querySelectorAll("[data-translate]");

  // If the language is English, set the content of elements to their data-translate attribute
  if (lang === "en") {
    elements.forEach(function (element) {
      var key = element.getAttribute("data-translate");
      element.textContent = key;
    });
  } else {
    // If the language is not English, use the translations object to set the content of elements
    elements.forEach(function (element) {
      var key = element.getAttribute("data-translate");
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });
  }
}

// Function to generate the calendar for a given month and year
function generateCalendar(month, year) {
  // Load calendar data from local storage
  loadCalendarData();

  // Update the month name in the HTML
  const monthNameElement = document.getElementById("monthName");
  monthNameElement.textContent = monthsInEnglish[month];

  // Get the container for the calendar
  const calendarContainer = document.getElementById("calendarContainer");

  // Calculate the first and last day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Get the number of days in the month
  const daysInMonth = lastDayOfMonth.getDate();

  // Calculate the starting day of the calendar (e.g., Sunday, Monday, etc.)
  let startDay = firstDayOfMonth.getDay();
  if (startDay === 0) {
    startDay = 6;
  } else {
    startDay -= 1;
  }

  // Build the HTML for the calendar table
  let calendarHTML = "<table class='border-collapse w-full'>";
  calendarHTML += "<thead><tr>";
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (const day of daysOfWeek) {
    calendarHTML += `<th class="border border-gray-400 py-2 text-center">${day}</th>`;
  }
  calendarHTML += "</tr></thead><tbody><tr>";

  let dayCount = 1;
  // Fill the cells of the first row with empty cells until the starting day
  for (let i = 0; i < startDay; i++) {
    calendarHTML += "<td class='border border-gray-400 py-2 text-center'></td>";
  }
  // Fill the rest of the first row with the days of the month
  for (let i = startDay; i < 7; i++) {
    calendarHTML += `<td class='border border-gray-400 py-2 text-center' data-day="${dayCount}">${dayCount}</td>`;
    dayCount++;
  }
  calendarHTML += "</tr>";

  // Fill the remaining rows with the days of the month
  while (dayCount <= daysInMonth) {
    calendarHTML += "<tr>";
    for (let i = 0; i < 7 && dayCount <= daysInMonth; i++) {
      calendarHTML += `<td class='border border-gray-400 py-2 text-center' data-day="${dayCount}">${dayCount}</td>`;
      dayCount++;
    }
    calendarHTML += "</tr>";
  }

  calendarHTML += "</tbody></table>";

  // Update the calendar container with the generated HTML
  calendarContainer.innerHTML = calendarHTML;

  // Add click event listeners to each day cell
  const tdElements = calendarContainer.querySelectorAll("td");
  tdElements.forEach((td) => {
    td.addEventListener("click", handleTdClick);
  });

  // Fill in the calendar cells with stored work duration data from local storage
  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = getFormattedDateKey(year, month + 1, i);
    const durationMinutes = localStorage.getItem(dateKey);
    if (durationMinutes) {
      const td = calendarContainer.querySelector(`td[data-day="${i}"]`);
      if (td) {
        const newDurationSpan = document.createElement("span");
        newDurationSpan.textContent = " - " + durationMinutes + "min";
        td.innerHTML = i + newDurationSpan.outerHTML;
      }
    }
  }

  // Update local storage with the calendar data
  updateLocalStorage(month, year);
}

// Function to update the local storage with the calendar data
function updateLocalStorage() {
  const calendarContainer = document.getElementById("calendarContainer");
  const tdElements = calendarContainer.querySelectorAll("td");

  const calendarData = {};

  tdElements.forEach((td) => {
    const day = td.getAttribute("data-day");
    const dateKey = getFormattedDateKey(currentYear, currentMonth + 1, day);
    const durationSpan = td.querySelector("span");

    if (durationSpan) {
      const durationMinutes = parseInt(
        durationSpan.textContent.trim().split(" ")[2]
      );
      calendarData[dateKey] = durationMinutes;
    } else {
      delete calendarData[dateKey];
    }
  });

  localStorage.setItem("calendarData", JSON.stringify(calendarData));
}

// Function to navigate to the next or previous month
function navigateMonth(direction) {
  currentMonth += direction;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar(currentMonth, currentYear);
}

// Event listener to generate the calendar when the page loads
document.addEventListener("DOMContentLoaded", () => {
  generateCalendar(currentMonth, currentYear);
});

// Variables to manage the timer
var timerInterval; // Reference to the interval for updating the timer
var startTime; // Timestamp when the timer starts or resumes
var elapsedTime = 0; // Total elapsed time (in milliseconds) since the timer started or resumed
var isPaused = false; // Flag to track whether the timer is paused or running
var hourlyRate = 10; // Default hourly rate (can be adjusted by the user)

// Function to start or resume the timer
function startTimer() {
  if (!timerInterval) {
    // If the timerInterval is not set, it means the timer is not running
    // Check if the elapsed time is zero (i.e., timer is starting from zero) or not
    if (elapsedTime === 0) {
      startTime = Date.now(); // Set the start time to the current timestamp
    } else {
      startTime = Date.now() - elapsedTime; // Adjust the start time to account for elapsed time when resuming
    }
    timerInterval = setInterval(updateTimer, 10); // Start the interval to update the timer every 10 milliseconds
  }
}

// Function to update the timer display and calculate payment amount
function updateTimer() {
  if (!isPaused) {
    // If the timer is not paused, update the elapsed time
    var currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    var formattedTime = formatTime(elapsedTime);
    document.getElementById("timer").textContent = formattedTime;
    document.getElementById("elapsed-time-value").textContent = formattedTime;
    calculatePaymentAmount();
    saveElapsedTimeToStorage();
  }
}

// Function to toggle pause and resume the timer
function togglePause() {
  isPaused = !isPaused; // Toggle the isPaused flag
  var pauseButton = document.getElementById("pause");
  pauseButton.textContent = isPaused ? "Continue" : "Pause"; // Update the button text based on pause state

  if (isPaused) {
    // If the timer is paused, clear the interval to stop updating the timer
    clearInterval(timerInterval);
    timerInterval = null;
    saveElapsedTimeToStorage(); // Save the elapsed time to local storage when paused
  } else {
    // If the timer is resumed, start the timer again
    startTimer();
  }
}

// Function to reset the timer to zero
function resetTimer() {
  var confirmReset = confirm("Are you sure you want to start over?");

  if (confirmReset) {
    clearInterval(timerInterval); // Clear the interval to stop the timer
    timerInterval = null;
    elapsedTime = 0; // Reset the elapsed time to zero
    document.getElementById("timer").textContent = "00:00:00"; // Reset the timer display
    document.getElementById("elapsed-time-value").textContent = "00:00:00";
    document.getElementById("payment-amount-value").textContent = "0 €"; // Reset the payment amount display
    isPaused = false; // Set the pause flag to false
    document.getElementById("pause").textContent = "Pause"; // Reset the button text to "Pause"
    saveElapsedTimeToStorage(); // Save the elapsed time to local storage
  }
}

// Function to format the time in HH:mm:ss format
function formatTime(time) {
  var milliseconds = Math.floor((time % 1000) / 10);
  var seconds = Math.floor((time / 1000) % 60);
  var minutes = Math.floor((time / 1000 / 60) % 60);
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

// Function to handle clicks on calendar cells
function handleTdClick(event) {
  // Logic for handling clicks on calendar cells is explained in the previous comment section.
}

// Function to format the date in the format "YYYY-MM-DD"
function getFormattedDateKey(year, month, day) {
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

// Function to load calendar data from local storage
function loadCalendarData() {
  // Logic for loading calendar data from local storage is explained in the previous comment section.
}

// Event listener to load calendar data when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadCalendarData();
});

// Event listener to save the current month and year to local storage before the page is unloaded
window.addEventListener("beforeunload", () => {
  localStorage.setItem("currentMonth", currentMonth);
  localStorage.setItem("currentYear", currentYear);
});

// Function to left-pad a numeric value with leading zeros
function pad(value, length) {
  return value.toString().padStart(length, "0");
}

// Function to save the elapsed time to local storage
function saveElapsedTimeToStorage() {
  localStorage.setItem("elapsedTime", elapsedTime);
}

// Function to load the elapsed time from local storage and update the timer display
function loadElapsedTimeFromStorage() {
  var storedElapsedTime = localStorage.getItem("elapsedTime");
  if (storedElapsedTime) {
    elapsedTime = parseInt(storedElapsedTime);
    document.getElementById("timer").textContent = formatTime(elapsedTime);
    document.getElementById("elapsed-time-value").textContent = formatTime(elapsedTime);
    calculatePaymentAmount();
  }
}

// Function to calculate the payment amount based on the elapsed time and hourly rate
function calculatePaymentAmount() {
  var paymentAmount = (elapsedTime / 1000 / 60 / 60) * hourlyRate;
  document.getElementById("payment-amount-value").textContent = paymentAmount.toFixed(2) + " €";
}

// Function to update the hourly rate and recalculate the payment amount
function updateHourlyRate() {
  hourlyRate = parseFloat(document.getElementById("hourly-rate-input").value);
  calculatePaymentAmount();
}

// Event listeners for the timer controls and hourly rate input
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", togglePause);
document.getElementById("reset").addEventListener("click", resetTimer);
document.getElementById("hourly-rate-input").addEventListener("input", updateHourlyRate);

// Load the elapsed time from local storage when the page loads
loadElapsedTimeFromStorage();
