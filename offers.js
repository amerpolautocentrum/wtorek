// Plik offers.js – wersja z ładowaniem filtrów z gotowej listy marek

const markiFox = [
  "audi", "bmw", "chevrolet", "chrysler", "citroen", "cupra", "dacia", "daewoo", "daihatsu", "dodge",
  "fiat", "ford", "gmc", "honda", "hummer", "hyundai", "infiniti", "jaguar", "jeep", "kia",
  "lancia", "land-rover", "lexus", "lincoln", "mazda", "mercedes-benz", "mg", "mini", "mitsubishi", "nissan",
  "opel", "peugeot", "pontiac", "porsche", "renault", "rolls-royce", "rover", "saab", "seat", "skoda",
  "smart", "ssangyong", "subaru", "suzuki", "tesla", "toyota", "volkswagen", "volvo"
];

function populateStaticFilters() {
  const fillSelect = (id, values, label) => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = `<option value="">${label}</option>`;
    values.forEach(v => {
      const option = document.createElement("option");
      option.value = v;
      option.textContent = v.charAt(0).toUpperCase() + v.slice(1);
      select.appendChild(option);
    });
  };

  fillSelect("brand", markiFox, "Wybierz markę");
  // Modele, roczniki, ceny zostaną wypełnione po kliknięciu FILTRUJ, gdy znamy markę/model
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
    div.innerHTML = `
      <h2>${d.id_make || ''} ${d.id_model || ''}</h2>
      <img src="${d.mainimage?.[0]?.source || 'https://via.placeholder.com/200'}" alt="miniatura auta" width="200">
      <p>${d.yearproduction || ''} • ${d.power || ''} KM • ${d.mileage || ''} km</p>
      <p>Cena: ${d.price || 'brak'} PLN</p>
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
  displayOffers(offers);
}

document.getElementById("filter-button")?.addEventListener("click", filterOffers);

// Inicjalizacja – tylko lista marek
populateStaticFilters();
