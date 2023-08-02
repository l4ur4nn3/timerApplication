let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const monthsInEnglish = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


function changeLanguage(lang) {
  var elements = document.querySelectorAll("[data-translate]");

  if (lang === "en") {
    elements.forEach(function (element) {
      var key = element.getAttribute("data-translate");
      element.textContent = key;
    });
  } else {
    elements.forEach(function (element) {
      var key = element.getAttribute("data-translate");
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });
  }
}



function generateCalendar(month, year) {

  const monthNameElement = document.getElementById("monthName");
  monthNameElement.textContent = monthsInEnglish[month];
  const calendarContainer = document.getElementById("calendarContainer");
  const currentDate = new Date(year, month, 1);
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  let startDay = firstDayOfMonth.getDay();

  if (startDay === 0) {
    startDay = 6;
  } else {
    startDay -= 1;
  }

  let calendarHTML = "<table class='border-collapse w-full'>";
  calendarHTML += "<thead><tr>";
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (const day of daysOfWeek) {
    calendarHTML += `<th class="border border-gray-400 py-2 text-center">${day}</th>`;
  }
  calendarHTML += "</tr></thead><tbody><tr>";

  let dayCount = 1;
  for (let i = 0; i < startDay; i++) {
    calendarHTML += "<td class='border border-gray-400 py-2 text-center'></td>";
  }
  for (let i = startDay; i < 7; i++) {
    calendarHTML += `<td class='border border-gray-400 py-2 text-center' data-day="${dayCount}">${dayCount}</td>`;
    dayCount++;
  }
  calendarHTML += "</tr>";

  while (dayCount <= daysInMonth) {
    calendarHTML += "<tr>";
    for (let i = 0; i < 7 && dayCount <= daysInMonth; i++) {
      calendarHTML += `<td class='border border-gray-400 py-2 text-center' data-day="${dayCount}">${dayCount}</td>`;
      dayCount++;
    }
    calendarHTML += "</tr>";
  }

  calendarHTML += "</tbody></table>";

  calendarContainer.innerHTML = calendarHTML;

  // Ajouter un écouteur d'événements à chaque <td> nouvellement généré
  const tdElements = calendarContainer.querySelectorAll("td");
  tdElements.forEach((td) => {
    td.addEventListener("click", handleTdClick);
  });

  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = getFormattedDateKey(year, month + 1, i);
    const durationMinutes = localStorage.getItem(dateKey);
    if (durationMinutes) {
      const td = calendarContainer.querySelector(`td[data-day="${i}"]`);
      if (td){
      const newDurationSpan = document.createElement("span");
      newDurationSpan.textContent = " - " + durationMinutes + "min";
      td.innerHTML = i + newDurationSpan.outerHTML;
      }
    }
  }

}

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

document.addEventListener("DOMContentLoaded", () => {
  generateCalendar(currentMonth, currentYear);
});

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

function handleTdClick(event) {
  const tdContent = event.target.textContent.trim();
  const durationSpan = event.target.querySelector("span");
  const dateKey = getFormattedDateKey(currentYear, currentMonth, event.target.textContent);


  if (tdContent === "" || durationSpan) {
    // Si le <td> est vide ou s'il contient déjà un élément <span>, afficher une invite pour éditer ou supprimer
    const editOrDelete = prompt(
      "Choisissez une option : 'E' pour éditer, 'S' pour supprimer."
    );

    if (editOrDelete !== null) {
      const option = editOrDelete.trim().toUpperCase();
      if (option === "E") {
        if (!durationSpan) {
          // Créer un nouvel élément <span> si l'élément n'existe pas déjà
          const newDurationSpan = document.createElement("span");
          event.target.appendChild(newDurationSpan);
        }
        const inputString = prompt("Entrez la nouvelle durée (ex. : 2h 30m) :");
        if (inputString !== null) {
          const [heures, minutes] = inputString
            .split("h")
            .map((str) => parseInt(str.trim()));
          const minutesTotal = heures * 60 + (minutes || 0);
          // Mettre à jour l'élément <span> avec la nouvelle durée
          durationSpan.textContent = " - " + minutesTotal + "min";
        }
      } else if (option === "S") {
        // Supprimer l'élément <span> contenant la durée existante
        if (durationSpan) {
          durationSpan.remove();
        }
      } else {
        alert("Option non valide. Aucune modification effectuée.");
      }
    }
    if (durationSpan) {
        const durationMinutes = parseInt(durationSpan.textContent.trim().split(" ")[2]);
        localStorage.setItem(dateKey, durationMinutes);
      } else {
        localStorage.removeItem(dateKey);
      }

  } else {
    // Si le <td> est vide, afficher une invite d'entrée pour saisir une nouvelle durée
    const inputString = prompt("Entrez la durée (ex. : 2h 30m) :");

    if (inputString !== null) {
      const [heures, minutes] = inputString
        .split("h")
        .map((str) => parseInt(str.trim()));
      const minutesTotal = heures * 60 + (minutes || 0);
      // Créer un nouvel élément <span> pour afficher la durée à côté de la date
      const newDurationSpan = document.createElement("span");
      newDurationSpan.textContent = " - " + minutesTotal + "min";
      event.target.innerHTML += newDurationSpan.outerHTML;
      localStorage.setItem(dateKey, minutesTotal);
    }
  }
}

// Fonction pour obtenir la clé de stockage au format désiré
function getFormattedDateKey(year, month, day) {
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }
  
  // Fonction pour charger les données depuis le localStorage lorsque la page est chargée
  function loadCalendarData() {
    const storedMonth = parseInt(localStorage.getItem("currentMonth"));
    const storedYear = parseInt(localStorage.getItem("currentYear"));
  
    if (!isNaN(storedMonth) && !isNaN(storedYear)) {
      currentMonth = storedMonth;
      currentYear = storedYear;
    }
  
    generateCalendar(currentMonth, currentYear);
  }
  
  // Événement DOMContentLoaded pour charger les données du calendrier lorsque la page est prête
  document.addEventListener("DOMContentLoaded", () => {
    loadCalendarData();
  });
  
  // Événement pour sauvegarder le mois et l'année actuels lorsqu'on navigue entre les mois
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("currentMonth", currentMonth);
    localStorage.setItem("currentYear", currentYear);
  });

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
    document.getElementById("elapsed-time-value").textContent =
      formatTime(elapsedTime);
    calculatePaymentAmount();
  }
}

// Calculates the payment amount based on the elapsed time and hourly rate
function calculatePaymentAmount() {
  var paymentAmount = (elapsedTime / 1000 / 60 / 60) * hourlyRate;
  document.getElementById("payment-amount-value").textContent =
    paymentAmount.toFixed(2) + " €";
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
document
  .getElementById("hourly-rate-input")
  .addEventListener("input", updateHourlyRate);

// Load elapsed time from local storage when the page loads
loadElapsedTimeFromStorage();
