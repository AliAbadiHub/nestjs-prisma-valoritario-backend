export function normalizeUnit(inputUnit: string): string {
  if (!inputUnit) return '';

  // Normalize input to lowercase and trim whitespace
  const normalizedInput = inputUnit.trim().toLowerCase();

  // Handle regex patterns for dynamic input matching
  if (/^\d+\s?(grams?|g)$/i.test(normalizedInput)) {
    // Match variations like "60 grams", "60g", "60 g"
    return normalizedInput.replace(/\s?(grams?|g)$/i, ' g').trim();
  }

  if (/^\d+\s?(kilograms?|kilos?|kg)$/i.test(normalizedInput)) {
    // Match variations like "1 kilo", "1 kilogram", "1kg", "1 kg"
    const value = parseInt(normalizedInput.match(/^\d+/)?.[0] || '0', 10);
    return `${value * 1000} g`; // Convert kilograms to grams
  }

  if (/^\d+\s?(liters?|litres?|l|ml)$/i.test(normalizedInput)) {
    // Match variations like "1L", "1 liter", "1litre", "1000ml"
    if (/ml$/i.test(normalizedInput)) {
      // Already in milliliters
      return normalizedInput.replace(/\s?ml$/i, ' ml').trim();
    } else {
      // Convert liters to milliliters
      const value = parseInt(normalizedInput.match(/^\d+/)?.[0] || '0', 10);
      return `${value * 1000} ml`;
    }
  }

  if (/^\d+\s?(ounces?|oz)$/i.test(normalizedInput)) {
    // Match variations like "1 ounce", "1oz"
    const value = parseInt(normalizedInput.match(/^\d+/)?.[0] || '0', 10);
    return `${(value * 28.35).toFixed(2)} g`; // Convert ounces to grams
  }

  if (/^\d+\s?(pints?)$/i.test(normalizedInput)) {
    // Match variations like "1 pint"
    const value = parseInt(normalizedInput.match(/^\d+/)?.[0] || '0', 10);
    return `${(value * 473.18).toFixed(2)} ml`; // Convert pints to milliliters
  }

  if (/^\d+\s?(quarts?)$/i.test(normalizedInput)) {
    // Match variations like "1 quart"
    const value = parseInt(normalizedInput.match(/^\d+/)?.[0] || '0', 10);
    return `${(value * 946.35).toFixed(2)} ml`; // Convert quarts to milliliters
  }

  // Return the mapped value or the original input for unmatched cases
  return unitMappings[normalizedInput] || normalizedInput;
}

const unitMappings: Record<string, string> = {
  // Direct mappings for standard cases
  '1l': '1000 ml',
  '1 liter': '1000 ml',
  '1 litre': '1000 ml',
  '1000ml': '1000 ml',
  '500ml': '500 ml',
  '250ml': '250 ml',
  '1kg': '1000 g',
  '1 kilogram': '1000 g',
  '1 kilo': '1000 g',
  '500g': '500 g',
  '100g': '100 g',
  '60g': '60 g',
  '1oz': '28.35 g',
  '1 ounce': '28.35 g',
  '1 pint': '473.18 ml',
  '1 quart': '946.35 ml',
};
