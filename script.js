document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    console.log('languageSelect element:', languageSelect);
    const refreshPricesButton = document.getElementById('refresh-prices');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    const weatherCityInput = document.getElementById('weather-city');
    const weatherInfoDiv = document.getElementById('weather-info');

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
        if (marketPriceSpan) marketPriceSpan.textContent = 'Fetching...';
        if (lastUpdatedSpan) lastUpdatedSpan.textContent = '...';
        setTimeout(() => {
            const randomPrice = (Math.random() * 1000 + 500).toFixed(2);
            if (marketPriceSpan) marketPriceSpan.textContent = `₹${randomPrice}`;
            if (lastUpdatedSpan) lastUpdatedSpan.textContent = new Date().toLocaleTimeString();
        }, 1500);
    }

    // --- Weather Functionality ---
    async function fetchWeather(city) {
        const API_KEY = '92ec6d4c3c9b1f58a5546dbfdae9a801'; // Replace with your OpenWeatherMap API key
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        
        try {
            weatherInfoDiv.innerHTML = '<div class="alert alert-info">Fetching weather...</div>';
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.cod !== 200) {
                throw new Error(data.message || 'City not found');
            }
            
            const temp = Math.round(data.main.temp);
            const description = data.weather[0].description;
            const humidity = data.main.humidity;
            const feelsLike = Math.round(data.main.feels_like);
            
            weatherInfoDiv.innerHTML = `
                <div class="alert alert-success">
                    <h5>${city}</h5>
                    <p><strong>Temperature:</strong> ${temp}°C (Feels like: ${feelsLike}°C)</p>
                    <p><strong>Conditions:</strong> ${description}</p>
                    <p><strong>Humidity:</strong> ${humidity}%</p>
                </div>
            `;
        } catch (error) {
            weatherInfoDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}. Please check the city name or API key.</div>`;
            console.error('Weather fetch error:', error);
        }
    }

    getWeatherBtn.addEventListener('click', () => {
        const city = weatherCityInput.value.trim() || 'Ahmedabad';
        fetchWeather(city);
    });

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
