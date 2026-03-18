import { useCheckoutViewModel } from "../viewmodel/useCheckoutViewModel";
import { useForm } from "react-hook-form";
import type { CheckoutFormData, CheckoutStep } from "../model/types";
import { formatPrice } from "@/core/lib/formatters";
import styles from "./CheckoutSection.module.scss";

export function CheckoutSection() {
  const vm = useCheckoutViewModel();

  // Order confirmation screen
  if (vm.orderResult) {
    return (
      <div className={styles.confirmation}>
        <h2>Order Confirmed!</h2>
        <p>Your order ID is: <strong>{vm.orderResult.orderId}</strong></p>
        <p>Total: {formatPrice(vm.orderResult.total)}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.steps}>
        {/* Step indicators */}
        <div className={styles.stepIndicators}>
          {vm.steps.map((step, idx) => (
            <button
              key={step.id}
              className={`${styles.stepIndicator} ${
                step.id === vm.currentStep ? styles.active : ""
              } ${step.completed ? styles.completed : ""}`}
              onClick={() => vm.onStepClick(step.id)}
            >
              <span className={styles.stepNumber}>{idx + 1}</span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>

        {/* Accordion panels */}
        <ContactStep
          isOpen={vm.currentStep === "contact"}
          formData={vm.formData}
          onChange={vm.onFormChange}
          onComplete={() => vm.onStepComplete("contact")}
        />

        <ShippingStep
          isOpen={vm.currentStep === "shipping"}
          formData={vm.formData}
          addressConfig={vm.addressConfig}
          isLoading={vm.isLoadingAddress}
          onChange={vm.onFormChange}
          onCountryChange={vm.onCountryChange}
          onComplete={() => vm.onStepComplete("shipping")}
        />

        <PaymentStep
          isOpen={vm.currentStep === "payment"}
          formData={vm.formData}
          onChange={vm.onFormChange}
          onComplete={() => vm.onStepComplete("payment")}
        />

        <ReviewStep
          isOpen={vm.currentStep === "review"}
          formData={vm.formData}
          cartItems={vm.cartItems}
          subtotal={vm.formattedSubtotal}
          isSubmitting={vm.isSubmitting}
          onSubmit={vm.onSubmitOrder}
        />
      </div>
    </div>
  );
}

// ── Sub-step components ──────────────────────────────────

interface StepProps {
  isOpen: boolean;
  formData: Partial<CheckoutFormData>;
  onChange: (data: Partial<CheckoutFormData>) => void;
  onComplete: () => void;
}

function ContactStep({ isOpen, formData, onChange, onComplete }: StepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: formData.email ?? "", phone: formData.phone ?? "" },
  });

  if (!isOpen) return null;

  const onSubmit = (data: { email: string; phone: string }) => {
    onChange(data);
    onComplete();
  };

  return (
    <div id="step-contact" className={styles.stepPanel}>
      <h3>Contact Information</h3>
      <div className={styles.form} role="form">
        <div className={styles.field}>
          <label>Email *</label>
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            placeholder="your@email.com"
          />
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}
        </div>
        <div className={styles.field}>
          <label>Phone</label>
          <input {...register("phone")} type="tel" placeholder="+30..." />
        </div>
        <button
          className={styles.continueButton}
          onClick={handleSubmit(onSubmit)}
        >
          Continue to Shipping
        </button>
      </div>
    </div>
  );
}

