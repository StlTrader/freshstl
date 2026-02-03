
/**
 * Utility functions for currency formatting and conversion.
 */

export const CONVERSION_RATE_USD_TO_TND = 3.15; // Approximate rate

/**
 * Formats a price (in cents/millimes) based on the specified currency.
 * @param amountInCents The amount in the base unit's smallest denomination (cents for USD, millimes for TND if converted).
 * @param currency The currency code (e.g., 'USD', 'TND').
 * @returns A formatted string (e.g., "$10.00", "31.50 DT").
 */
export const formatPrice = (amountInCents: number, currency: string = 'USD'): string => {
    if (currency.toUpperCase() === 'TND' || currency.toUpperCase() === 'DT') {
        // Note: In reality, prices might be stored in USD and converted.
        // If we assume amountInCents is always USD cents:
        const tndValue = (amountInCents / 100) * CONVERSION_RATE_USD_TO_TND;
        return `${tndValue.toFixed(2)} DT`;
    }

    // Default to USD
    return `$${(amountInCents / 100).toFixed(2)}`;
};

/**
 * Gets the currency code based on the user's location.
 * Defaults to 'USD'.
 */
export const detectCurrency = async (): Promise<string> => {
    try {
        // Simple GeoIP check
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data.country === 'TN') {
            return 'TND';
        }
    } catch (error) {
        console.error('Failed to detect location:', error);
    }

    return 'USD';
};
