// Plik offers.js w katalogu głównym – obsługa filtrów i pobieranie ogłoszeń z API

async function fetchOffersWithFilters(filters = {}) {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters })
    });

    const result = await response.json();
    return result.full || [];
  } catch (error) {
    console.error("Błąd pobierania ofert:", error);
    return [];
  }
}

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
  const container = document.getElementById("offers-container");
  container.innerHTML = "";

  if (!offers.length) {
    container.innerHTML = "<p>Brak ofert do wyświetlenia.</p>";
    return;
  }

  offers.forEach(o => {
    const d = o.data || {};
    const div = document.createElement("div");
    div.className = "offer-item";
    div.innerHTML = `
      <h2>${d.id_make || ''} ${d.id_model || ''}</h2>
      <img src="${d.mainimage || ''}" alt="miniatura auta" width="200">
      <p>${d.yearproduction || ''} • ${d.power || ''} KM • ${d.mileage || ''} km</p>
      <p>Cena: ${d.price || 'brak'} PLN</p>
    `;
    if (o.id) {
      div.addEventListener("click", () => {
        window.open("https://oferta.amer-pol.com/oferta/" + o.id, "_blank");
      });
    }
    container.appendChild(div);
  });
}

async function filterOffers() {
  const filters = collectFilters();
  const offers = await fetchOffersWithFilters(filters);
  displayOffers(offers);
}

document.getElementById("filter-button")?.addEventListener("click", filterOffers);

// Domyślne ładowanie 8 losowych ogłoszeń bez filtrowania na starcie
(async () => {
  const offers = await fetchOffersWithFilters();
  displayOffers(offers.slice(0, 8));
})();
