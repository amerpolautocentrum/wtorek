const accessToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIxMDg5MTM2NDIiLCJzY29wZSI6WyJhbGxlZ3JvOmFwaTpzYWxlOm9mZmVyczpyZWFkIl0sImFsbGVncm9fYXBpIjp0cnVlLCJpc3MiOiJodHRwczovL2FsbGVncm8ucGwiLCJleHAiOjE3NDAyNDgyMDQsImp0aSI6ImY0MzMwYmZmLTFmMDEtNDQ0Yy1hODc5LTJjNGU4NDUxZGRjZiIsImNsaWVudF9pZCI6IjRhNjhkMDk0ZDljMjQ3NTRhNzBlNWY4MWVlNWIxMjQxIn0.HRwHaSQgV8h7FxRIkD6sLfokU8WIA3t27fixuJXKTLaXjsazZqdC9TwpvHgKzcN6YuXNpNZvK1OW-5i0P_Y3GS7IFuPxqfatrmDdEoIy88L93xP70XpJ3oesNyTLdaP4IWuPzhSQ4Q7LUGY4QLPqg8vyWiXkGnqwRqIbKG3Zdyhn1eUwusJZhWf7_yNEik1nNNFUq0vrbPZdeJJpsyslHMHl0UADXn5CB1Uf-GtAamnQH6ZZWNu9R2uMOKMMyPHUYx_1NVmM8jvkrZniVyeX5fYk4AyHJXDXdqdDIHg-WUtZtfSxRJCJBh5uSo5yCcdmLMPQzn-fGw1OPKnQSWuIVg";
let allOffers = [];

async function fetchOffers(offset = 0, limit = 100) {
    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.allegro.pl/sale/offers?offset=${offset}&limit=${limit}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/vnd.allegro.public.v1+json"
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Błąd podczas pobierania ofert:", error);
        return { offers: [] };
    }
}

async function loadAllOffers() {
    const limit = 100;
    let offset = 0;
    let totalCount = 0;

    do {
        const data = await fetchOffers(offset, limit);
        allOffers = allOffers.concat(data.offers);
        totalCount = data.totalCount || 0;
        offset += limit;
    } while (offset < totalCount && allOffers.length < totalCount);

    displayOffers(allOffers);
    populateFilters(allOffers);
}

function displayOffers(offers) {
    const container = document.getElementById("offers-container");
    container.innerHTML = "";
    offers.forEach(offer => {
        const div = document.createElement("div");
        div.innerHTML = `
            <h2>${offer.name}</h2>
            <img src="${offer.primaryImage.url}" alt="${offer.name}" width="200">
            <p>Cena: ${offer.sellingMode.price.amount} ${offer.sellingMode.price.currency}</p>
        `;
        container.appendChild(div);
    });
}

function populateFilters(offers) {
    // Marki
    const brands = [...new Set(offers.map(offer => offer.name.split(" ")[0]))];
    const brandSelect = document.getElementById("brand");
    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });

    // Początkowe modele (puste, aktualizowane w updateModels)
    updateModels();

    // Roczniki
    const years = [...new Set(offers.map(offer => offer.name.match(/\d{4}/)?.[0]))].sort();
    const yearFromSelect = document.getElementById("yearFrom");
    const yearToSelect = document.getElementById("yearTo");
    years.forEach(year => {
        const fromOption = document.createElement("option");
        fromOption.value = year;
        fromOption.textContent = year;
        yearFromSelect.appendChild(fromOption);

        const toOption = document.createElement("option");
        toOption.value = year;
        toOption.textContent = year;
        yearToSelect.appendChild(toOption);
    });

    // Ceny
    const prices = [...new Set(offers.map(offer => parseFloat(offer.sellingMode.price.amount)))].sort((a, b) => a - b);
    const priceMinSelect = document.getElementById("priceMin");
    const priceMaxSelect = document.getElementById("priceMax");
    prices.forEach(price => {
        const minOption = document.createElement("option");
        minOption.value = price;
        minOption.textContent = `${price} PLN`;
        priceMinSelect.appendChild(minOption);

        const maxOption = document.createElement("option");
        maxOption.value = price;
        maxOption.textContent = `${price} PLN`;
        priceMaxSelect.appendChild(maxOption);
    });
}

function updateModels() {
    const brand = document.getElementById("brand").value;
    const modelSelect = document.getElementById("model");
    modelSelect.innerHTML = '<option value="">Wybierz model</option>'; // Resetowanie listy

    if (brand) {
        const filteredOffers = allOffers.filter(offer => offer.name.startsWith(brand));
        // Wyciągamy modele bez roczników (np. "SQ5" zamiast "SQ5 2024")
        const models = [...new Set(filteredOffers.map(offer => {
            const parts = offer.name.split(" ");
            return parts[1]; // Bierzemy tylko drugi człon (np. "SQ5" z "Audi SQ5 2024")
        }))];
        models.forEach(model => {
            const option = document.createElement("option");
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
}

function filterOffers() {
    const brand = document.getElementById("brand").value;
    const model = document.getElementById("model").value;
    const yearFrom = document.getElementById("yearFrom").value;
    const yearTo = document.getElementById("yearTo").value;
    const priceMin = parseFloat(document.getElementById("priceMin").value) || 0;
    const priceMax = parseFloat(document.getElementById("priceMax").value) || Infinity;

    const filteredOffers = allOffers.filter(offer => {
        const title = offer.name;
        const price = parseFloat(offer.sellingMode.price.amount);
        const year = title.match(/\d{4}/)?.[0] || "";
        return (
            (!brand || title.includes(brand)) &&
            (!model || title.includes(model)) &&
            (!yearFrom || parseInt(year) >= parseInt(yearFrom)) &&
            (!yearTo || parseInt(year) <= parseInt(yearTo)) &&
            price >= priceMin &&
            price <= priceMax
        );
    });

    displayOffers(filteredOffers);
}

loadAllOffers();