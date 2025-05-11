
let allOffers = [];

function fillSelect(id, values, label) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = `<option value="">${label}</option>`;
  (values || []).forEach(v => {
    if (typeof v === "string" || typeof v === "number") {
      const option = document.createElement("option");
      option.value = v;
      option.textContent = v;
      select.appendChild(option);
    }
  });
}

function updateModelOptions(brand) {
  const models = [...new Set(
    allOffers
      .filter(o => o.id_make?.toLowerCase() === brand.toLowerCase())
      .map(o => o.id_model?.toLowerCase())
      .filter(Boolean)
  )].sort();
  fillSelect("model", models, "Wybierz model");

  updateYearAndPriceFilters(brand);
}

function updateYearAndPriceFilters(brand = null) {
  const filtered = brand
    ? allOffers.filter(o => o.id_make?.toLowerCase() === brand.toLowerCase())
    : allOffers;

  const years = [...new Set(filtered.map(o => parseInt(o.yearproduction)).filter(Boolean))].sort((a, b) => a - b);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  fillSelect("yearFrom", years, "Od roku");
  fillSelect("yearTo", years.slice().reverse(), "Do roku");

  const prices = filtered
    .map(o => parseInt(o.price))
    .filter(p => !isNaN(p));
  const minPrice = Math.floor(Math.min(...prices || [0]) / 5000) * 5000;
  const maxPrice = Math.ceil(Math.max(...prices || [50000]) / 5000) * 5000;

  const priceSteps = [];
  for (let p = minPrice; p <= maxPrice; p += 5000) {
    priceSteps.push(p);
  }

  fillSelect("priceMin", priceSteps, "Cena od");
  fillSelect("priceMax", priceSteps.slice().reverse(), "Cena do");
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

function filterOffersLocally(filters = {}) {
  return allOffers.filter(o => {
    const makeOk = !filters.id_make || o.id_make?.toLowerCase() === filters.id_make.toLowerCase();
    const modelOk = !filters.id_model || o.id_model?.toLowerCase() === filters.id_model.toLowerCase();
    const year = parseInt(o.yearproduction);
    const price = parseInt(o.price);
    const yearOk = (!filters.yearproduction_from || year >= parseInt(filters.yearproduction_from)) &&
                   (!filters.yearproduction_to || year <= parseInt(filters.yearproduction_to));
    const priceOk = (!filters.price_min || price >= parseInt(filters.price_min)) &&
                    (!filters.price_max || price <= parseInt(filters.price_max));
    return makeOk && modelOk && yearOk && priceOk;
  });
}

function displayOffers(offers) {
  const container = document.getElementById("offers-container");
  container.innerHTML = "";

  if (!offers.length) {
    container.innerHTML = "<p>Brak ofert do wyświetlenia.</p>";
    return;
  }

  offers.forEach(o => {
    const d = o;
    const div = document.createElement("div");
    div.className = "offer-item";

    const title = `${d.id_make || ''} ${d.id_model || ''}`;
    const imageSrc = d.mainimage?.[0]?.source || 'https://via.placeholder.com/200';
    const year = d.yearproduction || '';
    const power = d.power || '';
    const mileage = d.mileage || '';
    const price = d.price || 'brak';

    div.innerHTML = `
      <h2>${title}</h2>
      <img src="${imageSrc}" alt="Miniatura auta" width="200">
      <p>${year} • ${power} KM • ${mileage} km</p>
      <p>Cena: ${price} PLN</p>
    `;

    if (o.id) {
      div.addEventListener("click", () => {
        window.open("https://oferta.amer-pol.com/m/komis-offer/index/" + o.id, "_blank");
      });
    }

    container.appendChild(div);
  });
}

async function initFiltersAndOffers() {
  try {
    const response = await fetch("/all-offers.json");
    allOffers = await response.json();

    const brands = [...new Set(allOffers.map(o => o.id_make?.toLowerCase()).filter(Boolean))].sort();
    fillSelect("brand", brands, "Wybierz markę");

    updateYearAndPriceFilters();
    const sorted = allOffers.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    displayOffers(sorted.slice(0, 8));
  } catch (e) {
    console.error("Błąd ładowania all-offers.json:", e);
  }
}

function filterOffers() {
  const filters = collectFilters();
  const filtered = filterOffersLocally(filters);
  displayOffers(filtered);
}

document.getElementById("filter-button")?.addEventListener("click", filterOffers);
document.getElementById("brand")?.addEventListener("change", () => {
  const selectedBrand = document.getElementById("brand")?.value;
  updateModelOptions(selectedBrand);
});

(async function init() {
  await initFiltersAndOffers();
})();