function ShippingStep({
  isOpen,
  formData,
  addressConfig,
  isLoading,
  onChange,
  onCountryChange,
  onComplete,
}: StepProps & {
  addressConfig: ReturnType<typeof useCheckoutViewModel>["addressConfig"];
  isLoading: boolean;
  onCountryChange: (country: string) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: formData.firstName ?? "",
      lastName: formData.lastName ?? "",
      address: formData.address ?? "",
      city: formData.city ?? "",
      postalCode: formData.postalCode ?? "",
      region: formData.region ?? "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: Record<string, string>) => {
    onChange(data);
    onComplete();
  };

  return (
    <div id="step-shipping" className={styles.stepPanel}>
      <h3>Shipping Address</h3>
      {isLoading ? (
        <p>Loading address fields…</p>
      ) : (
        <div className={styles.form} role="form">
          <div className={styles.field}>
            <label>Country *</label>
            <select
              value={formData.country ?? "GR"}
              onChange={(e) => onCountryChange(e.target.value)}
            >
              <option value="GR">Greece</option>
              <option value="CY">Cyprus</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>First Name *</label>
              <input {...register("firstName", { required: "Required" })} />
              {errors.firstName && <span className={styles.error}>{errors.firstName.message}</span>}
            </div>
            <div className={styles.field}>
              <label>Last Name *</label>
              <input {...register("lastName", { required: "Required" })} />
              {errors.lastName && <span className={styles.error}>{errors.lastName.message}</span>}
            </div>
          </div>
          <div className={styles.field}>
            <label>Address *</label>
            <input {...register("address", { required: "Required" })} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>City *</label>
              <input {...register("city", { required: "Required" })} />
            </div>
            <div className={styles.field}>
              <label>{addressConfig?.postalCodeLabel ?? "Postal Code"} *</label>
              <input {...register("postalCode", { required: "Required" })} />
            </div>
          </div>
          {addressConfig?.regions && addressConfig.regions.length > 0 && (
            <div className={styles.field}>
              <label>{addressConfig.regionLabel ?? "Region"}</label>
              <select {...register("region")}>
                <option value="">Select…</option>
                {addressConfig.regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            className={styles.continueButton}
            onClick={handleSubmit(onSubmit)}
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  );
}

function PaymentStep({ isOpen, formData, onChange, onComplete }: StepProps) {
  if (!isOpen) return null;

  const paymentMethods = [
    { id: "card" as const, label: "Credit / Debit Card" },
    { id: "bank_transfer" as const, label: "Bank Transfer" },
    { id: "cod" as const, label: "Cash on Delivery" },
  ];

  return (
    <div id="step-payment" className={styles.stepPanel}>
      <h3>Payment Method</h3>
      <div className={styles.paymentOptions}>
        {paymentMethods.map((method) => (
          <label key={method.id} className={styles.paymentOption}>
            <input
              type="radio"
              name="paymentMethod"
              checked={formData.paymentMethod === method.id}
              onChange={() => onChange({ paymentMethod: method.id })}
            />
            <span>{method.label}</span>
          </label>
        ))}
      </div>
      <button className={styles.continueButton} onClick={onComplete}>
        Continue to Review
      </button>
    </div>
  );
}

function ReviewStep({
  isOpen,
  formData,
  cartItems,
  subtotal,
  isSubmitting,
  onSubmit,
}: {
  isOpen: boolean;
  formData: Partial<CheckoutFormData>;
  cartItems: ReturnType<typeof useCheckoutViewModel>["cartItems"];
  subtotal: string;
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div id="step-review" className={styles.stepPanel}>
      <h3>Review Your Order</h3>
      <div className={styles.reviewSection}>
        <h4>Contact</h4>
        <p>{formData.email} — {formData.phone}</p>
      </div>
      <div className={styles.reviewSection}>
        <h4>Shipping</h4>
        <p>
          {formData.firstName} {formData.lastName}<br />
          {formData.address}<br />
          {formData.city}, {formData.postalCode}
        </p>
      </div>
      <div className={styles.reviewSection}>
        <h4>Items ({cartItems.length})</h4>
        {cartItems.map((item) => (
          <p key={item.productId}>
            {item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}
          </p>
        ))}
        <p className={styles.reviewTotal}>Total: {subtotal}</p>
      </div>
      <button
        className={styles.submitButton}
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Placing Order…" : "Place Order"}
      </button>
    </div>
  );
}
