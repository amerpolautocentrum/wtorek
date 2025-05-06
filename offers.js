// Plik offers.js – z dynamicznym filtrowaniem modeli na podstawie wybranej marki oraz pełnym pobieraniem ofert z API FOX

async function fetchAllOffers(pagesToFetch = 7) {
  let allOffers = [];

  for (let page = 1; page <= pagesToFetch; page++) {
    try {
      const response = await fetch("https://api-offers.vercel.app/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page })
      });

      const result = await response.json();
      const offersPage = Object.values(result.offers || {});
      allOffers = allOffers.concat(offersPage);
    } catch (error) {
      console.error("Błąd pobierania strony ofert:", error);
    }
  }

  return allOffers;
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
  const normalize = val => val?.toString().trim().toUpperCase();

  const years = [...new Set(offers.map(o => parseInt(o.data?.yearproduction)).filter(Boolean))].sort((a, b) => a - b);
  const prices = offers.map(o => parseInt(o.data?.price)).filter(Boolean).sort((a, b) => a - b);
  const makes = [...new Set(offers.map(o => normalize(o.data?.id_make)).filter(Boolean))].sort();

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
  fillSelect("yearFrom", years, "Rocznik od");
  fillSelect("yearTo", years.slice().reverse(), "Rocznik do");
  fillSelect("priceMin", prices, "Cena min");
  fillSelect("priceMax", prices.slice().reverse(), "Cena max");

  const brandSelect = document.getElementById("brand");
  brandSelect?.addEventListener("change", () => updateModels(offers));
  updateModels(offers); // wstępne wypełnienie modeli
}

function updateModels(offers) {
  const brand = document.getElementById("brand")?.value;
  const modelSelect = document.getElementById("model");
  modelSelect.innerHTML = '<option value="">Wybierz model</option>';
  if (!brand) return;

  const normalize = val => val?.toString().trim().toUpperCase();
  const models = [...new Set(offers
    .filter(o => normalize(o.data?.id_make) === normalize(brand))
    .map(o => normalize(o.data?.id_model))
  )].filter(Boolean).sort();

  models.forEach(model => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });
}

async function filterOffers() {
  const filters = collectFilters();
  const offers = await fetchAllOffers();
  const filtered = offers.filter(o => {
    const d = o.data || {};
    const normalize = val => val?.toString().trim().toUpperCase();
    return (!filters.id_make || normalize(d.id_make) === normalize(filters.id_make)) &&
           (!filters.id_model || normalize(d.id_model) === normalize(filters.id_model)) &&
           (!filters.yearproduction_from || parseInt(d.yearproduction) >= parseInt(filters.yearproduction_from)) &&
           (!filters.yearproduction_to || parseInt(d.yearproduction) <= parseInt(filters.yearproduction_to)) &&
           (!filters.price_min || parseInt(d.price) >= parseInt(filters.price_min)) &&
           (!filters.price_max || parseInt(d.price) <= parseInt(filters.price_max));
  });
  displayOffers(filtered);
}

document.getElementById("filter-button")?.addEventListener("click", filterOffers);

(async () => {
  const allOffers = await fetchAllOffers();
  populateFilters(allOffers);
  const shuffled = allOffers.sort(() => 0.5 - Math.random());
  displayOffers(shuffled.slice(0, 6));
})();
