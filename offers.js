document.addEventListener("DOMContentLoaded", function () {
    const offersContainer = document.getElementById("offers-container");
    const brandFilter = document.getElementById("brand-filter");
    const yearFromFilter = document.getElementById("yearFrom");
    const yearToFilter = document.getElementById("yearTo");
    const priceMinFilter = document.getElementById("priceMin");
    const priceMaxFilter = document.getElementById("priceMax");
    const rssUrl = "https://allegro.pl/rss.php?feed=search&string=&user=amerpolautocentrum";
    let allOffers = [];

    async function fetchOffers() {
        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
            if (!response.ok) throw new Error("Nie udało się pobrać ofert");
            const data = await response.json();
            parseRSS(data.contents);
        } catch (error) {
            console.error("Błąd pobierania ofert:", error);
        }
    }

    function parseRSS(xmlString) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, "text/xml");
        const items = xml.querySelectorAll("item");
        
        allOffers = Array.from(items).map(item => {
            const title = item.querySelector("title")?.textContent || "Brak tytułu";
            const link = item.querySelector("link")?.textContent || "#";
            const image = item.querySelector("enclosure")?.getAttribute("url") || "https://via.placeholder.com/200";
            const priceMatch = item.querySelector("description")?.textContent.match(/\d+[,.]?\d*/);
            const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
            const yearMatch = title.match(/\d{4}/);
            const year = yearMatch ? yearMatch[0] : "";

            return { title, link, image, price, year };
        });

        displayOffers(allOffers.slice(0, 8));
        populateFilters();
    }

    function displayOffers(offers) {
        offersContainer.innerHTML = "";
        offers.forEach(offer => {
            const div = document.createElement("div");
            div.className = "offer-item";
            div.innerHTML = `
                <h2>${offer.title}</h2>
                <div class="offer-image">
                    <img src="${offer.image}" alt="${offer.title}" width="200">
                </div>
                <p class="offer-price">Cena: ${offer.price.toFixed(2)} PLN</p>
                <button class="offer-button" onclick="window.open('${offer.link}', '_blank')">Zobacz ofertę</button>
            `;
            offersContainer.appendChild(div);
        });
    }

    function populateFilters() {
        const brands = [...new Set(allOffers.map(offer => offer.title.split(" ")[0]))].sort();
        brandFilter.innerHTML = '<option value="">Wybierz markę</option>';
        brands.forEach(brand => {
            const option = document.createElement("option");
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });

        const years = [...new Set(allOffers.map(offer => offer.year).filter(y => y))].sort();
        yearFromFilter.innerHTML = '<option value="">Rocznik od</option>';
        yearToFilter.innerHTML = '<option value="">Rocznik do</option>';
        years.forEach(year => {
            yearFromFilter.innerHTML += `<option value="${year}">${year}</option>`;
            yearToFilter.innerHTML += `<option value="${year}">${year}</option>`;
        });

        const prices = [...new Set(allOffers.map(offer => offer.price))].sort((a, b) => a - b);
        priceMinFilter.innerHTML = '<option value="">Cena min</option>';
        priceMaxFilter.innerHTML = '<option value="">Cena max</option>';
        prices.forEach(price => {
            priceMinFilter.innerHTML += `<option value="${price}">${price.toFixed(2)} PLN</option>`;
            priceMaxFilter.innerHTML += `<option value="${price}">${price.toFixed(2)} PLN</option>`;
        });
    }

    function filterOffers() {
        const brand = brandFilter.value;
        const yearFrom = parseInt(yearFromFilter.value) || 0;
        const yearTo = parseInt(yearToFilter.value) || Infinity;
        const priceMin = parseFloat(priceMinFilter.value) || 0;
        const priceMax = parseFloat(priceMaxFilter.value) || Infinity;

        const filteredOffers = allOffers.filter(offer => {
            const year = parseInt(offer.year) || 0;
            return (
                (!brand || offer.title.startsWith(brand)) &&
                (year >= yearFrom && year <= yearTo) &&
                (offer.price >= priceMin && offer.price <= priceMax)
            );
        });

        displayOffers(filteredOffers);
    }

    brandFilter.addEventListener("change", filterOffers);
    yearFromFilter.addEventListener("change", filterOffers);
    yearToFilter.addEventListener("change", filterOffers);
    priceMinFilter.addEventListener("change", filterOffers);
    priceMaxFilter.addEventListener("change", filterOffers);

    fetchOffers();
});
