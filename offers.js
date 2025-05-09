
let offersCache = [];

function logBrandsAndBMWs(offers) {
  const makes = new Set();
  const bmwLike = [];

  offers.forEach(d => {
    const make = (d.id_make || "").toLowerCase().trim();
    if (make) makes.add(make);
    if (make.includes("bmw")) bmwLike.push(d);
  });

  console.log("🔍 Zebrane marki:", [...makes].sort());
  console.log("📦 Przykładowe oferty z marką zawierającą 'bmw':", bmwLike.slice(0, 3));
}

async function fetchFilteredOffers(filters = {}, page = 1) {
  try {
    const response = await fetch("https://api-offers.vercel.app/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters, page })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Błąd pobierania ofert:", error);
    return { offers: {}, page: 1, pages: 1 };
  }
}

async function fetchAllPagesDynamic() {
  let allOffers = [];
  let result = await fetchFilteredOffers({}, 1);
  let pages = result.pages || 1;

  allOffers = Object.values(result.offers || {});

  for (let page = 2; page <= pages; page++) {
    const res = await fetchFilteredOffers({}, page);
    allOffers = allOffers.concat(Object.values(res.offers || {}));
  }

  return allOffers;
}

(async function init() {
  offersCache = await fetchAllPagesDynamic();
  logBrandsAndBMWs(offersCache);
})();
