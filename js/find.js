/* Find a Beauty Professional — search + filter logic */

const serviceSelect = document.getElementById("serviceSelect");
const locationSelect = document.getElementById("locationSelect");
const searchInput = document.getElementById("searchInput");
const resultsGrid = document.getElementById("resultsGrid");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const resetBtn = document.getElementById("resetBtn");

SERVICES.forEach(s => {
  const opt = document.createElement("option");
  opt.value = s;
  opt.textContent = s;
  serviceSelect.appendChild(opt);
});

LOCATIONS.forEach(l => {
  const opt = document.createElement("option");
  opt.value = l;
  opt.textContent = l;
  locationSelect.appendChild(opt);
});

// Pre-fill from URL query params (e.g. linked from a homepage category card)
const initialService = getQueryParam("service");
const initialLocation = getQueryParam("location");
const initialSearch = getQueryParam("q");
if (initialService) serviceSelect.value = initialService;
if (initialLocation) locationSelect.value = initialLocation;
if (initialSearch) searchInput.value = initialSearch;

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const service = serviceSelect.value;
  const location = locationSelect.value;

  const filtered = PROFESSIONALS.filter(p => {
    const matchesQuery = !query ||
      p.name.toLowerCase().includes(query) ||
      p.service.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    const matchesService = !service || p.service === service;
    const matchesLocation = !location || p.location === location;
    return matchesQuery && matchesService && matchesLocation;
  });

  resultsCount.textContent = `${filtered.length} professional${filtered.length === 1 ? "" : "s"} found`;

  if (filtered.length === 0) {
    resultsGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    resultsGrid.innerHTML = filtered.map(proCardHTML).join("");
  }
}

searchInput.addEventListener("input", render);
serviceSelect.addEventListener("change", render);
locationSelect.addEventListener("change", render);
resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  serviceSelect.value = "";
  locationSelect.value = "";
  render();
});

render();
