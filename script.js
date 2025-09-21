document.addEventListener('DOMContentLoaded', () => {
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatbotButton = document.getElementById('close-chatbot');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const languageSelect = document.getElementById('language-select');
    const refreshPricesButton = document.getElementById('refresh-prices');

    // --- Core Chatbot Functionality ---
    chatbotButton.addEventListener('click', () => {
        chatbotContainer.style.display = 'flex';
    });

    closeChatbotButton.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
    });

    // Function to add a message to the chatbot
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chatbot-message', `${sender}-message`, 'my-2', 'p-3');
        messageDiv.textContent = text;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Handle user input
    sendButton.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text !== '') {
            addMessage(text, 'user');
            setTimeout(() => {
                addMessage('Thinking...', 'bot');
                setTimeout(() => {
                    const response = getAIResponse(text);
                    chatbotMessages.lastChild.textContent = response;
                }, 1000);
            }, 500);
            userInput.value = '';
        }
    });

    // Listen for Enter key in the input field
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    // --- Language Translation ---
    function translatePage(lang) {
        document.querySelectorAll('[data-en], [data-hi]').forEach(element => {
            const translatedText = element.getAttribute(`data-${lang}`);
            if (translatedText) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.setAttribute('placeholder', translatedText);
                } else {
                    element.textContent = translatedText;
                }
            }
        });
    }

    languageSelect.addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        translatePage(selectedLang);
    });

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