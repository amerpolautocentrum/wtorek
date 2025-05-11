let offersCache = [];
let brandModelMap = {};

function fillSelect(id, values, label) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = `<option value="">${label}</option>`;
  (values || []).forEach(v => {
    if (typeof v === "string" || typeof v === "number") {
      const option = document.createElement("option");
      option.value = v;
      option.textContent = v.charAt(0).toUpperCase() + v.slice(1);
      select.appendChild(option);
    }
  });
}

function updateModelOptions(brand) {
  fetch("https://api-offers.vercel.app/api/models?brand=" + encodeURIComponent(brand))
    .then(res => res.json())
    .then(models => {
      brandModelMap[brand.toLowerCase()] = models;
      fillSelect("model", models, "Wybierz model");
    })
    .catch(e => console.error("Błąd ładowania modeli:", e));
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

async function initFilters() {
  try {
    const res = await fetch("https://api-offers.vercel.app/api/brands");
    const brands = await res.json();
    fillSelect("brand", brands.sort(), "Wybierz markę");
  } catch (e) {
    console.error("Błąd ładowania marek:", e);
  }
}

async function filterOffers() {
  const filters = collectFilters();
  const result = await fetchFilteredOffers(filters);
  const offers = Object.values(result.offers || {});
  displayOffers(offers);
}

document.getElementById("filter-button")?.addEventListener("click", filterOffers);
document.getElementById("brand")?.addEventListener("change", () => {
  const selectedBrand = document.getElementById("brand")?.value;
  if (selectedBrand) {
    updateModelOptions(selectedBrand);
  }
});

(async function init() {
  await initFilters();
})();
