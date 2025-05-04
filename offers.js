const foxApiUrl = "https://api-offers.vercel.app/api/offers";

async function fetchOffers() {
  try {
    const response = await fetch(foxApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offset: 0, limit: 8 })
    });

    const data = await response.json();
    return data.full || [];
  } catch (err) {
    console.error("Błąd pobierania ofert:", err);
    return [];
  }
}

function displayOffers(offers) {
  const container = document.getElementById("offers-container");
  container.innerHTML = "";

  offers.forEach((offer) => {
    const d = offer.data || {};
    const div = document.createElement("div");
    div.className = "offer-item";
    div.innerHTML = `
      <h2>${d.id_make || ''} ${d.id_model || ''}</h2>
      <img src="${d.mainimage || ''}" alt="miniatura auta" width="200">
      <p>${d.yearproduction || ''} • ${d.power || ''} KM • ${d.mileage || ''} km</p>
      <p>Cena: ${d.price || 'brak'} PLN</p>
    `;
    if (offer.id) {
      const url = `https://oferta.amer-pol.com/oferta/${offer.id}`;
      div.addEventListener("click", () => {
        window.open(url, "_blank");
      });
    }
    container.appendChild(div);
  });
}

(async () => {
  const offers = await fetchOffers();
  displayOffers(offers);
})();
