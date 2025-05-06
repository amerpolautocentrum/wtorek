
Skip to content
Navigation Menu
amerpolautocentrum
wtorek

Code
Issues
Pull requests
Actions
Projects
Wiki
Security
Insights

    Settings

Commit f514136
amerpolautocentrum
amerpolautocentrum
authored
May 5, 2025
·
·
Add files via upload
main

1 parent 
9255625
 commit f514136

1 file changed
+33
-58
lines changed
 
‎offers.js
+33-58
Original file line number	Diff line number	Diff line change
@@ -1,25 +1,30 @@
// Plik frontendowy: offers.js (do katalogu głównego, np. obok offers.html)
// Plik offers.js w katalogu głównym – obsługa filtrów i pobieranie ogłoszeń z API

async function fetchOffers(offset = 0, limit = 8) {
async function fetchOffersWithFilters(filters = {}) {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
      body: JSON.stringify({ filters })
    });

    const result = await response.json();
    return (result.full || []).slice(offset, offset + limit);
    return result.full || [];
  } catch (error) {
    console.error("Błąd pobierania danych:", error);
    console.error("Błąd pobierania ofert:", error);
    return [];
  }
}

async function loadInitialOffers() {
  const offers = await fetchOffers(0, 8);
  displayOffers(offers);
  populateFilters(offers);
function collectFilters() {
  return {
    id_make: document.getElementById("brand")?.value || undefined,
    id_model: document.getElementById("model")?.value || undefined,
    yearproduction_from: document.getElementById("yearFrom")?.value || undefined,
    yearproduction_to: document.getElementById("yearTo")?.value || undefined,
    price_min: document.getElementById("priceMin")?.value || undefined,
    price_max: document.getElementById("priceMax")?.value || undefined
  };
}

function displayOffers(offers) {
@@ -31,65 +36,35 @@ function displayOffers(offers) {
    return;
  }

  offers.forEach(offer => {
    const d = offer.data || {};
  offers.forEach(o => {
    const d = o.data || {};
    const div = document.createElement("div");
    div.className = "offer-item";
    div.innerHTML = `
      <h2>${d.id_make || ""} ${d.id_model || ""}</h2>
      <img src="${d.mainimage || ""}" alt="miniatura auta" width="200">
      <p>${d.yearproduction || ""} • ${d.power || ""} KM • ${d.mileage || ""} km</p>
      <p>Cena: ${d.price || "brak"} PLN</p>
      <h2>${d.id_make || ''} ${d.id_model || ''}</h2>
      <img src="${d.mainimage || ''}" alt="miniatura auta" width="200">
      <p>${d.yearproduction || ''} • ${d.power || ''} KM • ${d.mileage || ''} km</p>
      <p>Cena: ${d.price || 'brak'} PLN</p>
    `;
    if (offer.id) {
    if (o.id) {
      div.addEventListener("click", () => {
        window.open(`https://oferta.amer-pol.com/oferta/${offer.id}`, "_blank");
        window.open("https://oferta.amer-pol.com/oferta/" + o.id, "_blank");
      });
    }
    container.appendChild(div);
  });
}

function populateFilters(offers) {
  const brandSelect = document.getElementById("brand");
  const modelSelect = document.getElementById("model");
  const brands = [...new Set(offers.map(o => o.data?.id_make).filter(Boolean))].sort();
  brandSelect.innerHTML = '<option value="">Wybierz markę</option>';
  brands.forEach(brand => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });
  brandSelect.addEventListener("change", () => {
    const selectedBrand = brandSelect.value;
    const models = [...new Set(offers
      .filter(o => o.data?.id_make === selectedBrand)
      .map(o => o.data?.id_model)
    )].filter(Boolean).sort();
    modelSelect.innerHTML = '<option value="">Wybierz model</option>';
    models.forEach(model => {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });
  });
  // Obsługa przycisku FILTRUJ
  document.getElementById("filter-button").addEventListener("click", () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;
    const filtered = offers.filter(o => {
      const d = o.data || {};
      return (!brand || d.id_make === brand) && (!model || d.id_model === model);
    });
    displayOffers(filtered.slice(0, 8));
  });
async function filterOffers() {
  const filters = collectFilters();
  const offers = await fetchOffersWithFilters(filters);
  displayOffers(offers);
}

// Start
loadInitialOffers();
document.getElementById("filter-button")?.addEventListener("click", filterOffers);
// Domyślne ładowanie 8 losowych ogłoszeń bez filtrowania na starcie
(async () => {
  const offers = await fetchOffersWithFilters();
  displayOffers(offers.slice(0, 8));
})();
0 commit comments
Comments
0 (0)

You're receiving notifications because you're subscribed to this thread.
Add files via upload · amerpolautocentrum/wtorek@f514136
