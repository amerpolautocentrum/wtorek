const apiUrl = 'https://api-offers.vercel.app/api/offers'; // Poprawny adres Twojego projektu Vercel

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
                    token: '021990a9e67cfd35389f867fc0cf5ee4322ca152407e35264fb01186d578cd8b'
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
            throw new Error(`Błąd HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.status !== 'success') {
            throw new Error(`Błąd API: ${data.message || 'Nieznany błąd'}`);
        }
        return data.offers || [];
    } catch (error) {
        console.error('Błąd pobierania danych:', error.message);
        return [];
    }
}

// Funkcja do wyświetlania ogłoszeń
function displayListings(listings, containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Kontener ${containerId} nie istnieje`);
        return;
    }
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
            if (listing.url) {
                window.open(listing.url, '_blank');
            } else {
                console.error('Brak URL dla ogłoszenia:', listing.id);
            }
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
document.addEventListener('DOMContentLoaded', async () => {
    const listings = await fetchListings({ limit: 8 });
    displayListings(listings, 'featured-listings', 8);
});

// Obsługa przycisku "Pokaż więcej"
const showMoreButton = document.getElementById('show-more');
if (showMoreButton) {
    showMoreButton.addEventListener('click', () => {
        const filterSection = document.getElementById('filter-section');
        if (filterSection) {
            filterSection.style.display = 'block';
            showMoreButton.style.display = 'none';
        } else {
            console.error('Sekcja filtrowania nie istnieje');
        }
    });
} else {
    console.error('Przycisk "show-more" nie istnieje');
}

// Obsługa formularza filtrowania
const filterForm = document.getElementById('filter-form');
if (filterForm) {
    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const filters = {
            brand: document.getElementById('brand').value,
            priceMin: parseInt(document.getElementById('price-min').value) || 0,
            priceMax: parseInt(document.getElementById('price-max').value) || Infinity,
            year: parseInt(document.getElementById('year').value) || 0
        };

        await filterListings(filters);
    });
} else {
    console.error('Formularz filtrowania nie istnieje');
}