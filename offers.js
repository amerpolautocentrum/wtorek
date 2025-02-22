const accessToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIxMDg5MTM2NDIiLCJzY29wZSI6WyJhbGxlZ3JvOmFwaTpzYWxlOm9mZmVyczpyZWFkIl0sImFsbGVncm9fYXBpIjp0cnVlLCJpc3MiOiJodHRwczovL2FsbGVncm8ucGwiLCJleHAiOjE3NDAyNDgyMDQsImp0aSI6ImY0MzMwYmZmLTFmMDEtNDQ0Yy1hODc5LTJjNGU4NDUxZGRjZiIsImNsaWVudF9pZCI6IjRhNjhkMDk0ZDljMjQ3NTRhNzBlNWY4MWVlNWIxMjQxIn0.HRwHaSQgV8h7FxRIkD6sLfokU8WIA3t27fixuJXKTLaXjsazZqdC9TwpvHgKzcN6YuXNpNZvK1OW-5i0P_Y3GS7IFuPxqfatrmDdEoIy88L93xP70XpJ3oesNyTLdaP4IWuPzhSQ4Q7LUGY4QLPqg8vyWiXkGnqwRqIbKG3Zdyhn1eUwusJZhWf7_yNEik1nNNFUq0vrbPZdeJJpsyslHMHl0UADXn5CB1Uf-GtAamnQH6ZZWNu9R2uMOKMMyPHUYx_1NVmM8jvkrZniVyeX5fYk4AyHJXDXdqdDIHg-WUtZtfSxRJCJBh5uSo5yCcdmLMPQzn-fGw1OPKnQSWuIVg";
let allOffers = [];

async function fetchOffers(offset = 0, limit = 20) {
    try {
        const response = await fetch(`https://api.allegro.pl/sale/offers?offset=${offset}&limit=${limit}`, {
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
    const limit = 20;
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
    const brands = [...new Set(offers.map(offer => offer.name.split(" ")[0]))]; // Pobieramy markę z nazwy
    const brandSelect = document.getElementById("brand");
    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
}

function filterOffers() {
    const search = document.getElementById("search").value.toLowerCase();
    const brand = document.getElementById("brand").value;
    const minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
    const maxPrice = parseFloat(document.getElementById("maxPrice").value) || Infinity;

    const filteredOffers = allOffers.filter(offer => {
        const title = offer.name.toLowerCase();
        const price = parseFloat(offer.sellingMode.price.amount);
        const offerBrand = brand ? offer.name.includes(brand) : true;
        return (
            title.includes(search) &&
            offerBrand &&
            price >= minPrice &&
            price <= maxPrice
        );
    });

    displayOffers(filteredOffers);
}

loadAllOffers();