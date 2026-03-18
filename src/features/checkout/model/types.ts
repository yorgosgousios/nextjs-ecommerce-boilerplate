export interface CheckoutFormData {
  // Contact
  email: string;
  phone: string;

  // Shipping address
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  region: string;

  // Shipping method
  shippingMethodId: string;

  // Payment
  paymentMethod: "card" | "bank_transfer" | "cod";

  // Notes
  notes: string;
}

export interface CheckoutStep {
  id: "contact" | "shipping" | "payment" | "review";
  label: string;
  completed: boolean;
}

export interface OrderResponse {
  orderId: string;
  status: string;
  total: number;
}

export interface AddressField {
  name: keyof CheckoutFormData;
  label: string;
  required: boolean;
  type?: string;
}

/** Dynamic address fields per country (fetched from API) */
export interface CountryAddressConfig {
  countryCode: string;
  fields: AddressField[];
  postalCodeLabel: string;
  regionLabel: string;
  regions: { code: string; name: string }[];
}
