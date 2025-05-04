
async function fetchOffers(offset = 0, limit = 8, filters = {}) {
    let url = "https://api-offers.vercel.app/api/offers";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });

        const result = await response.json();
        const offers = result.full || [];

        return offers.slice(offset, offset + limit);
    } catch (error) {
        console.error("Błąd pobierania ofert:", error);
        return [];
    }
}

async function loadInitialOffers() {
    const offers = await fetchOffers(0, 8);
    if (offers.length === 0) {
        document.getElementById("offers-container").innerHTML = "<p>Brak ofert do wyświetlenia.</p>";
        return;
    }
    displayOffers(offers);
    populateFiltersFromApi(offers);
}

function displayOffers(offers) {
    const container = document.getElementById("offers-container");
    container.innerHTML = "";

    offers.forEach(offer => {
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
            div.addEventListener("click", () => {
                window.open(\`https://oferta.amer-pol.com/oferta/${offer.id}\`, "_blank");
            });
        }
        container.appendChild(div);
    });
}

function populateFiltersFromApi(offers) {
    const knownBrands = [...new Set(offers.map(o => o.data?.id_make).filter(Boolean))].sort();
    const brandSelect = document.getElementById("brand");
    brandSelect.innerHTML = '<option value="">Wybierz markę</option>';
    knownBrands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    updateModels(offers);
}

function updateModels(offers) {
    const brand = document.getElementById("brand").value;
    const modelSelect = document.getElementById("model");
    modelSelect.innerHTML = '<option value="">Wybierz model</option>';

    const models = [...new Set(offers
        .filter(o => o.data?.id_make === brand)
        .map(o => o.data?.id_model)
    )].filter(Boolean).sort();

    models.forEach(model => {
        const option = document.createElement("option");
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });
}

async function filterOffers() {
    const selectedBrand = document.getElementById("brand").value;
    const selectedModel = document.getElementById("model").value;

    const offers = await fetchOffers(0, 50);
    const filtered = offers.filter(o => {
        const d = o.data || {};
        return (!selectedBrand || d.id_make === selectedBrand)
            && (!selectedModel || d.id_model === selectedModel);
    });

    displayOffers(filtered.slice(0, 8));
}

// Start
loadInitialOffers();
