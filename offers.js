const accessToken = "TWÓJ_NOWY_ACCESS_TOKEN"; // Wstaw nowy token z Postmana
let allOffers = [];

async function fetchOffers(offset = 0, limit = 100) {
    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.allegro.pl/sale/offers?offset=${offset}&limit=${limit}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/vnd.allegro.public.v1+json"
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Logujemy surową odpowiedź, aby zobaczyć, co zwraca serwer
        const text = await response.text();
        console.log("Surowa odpowiedź serwera:", text);
        const data = JSON.parse(text); // Tutaj może wystąpić błąd, jeśli text nie jest JSON-em
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

    if (allOffers.length === 0) {
        console.error("Brak ofert do wyświetlenia!");
        document.getElementById("offers-container").innerHTML = "<p>Brak ofert do wyświetlenia. Sprawdź token lub połączenie.</p>";
    } else {
        displayOffers(allOffers);
        populateFilters(allOffers);
    }
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

function populateFilters(offers) {
    const brands = [...new Set(offers.map(offer => offer.name.split(" ")[0]))].sort();
    const brandSelect = document.getElementById("brand");
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
    modelSelect.innerHTML = '<option value="">Wybierz model</option>';

    if (brand) {
        const filteredOffers = allOffers.filter(offer => offer.name.startsWith(brand));
        const models = [...new Set(filteredOffers.map(offer => {
            const parts = offer.name.split(" ");
            return parts[1];
        }))].sort();
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