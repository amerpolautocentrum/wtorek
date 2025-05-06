// Plik offers.js – główne repozytorium, ładowanie ogłoszeń i filtrów

async function fetchOffers() {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const result = await response.json();
    return result.full || [];
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
  const makes = [...new Set(offers.map(o => o.data?.id_make).filter(Boolean))].sort();
  const models = [...new Set(offers.map(o => o.data?.id_model).filter(Boolean))].sort();
  const years = [...new Set(offers.map(o => parseInt(o.data?.yearproduction)).filter(Boolean))].sort((a, b) => a - b);
  const prices = offers.map(o => parseInt(o.data?.price)).filter(Boolean).sort((a, b) => a - b);

  const fill = (id, values, label) => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = `<option value="">${label}</option>`;
    values.forEach(val => {
      const option = document.createElement("option");
      option.value = val;
      option.textContent = val;
      select.appendChild(option);
    });
  };

  fill("brand", makes, "Wybierz markę");
  fill("model", models, "Wybierz model");
  fill("yearFrom", years, "Rocznik od");
  fill("yearTo", years.slice().reverse(), "Rocznik do");
  fill("priceMin", prices, "Cena min");
  fill("priceMax", prices.slice().reverse(), "Cena max");
}

(async () => {
  const offers = await fetchOffers();
  populateFilters(offers);
  const random = offers.sort(() => 0.5 - Math.random()).slice(0, 6);
  displayOffers(random);
})();
