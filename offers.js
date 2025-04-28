// Nowy offers.js dla FOX API

const foxApiUrl = "https://sandbox.44fox.com/m/openapi/offers";
const foxToken = "e370701bca9f24947ef8da6bc0813d9c1fdde2a7aa4bc328f0e329125659dc46"; // Twój token z sandboxa

async function fetchOffers(offset = 0, limit = 8, filters = {}) {
    let url = `${foxApiUrl}?offset=${offset}&limit=${limit}`;

    if (filters.brand) url += `&brand=${encodeURIComponent(filters.brand)}`;
    if (filters.model) url += `&model=${encodeURIComponent(filters.model)}`;
    if (filters.yearFrom) url += `&yearFrom=${filters.yearFrom}`;
    if (filters.yearTo) url += `&yearTo=${filters.yearTo}`;
    if (filters.priceMin) url += `&priceFrom=${filters.priceMin}`;
    if (filters.priceMax) url += `&priceTo=${filters.priceMax}`;

    console.log("Zapytanie do FOX API:", url);

    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${foxToken}`,
                "Accept": "application/json"
            }
        });
        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        const data = await response.json();
        console.log("Otrzymane dane:", data);
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
    populateFiltersFromApi();
}

async function populateFiltersFromApi() {
    const data = await fetchOffers(0, 50);
    const offers = data.offers;

    const brands = [...new Set(offers.map(offer => offer.brand))].filter(Boolean).sort();

    const brandSelect = document.getElementById("brand");
    brandSelect.innerHTML = '<option value="">Wybierz markę</option>';
    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    updateModels();

    const years = [...new Set(offers.map(offer => offer.year))].filter(Boolean).sort();
    const yearFromSelect = document.getElementById("yearFrom");
    const yearToSelect = document.getElementById("yearTo");
    yearFromSelect.innerHTML = '<option value="">Rocznik od</option>';
    yearToSelect.innerHTML = '<option value="">Rocznik do</option>';
    years.forEach(year => {
        yearFromSelect.innerHTML += `<option value="${year}">${year}</option>`;
        yearToSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });
}

function displayOffers(offers) {
    const container = document.getElementById("offers-container");
    container.innerHTML = "";

    offers.forEach(offer => {
        const div = document.createElement("div");
        div.className = "offer-item";
        div.innerHTML = `
            <h2>${offer.brand} ${offer.model}</h2>
            <img src="${offer.photos && offer.photos.length ? offer.photos[0].url : ''}" alt="${offer.brand} ${offer.model}" width="200">
            <p>Cena: ${offer.price} PLN</p>
            <p>Rocznik: ${offer.year}</p>
        `;
        div.addEventListener("click", () => {
            window.open(offer.link, "_blank");
        });
        container.appendChild(div);
    });
}

function updateModels() {
    const brand = document.getElementById("brand").value;
    const modelSelect = document.getElementById("model");
    modelSelect.innerHTML = '<option value="">Wybierz model</option>';

    if (brand) {
        fetchOffers(0, 50, { brand }).then(data => {
            const models = [...new Set(data.offers.map(offer => offer.model))].filter(Boolean).sort();
            models.forEach(model => {
                modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
            });
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

    const data = await fetchOffers(0, 8, filters);
    displayOffers(data.offers);
}

// Start
loadInitialOffers();
