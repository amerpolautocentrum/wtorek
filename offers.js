// Plik offers.js – dynamiczne filtrowanie danych ofert

let allOffers = [];

async function fetchOffersWithFilters(filters = {}) {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters })
    });

    const result = await response.json();
    allOffers = result.full || [];
    return allOffers;
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

function updateFilters() {
  const brandSelect = document.getElementById("brand");
  const modelSelect = document.getElementById("model");
  const yearFromSelect = document.getElementById("yearFrom");
  const yearToSelect = document.getElementById("yearTo");
  const priceMinSelect = document.getElementById("priceMin");
  const priceMaxSelect = document.getElementById("priceMax");

  const selectedBrand = brandSelect.value;
  const filtered = selectedBrand ? allOffers.filter(o => o.data?.id_make === selectedBrand) : allOffers;

  const unique = (arr, key) => [...new Set(arr.map(o => o.data?.[key]).filter(Boolean))].sort();

  // Modele
  modelSelect.innerHTML = '<option value="">Wybierz model</option>';
  unique(filtered, 'id_model').forEach(v => {
    modelSelect.innerHTML += `<option value="${v}">${v}</option>`;
  });

  // Roczniki
  yearFromSelect.innerHTML = '<option value="">Rocznik od</option>';
  yearToSelect.innerHTML = '<option value="">Rocznik do</option>';
  const years = unique(filtered, 'yearproduction');
  years.forEach(y => {
    yearFromSelect.innerHTML += `<option value="${y}">${y}</option>`;
    yearToSelect.innerHTML += `<option value="${y}">${y}</option>`;
  });

  // Ceny
  priceMinSelect.innerHTML = '<option value="">Cena min</option>';
  priceMaxSelect.innerHTML = '<option value="">Cena max</option>';
  const prices = unique(filtered, 'price');
  prices.forEach(p => {
    priceMinSelect.innerHTML += `<option value="${p}">${p}</option>`;
    priceMaxSelect.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

async function filterOffers() {
  const filters = collectFilters();
  const offers = allOffers.filter(o => {
    const d = o.data || {};
    return (!filters.id_make || d.id_make === filters.id_make) &&
           (!filters.id_model || d.id_model === filters.id_model) &&
           (!filters.yearproduction_from || parseInt(d.yearproduction) >= parseInt(filters.yearproduction_from)) &&
           (!filters.yearproduction_to || parseInt(d.yearproduction) <= parseInt(filters.yearproduction_to)) &&
           (!filters.price_min || parseInt(d.price) >= parseInt(filters.price_min)) &&
           (!filters.price_max || parseInt(d.price) <= parseInt(filters.price_max));
  });
  displayOffers(offers.slice(0, 6));
}

(async () => {
  const offers = await fetchOffersWithFilters();
  displayOffers(offers.slice(0, 6));

  // Marki
  const brandSelect = document.getElementById("brand");
  const brands = [...new Set(allOffers.map(o => o.data?.id_make).filter(Boolean))].sort();
  brands.forEach(b => {
    brandSelect.innerHTML += `<option value="${b}">${b}</option>`;
  });

  brandSelect.addEventListener("change", updateFilters);
})();

document.getElementById("filter-button")?.addEventListener("click", filterOffers);
