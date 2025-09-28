document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCGQnWdci-4lwya38ToVhtI35zWwUuDz1U",
        authDomain: "agritech-4e1af.firebaseapp.com",
        projectId: "agritech-4e1af",
        storageBucket: "agritech-4e1af.firebasestorage.app",
        messagingSenderId: "87928629801",
        appId: "1:87928629801:web:fdf1f1aa04b2eb55e74a38",
        measurementId: "G-9VVG3NPN4W"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const languageSelect = document.getElementById('language-select');
    console.log('languageSelect element:', languageSelect);
    const refreshPricesButton = document.getElementById('refresh-prices');
    const commoditySelect = document.getElementById('commodity-select');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    const weatherCityInput = document.getElementById('weather-city');
    const weatherInfoDiv = document.getElementById('weather-info');

    // Gemini API constants (same as chatbot.html)
    const API_KEY = "AIzaSyCvCJfO2MtWa2zIPcB0sV1yD66plUAvtrc";
    const MODEL_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    // Soil & Fertilizer Guidance
    const checkSoilBtn = document.getElementById('check-soil-btn');
    const soilModal = new bootstrap.Modal(document.getElementById('soilModal'));
    const getRecommendationBtn = document.getElementById('get-recommendation-btn');
    const cropSelect = document.getElementById('crop-select');
    const recommendationResult = document.getElementById('recommendation-result');

    // Pest & Disease Detection
    const pestImageUpload = document.getElementById('pest-image-upload');
    const pestResult = document.getElementById('pest-result');

    // Feedback Form
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackName = document.getElementById('feedback-name');
    const feedbackEmail = document.getElementById('feedback-email');
    const feedbackMobile = document.getElementById('feedback-mobile');
    const feedbackText = document.getElementById('feedback-text');

    // --- Language Translation ---
    function translatePage(lang) {
        console.log('Translating page to:', lang);
        document.querySelectorAll('[data-en]').forEach(element => {
            const translatedText = element.getAttribute(`data-${lang}`);
            if (translatedText) {
                console.log('Updating element:', element, 'to:', translatedText);
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.setAttribute('placeholder', translatedText);
                } else if (element.tagName === 'OPTION') {
                    element.textContent = translatedText;
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
        // Re-translate commodity options
        const selectedCommodity = commoditySelect.value;
        translateCommodityOptions(selectedLang);
        commoditySelect.value = selectedCommodity; // Restore selection
    }, { capture: true });

    function translateCommodityOptions(lang) {
        const options = commoditySelect.querySelectorAll('option');
        options.forEach(option => {
            const translatedText = option.getAttribute(`data-${lang}`);
            if (translatedText) {
                option.textContent = translatedText;
            }
        });
    }

    // Set initial language to English
    translatePage('en');
    translateCommodityOptions('en');

    // --- Feedback Form Submission ---
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = feedbackName.value.trim();
        const email = feedbackEmail.value.trim();
        const mobile = feedbackMobile.value.trim();
        const feedback = feedbackText.value.trim();

        if (!name || !email || !mobile || !feedback) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            console.log('Attempting to save feedback to Firestore...');
            await db.collection('feedback').add({
                name: name,
                email: email,
                mobile: mobile,
                feedback: feedback,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Feedback saved successfully!');
            alert('Thank you for your feedback!');
            feedbackForm.reset();
        } catch (error) {
            console.error('Error saving feedback:', error);
            alert(`Error submitting feedback: ${error.message}. Please try again.`);
        }
    });

    // --- Other Functionality ---
    refreshPricesButton.addEventListener('click', () => {
        updateMarketPrices();
    });

    commoditySelect.addEventListener('change', () => {
        updateMarketPrices();
    });

    async function updateMarketPrices() {
        const selectedCommodity = commoditySelect.value;
        const commodityName = commoditySelect.options[commoditySelect.selectedIndex].textContent;
        const marketPriceSpan = document.getElementById('market-price');
        const lastUpdatedSpan = document.getElementById('market-last-updated');
        console.log('Selected Commodity:', commodityName);
        if (marketPriceSpan) marketPriceSpan.textContent = 'Fetching...';
        if (lastUpdatedSpan) lastUpdatedSpan.textContent = '...';

        try {
            // Mock response for testing
            let reply = '₹2500 per quintal'; // Mock price
            console.log('Mock price for', commodityName, ':', reply);

            if (marketPriceSpan) marketPriceSpan.textContent = reply;
            if (lastUpdatedSpan) lastUpdatedSpan.textContent = new Date().toLocaleTimeString();

            // Save to localStorage
            localStorage.setItem('marketPrice_' + selectedCommodity, reply);

            // Add link to Agmarknet for more prices
            const lowestPriceLinkDiv = document.getElementById('lowest-price-link');
            if (lowestPriceLinkDiv) {
                lowestPriceLinkDiv.innerHTML = `<a href="https://agmarknet.gov.in/" target="_blank" class="text-decoration-none">Find more prices on Agmarknet</a>`;
            }
        } catch (error) {
            console.error('Market price fetch error:', error);
            if (marketPriceSpan) marketPriceSpan.textContent = 'Error fetching price';
            if (lastUpdatedSpan) lastUpdatedSpan.textContent = new Date().toLocaleTimeString();
        }
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

    // --- Soil & Fertilizer Guidance ---
    checkSoilBtn.addEventListener('click', () => {
        soilModal.show();
    });

    getRecommendationBtn.addEventListener('click', async () => {
        const selectedCrop = cropSelect.options[cropSelect.selectedIndex].textContent;
        const currentLang = languageSelect.value;

        if (!selectedCrop) {
            recommendationResult.innerHTML = '<div class="alert alert-warning">Please select a crop.</div>';
            return;
        }

        // Show loading indicator
        recommendationResult.innerHTML = '<div class="alert alert-info">Generating recommendations...</div>';

        try {
            const langMap = {
                'en': 'English',
                'hi': 'Hindi',
                'gu': 'Gujarati',
                'ma': 'Marathi',
                'pu': 'Punjabi'
            };
            const langName = langMap[currentLang] || 'English';

            // Always provide for all soil types
            const prompt = `Provide concise, practical fertilizer and soil management guidance for growing ${selectedCrop} seeds on different soil types (sandy, clay, loamy, silt, peat, chalky). For each soil type, include recommended NPK ratios, application tips, and precautions. Respond in one structured paragraph in ${langName} language.`;

            const response = await fetch(`${MODEL_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI. Please try again.';
            // Clean the reply: remove markdown, extra spaces, and ensure one paragraph
            reply = reply.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();

            const title = `Recommendations for ${selectedCrop} on All Soil Types:`;

            recommendationResult.innerHTML = `
                <div class="alert alert-success">
                    <h6>${title}</h6>
                    <p>${reply}</p>
                </div>
            `;
        } catch (error) {
            recommendationResult.innerHTML = `<div class="alert alert-danger">Error generating recommendations: ${error.message}. Please check your connection or try again.</div>`;
            console.error('Gemini API error:', error);
        }
    });

    // --- Pest & Disease Detection ---
    pestImageUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Show loading
        pestResult.innerHTML = '<div class="alert alert-info">Analyzing image...</div>';

        try {
            const base64Image = await toBase64(file);
            const currentLang = languageSelect.value;
            const langMap = {
                'en': 'English',
                'hi': 'Hindi',
                'gu': 'Gujarati',
                'ma': 'Marathi',
                'pu': 'Punjabi'
            };
            const langName = langMap[currentLang] || 'English';

            const prompt = `Analyze this image of a crop and identify any pests or diseases. Provide advice on treatment and prevention. Respond in one structured paragraph in ${langName} language.`;

            const response = await fetch(`${MODEL_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: file.type,
                                    data: base64Image.split(',')[1] // Remove the data:image/...;base64, prefix
                                }
                            }
                        ]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI. Please try again.';
            reply = reply.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();

            pestResult.innerHTML = `
                <div class="alert alert-success">
                    <h6>Pest & Disease Analysis:</h6>
                    <p>${reply}</p>
                </div>
            `;
        } catch (error) {
            pestResult.innerHTML = `<div class="alert alert-danger">Error analyzing image: ${error.message}. Please check your connection or try again.</div>`;
            console.error('Gemini API error:', error);
        }
    });

    // Helper function to convert file to base64
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Legacy AI response function (can be removed if not used elsewhere)
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
        } 
        else {
            return 'I am a basic bot right now, but I can assist with weather, soil, or market questions. How can I help?';
        }
    }

    updateMarketPrices();
});
