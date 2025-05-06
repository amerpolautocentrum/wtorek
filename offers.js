// Plik offers.js do głównego repozytorium – ładowanie ogłoszeń i filtrowanie po marce

async function fetchOffers() {
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

function populateBrandFilter(offers) {
  const brandSelect = document.getElementById("brand");
  if (!brandSelect) return;
  const brands = [...new Set(offers.map(o => o.data?.id_make).filter(Boolean))].sort();
  brandSelect.innerHTML = '<option value="">Wybierz markę</option>';
  brands.forEach(brand => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });
}

function applyBrandFilter(offers) {
  const selectedBrand = document.getElementById("brand")?.value;
  const filtered = selectedBrand ? offers.filter(o => o.data?.id_make === selectedBrand) : offers;
  displayOffers(filtered.slice(0, 6));
}

document.getElementById("brand")?.addEventListener("change", async () => {
  const offers = await fetchOffers();
  applyBrandFilter(offers);
});

(async () => {
  const offers = await fetchOffers();
  populateBrandFilter(offers);
  const shuffled = offers.sort(() => 0.5 - Math.random());
  displayOffers(shuffled.slice(0, 6));
})();
