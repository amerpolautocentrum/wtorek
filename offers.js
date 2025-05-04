// Wersja debugująca — pokazuje pełne dane ofert z FOX w konsoli i na stronie

const foxApiUrl = "https://api-offers.vercel.app/api/offers";

async function fetchOffers(offset = 0, limit = 8) {
    const body = {
        offset,
        limit
    };

    try {
        const response = await fetch(foxApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        const data = await response.json();
        console.log("[DEBUG] Otrzymane dane z FOX API:", data);
        return data;
    } catch (error) {
        console.error("Błąd pobierania ofert:", error);
        return { offers: [] };
    }
}

async function loadInitialOffers() {
    const data = await fetchOffers(0, 8);
    if (!data.offers || data.offers.length === 0) {
        document.getElementById("offers-container").innerHTML = "<p>Brak ofert do wyświetlenia.</p>";
        return;
    }
    displayOffers(data.offers);
}

function displayOffers(offers) {
    const container = document.getElementById("offers-container");
    container.innerHTML = "";

    offers.forEach((offer, index) => {
        const div = document.createElement("div");
        div.className = "offer-item";
        div.style.textAlign = "left";
        div.style.fontSize = "10px";
        div.style.backgroundColor = "#111";
        div.style.padding = "10px";
        div.style.overflowWrap = "break-word";

        div.innerHTML = `
            <strong>Oferta ${index + 1}</strong><br>
            <pre style="white-space: pre-wrap; color: #ccc;">${JSON.stringify(offer, null, 2)}</pre>
        `;
        container.appendChild(div);
    });
}

loadInitialOffers();
