document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    console.log('languageSelect element:', languageSelect);
    const refreshPricesButton = document.getElementById('refresh-prices');

    // --- Language Translation ---
    function translatePage(lang) {
        console.log('Translating page to:', lang);
        document.querySelectorAll('[data-en]').forEach(element => {
            const translatedText = element.getAttribute(`data-${lang}`);
            if (translatedText) {
                console.log('Updating element:', element, 'to:', translatedText);
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.setAttribute('placeholder', translatedText);
                } else {
                    element.textContent = translatedText;
                }
            } else {
                console.log('No translation for element:', element, 'in lang:', lang);
            }
        });
    }

    languageSelect.addEventListener('change', (e) => {
        console.log('Language select changed to:', e.target.value);
        const selectedLang = e.target.value;
        translatePage(selectedLang);
    }, { capture: true });

    // Set initial language to English
    translatePage('en');

    // --- Other Functionality ---
    refreshPricesButton.addEventListener('click', () => {
        updateMarketPrices();
    });

    function updateMarketPrices() {
        const marketPriceSpan = document.getElementById('market-price');
        const lastUpdatedSpan = document.getElementById('market-last-updated');

        marketPriceSpan.textContent = 'Fetching...';
        lastUpdatedSpan.textContent = '...';

        setTimeout(() => {
            const randomPrice = (Math.random() * 1000 + 500).toFixed(2);
            marketPriceSpan.textContent = `₹${randomPrice}`;
            lastUpdatedSpan.textContent = new Date().toLocaleTimeString();
        }, 1500);
    }

    function getAIResponse(userQuery) {
        userQuery = userQuery.toLowerCase();
        if (userQuery.includes('hello')) {
            return 'Hello! How can I help you with your crops today?';
        } else if (userQuery.includes('weather')) {
            return 'I can provide real-time weather forecasts. What is your location?';
        } else if (userQuery.includes('soil')) {
            return 'Please provide a soil sample or details for a recommendation.';
        } else if (userQuery.includes('market')) {
            return 'What commodity price are you looking for?';
        } else {
            return 'I am a basic bot right now, but I can assist with weather, soil, or market questions. How can I help?';
        }
    }

    updateMarketPrices();
});