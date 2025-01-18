export function formatMoney(
  amount: number,
  currencySymbol: string = "₵",
  decimalPlaces: number = 2,
  locale: string = "en-GH"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })
    .format(amount)
    .replace(/\u00A0/, " ")
    .replace("GHS", currencySymbol);
}

export const subStringLongText = (
  text: string,
  maxLength: number,
  ellipsis: string = "..."
): string => {
  return text?.length > maxLength
    ? text?.substring(0, maxLength - ellipsis.length) + ellipsis
    : text;
};

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    
  });
};

export const formatDate = (dateString: string) => {
  if (!dateString || dateString === "0001-01-01T00:00:00") {
    return "";
  }
  
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const validatePhoneNumber = (phoneNumber: string) => {
  const phoneRegex = /^\+?(\d{1,3})?[-.\s]?(\(?\d{3}\)?[-.\s]?)?(\d{3}[-.\s]?\d{4,})$/
  return phoneRegex.test(phoneNumber);
};

export const splitFullName = (fullName: string) => {
  const names = fullName.split(" ")
  const firstName = names[0]
  const lastName = names[names.length - 1]

  return {firstName, lastName}
}
