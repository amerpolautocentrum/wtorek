const accessToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIxMDg5MTM2NDIiLCJzY29wZSI6WyJhbGxlZ3JvOmFwaTpzYWxlOm9mZmVyczpyZWFkIl0sImFsbGVncm9fYXBpIjp0cnVlLCJpc3MiOiJodHRwczovL2FsbGVncm8ucGwiLCJleHAiOjE3NDA0NzEzMTksImp0aSI6IjAwYzQzZmJhLWVlYjUtNGQ3Yi1hMDc4LTQ4ZTgzY2MwODdkNCIsImNsaWVudF9pZCI6IjRhNjhkMDk0ZDljMjQ3NTRhNzBlNWY4MWVlNWIxMjQxIn0.zIuDmtfq7o-WXbMqQcQwYVOpcZ3WBrAh8HSf3OTNuP5gpp13METrCZu9mhaoUmu0oIeLM-jPKKHnvD2h85zNdcPAv6KV0xLKD-ZNY2jp61Oi0-VJYLveHoJjnC4lkm0QYmuRL1PVvtTSFCIf3fWCYvopjy2vCsXV_tyvbdMpVsawfLtW2cA6PqZPRnj7F4YFYtKq3S3trydz4e9uLT2UCXN3UT_njrEoEzwJBotnw1pYV2f1VDJS5RuPD1kGhAh3jG3FrHN1Vf1o4CyRM9zpl_KbBH3cMRpin2beYaN58qqy59YQa0uQC_InNvj3fAXN2tDw-dhKr0j4bGfxbDrO9g";

async function fetchOffers(offset = 0, limit = 6, filters = {}) {
    let url = `https://thingproxy.freeboard.io/fetch/https://api.allegro.pl/sale/offers?offset=${offset}&limit=${limit}&sort=-publication.start`;
    
    if (filters.brand) url += `&phrase=${encodeURIComponent(filters.brand)}`;
    if (filters.model) url += `&phrase=${encodeURIComponent(filters.brand + " " + filters.model)}`;
    if (filters.yearFrom) url += `¶meter.15326=${filters.yearFrom}`;
    if (filters.yearTo) url += `¶meter.15326=${filters.yearTo}`;
    if (filters.priceMin) url += `&price.from=${filters.priceMin}`;
    if (filters.priceMax) url += `&price.to=${filters.priceMax}`;

    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/vnd.allegro.public.v1+json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
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
    const data = await fetchOffers(0, 6);
    if (data.offers.length === 0) {
        document.getElementById("offers-container").innerHTML = "<p>Brak ofert do wyświetlenia.</p>";
        return;
    }
    displayOffers(data.offers);
    populateFiltersFromApi();
}

async function populateFiltersFromApi() {
    const data = await fetchOffers(0, 50);
    const offers = data.offers;

    const knownBrands = ["Alfa Romeo", "Volkswagen", "Volvo", "Land Rover"];
    const brands = [...new Set(offers.map(offer => {
        for (const brand of knownBrands) {
            if (offer.name.startsWith(brand)) return brand;
        }
        return offer.name.split(" ")[0];
    }))].sort();

    const brandSelect = document.getElementById("brand");
    brandSelect.innerHTML = '<option value="">Wybierz markę</option>';
    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    updateModels();

    const years = [...new Set(offers.map(offer => offer.name.match(/\d{4}/)?.[0]))].sort();
    const yearFromSelect = document.getElementById("yearFrom");
    const yearToSelect = document.getElementById("yearTo");
    yearFromSelect.innerHTML = '<option value="">Rocznik od</option>';
    yearToSelect.innerHTML = '<option value="">Rocznik do</option>';
    years.forEach(year => {
        yearFromSelect.innerHTML += `<option value="${year}">${year}</option>`;
        yearToSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });

    const prices = [...new Set(offers.map(offer => parseFloat(offer.sellingMode.price.amount)))].sort((a, b) => a - b);
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
        const div = document.createElement("div");
        div.className = "offer-item";
        div.innerHTML = `
            <h2>${offer.name}</h2>
            <img src="${offer.primaryImage.url}" alt="${offer.name}" width="200">
            <p>Cena: ${offer.sellingMode.price.amount} ${offer.sellingMode.price.currency}</p>
        `;
        div.addEventListener("click", () => {
            window.open(`https://allegro.pl/oferta/${offer.id}`, "_blank");
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
            const models = [...new Set(data.offers.map(offer => {
                const parts = offer.name.split(" ");
                const brandWords = brand.split(" ").length;
                let model = parts[brandWords];
                const nextPart = parts[brandWords + 1];
                if (nextPart && !/^\d{4}$/.test(nextPart)) model += " " + nextPart;
                return model;
            }))].sort();
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

    const data = await fetchOffers(0, 6, filters);
    displayOffers(data.offers);
}

loadInitialOffers();