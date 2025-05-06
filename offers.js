// Nowy plik offers.js z poprawioną logiką filtrów

let allOffers = [];

async function fetchAllOffers() {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const result = await response.json();
    return result.full || [];
  } catch (error) {
    console.error("Błąd pobierania ofert:", error);
    return [];
  }
}

function getUniqueSorted(values) {
  return [...new Set(values)].filter(Boolean).sort();
}

function populateFilters(offers) {
  const brandSelect = document.getElementById("brand");
  const modelSelect = document.getElementById("model");
  const yearFrom = document.getElementById("yearFrom");
  const yearTo = document.getElementById("yearTo");
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");

  const brands = getUniqueSorted(offers.map(o => o.data?.id_make));
  brandSelect.innerHTML = '<option value="">Wybierz markę</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join("");

  brandSelect.addEventListener("change", () => updateModelFilter(offers));

  updateModelFilter(offers);

  const years = getUniqueSorted(offers.map(o => o.data?.yearproduction));
  yearFrom.innerHTML = '<option value="">Rocznik od</option>' + years.map(y => `<option value="${y}">${y}</option>`).join("");
  yearTo.innerHTML = '<option value="">Rocznik do</option>' + years.map(y => `<option value="${y}">${y}</option>`).join("");

  const prices = getUniqueSorted(offers.map(o => parseInt(o.data?.price)).filter(p => !isNaN(p)));
  priceMin.innerHTML = '<option value="">Cena min</option>' + prices.map(p => `<option value="${p}">${p}</option>`).join("");
  priceMax.innerHTML = '<option value="">Cena max</option>' + prices.map(p => `<option value="${p}">${p}</option>`).join("");
}

function updateModelFilter(offers) {
  const selectedBrand = document.getElementById("brand").value;
  const modelSelect = document.getElementById("model");

  const models = getUniqueSorted(offers
    .filter(o => !selectedBrand || o.data?.id_make === selectedBrand)
    .map(o => o.data?.id_model));

  modelSelect.innerHTML = '<option value="">Wybierz model</option>' + models.map(m => `<option value="${m}">${m}</option>`).join("");
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

function collectFilters() {
  return {
    brand: document.getElementById("brand").value,
    model: document.getElementById("model").value,
    yearFrom: document.getElementById("yearFrom").value,
    yearTo: document.getElementById("yearTo").value,
    priceMin: document.getElementById("priceMin").value,
    priceMax: document.getElementById("priceMax").value
  };
}

function applyFilters(offers, filters) {
  return offers.filter(o => {
    const d = o.data || {};
    return (!filters.brand || d.id_make === filters.brand)
      && (!filters.model || d.id_model === filters.model)
      && (!filters.yearFrom || parseInt(d.yearproduction) >= parseInt(filters.yearFrom))
      && (!filters.yearTo || parseInt(d.yearproduction) <= parseInt(filters.yearTo))
      && (!filters.priceMin || parseInt(d.price) >= parseInt(filters.priceMin))
      && (!filters.priceMax || parseInt(d.price) <= parseInt(filters.priceMax));
  });
}

async function start() {
  allOffers = await fetchAllOffers();
  populateFilters(allOffers);
  displayOffers(shuffleArray(allOffers).slice(0, 6));

  document.getElementById("filter-button").addEventListener("click", () => {
    const filtered = applyFilters(allOffers, collectFilters());
    displayOffers(filtered);
  });
}

function shuffleArray(arr) {
  return arr.map(a => [Math.random(), a]).sort().map(a => a[1]);
}

start();
