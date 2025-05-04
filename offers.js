// Finalna wersja offers.js — 8 ogłoszeń + filtry z przekierowaniem na stronę oferty

const foxApiUrl = "https://api-offers.vercel.app/api/offers";

async function fetchOffers(offset = 0, limit = 8) {
    try {
        const response = await fetch(foxApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ offset, limit })
        });

        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Błąd pobierania ofert:", error);
        return { full: [], all: [] };
    }
}

let allOffers = [];

async function loadInitialOffers() {
    const data = await fetchOffers(0, 8);
    if (!data.full || data.full.length === 0) {
        document.getElementById("offers-container").innerHTML = "<p>Brak ofert do wyświetlenia.</p>";
        return;
    }
    allOffers = data.all;
    displayOffers(data.full);
    populateFiltersFromApi(data.all);
}

function populateFiltersFromApi(offers) {
    const brands = [...new Set(offers.map(offer => offer.id_make))].filter(Boolean).sort();
    const brandSelect = document.getElementById("brand");
    brandSelect.innerHTML = '<option value="">Wybierz markę</option>';
    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    updateModels();

    const years = [...new Set(offers.map(offer => offer.yearproduction))].filter(Boolean).sort();
    const yearFromSelect = document.getElementById("yearFrom");
    const yearToSelect = document.getElementById("yearTo");
    yearFromSelect.innerHTML = '<option value="">Rocznik od</option>';
    yearToSelect.innerHTML = '<option value="">Rocznik do</option>';
    years.forEach(year => {
        yearFromSelect.innerHTML += `<option value="${year}">${year}</option>`;
        yearToSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });

    const prices = [...new Set(offers.map(offer => parseFloat(offer.price)))].filter(n => !isNaN(n)).sort((a, b) => a - b);
    const priceMinSelect = document.getElementById("priceMin");
    const priceMaxSelect = document.getElementById("priceMax");
    priceMinSelect.innerHTML = '<option value="">Cena min</option>';
    priceMaxSelect.innerHTML = '<option value="">Cena max</option>';
    prices.forEach(price => {
        priceMinSelect.innerHTML += `<option value="${price}">${price} PLN</option>`;
        priceMaxSelect.innerHTML += `<option value="${price}">${price} PLN</option>`;
    });
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
            <img src="${d.mainimage || ''}" alt="${d.title || ''}" width="200">
            <p>${d.yearproduction || ''} • ${d.power || ''} KM • ${d.mileage || ''} km</p>
            <p>Cena: ${d.price || 'brak'} ${d.currency?.toUpperCase() || ''}</p>
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

function updateModels() {
    const brand = document.getElementById("brand").value;
    const modelSelect = document.getElementById("model");
    modelSelect.innerHTML = '<option value="">Wybierz model</option>';

    if (brand) {
        const models = [...new Set(allOffers
            .filter(offer => offer.id_make === brand)
            .map(offer => offer.id_model))]
            .filter(Boolean).sort();

        models.forEach(model => {
            modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
        });
    }
}

document.getElementById("brand").addEventListener("change", updateModels);

document.getElementById("filter-button").addEventListener("click", async () => {
    const filters = {
        brand: document.getElementById("brand").value,
        model: document.getElementById("model").value,
        yearFrom: document.getElementById("yearFrom").value,
        yearTo: document.getElementById("yearTo").value,
        priceMin: document.getElementById("priceMin").value,
        priceMax: document.getElementById("priceMax").value
    };

    const data = await fetchOffers(0, 50);
    const filtered = data.full.filter(offer => {
        const d = offer.data || {};
        return (!filters.brand || d.id_make === filters.brand) &&
               (!filters.model || d.id_model === filters.model) &&
               (!filters.yearFrom || parseInt(d.yearproduction) >= parseInt(filters.yearFrom)) &&
               (!filters.yearTo || parseInt(d.yearproduction) <= parseInt(filters.yearTo)) &&
               (!filters.priceMin || parseFloat(d.price) >= parseFloat(filters.priceMin)) &&
               (!filters.priceMax || parseFloat(d.price) <= parseFloat(filters.priceMax));
    });

    displayOffers(filtered);
});

loadInitialOffers();
