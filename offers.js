// Plik offers.js w katalogu głównym – obsługa filtrów i pobieranie ogłoszeń z API

async function fetchOffersWithFilters(filters = {}) {
try {
const response = await fetch("https://api-offers.vercel.app/api/offers", {
@@ -55,6 +53,32 @@ function displayOffers(offers) {
});
}

function populateFilters(offers) {
  const years = [...new Set(offers.map(o => parseInt(o.data?.yearproduction)).filter(Boolean))].sort((a, b) => a - b);
  const prices = offers.map(o => parseInt(o.data?.price)).filter(Boolean).sort((a, b) => a - b);
  const makes = [...new Set(offers.map(o => o.data?.id_make).filter(Boolean))].sort();
  const models = [...new Set(offers.map(o => o.data?.id_model).filter(Boolean))].sort();

  const fillSelect = (id, values, label) => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = `<option value="">${label}</option>`;
    values.forEach(v => {
      const option = document.createElement("option");
      option.value = v;
      option.textContent = v;
      select.appendChild(option);
    });
  };

  fillSelect("brand", makes, "Wybierz markę");
  fillSelect("model", models, "Wybierz model");
  fillSelect("yearFrom", years, "Rocznik od");
  fillSelect("yearTo", years.slice().reverse(), "Rocznik do");
  fillSelect("priceMin", prices, "Cena min");
  fillSelect("priceMax", prices.slice().reverse(), "Cena max");
}

async function filterOffers() {
const filters = collectFilters();
const offers = await fetchOffersWithFilters(filters);
@@ -63,8 +87,9 @@ async function filterOffers() {

document.getElementById("filter-button")?.addEventListener("click", filterOffers);

// Domyślne ładowanie 8 losowych ogłoszeń bez filtrowania na starcie
(async () => {
  const offers = await fetchOffersWithFilters();
  displayOffers(offers.slice(0, 8));
  const allOffers = await fetchOffersWithFilters();
  populateFilters(allOffers);
  const shuffled = allOffers.sort(() => 0.5 - Math.random());
  displayOffers(shuffled.slice(0, 6));
})();
