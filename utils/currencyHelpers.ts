
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
    // 1. Try GeoIP with a timeout to prevent long hangs or NetworkErrors
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.country === 'TN') {
            return 'TND';
        }
    } catch (error) {
        console.warn('GeoIP detection failed or timed out. Falling back to timezone/default.', error);
    }

    // 2. Secondary fallback: Check browser timezone
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Tunis') || timezone.includes('Africa/Tunis')) {
            return 'TND';
        }
    } catch (e) {
        // Ignore timezone errors
    }

    return 'USD';
};
