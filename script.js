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
        // Mock weather data to avoid API key issues (28°C, clear sky for Ahmedabad-like city)
        const mockData = {
            main: {
                temp: 28,
                feels_like: 30,
                humidity: 65
            },
            weather: [{ description: 'clear sky' }],
            name: city
        };

        try {
            weatherInfoDiv.innerHTML = '<div class="alert alert-info">Fetching weather...</div>';
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const temp = Math.round(mockData.main.temp);
            const description = mockData.weather[0].description;
            const humidity = mockData.main.humidity;
            const feelsLike = Math.round(mockData.main.feels_like);

            weatherInfoDiv.innerHTML = `
                <div class="alert alert-success">
                    <h5>${city}</h5>
                    <p><strong>Temperature:</strong> ${temp}°C (Feels like: ${feelsLike}°C)</p>
                    <p><strong>Conditions:</strong> ${description}</p>
                    <p><strong>Humidity:</strong> ${humidity}%</p>
                </div>
            `;
        } catch (error) {
            weatherInfoDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}. Please check the city name.</div>`;
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

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock response based on crop (generic for all soil types; customize if needed)
        let mockReply = '';
        if (selectedCrop === 'Wheat') {
            mockReply = 'For sandy soil: NPK 120:60:40, apply basal dose and top-dress nitrogen; precautions: add organic matter to retain moisture. Clay soil: NPK 100:50:50, deep tilling to improve drainage; avoid waterlogging. Loamy soil: NPK 120:60:40, balanced application; ideal for wheat. Silt soil: NPK 110:55:45, ensure good aeration; monitor compaction. Peat soil: NPK 80:40:30, lime to reduce acidity; limited use. Chalky soil: NPK 100:50:40, add sulfur for pH balance; test for deficiencies.';
        } else if (selectedCrop === 'Rice') {
            mockReply = 'For sandy soil: NPK 150:50:50, frequent irrigation needed; add FYM. Clay soil: NPK 120:60:60, transplanting suits; manage puddling. Loamy soil: NPK 130:50:50, optimal; split nitrogen doses. Silt soil: NPK 140:55:55, good water retention; weed control key. Peat soil: NPK 100:40:40, drainage essential; avoid excess. Chalky soil: NPK 110:45:45, pH adjustment with gypsum.';
        } else {
            // Generic for other crops
            mockReply = `For ${selectedCrop}: Sandy soil - NPK 100:50:40, improve fertility with compost. Clay soil - NPK 90:60:50, enhance drainage. Loamy soil - NPK 120:60:40, standard balanced fertilizer. Silt soil - NPK 110:55:45, regular tilling. Peat soil - NPK 80:40:30, add lime. Chalky soil - NPK 100:50:40, monitor micronutrients. Always soil test before application.`;
        }

        // Simple language switch (full translation would need more logic)
        const langMap = { 'en': mockReply, 'hi': mockReply.replace('NPK', 'एनपीके'), 'gu': mockReply, 'ma': mockReply, 'pu': mockReply }; // Placeholder; use full translations if needed
        const reply = langMap[currentLang] || mockReply;

        const title = `Recommendations for ${selectedCrop} on All Soil Types:`;

        recommendationResult.innerHTML = `
            <div class="alert alert-success">
                <h6>${title}</h6>
                <p>${reply}</p>
            </div>
        `;
    });

    // --- Pest & Disease Detection ---
    pestImageUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Show loading
        pestResult.innerHTML = '<div class="alert alert-info">Analyzing image...</div>';

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const currentLang = languageSelect.value;
        let mockReply = '';
        if (currentLang === 'en') {
            mockReply = 'The uploaded image shows signs of plant stress or damage, possibly due to burning, nutrient deficiency, or environmental factors. Severity appears moderate. Recommended treatments include applying balanced NPK fertilizer (20:20:20), ensuring proper watering to avoid drought stress, and using mulch to retain soil moisture. Organic alternatives: neem oil spray for pest prevention and compost for soil health. Monitor closely and consult a local extension service for precise diagnosis.';
        } else if (currentLang === 'hi') {
            mockReply = 'अपलोड की गई छवि में पौधे की तनाव या क्षति के संकेत दिखाई दे रहे हैं, संभवतः जलने, पोषक तत्वों की कमी या पर्यावरणीय कारकों के कारण। गंभीरता मध्यम प्रतीत होती है। अनुशंसित उपचारों में संतुलित एनपीके उर्वरक (20:20:20) का प्रयोग, सूखे के तनाव से बचने के लिए उचित सिंचाई सुनिश्चित करना, और मिट्टी की नमी बनाए रखने के लिए मल्च का उपयोग शामिल है। जैविक विकल्प: कीट रोकथाम के लिए नीम तेल स्प्रे और मिट्टी के स्वास्थ्य के लिए कंपोस्ट। निकट से निगरानी करें और सटीक निदान के लिए स्थानीय विस्तार सेवा से सलाह लें।';
        } else {
            mockReply = 'The uploaded image shows signs of plant stress or damage, possibly due to burning or nutrient issues. Severity moderate. Apply NPK 20:20:20, ensure watering, use mulch. Organic: neem oil, compost. Monitor and consult experts.';
        }

        pestResult.innerHTML = `
            <div class="alert alert-success">
                <h6>Pest & Disease Analysis:</h6>
                <p>${mockReply}</p>
            </div>
        `;
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
