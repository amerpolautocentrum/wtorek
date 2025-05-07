
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

function populateDynamicFilters(offers) {
  const brands = new Set();
  const models = new Set();
  const years = new Set();
  const prices = [];

  offers.forEach(o => {
    const d = o.data || o;

    if (d.id_make && typeof d.id_make === "string") {
      brands.add(d.id_make.toLowerCase());
    }

    if (d.id_model && typeof d.id_model === "string") {
      models.add(d.id_model);
    }

    if (d.yearproduction) years.add(parseInt(d.yearproduction));
    if (d.price) prices.push(parseFloat(d.price));
  });

  const sortedBrands = [...brands].sort();
  const sortedModels = [...models].sort();
  const sortedYears = [...years].sort((a, b) => a - b);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  fillSelect("brand", sortedBrands, "Wybierz markę");
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

async function fetchFilteredOffers(filters = {}) {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters })
    });
    const result = await response.json();
    return Object.values(result.offers || {});
  } catch (error) {
    console.error("Błąd pobierania ofert:", error);
    return [];
  }
}

function displayOffers(offers) {
  const container = document.getElementById("offers-container");
  container.innerHTML = "";

  if (!offers.length) {
    container.innerHTML = "<p>Brak ofert do wyświetlenia.</p>";
    return;
  }

  offers.forEach(o => {
    const d = o.data || o;
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

async function filterOffers() {
  const filters = collectFilters();
  const offers = await fetchFilteredOffers(filters);
  populateDynamicFilters(offers);
  displayOffers(offers);
}

document.getElementById("filter-button")?.addEventListener("click", filterOffers);

(async function init() {
  const allOffers = await fetchFilteredOffers();
  populateDynamicFilters(allOffers);
})();
