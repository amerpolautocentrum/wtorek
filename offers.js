// Plik frontendowy: offers.js (do katalogu głównego, np. obok offers.html)

async function fetchOffers(offset = 0, limit = 8) {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const result = await response.json();
    return (result.full || []).slice(offset, offset + limit);
  } catch (error) {
    console.error("Błąd pobierania danych:", error);
    return [];
  }
}

async function loadInitialOffers() {
  const offers = await fetchOffers(0, 8);
  displayOffers(offers);
  populateFilters(offers);
}

function displayOffers(offers) {
  const container = document.getElementById("offers-container");
  container.innerHTML = "";

  if (!offers.length) {
    container.innerHTML = "<p>Brak ofert do wyświetlenia.</p>";
    return;
  }

  offers.forEach(offer => {
    const d = offer.data || {};
    const div = document.createElement("div");
    div.className = "offer-item";
    div.innerHTML = `
      <h2>${d.id_make || ""} ${d.id_model || ""}</h2>
      <img src="${d.mainimage || ""}" alt="miniatura auta" width="200">
      <p>${d.yearproduction || ""} • ${d.power || ""} KM • ${d.mileage || ""} km</p>
      <p>Cena: ${d.price || "brak"} PLN</p>
    `;
    if (offer.id) {
      div.addEventListener("click", () => {
        window.open(`https://oferta.amer-pol.com/oferta/${offer.id}`, "_blank");
      });
    }
    container.appendChild(div);
  });
}

function populateFilters(offers) {
  const brandSelect = document.getElementById("brand");
  const modelSelect = document.getElementById("model");
  const brands = [...new Set(offers.map(o => o.data?.id_make).filter(Boolean))].sort();

  brandSelect.innerHTML = '<option value="">Wybierz markę</option>';
  brands.forEach(brand => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });

  brandSelect.addEventListener("change", () => {
    const selectedBrand = brandSelect.value;
    const models = [...new Set(offers
      .filter(o => o.data?.id_make === selectedBrand)
      .map(o => o.data?.id_model)
    )].filter(Boolean).sort();

    modelSelect.innerHTML = '<option value="">Wybierz model</option>';
    models.forEach(model => {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });
  });

  // Obsługa przycisku FILTRUJ
  document.getElementById("filter-button").addEventListener("click", () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;
    const filtered = offers.filter(o => {
      const d = o.data || {};
      return (!brand || d.id_make === brand) && (!model || d.id_model === model);
    });
    displayOffers(filtered.slice(0, 8));
  });
}

// Start
loadInitialOffers();
