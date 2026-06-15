import axios from 'axios';

// utils/exchangeRate.js
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
let exchangeRates = {
    USD: 83.25, // Default fallback rate (1 USD = 83.25 INR)
    lastUpdated: Date.now()
};

// Get exchange rates from an external API
async function fetchExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        const data = await response.json();
        if (data && data.rates) {
            // Store the inverse rates (INR to other currencies)
            const rates = {};
            for (const [currency, rate] of Object.entries(data.rates)) {
                rates[currency] = 1 / rate;
            }
            return rates;
        }
        throw new Error('Invalid response from exchange rate API');
    } catch (error) {
        console.error('Failed to fetch exchange rates, using fallback:', error);
        return null;
    }
}

// Get the current exchange rate
export async function getExchangeRate(currency = 'USD') {
    // Return 1 if same currency or no conversion needed
    if (currency.toUpperCase() === 'INR') return 1;
    
    // Use cached rates if still valid
    if (Date.now() - exchangeRates.lastUpdated < CACHE_DURATION && exchangeRates[currency]) {
        return exchangeRates[currency];
    }

    // Fetch fresh rates
    const rates = await fetchExchangeRates();
    if (rates && rates[currency]) {
        exchangeRates = {
            ...rates,
            lastUpdated: Date.now()
        };
        return rates[currency];
    }

    // Fallback to default rate if fetch fails
    return exchangeRates[currency] || exchangeRates.USD;
}

// Convert any currency to INR
export async function convertToINR(amount, fromCurrency = 'USD') {
    if (fromCurrency.toUpperCase() === 'INR') return amount;
    const rate = await getExchangeRate(fromCurrency);
    return amount / rate; // Convert to INR
}

// Convert from INR to any currency
export async function convertFromINR(amount, toCurrency = 'USD') {
    if (toCurrency.toUpperCase() === 'INR') return amount;
    const rate = await getExchangeRate(toCurrency);
    return amount * rate; // Convert from INR
}

// Convert between any two currencies
export async function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    if (toCurrency === 'INR') return convertToINR(amount, fromCurrency);
    if (fromCurrency === 'INR') return convertFromINR(amount, toCurrency);
    
    // Convert from source currency to INR, then to target currency
    const inrAmount = await convertToINR(amount, fromCurrency);
    return convertFromINR(inrAmount, toCurrency);
}