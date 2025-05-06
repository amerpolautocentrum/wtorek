// Plik offers.js – aktualna wersja obsługująca poprawnie dane z API FOX

async function fetchOffersWithFilters(filters = {}) {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const result = await response.json();
    console.log("SUROWA ODPOWIEDŹ Z API:", result);
    return Object.values(result.offers || {});
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
  displayOffers(offers);
}

document.getElementById("filter-button")?.addEventListener("click", filterOffers);

(async () => {
  const allOffers = await fetchOffersWithFilters();
  populateFilters(allOffers);
  const shuffled = allOffers.sort(() => 0.5 - Math.random());
  displayOffers(shuffled.slice(0, 6));
})();
