/**
 * Cryptocurrency Trading Interface
 * This application provides real-time cryptocurrency price tracking and trading functionality
 * using Binance WebSocket API for live data and REST API for historical data.
 */

// Initialize the chart with default configuration
const ctx = document.getElementById('priceChart').getContext('2d');
let currentPair = 'BTCUSDT'; // Default trading pair
let currentTimeframe = '1m'; // Default timeframe (1 minute)
let ws = null; // WebSocket connection
let chartData = {
    labels: [],
    datasets: [{
        label: 'Price',
        data: [],
        borderColor: '#00b8d4',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0
    }]
};

/**
 * Chart Configuration
 * Sets up the chart appearance and behavior including:
 * - Responsive design
 * - Custom tooltip styling
 * - Grid and axis configuration
 * - Interaction modes
 */
const chartConfig = {
    type: 'line',
    data: chartData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#222',
                titleColor: '#888',
                bodyColor: '#fff',
                borderColor: '#333',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: {
                    color: '#222'
                },
                ticks: {
                    color: '#888'
                }
            },
            y: {
                grid: {
                    color: '#222'
                },
                ticks: {
                    color: '#888'
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    }
};

const priceChart = new Chart(ctx, chartConfig);

// Function to format date
function formatDate(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Function to connect to WebSocket
function connectWebSocket(symbol, interval) {
    if (ws) {
        ws.close();
    }

    // First, fetch recent klines (candlestick) data
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`)
        .then(response => response.json())
        .then(data => {
            // Clear existing data
            chartData.labels = [];
            chartData.datasets[0].data = [];

            // Process historical data
            data.forEach(candle => {
                const time = new Date(candle[0]);
                chartData.labels.push(formatDate(time));
                chartData.datasets[0].data.push(parseFloat(candle[4])); // Closing price
            });

            priceChart.update();

            // Connect to WebSocket for real-time updates
            ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.k) {
                    const candle = data.k;
                    const time = new Date(candle.t);
                    const usdPrice = parseFloat(candle.c);
                    const convertedPrice = currencyConverter.convertPrice(usdPrice);

                    // Update chart data
                    const lastIndex = chartData.labels.length - 1;
                    if (chartData.labels[lastIndex] === formatDate(time)) {
                        chartData.datasets[0].data[lastIndex] = convertedPrice;
                    } else {
                        if (chartData.labels.length > 100) {
                            chartData.labels.shift();
                            chartData.datasets[0].data.shift();
                        }
                        chartData.labels.push(formatDate(time));
                        chartData.datasets[0].data.push(convertedPrice);
                    }

                    // Update price display with both USD value and converted price
                    const priceElement = document.querySelector('.price');
                    priceElement.setAttribute('data-usd-price', usdPrice.toString());
                    priceElement.textContent = currencyConverter.formatCurrencyValue(convertedPrice);
                    
                    priceChart.update('none');
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        })
        .catch(error => console.error('Error fetching historical data:', error));
}

// Initialize with default pair and timeframe
connectWebSocket(currentPair, currentTimeframe);

// Timeframe buttons functionality
const timeButtons = document.querySelectorAll('.time-button');
timeButtons.forEach(button => {
    button.addEventListener('click', () => {
        timeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        currentTimeframe = button.dataset.value;
        connectWebSocket(currentPair, currentTimeframe);
    });
});

// Update pair selection handler
const pairRows = document.querySelectorAll('.pairs-list tbody tr');
pairRows.forEach(row => {
    row.addEventListener('click', () => {
        const symbol = row.querySelector('td:first-child').textContent;
        const price = row.querySelector('td:nth-child(2)').textContent;
        
        // Update the pair info
        pairSelector.querySelector('.pair-text').textContent = symbol + '/USDT';
        document.querySelector('.price').textContent = price;
        
        // Update current pair and reconnect WebSocket
        currentPair = symbol + 'USDT';
        connectWebSocket(currentPair, currentTimeframe);
        
        // Close the overlay
        searchOverlay.classList.remove('active');
    });
});

// Only keep sell button alert
document.querySelector('.action-button.sell').addEventListener('click', () => {
    alert('Sell order placed!');
});

// Sliding menu functionality
const searchOverlay = document.getElementById('searchOverlay');
const pairSelector = document.getElementById('pairSelector');
const backButton = document.querySelector('.back-button');
const searchInput = document.querySelector('.search-input');
const pairsList = document.querySelector('.pairs-list');

// Show search overlay when clicking on pair selector
pairSelector.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    searchInput.focus();
});

// Hide search overlay when clicking back button
backButton.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    pairRows.forEach(row => {
        const symbol = row.querySelector('td:first-child').textContent.toLowerCase();
        if (symbol.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Buy Modal Functionality
const buyModal = document.getElementById('buyModal');
const buyButton = document.querySelector('.action-button.buy');
const closeButton = document.querySelector('.close-button');
const timeOptions = document.querySelectorAll('.time-option');
const percentageOptions = document.querySelectorAll('.percentage-option');
const amountInput = document.querySelector('.amount-input input');
const quickAmountButtons = document.querySelectorAll('.quick-amounts button');
const increaseButton = document.querySelector('.amount-control.increase');
const decreaseButton = document.querySelector('.amount-control.decrease');

// Show modal when clicking buy button
buyButton.addEventListener('click', () => {
    buyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Update the modal title with current pair
    const currentPair = document.querySelector('.pair-text').textContent;
    document.querySelector('.modal-title').textContent = currentPair;
});

// Close modal when clicking close button or outside
closeButton.addEventListener('click', () => {
    buyModal.classList.remove('active');
    document.body.style.overflow = '';
});

buyModal.addEventListener('click', (e) => {
    if (e.target === buyModal) {
        buyModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Time options selection
timeOptions.forEach(option => {
    option.addEventListener('click', () => {
        timeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
    });
});

// Percentage options selection
percentageOptions.forEach(option => {
    option.addEventListener('click', () => {
        percentageOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
    });
});

// Quick amount selection
quickAmountButtons.forEach(button => {
    button.addEventListener('click', () => {
        amountInput.value = button.textContent;
    });
});

// Amount controls
increaseButton.addEventListener('click', () => {
    const currentValue = parseFloat(amountInput.value) || 0;
    amountInput.value = (currentValue + 100).toFixed(2);
});

decreaseButton.addEventListener('click', () => {
    const currentValue = parseFloat(amountInput.value) || 0;
    if (currentValue >= 100) {
        amountInput.value = (currentValue - 100).toFixed(2);
    }
});

// Buy up/down buttons
document.querySelector('.buy-up').addEventListener('click', () => {
    const amount = amountInput.value;
    const time = document.querySelector('.time-option.active').dataset.time;
    const percentage = document.querySelector('.percentage-option.active').dataset.percentage;
    console.log(`Buy Up: ${amount} USDT, Time: ${time}s, Percentage: ${percentage}%`);
    buyModal.classList.remove('active');
    document.body.style.overflow = '';
});

document.querySelector('.buy-down').addEventListener('click', () => {
    const amount = amountInput.value;
    const time = document.querySelector('.time-option.active').dataset.time;
    const percentage = document.querySelector('.percentage-option.active').dataset.percentage;
    console.log(`Buy Down: ${amount} USDT, Time: ${time}s, Percentage: ${percentage}%`);
    buyModal.classList.remove('active');
    document.body.style.overflow = '';
});

// Currency Selector Functionality
document.addEventListener('DOMContentLoaded', () => {
    const currencyDisplay = document.querySelector('.currency-display');
    const currencyDropdown = document.querySelector('.currency-dropdown');
    const currencyOptions = document.querySelectorAll('.currency-option');
    const selectedCurrency = document.querySelector('.selected-currency');

    // Toggle dropdown
    currencyDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        currencyDisplay.classList.toggle('active');
        currencyDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        currencyDisplay.classList.remove('active');
        currencyDropdown.classList.remove('show');
    });

    // Handle currency selection
    currencyOptions.forEach(option => {
        option.addEventListener('click', () => {
            e.stopPropagation();
            const currency = option.getAttribute('data-currency');
            const symbol = option.getAttribute('data-symbol');
            
            // Update selected currency display
            selectedCurrency.textContent = currency;
            
            // Update selected state
            currencyOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Close dropdown
            currencyDisplay.classList.remove('active');
            currencyDropdown.classList.remove('show');

            // Update all prices with new currency
            currencyConverter.currentCurrency = currency;
            currencyConverter.currentSymbol = symbol;
            currencyConverter.updateAllPrices();
        });
    });
});

/**
 * CurrencyConverter Class
 * Handles all currency conversion operations including:
 * - Fetching exchange rates
 * - Converting prices between currencies
 * - Formatting currency displays
 */
class CurrencyConverter {
    constructor() {
        this.rates = {
            USD: 1,
            INR: 83.25  // Default fallback rate
        };
        this.currentCurrency = 'USD';
        this.currentSymbol = '$';
        
        // Fetch exchange rates every 5 minutes
        this.fetchExchangeRates();
        setInterval(() => this.fetchExchangeRates(), 300000);
    }

    async fetchExchangeRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            this.rates = {
                USD: 1,
                INR: data.rates.INR
            };
            // Update all prices with new rates if needed
            if (this.currentCurrency !== 'USD') {
                this.updateAllPrices();
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
        }
    }

    convertPrice(price, fromCurrency = 'USD') {
        if (!price) return 0;
        const usdPrice = fromCurrency === 'USD' ? price : price / this.rates[fromCurrency];
        return usdPrice * this.rates[this.currentCurrency];
    }

    formatPriceWithCurrency(value) {
        const formattedValue = this.formatCurrencyValue(value);
        return `${this.currentSymbol}${formattedValue}`;
    }

    formatCurrencyValue(value) {
        if (this.currentCurrency === 'INR') {
            // For INR, show 2 decimal places for values >= 1, and up to 6 decimal places for values < 1
            return value >= 1 ? value.toFixed(2) : value.toFixed(6);
        }
        // For USD, show 2 decimal places for values >= 1, and up to 8 decimal places for values < 1
        return value >= 1 ? value.toFixed(2) : value.toFixed(8);
    }

    updateAllPrices() {
        // Update main price display
        const priceElement = document.querySelector('.price');
        if (priceElement) {
            const usdPrice = parseFloat(priceElement.getAttribute('data-usd-price') || priceElement.textContent);
            const convertedPrice = this.convertPrice(usdPrice);
            priceElement.textContent = this.formatCurrencyValue(convertedPrice);
        }

        // Update all prices in the pairs list
        document.querySelectorAll('.pairs-list tbody tr').forEach(row => {
            const priceCell = row.querySelector('td:nth-child(2)');
            if (priceCell) {
                const usdPrice = parseFloat(priceCell.getAttribute('data-usd-price') || priceCell.textContent);
                const convertedPrice = this.convertPrice(usdPrice);
                priceCell.textContent = this.formatCurrencyValue(convertedPrice);
            }
        });

        // Update 24h high/low prices
        const highPriceElement = document.querySelector('[data-price="high"]');
        const lowPriceElement = document.querySelector('[data-price="low"]');
        
        if (highPriceElement) {
            const usdHighPrice = parseFloat(highPriceElement.getAttribute('data-usd-price') || highPriceElement.textContent);
            highPriceElement.textContent = this.formatCurrencyValue(this.convertPrice(usdHighPrice));
        }
        
        if (lowPriceElement) {
            const usdLowPrice = parseFloat(lowPriceElement.getAttribute('data-usd-price') || lowPriceElement.textContent);
            lowPriceElement.textContent = this.formatCurrencyValue(this.convertPrice(usdLowPrice));
        }
    }
}

// Initialize currency converter
const currencyConverter = new CurrencyConverter();

/**
 * CryptoDataHandler Class
 * Manages all cryptocurrency data operations including:
 * - WebSocket connections for real-time price updates
 * - 24-hour price statistics tracking
 * - Price formatting and display
 * - Currency conversion coordination
 */
class CryptoDataHandler {
    constructor() {
        // Initialize tracking variables and DOM elements
        this.socket = null;
        this.currentSymbol = 'BTCUSDT';
        this.priceElements = {
            current: document.querySelector('.price'),
            low: document.querySelector('[data-price="low"]'),
            high: document.querySelector('[data-price="high"]'),
            volume: document.querySelector('[data-volume="24h"]')
        };

        // Price history tracking for 24h high/low
        this.priceHistory = {
            high24h: -Infinity,
            low24h: Infinity,
            lastUpdate: Date.now()
        };

        // Initialize components and start data fetching
        this.currencyConverter = currencyConverter;
        this.initializeWebSocket();
        this.fetch24hData();
        
        // Set up automatic data refresh intervals
        setInterval(() => this.reset24hPrices(), 24 * 60 * 60 * 1000); // Reset every 24 hours
        setInterval(() => this.fetch24hData(), 60000); // Refresh every minute
    }

    /**
     * Resets 24-hour price tracking
     * Called automatically every 24 hours to maintain accurate daily statistics
     */
    reset24hPrices() {
        this.priceHistory = {
            high24h: -Infinity,
            low24h: Infinity,
            lastUpdate: Date.now()
        };
        this.fetch24hData();
    }

    /**
     * Fetches 24-hour statistical data from Binance API
     * Updates price history and displays current statistics
     */
    async fetch24hData() {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${this.currentSymbol}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Update price history
            this.priceHistory.high24h = Math.max(this.priceHistory.high24h, parseFloat(data.highPrice));
            this.priceHistory.low24h = Math.min(this.priceHistory.low24h, parseFloat(data.lowPrice));
            
            this.update24hData(data);
        } catch (error) {
            console.error('Error fetching 24h data:', error);
        }
    }

    /**
     * Initializes WebSocket connection for real-time price updates
     * Handles connection lifecycle and automatic reconnection
     */
    initializeWebSocket() {
        if (this.socket) {
            this.socket.close();
        }

        this.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${this.currentSymbol.toLowerCase()}@ticker`);

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // Update high/low if new price exceeds current records
            const currentPrice = parseFloat(data.c);
            if (currentPrice > this.priceHistory.high24h) {
                this.priceHistory.high24h = currentPrice;
                this.updateHighLowDisplay();
            }
            if (currentPrice < this.priceHistory.low24h) {
                this.priceHistory.low24h = currentPrice;
                this.updateHighLowDisplay();
            }
            
            this.updatePriceData(data);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        this.socket.onclose = () => {
            setTimeout(() => this.initializeWebSocket(), 5000);
        };
    }

    /**
     * Updates the display of high/low prices
     * Called when new price records are set
     */
    updateHighLowDisplay() {
        // Update high price display
        const highPrice = this.formatPrice(this.priceHistory.high24h);
        const convertedHighPrice = this.currencyConverter.convertPrice(highPrice);
        this.priceElements.high.textContent = convertedHighPrice;
        this.priceElements.high.setAttribute('data-original-price', highPrice);
        
        // Update low price display
        const lowPrice = this.formatPrice(this.priceHistory.low24h);
        const convertedLowPrice = this.currencyConverter.convertPrice(lowPrice);
        this.priceElements.low.textContent = convertedLowPrice;
        this.priceElements.low.setAttribute('data-original-price', lowPrice);

        // Add timestamp to the data attributes
        this.priceElements.high.setAttribute('data-timestamp', new Date().toISOString());
        this.priceElements.low.setAttribute('data-timestamp', new Date().toISOString());
    }

    /**
     * Updates all price displays with new data
     * Handles currency conversion and formatting
     * @param {Object} data - Price data from Binance API
     */
    update24hData(data) {
        // Update 24h low price
        const lowPrice = Math.min(this.priceHistory.low24h, parseFloat(data.lowPrice));
        this.priceHistory.low24h = lowPrice;
        const formattedLowPrice = this.formatPrice(lowPrice);
        const convertedLowPrice = this.currencyConverter.convertPrice(formattedLowPrice);
        this.priceElements.low.textContent = convertedLowPrice;
        this.priceElements.low.setAttribute('data-original-price', formattedLowPrice);

        // Update 24h high price
        const highPrice = Math.max(this.priceHistory.high24h, parseFloat(data.highPrice));
        this.priceHistory.high24h = highPrice;
        const formattedHighPrice = this.formatPrice(highPrice);
        const convertedHighPrice = this.currencyConverter.convertPrice(formattedHighPrice);
        this.priceElements.high.textContent = convertedHighPrice;
        this.priceElements.high.setAttribute('data-original-price', formattedHighPrice);

        // Update current price
        if (data.lastPrice) {
            const currentPrice = this.formatPrice(data.lastPrice);
            const convertedCurrentPrice = this.currencyConverter.convertPrice(currentPrice);
            this.priceElements.current.textContent = convertedCurrentPrice;
            this.priceElements.current.setAttribute('data-original-price', currentPrice);
        }

        // Update volume
        if (data.volume) {
            const volume = this.formatVolume(data.volume);
            this.priceElements.volume.textContent = `${volume} ${this.currentSymbol.replace('USDT', '')}`;
        }

        // Update price change animation
        this.animatePriceChange(data.priceChangePercent);
    }

    /**
     * Formats price values based on their magnitude
     * @param {number} price - The price to format
     * @returns {string} Formatted price string
     */
    formatPrice(price) {
        const numPrice = parseFloat(price);
        if (numPrice < 0.1) {
            return numPrice.toFixed(8);
        } else if (numPrice < 1) {
            return numPrice.toFixed(6);
        } else if (numPrice < 10) {
            return numPrice.toFixed(4);
        } else {
            return numPrice.toFixed(2);
        }
    }

    /**
     * Formats volume values with K/M/B suffixes
     * @param {number} volume - The volume to format
     * @returns {string} Formatted volume string
     */
    formatVolume(volume) {
        const num = parseFloat(volume);
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }

    /**
     * Handles price change animations and indicators
     * @param {number} priceChangePercent - Percentage change in price
     */
    animatePriceChange(priceChangePercent) {
        const priceElement = this.priceElements.current;
        priceElement.classList.remove('price-up', 'price-down');
        
        const change = parseFloat(priceChangePercent);
        if (change > 0) {
            priceElement.classList.add('price-up');
        } else if (change < 0) {
            priceElement.classList.add('price-down');
        }

        // Add percentage change indicator
        const changeIndicator = document.createElement('span');
        changeIndicator.className = change > 0 ? 'price-change positive' : 'price-change negative';
        changeIndicator.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
        
        // Remove existing indicator if any
        const existingIndicator = priceElement.querySelector('.price-change');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        priceElement.appendChild(changeIndicator);
    }

    /**
     * Changes the current trading pair
     * Resets price history and initializes new data fetching
     * @param {string} newSymbol - New trading pair symbol
     */
    async changeSymbol(newSymbol) {
        // Reset price history when changing symbols
        this.priceHistory = {
            high24h: -Infinity,
            low24h: Infinity,
            lastUpdate: Date.now()
        };
        
        this.currentSymbol = newSymbol;
        await this.fetch24hData();
        this.initializeWebSocket();
    }

    updatePriceData(data) {
        if (data.c) {
            const currentPrice = this.formatPrice(data.c);
            const convertedPrice = this.currencyConverter.convertPrice(currentPrice);
            this.priceElements.current.textContent = convertedPrice;
            this.priceElements.current.setAttribute('data-original-price', currentPrice);
        }

        // Update 24h low
        if (data.l) {
            const lowPrice = this.formatPrice(data.l);
            const convertedLowPrice = this.currencyConverter.convertPrice(lowPrice);
            this.priceElements.low.textContent = convertedLowPrice;
            this.priceElements.low.setAttribute('data-original-price', lowPrice);
        }

        // Update 24h high
        if (data.h) {
            const highPrice = this.formatPrice(data.h);
            const convertedHighPrice = this.currencyConverter.convertPrice(highPrice);
            this.priceElements.high.textContent = convertedHighPrice;
            this.priceElements.high.setAttribute('data-original-price', highPrice);
        }

        // Update volume (keep in original currency)
        if (data.v) {
            const volume = this.formatVolume(data.v);
            this.priceElements.volume.textContent = `${volume} ${this.currentSymbol.replace('USDT', '')}`;
        }

        // Add color animation for price changes
        this.animatePriceChange(data.p);
    }
}

