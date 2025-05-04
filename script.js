const apiUrl = '/api/offers'; // Endpoint Vercela, zmień na właściwy, jeśli inny

// Funkcja do pobierania danych z API
async function fetchListings(params = {}) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account: {
                    token: '3f559f0bdd542b4b0348459dce190878271d3afcce65ab602fd327c18b64ea90' // Zastąp swoim tokenem
                },
                data: {
                    detaillevel: 'simple',
                    visible: 1,
                    sold: 0,
                    source: 'my',
                    page: 1,
                    limit: 30,
                    ...params
                }
            })
        });
        if (!response.ok) {
            throw new Error('Błąd podczas pobierania danych');
        }
        const data = await response.json();
        return data.offers || []; // Zwraca listę ofert
    } catch (error) {
        console.error('Błąd:', error);
        return [];
    }
}

// Funkcja do wyświetlania ogłoszeń
function displayListings(listings, containerId, limit = null) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (listings.length === 0) {
        container.innerHTML = '<p>Brak ogłoszeń spełniających kryteria.</p>';
        return;
    }

    const displayCount = limit ? Math.min(listings.length, limit) : listings.length;
    const displayListings = listings.slice(0, displayCount);

    displayListings.forEach(listing => {
        const div = document.createElement('div');
        div.className = 'listing';
        div.innerHTML = `
            <img src="${listing.mainimage || 'placeholder.jpg'}" alt="${listing.id_make} ${listing.id_model}">
            <div class="listing-content">
                <h3>${listing.id_make} ${listing.id_model}</h3>
                <p>Rok: ${listing.yearproduction}</p>
                <p>Cena: ${listing.price} ${listing.currency.toUpperCase()}</p>
            </div>
        `;
        div.addEventListener('click', () => {
            window.open(listing.url, '_blank'); // Przekierowanie do FOX
        });
        container.appendChild(div);
    });
}

// Funkcja do filtrowania ogłoszeń
async function filterListings(filters) {
    const params = {};
    if (filters.brand) params.id_make = filters.brand;
    if (filters.priceMin) params.price_min = filters.priceMin;
    if (filters.priceMax) params.price_max = filters.priceMax;
    if (filters.year) params.yearproduction_min = filters.year;

    const listings = await fetchListings(params);
    displayListings(listings, 'filtered-listings');
}

// Inicjalne ładowanie 8 przykładowych ogłoszeń
window.addEventListener('load', async () => {
    const listings = await fetchListings({ limit: 8 });
    displayListings(listings, 'featured-listings', 8);
});

// Obsługa przycisku "Pokaż więcej"
document.getElementById('show-more').addEventListener('click', () => {
    const filterSection = document.getElementById('filter-section');
    filterSection.style.display = 'block';
    document.getElementById('show-more').style.display = 'none';
});

// Obsługa formularza filtrowania
document.getElementById('filter-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const filters = {
        brand: document.getElementById('brand').value,
        priceMin: parseInt(document.getElementById('price-min').value) || 0,
        priceMax: parseInt(document.getElementById('price-max').value) || Infinity,
        year: parseInt(document.getElementById('year').value) || 0
    };

    await filterListings(filters);
});