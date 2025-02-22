const accessToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIxMDg5MTM2NDIiLCJzY29wZSI6WyJhbGxlZ3JvOmFwaTpzYWxlOm9mZmVyczpyZWFkIl0sImFsbGVncm9fYXBpIjp0cnVlLCJpc3MiOiJodHRwczovL2FsbGVncm8ucGwiLCJleHAiOjE3NDAyNjQ5MjcsImp0aSI6IjdjYjExYmE3LTQ0YWMtNGQxYS04OTY5LWU5NDgzOTE2YjUzNCIsImNsaWVudF9pZCI6IjRhNjhkMDk0ZDljMjQ3NTRhNzBlNWY4MWVlNWIxMjQxIn0.7MLLlGrm4Tg7F_OPPnupAaIDdsA8Y9CfakK6W62qa-M6IjO-xBBPDI9YCAYdmsoMBzyhirr13uQ51LD9ybs3dls6UDiIz9T_CZ6PpFk_xPyLMjzWB3f7xIXCiLgW9qRNuaqsadJuytWB61y-8Q2HTT4CHrPU-SFsum74bRuRhy0goxuHmx6E-9FtQC2YAoJDgf_o0ouRJlQtol1Gv12hf8MuRAmrPwt0M4x0XIExaspltmq4j6_9tH4jYjZlVqsMaL-UYvixIGiXxQVI1jsyjP5wG-EhWmPGBBxHdBkidaWJH98YFAsYG_aOzp1z2mOY2k9cI9n72BT2xzp2Xsq1sA";
let allOffers = [];

async function fetchOffers(offset = 0, limit = 100) {
    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.allegro.pl/sale/offers?offset=${offset}&limit=${limit}&sort=-publication.start`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/vnd.allegro.public.v1+json"
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text();
        console.log("Surowa odpowiedź serwera:", text);
        const data = JSON.parse(text);
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

    // Pobieramy wszystkie oferty
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
        // Sortujemy po dacie publikacji i bierzemy 8 najnowszych
        const latestOffers = allOffers
            .sort((a, b) => new Date(b.publication.startedAt) - new Date(a.publication.startedAt))
            .slice(0, 8);
        displayOffers(latestOffers); // Wyświetlamy tylko 8
        populateFilters(allOffers); // Filtry na wszystkich ofertach
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