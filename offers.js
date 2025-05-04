// Finalna wersja offers.js — z pełnymi danymi z FOX (przez proxy, każde ogłoszenie z /get)

const foxApiUrl = "https://api-offers.vercel.app/api/offers";

async function fetchOffers(offset = 0, limit = 8) {
    const body = {
        offset,
        limit
    };

    try {
        const response = await fetch(foxApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Błąd pobierania ofert:", error);
        return { offers: [] };
    }
}

async function loadInitialOffers() {
    const data = await fetchOffers(0, 8);
    if (!data.offers || data.offers.length === 0) {
        document.getElementById("offers-container").innerHTML = "<p>Brak ofert do wyświetlenia.</p>";
        return;
    }
    displayOffers(data.offers);
    populateFiltersFromApi(data.offers);
}

function populateFiltersFromApi(offers) {
    const brands = [...new Set(offers.map(offer => offer.data?.id_make))].filter(Boolean).sort();
    const brandSelect = document.getElementById("brand");
    brandSelect.innerHTML = '<option value="">Wybierz markę</option>';
    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    updateModels(offers);

    const years = [...new Set(offers.map(offer => offer.data?.yearproduction))].filter(Boolean).sort();
    const yearFromSelect = document.getElementById("yearFrom");
    const yearToSelect = document.getElementById("yearTo");
    yearFromSelect.innerHTML = '<option value="">Rocznik od</option>';
    yearToSelect.innerHTML = '<option value="">Rocznik do</option>';
    years.forEach(year => {
        yearFromSelect.innerHTML += `<option value="${year}">${year}</option>`;
        yearToSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });

    const prices = [...new Set(offers.map(offer => parseFloat(offer.data?.price)))].filter(n => !isNaN(n)).sort((a, b) => a - b);
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
        container.appendChild(div);
    });
}

function updateModels(offers) {
    const brand = document.getElementById("brand").value;
    const modelSelect = document.getElementById("model");
    modelSelect.innerHTML = '<option value="">Wybierz model</option>';

    if (brand) {
        const models = [...new Set(offers
            .filter(offer => offer.data?.id_make === brand)
            .map(offer => offer.data?.id_model))]
            .filter(Boolean).sort();

        models.forEach(model => {
            modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
        });
    }
}

async function filterOffers() {
    const filters = {
        brand: document.getElementById("brand").value,
        model: document.getElementById("model").value,
        yearFrom: document.getElementById("yearFrom").value,
        yearTo: document.getElementById("yearTo").value,
        priceMin: document.getElementById("priceMin").value,
        priceMax: document.getElementById("priceMax").value
    };

    const data = await fetchOffers(0, 50);
    const filtered = data.offers.filter(offer => {
        const d = offer.data || {};
        return (!filters.brand || d.id_make === filters.brand) &&
               (!filters.model || d.id_model === filters.model) &&
               (!filters.yearFrom || parseInt(d.yearproduction) >= parseInt(filters.yearFrom)) &&
               (!filters.yearTo || parseInt(d.yearproduction) <= parseInt(filters.yearTo)) &&
               (!filters.priceMin || parseFloat(d.price) >= parseFloat(filters.priceMin)) &&
               (!filters.priceMax || parseFloat(d.price) <= parseFloat(filters.priceMax));
    });

    displayOffers(filtered);
}

loadInitialOffers();
