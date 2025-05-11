import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCreditCard,
  faMoneyBill,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import { faPaypal } from "@fortawesome/free-brands-svg-icons";
import axios from "axios";

const Checkout = ({ onBack, onOrderComplete }) => {
  // User information form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "credit_card",
    paymentDetails: {
      cardNumber: "",
      cardHolderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    },
  });

  // Cart summary state
  const [cart, setCart] = useState({
    items: [],
    summary: { subtotal: 0, tax: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch and validate cart for checkout
  const validateCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to checkout");
        return;
      }

      // Validate cart for checkout
      const response = await axios.get("/api/checkout/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(response.data.data);

      // Pre-fill form with user data if available
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user) {
        setForm((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
        }));
      }
    } catch (err) {
      console.error("Error validating cart:", err);
      setError(
        err.response?.data?.message || "Failed to validate cart for checkout"
      );
    } finally {
      setLoading(false);
    }
  };

  // Validate cart on component mount
  useEffect(() => {
    validateCart();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear form errors when field is modified
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }

    if (name.includes(".")) {
      // Handle nested properties (payment details)
      const [parent, child] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      // Handle top-level properties
      setForm((prev) => ({ ...prev, [name]: value }));

      // Reset payment details when payment method changes
      if (name === "paymentMethod") {
        const paymentDetails =
          value === "credit_card"
            ? {
                cardNumber: "",
                cardHolderName: "",
                expiryMonth: "",
                expiryYear: "",
                cvv: "",
              }
            : value === "paypal"
            ? { email: "" }
            : value === "bank_transfer"
            ? { accountName: "", accountNumber: "", bankName: "" }
            : {};

        setForm((prev) => ({ ...prev, paymentDetails }));
      }
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};

    // Validate required fields
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    if (!form.address.trim()) errors.address = "Address is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
    if (form.phone && !phoneRegex.test(form.phone.replace(/[\s-]/g, ""))) {
      errors.phone = "Please enter a valid phone number";
    }

    // Payment method specific validation
    if (form.paymentMethod === "credit_card") {
      const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv } =
        form.paymentDetails;

      if (!cardNumber.trim())
        errors["paymentDetails.cardNumber"] = "Card number is required";
      else if (!/^[0-9]{13,19}$/.test(cardNumber.replace(/\s/g, ""))) {
        errors["paymentDetails.cardNumber"] =
          "Please enter a valid card number";
      }

      if (!cardHolderName.trim())
        errors["paymentDetails.cardHolderName"] = "Cardholder name is required";
      if (!expiryMonth)
        errors["paymentDetails.expiryMonth"] = "Expiry month is required";
      if (!expiryYear)
        errors["paymentDetails.expiryYear"] = "Expiry year is required";

      if (!cvv.trim()) errors["paymentDetails.cvv"] = "CVV is required";
      else if (!/^[0-9]{3,4}$/.test(cvv)) {
        errors["paymentDetails.cvv"] = "Please enter a valid CVV";
      }
    } else if (form.paymentMethod === "paypal") {
      const { email } = form.paymentDetails;
      if (!email.trim())
        errors["paymentDetails.email"] = "PayPal email is required";
      else if (!emailRegex.test(email)) {
        errors["paymentDetails.email"] = "Please enter a valid email address";
      }
    } else if (form.paymentMethod === "bank_transfer") {
      const { accountName, accountNumber, bankName } = form.paymentDetails;
      if (!accountName.trim())
        errors["paymentDetails.accountName"] = "Account name is required";
      if (!accountNumber.trim())
        errors["paymentDetails.accountNumber"] = "Account number is required";
      if (!bankName.trim())
        errors["paymentDetails.bankName"] = "Bank name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to checkout");
        return;
      }

      // Process checkout
      const response = await axios.post("/api/checkout/process", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle successful order
      onOrderComplete(response.data.data);
    } catch (err) {
      console.error("Error processing checkout:", err);
      setError(err.response?.data?.message || "Failed to process checkout");

      // Handle validation errors from server
      if (err.response?.data?.errors) {
        const serverErrors = {};
        err.response.data.errors.forEach((error) => {
          // Extract field name from error message if possible
          const fieldMatch = error.match(/^"([^"]+)"/);
          if (fieldMatch) {
            serverErrors[fieldMatch[1]] = error;
          }
        });

        if (Object.keys(serverErrors).length > 0) {
          setFormErrors(serverErrors);
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Preparing checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-black text-white hover:bg-gray-800"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        <span>Back to Cart</span>
      </button>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Checkout Form */}
        <div className="w-full md:w-3/5">
          <form onSubmit={handleSubmit}>
            {/* Contact Information */}
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">Contact Information</h2>

              <div className="mb-4">
                <label className="block text-sm mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="Your full name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="your@email.com"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    formErrors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="+62 812 3456 7890"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">Shipping Address</h2>

              <div className="mb-4">
                <label className="block text-sm mb-1">Full Address *</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    formErrors.address ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="Enter your complete address, including street, building/house number, city, postal code, and country"
                  rows="3"
                />
                {formErrors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">Payment Method</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <label
                  className={`flex flex-col items-center p-4 border rounded-md cursor-pointer ${
                    form.paymentMethod === "credit_card"
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={form.paymentMethod === "credit_card"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    className="text-2xl mb-2"
                  />
                  <span className="text-sm">Credit Card</span>
                </label>

                <label
                  className={`flex flex-col items-center p-4 border rounded-md cursor-pointer ${
                    form.paymentMethod === "paypal"
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={form.paymentMethod === "paypal"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <FontAwesomeIcon icon={faPaypal} className="text-2xl mb-2" />
                  <span className="text-sm">PayPal</span>
                </label>

                <label
                  className={`flex flex-col items-center p-4 border rounded-md cursor-pointer ${
                    form.paymentMethod === "bank_transfer"
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={form.paymentMethod === "bank_transfer"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <FontAwesomeIcon
                    icon={faMoneyBill}
                    className="text-2xl mb-2"
                  />
                  <span className="text-sm">Bank Transfer</span>
                </label>

                <label
                  className={`flex flex-col items-center p-4 border rounded-md cursor-pointer ${
                    form.paymentMethod === "cod"
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === "cod"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <FontAwesomeIcon icon={faTruck} className="text-2xl mb-2" />
                  <span className="text-sm">Cash on Delivery</span>
                </label>
              </div>

              {/* Payment Details based on selected method */}
              {form.paymentMethod === "credit_card" && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-4">
                    <label className="block text-sm mb-1">Card Number *</label>
                    <input
                      type="text"
                      name="paymentDetails.cardNumber"
                      value={form.paymentDetails.cardNumber}
                      onChange={handleChange}
                      className={`w-full p-3 border ${
                        formErrors["paymentDetails.cardNumber"]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md`}
                      placeholder="1234 5678 9012 3456"
                    />
                    {formErrors["paymentDetails.cardNumber"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors["paymentDetails.cardNumber"]}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      name="paymentDetails.cardHolderName"
                      value={form.paymentDetails.cardHolderName}
                      onChange={handleChange}
                      className={`w-full p-3 border ${
                        formErrors["paymentDetails.cardHolderName"]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md`}
                      placeholder="Name on card"
                    />
                    {formErrors["paymentDetails.cardHolderName"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors["paymentDetails.cardHolderName"]}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="w-1/3">
                      <label className="block text-sm mb-1">
                        Expiry Month *
                      </label>
                      <select
                        name="paymentDetails.expiryMonth"
                        value={form.paymentDetails.expiryMonth}
                        onChange={handleChange}
                        className={`w-full p-3 border ${
                          formErrors["paymentDetails.expiryMonth"]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md`}
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1;
                          return (
                            <option key={month} value={month}>
                              {month.toString().padStart(2, "0")}
                            </option>
                          );
                        })}
                      </select>
                      {formErrors["paymentDetails.expiryMonth"] && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors["paymentDetails.expiryMonth"]}
                        </p>
                      )}
                    </div>

                    <div className="w-1/3">
                      <label className="block text-sm mb-1">
                        Expiry Year *
                      </label>
                      <select
                        name="paymentDetails.expiryYear"
                        value={form.paymentDetails.expiryYear}
                        onChange={handleChange}
                        className={`w-full p-3 border ${
                          formErrors["paymentDetails.expiryYear"]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md`}
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year % 100}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                      {formErrors["paymentDetails.expiryYear"] && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors["paymentDetails.expiryYear"]}
                        </p>
                      )}
                    </div>

                    <div className="w-1/3">
                      <label className="block text-sm mb-1">CVV *</label>
                      <input
                        type="text"
                        name="paymentDetails.cvv"
                        value={form.paymentDetails.cvv}
                        onChange={handleChange}
                        className={`w-full p-3 border ${
                          formErrors["paymentDetails.cvv"]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md`}
                        placeholder="123"
                        maxLength="4"
                      />
                      {formErrors["paymentDetails.cvv"] && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors["paymentDetails.cvv"]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {form.paymentMethod === "paypal" && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-4">
                    <label className="block text-sm mb-1">PayPal Email *</label>
                    <input
                      type="email"
                      name="paymentDetails.email"
                      value={form.paymentDetails.email}
                      onChange={handleChange}
                      className={`w-full p-3 border ${
                        formErrors["paymentDetails.email"]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md`}
                      placeholder="your@email.com"
                    />
                    {formErrors["paymentDetails.email"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors["paymentDetails.email"]}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {form.paymentMethod === "bank_transfer" && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-4">
                    <label className="block text-sm mb-1">Bank Name *</label>
                    <input
                      type="text"
                      name="paymentDetails.bankName"
                      value={form.paymentDetails.bankName}
                      onChange={handleChange}
                      className={`w-full p-3 border ${
                        formErrors["paymentDetails.bankName"]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md`}
                      placeholder="Bank name"
                    />
                    {formErrors["paymentDetails.bankName"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors["paymentDetails.bankName"]}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm mb-1">Account Name *</label>
                    <input
                      type="text"
                      name="paymentDetails.accountName"
                      value={form.paymentDetails.accountName}
                      onChange={handleChange}
                      className={`w-full p-3 border ${
                        formErrors["paymentDetails.accountName"]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md`}
                      placeholder="Account holder name"
                    />
                    {formErrors["paymentDetails.accountName"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors["paymentDetails.accountName"]}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="paymentDetails.accountNumber"
                      value={form.paymentDetails.accountNumber}
                      onChange={handleChange}
                      className={`w-full p-3 border ${
                        formErrors["paymentDetails.accountNumber"]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md`}
                      placeholder="Account number"
                    />
                    {formErrors["paymentDetails.accountNumber"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors["paymentDetails.accountNumber"]}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {form.paymentMethod === "cod" && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    Payment will be collected upon delivery. Please ensure
                    someone is available to receive the package and make the
                    payment.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 disabled:bg-gray-400"
              disabled={processing}
            >
              {processing ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-2/5">
          <div className="bg-gray-50 p-6 rounded-md">
            <h2 className="text-xl font-medium mb-4">Order Summary</h2>

            <div className="max-h-80 overflow-y-auto mb-4">
              {cart.items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex items-start py-3 border-b"
                >
                  <div className="w-16 h-16 bg-gray-200 mr-3 flex-shrink-0">
                    {item.image ? (
                      <img
                        src={`data:image/jpeg;base64,${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-xs text-gray-600">{item.subtitle}</p>
                    <p className="text-xs">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="ml-2 text-right">
                    <p className="font-medium text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(cart.summary.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax (10%)</span>
                <span>{formatCurrency(cart.summary.tax)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t">
                <span>Total</span>
                <span>{formatCurrency(cart.summary.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
