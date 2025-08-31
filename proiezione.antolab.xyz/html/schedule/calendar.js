let config; // Declare globally for access
let schedule; // Declare globally for access
let currentDate = new Date();

const monthNames = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

async function fetchJson(name) {
  try {
    const response = await fetch(`./${name}`); // Relative path to the JSON file
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching JSON:", error);
    throw error;
  }
}

async function initializeCalendar() {
  try {
    config = await fetchJson("config_rcy.json");
    schedule = await fetchJson("schedule_rcy.json");
    updateCalendar(); // Update calendar only after config and schedule are loaded
  } catch (error) {
    console.error("Error initializing calendar:", error);
  }
}

function updateCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Update title
  const titleElement = document.querySelector(".calendar-title");
  titleElement.textContent = `Calendario RCY ${monthNames[month]} ${year}`;

  // Update header
  const headerElement = document.querySelector(".calendar-header");
  headerElement.innerHTML = "";
  const daysOfWeek = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];
  daysOfWeek.forEach((day) => {
    const headerCell = document.createElement("div");
    headerCell.className = "header-cell";
    headerCell.textContent = day;
    headerElement.appendChild(headerCell);
  });

  // Update grid
  const gridElement = document.querySelector(".calendar-grid");
  gridElement.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Calculate offset based on first weekday configuration
  let offset = firstDay.getDay();
  offset = (offset + 6) % 7; // Adjust for Monday as the first day

  // Create calendar cells
  for (let i = 0; i < 42; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    const dayNumber = i - offset + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      const dateString = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-${String(dayNumber).padStart(2, "0")}`;
      const content = schedule[dateString];

      const dateDiv = document.createElement("div");
      dateDiv.className = "date-number";
      dateDiv.textContent = dayNumber;
      cell.appendChild(dateDiv);

      if (content) {
        cell.classList.add("has-content");
        cell.style.setProperty("--maker-color", getMakerColor(content.maker));

        const typeDiv = document.createElement("div");
        typeDiv.className = "content-type";
        typeDiv.textContent = content.type;
        cell.appendChild(typeDiv);

        const makerDiv = document.createElement("div");
        makerDiv.className = "content-maker";
        makerDiv.textContent = content.maker;
        cell.appendChild(makerDiv);
      }
    }

    gridElement.appendChild(cell);
  }
}

function getMakerColor(maker) {
  const person = config.peopleColors.find((p) => p.name === maker);
  return person ? `#${person.color}` : "#d3d3d3"; // Fallback to light gray
}

function previousMonth() {
  currentDate.setDate(1);
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
}

function nextMonth() {
  currentDate.setDate(1);
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
}

// Initialize calendar
initializeCalendar();