// Initialize the crypto data handler
const cryptoHandler = new CryptoDataHandler();

// Add event listener for pair selection
document.getElementById('pairSelector').addEventListener('click', () => {
    const pairs = [
        'BTCUSDT',  // Bitcoin at top
        'ETHUSDT',  // Ethereum second
        'DOGEUSDT', // Dogecoin third
        'XRPUSDT',  // Ripple fourth
        'LTCUSDT',  // Litecoin
        'BCHUSDT',  // Bitcoin Cash
        'TRXUSDT',  // TRON
        'FILUSDT',  // Filecoin
        'IOTAUSDT', // IOTA
        'EOSUSDT',  // EOS
        'BTSUSDT'   // BTS at bottom
    ];
    const currentIndex = pairs.indexOf(cryptoHandler.currentSymbol);
    const nextIndex = (currentIndex + 1) % pairs.length;
    cryptoHandler.changeSymbol(pairs[nextIndex]);
});

// Update currency selection handler
document.querySelectorAll('.currency-option').forEach(option => {
    option.addEventListener('click', async () => {
        const currency = option.getAttribute('data-currency');
        const symbol = option.getAttribute('data-symbol');
        
        // Update currency converter
        currencyConverter.currentCurrency = currency;
        currencyConverter.currentSymbol = symbol;
        
        // Fetch fresh exchange rates and update prices
        await currencyConverter.fetchExchangeRates();
        
        // Update selected state in dropdown
        document.querySelectorAll('.currency-option').forEach(opt => {
            opt.classList.toggle('selected', opt === option);
        });
        
        // Update display
        document.querySelector('.selected-currency').textContent = currency;
    });
});

// Sidebar functionality
const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('profileIcon');
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

// Toggle sidebar visibility
toggleButton.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
});

// Close sidebar when clicking overlay
overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});

// Close sidebar when clicking close button
document.getElementById('closeSidebar').addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
});

// Handle sign out
document.querySelector('.sign-out-btn').addEventListener('click', () => {
    // Add sign out logic here
    window.location.href = 'index.html';
});

// Add active class to current page link
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    if (link.getAttribute('href') === window.location.pathname.split('/').pop()) {
        link.classList.add('active');
    }
}); 