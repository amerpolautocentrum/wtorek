const accessToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIxMDg5MTM2NDIiLCJzY29wZSI6WyJhbGxlZ3JvOmFwaTpzYWxlOm9mZmVyczpyZWFkIl0sImFsbGVncm9fYXBpIjp0cnVlLCJpc3MiOiJodHRwczovL2FsbGVncm8ucGwiLCJleHAiOjE3NDAzNDkwNTMsImp0aSI6IjI5MzM0MWNiLWE0NGItNDQ2NS1hYjFkLWE5ODliMzMwNGI5NSIsImNsaWVudF9pZCI6IjRhNjhkMDk0ZDljMjQ3NTRhNzBlNWY4MWVlNWIxMjQxIn0.iBMLZGQzNJkY4FGo9THHeDeATP9eVVRHojlYLNrhnXGaRewJVJWeg095KgpnCr1fIVhrHDTKmNL74uyy-NKNrvz134LnPzlodBOrHVQNsTlsO--wO6YjyC6hdbj3nCyG34esG6N6yo2ZgWp2NpdfHP11GdDgg1LnPdb-7MRHvw4eiS-EbYBgNl3Q3ckTw6jA4iHgAMEALrwmILNaswJY-Q2fGmCbn90HE4id1QuBs2YPM_QgococJCj-KPhgErw2x2mUzW7k0HZEssbp-KWYu7N8EmdC3jpPklYWts3cjoVD8xs0guewBqw4T2HQTjyTaBzyh_aOdsXbRTiTrd9UYw";
let allOffers = [];

async function fetchOffers(offset = 0, limit = 200, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.allegro.pl/sale/offers?offset=${offset}&limit=${limit}&sort=-publication.start`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "application/vnd.allegro.public.v1+json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Origin": "https://amerpolautocentrum.github.io",
                    "Referer": "https://amerpolautocentrum.github.io/wtorek/offers.html"
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const text = await response.text();
            console.log(`Próba ${attempt} - Surowa odpowiedź serwera (offset=${offset}):`, text);
            const data = JSON.parse(text);
            return data;
        } catch (error) {
            console.error(`Próba ${attempt} nieudana - Błąd podczas pobierania ofert:`, error);
            if (attempt === retries) {
                console.error("Wyczerpano próby pobierania ofert!");
                return { offers: [] };
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

async function loadAllOffers() {
    // Pierwsze żądanie – 50 ofert na start dla różnorodnych filtrów
    const firstBatch = await fetchOffers(0, 50);
    allOffers = firstBatch.offers;
    if (allOffers.length === 0) {
        console.error("Brak ofert do wyświetlenia!");
        document.getElementById("offers-container").innerHTML = "<p>Brak ofert do wyświetlenia. Sprawdź token lub połączenie.</p>";
        return;
    }

    // Wyświetlamy 8 ofert, ale filtry od razu mają 50
    displayOffers(allOffers.slice(0, 8));
    populateFilters(allOffers);

    // Pobieramy resztę w tle (limit 100)
    const limit = 100;
    let offset = limit;
    const totalCount = firstBatch.totalCount || 0;

    while (offset < totalCount && allOffers.length < totalCount) {
        const data = await fetchOffers(offset, limit);
        allOffers = allOffers.concat(data.offers);
        offset += limit;
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1,5 sekundy odstępu
    }

    // Aktualizujemy filtry po pełnym załadowaniu
    populateFilters(allOffers);
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
    const knownBrands = ["Alfa Romeo", "Volkswagen", "Volvo", "Land Rover"];
    const brands = [...new Set(offers.map(offer => {
        const parts = offer.name.split(" ");
        for (const brand of knownBrands) {
            if (offer.name.startsWith(brand)) {
                return brand;
            }
        }
        return parts[0];
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
    priceMinSelect.innerHTML = '<option value="">Cena min</option>';
    priceMaxSelect.innerHTML = '<option value="">Cena max</option>';
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
            const brandWords = brand.split(" ").length;
            let model = parts[brandWords];
            const nextPart = parts[brandWords + 1];
            if (nextPart && !/^\d{4}$/.test(nextPart)) {
                model += " " + nextPart;
            }
            return model;
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
            (!brand || title.startsWith(brand)) &&
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