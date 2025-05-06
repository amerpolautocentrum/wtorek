document.addEventListener('DOMContentLoaded', async () => {
  // Elementy DOM
  const offersContainer = document.getElementById('offers-container');
  const brandSelect = document.getElementById('brand');
  const modelSelect = document.getElementById('model');
  const filterBtn = document.getElementById('filter-button');
  
  // Ładowanie danych
  offersContainer.innerHTML = '<div class="loading">Ładowanie ofert...</div>';
  
  let allOffers = [];
  let filteredOffers = [];
  
  // Pobierz wszystkie oferty
  async function fetchOffers() {
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      return [];
    }
  }

  // Wyświetl 6 randomowych ofert
  function displayRandomOffers() {
    const shuffled = [...allOffers].sort(() => 0.5 - Math.random());
    displayOffers(shuffled.slice(0, 6));
  }

  // Aktualizuj filtry
  function updateFilters() {
    // Marki
    const brands = [...new Set(allOffers.map(o => o.data?.id_make).filter(Boolean))].sort();
    brandSelect.innerHTML = '<option value="">Wybierz markę</option>' + 
      brands.map(b => `<option value="${b}">${b}</option>`).join('');

    // Modele (aktualizowane przy zmianie marki)
    brandSelect.addEventListener('change', () => {
      const selectedBrand = brandSelect.value;
      const models = [...new Set(allOffers
        .filter(o => o.data?.id_make === selectedBrand)
        .map(o => o.data?.id_model)
        .filter(Boolean))].sort();
      
      modelSelect.innerHTML = '<option value="">Wybierz model</option>' + 
        models.map(m => `<option value="${m}">${m}</option>`).join('');
    });
  }

  // Wyświetl oferty
  function displayOffers(offers) {
    offersContainer.innerHTML = offers.length ? 
      offers.map(offer => `
        <div class="offer-card" onclick="window.open('https://oferta.amer-pol.com/oferta/${offer.id}', '_blank')">
          <img src="${offer.data?.mainimage || 'placeholder.jpg'}" alt="${offer.data?.id_make} ${offer.data?.id_model}">
          <div class="offer-info">
            <h3>${offer.data?.id_make} ${offer.data?.id_model}</h3>
            <p>${offer.data?.yearproduction || '--'} • ${offer.data?.price || '?'} PLN</p>
          </div>
        </div>
      `).join('') : 
      '<p class="no-results">Brak ofert spełniających kryteria</p>';
  }

  // Filtruj oferty
  function applyFilters() {
    const brand = brandSelect.value;
    const model = modelSelect.value;
    
    filteredOffers = allOffers.filter(offer => {
      const data = offer.data || {};
      return (!brand || data.id_make === brand) && 
             (!model || data.id_model === model);
    });
    
    displayOffers(filteredOffers);
  }

  // Resetuj do widoku początkowego
  function resetView() {
    if (!brandSelect.value && !modelSelect.value) {
      displayRandomOffers();
    }
  }

  // Inicjalizacja
  allOffers = await fetchOffers();
  updateFilters();
  displayRandomOffers();
  
  // Event listeners
  filterBtn.addEventListener('click', applyFilters);
  brandSelect.addEventListener('change', resetView);
  modelSelect.addEventListener('change', resetView);
});