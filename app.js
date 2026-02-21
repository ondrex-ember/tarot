// DŮLEŽITÉ: Zde vložte vaši PERMANENTNÍ adresu končící na /exec
const API_URL = 'https://script.google.com/macros/s/AKfycbwLvBpGzjpLO_MAJgs26VUwNM_kiwZF4aQEdEC4Cf1Vr4bHMGpub82ee1YILni9sA9i/exec';

// Proměnná, do které si uložíme karty z Google Tabulky
let tarotDeck = [];

// Propojení na HTML elementy
const drawBtn = document.getElementById('draw-btn');
const loadingDiv = document.getElementById('loading');
const tarotBoard = document.getElementById('tarot-board');
const cardImg = document.getElementById('card-img');
const cardTitle = document.getElementById('card-title');
const cardPosition = document.getElementById('card-position');
const cardKeywords = document.getElementById('card-keywords');
const cardMeaning = document.getElementById('card-meaning');

// 1. Funkce pro stažení dat z vašeho API
async function loadCards() {
    // Skryjeme tlačítko a ukážeme text "Načítání..."
    drawBtn.classList.add('hidden');
    loadingDiv.classList.remove('hidden');

    try {
        const response = await fetch(API_URL);
        tarotDeck = await response.json();
        console.log("Karty úspěšně načteny z Google Sheets:", tarotDeck);
        
        // Data jsou tu! Skryjeme načítání a ukážeme tlačítko
        loadingDiv.classList.add('hidden');
        drawBtn.classList.remove('hidden');
    } catch (error) {
        console.error("Chyba při stahování karet:", error);
        loadingDiv.innerText = "Nepodařilo se načíst karty. Zkontrolujte připojení k internetu a URL API.";
    }
}

// 2. Funkce pro vytažení a zobrazení karty
// Nezapomeňte si nahoře v app.js definovat napojení na náš nový obal:
// const cardInner = document.getElementById('card-inner');

function drawCard() {
    // Pokud nemáme karty, nic neděláme
    if (tarotDeck.length < 3) return;

    const readingTextContainer = document.getElementById('reading-text');
    
    // 1. Skryjeme předchozí texty a otočíme karty zpět rubem nahoru
    readingTextContainer.innerHTML = '';
    readingTextContainer.classList.add('hidden');
    
    for(let i = 1; i <= 3; i++) {
        document.getElementById(`card${i}-inner`).classList.remove('is-flipped');
    }

    // Dáme kartám 400ms na zakrytí
    setTimeout(() => {
        tarotBoard.classList.remove('hidden');

        // 2. Logika pro výběr 3 UNIKÁTNÍCH karet (bez opakování)
        let deckCopy = [...tarotDeck]; // Uděláme si pracovní kopii balíčku
        let drawnCards = [];
        for(let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * deckCopy.length);
            // Vyřízneme kartu z balíčku a přesuneme do tažených
            drawnCards.push(deckCopy.splice(randomIndex, 1)[0]); 
        }

        const positions = ["Minulost", "Přítomnost", "Budoucnost"];
        let htmlContent = ""; // Sem si poskládáme texty

        // 3. Přiřazení dat jednotlivým kartám
        drawnCards.forEach((card, index) => {
            const num = index + 1; // Číslo slotu (1, 2, 3)
            const isReversed = Math.random() < 0.5;
            const imgEl = document.getElementById(`card${num}-img`);
            
            imgEl.src = 'assets/' + card.image;
            
            let posText, keywords, meaning;
            if (isReversed) {
                imgEl.classList.add('reversed-card');
                posText = "Obrácená pozice";
                keywords = card.keywords_reversed;
                meaning = card.meaning_reversed_general;
            } else {
                imgEl.classList.remove('reversed-card');
                posText = "Přímá pozice";
                keywords = card.keywords_upright;
                meaning = card.meaning_upright_general;
            }

            // Příprava textového bloku pro tuto kartu
            htmlContent += `
                <div class="reading-block">
                    <h4>${positions[index]}: ${card.name_cz}</h4>
                    <div class="meta-info">${posText} | ${keywords}</div>
                    <p>${meaning}</p>
                </div>
            `;

            // 4. Magie postupného otáčení! (Kaskádový efekt)
            setTimeout(() => {
                document.getElementById(`card${num}-inner`).classList.add('is-flipped');
            }, num * 500); // 1. karta za 500ms, 2. za 1000ms, 3. za 1500ms
        });

        // 5. Vložení textů a jejich zobrazení, až se dotočí poslední karta
        readingTextContainer.innerHTML = htmlContent;
        setTimeout(() => {
            readingTextContainer.classList.remove('hidden');
        }, 2200);

    }, 400); // Konec prvního setTimeoutu
}

// 3. Spuštění interakce
// Když uživatel klikne na tlačítko, zavolá se funkce drawCard
drawBtn.addEventListener('click', drawCard);

// Hned po spuštění stránky začneme na pozadí stahovat karty
loadCards();