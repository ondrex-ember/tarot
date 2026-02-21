// DŮLEŽITÉ: Zde vložte vaši PERMANENTNÍ adresu končící na /exec
const API_URL = 'https://script.google.com/macros/s/AKfycbzg2YNckMcLzo5Z2bVbonXMHTJXInJfR1M4BsXhWE0CrbUTQ9cht2YOSSfg-Wkhl_nT/exec';

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
    if (tarotDeck.length < 3) return;

    const readingTextContainer = document.getElementById('reading-text');
    const aiContainer = document.getElementById('ai-reading-container');
    const aiTextEl = document.getElementById('ai-text-content');
    
    // Skryjeme staré texty
    readingTextContainer.innerHTML = '';
    readingTextContainer.classList.add('hidden');
    aiContainer.classList.add('hidden');
    aiTextEl.innerHTML = '';
    
    for(let i = 1; i <= 3; i++) {
        document.getElementById(`card${i}-inner`).classList.remove('is-flipped');
    }

    setTimeout(() => {
        tarotBoard.classList.remove('hidden');

        let deckCopy = [...tarotDeck];
        let drawnCards = [];
        for(let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * deckCopy.length);
            drawnCards.push(deckCopy.splice(randomIndex, 1)[0]); 
        }

        const positions = ["Minulost", "Přítomnost", "Budoucnost"];
        let htmlContent = ""; 
        let kartyProAI = []; // Sem si uložíme názvy karet pro věštce

        drawnCards.forEach((card, index) => {
            const num = index + 1; 
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

            // Zapíšeme si kartu do seznamu pro AI
            kartyProAI.push(`${card.name_cz} (${posText})`);

            htmlContent += `
                <div class="reading-block">
                    <h4>${positions[index]}: ${card.name_cz}</h4>
                    <div class="meta-info">${posText} | ${keywords}</div>
                    <p>${meaning}</p>
                </div>
            `;

            setTimeout(() => {
                document.getElementById(`card${num}-inner`).classList.add('is-flipped');
            }, num * 500); 
        });

        // Zobrazíme klasické texty z tabulky
        readingTextContainer.innerHTML = htmlContent;
        setTimeout(() => {
            readingTextContainer.classList.remove('hidden');
            
            // --- VOLÁNÍ AI VĚŠTCE ---
            // Zobrazíme box pro AI a dáme tam text, že věštec přemýšlí
            aiContainer.classList.remove('hidden');
            aiTextEl.innerHTML = "<i>Věštec naslouchá hvězdám...</i>";

            // Sestavíme URL pro náš Apps Script s parametrem action=reading
            const kartyString = encodeURIComponent(kartyProAI.join(", "));
            const fetchUrl = `${API_URL}?action=reading&cards=${kartyString}`;

            fetch(fetchUrl)
                .then(response => response.json())
                .then(data => {
                    // Jakmile přijde odpověď, spustíme efekt psacího stroje!
                    if (data.reading) {
                        typeWriterEffect(data.reading, 'ai-text-content', 40);
                    }
                })
                .catch(err => {
                    aiTextEl.innerHTML = "Spojení s astrální sférou selhalo.";
                });

        }, 2200);

    }, 400); 
}

// 3. Spuštění interakce
// Když uživatel klikne na tlačítko, zavolá se funkce drawCard
drawBtn.addEventListener('click', drawCard);

// Hned po spuštění stránky začneme na pozadí stahovat karty
loadCards();

// --- VYLEPŠENÝ EFEKT PSACÍHO STROJE PRO AI ---
function typeWriterEffect(text, elementId, speed = 35) {
    const el = document.getElementById(elementId);
    el.innerHTML = "";
    el.classList.add("cursor-blink");
    
    let cleanText = text.replace(/\*\*/g, ''); 
    const chars = Array.from(cleanText); 
    let i = 0;
    
    function type() {
        if (i < chars.length) {
            if (chars[i] === '\n') {
                el.innerHTML += '<br>';
            } else {
                el.innerHTML += chars[i];
            }
            i++;
            setTimeout(type, speed);
        } else {
            el.classList.remove("cursor-blink"); 
        }
    }
    type();
}
