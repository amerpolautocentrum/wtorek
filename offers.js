
function fillSelect(id, values, label) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = `<option value="">${label}</option>`;

  (values || []).forEach(v => {
    if (typeof v === "string" || typeof v === "number") {
      const option = document.createElement("option");
      option.value = v;
      option.textContent = typeof v === "string"
        ? v.charAt(0).toUpperCase() + v.slice(1)
        : v;
      select.appendChild(option);
    }
  });
}

let offersCache = [];

function populateDynamicFilters(offers, selectedBrand = null) {
  const models = new Set();
  const years = new Set();
  const prices = [];
  const debugModels = [];

  offers.forEach(o => {
    const d = o;

    if (!selectedBrand || d.id_make?.toLowerCase() === selectedBrand.toLowerCase()) {
      if (selectedBrand && d.id_make?.toLowerCase() === selectedBrand.toLowerCase()) {
        debugModels.push(d);
      }

      const model = d.id_model || d.model || d.title || d.description;
      if (model && typeof model === "string") {
        models.add(model.toLowerCase());
      }
    }

    if (d.yearproduction) years.add(parseInt(d.yearproduction));
    if (d.price) prices.push(parseFloat(d.price));
  });

  const sortedModels = [...models].sort();

  if (selectedBrand) {
    console.log(`🔍 Modele (z fallbackiem) dla marki ${selectedBrand}:`, sortedModels);
    console.log(`📦 Oferty marki ${selectedBrand} – pierwsze 3:`);
    console.log(debugModels.slice(0, 3));
  }

  const sortedYears = [...years].sort((a, b) => a - b);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  fillSelect("model", sortedModels, "Wybierz model");
  fillSelect("yearFrom", sortedYears, "Od roku");
  fillSelect("yearTo", sortedYears, "Do roku");

  const priceMinInput = document.getElementById("priceMin");
  const priceMaxInput = document.getElementById("priceMax");

  if (priceMinInput && priceMaxInput) {
    priceMinInput.placeholder = Math.floor(minPrice);
    priceMaxInput.placeholder = Math.ceil(maxPrice);
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

async function fetchFilteredOffers(filters = {}, page = 1) {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters, page })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Błąd pobierania ofert:", error);
    return { offers: {}, page: 1, pages: 1 };
  }
}

async function fetchAllPagesDynamic() {
  let allOffers = [];
  let result = await fetchFilteredOffers({}, 1);
  let pages = result.pages || 1;

  allOffers = Object.values(result.offers || {});

  for (let page = 2; page <= pages; page++) {
    const res = await fetchFilteredOffers({}, page);
    allOffers = allOffers.concat(Object.values(res.offers || {}));
  }

  return allOffers;
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
    const imageAlt = `Miniatura auta ${title}`;
    const year = d.yearproduction || '';
    const power = d.power || '';
    const mileage = d.mileage || '';
    const price = d.price || 'brak';

    div.innerHTML = `
      <h2>${title}</h2>
      <img src="${imageSrc}" alt="${imageAlt}" width="200">
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

async function fetchBrands() {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/brands", {
      method: "GET",
      mode: "cors"
    });
    return await response.json();
  } catch (e) {
    console.error("Błąd ładowania marek:", e);
    return [];
  }
}

async function filterOffers() {
  const filters = collectFilters();
  const result = await fetchFilteredOffers(filters);
  const offers = Object.values(result.offers || {});
  populateDynamicFilters(offers, filters.id_make);
  displayOffers(offers);
}

document.getElementById("filter-button")?.addEventListener("click", filterOffers);
document.getElementById("brand")?.addEventListener("change", () => {
  const selectedBrand = document.getElementById("brand")?.value;
  populateDynamicFilters(offersCache, selectedBrand);
});

(async function init() {
  const brands = await fetchBrands();
  fillSelect("brand", brands, "Wybierz markę");

  offersCache = await fetchAllPagesDynamic();
  populateDynamicFilters(offersCache);
})();
