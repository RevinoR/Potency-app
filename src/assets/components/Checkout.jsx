import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCreditCard,
  faMoneyBill,
  faTruck,
  faExclamationTriangle,
  faSync,
  faInfoCircle,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { faPaypal } from "@fortawesome/free-brands-svg-icons";
import axios from "axios";

const Checkout = ({ onBack, onOrderComplete }) => {
  const navigate = useNavigate();
  // Simplified form state with default values
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

  // Consolidated state management
  const [cart, setCart] = useState({
    items: [],
    summary: { subtotal: 0, tax: 0, total: 0 },
  });
  const [status, setStatus] = useState({
    loading: true,
    processing: false,
    processingStep: null,
    error: null,
  });
  const [stockWarnings, setStockWarnings] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Simplified cart validation
  const validateCart = async (showValidating = true) => {
    try {
      setStatus((prev) => ({
        ...prev,
        loading: !showValidating,
        processing: showValidating,
        processingStep: showValidating ? "validating" : null,
        error: null,
      }));

      const token = localStorage.getItem("token");
      if (!token) {
        setStatus((prev) => ({
          ...prev,
          error: "You must be logged in to checkout",
        }));
        return false;
      }

      // Validate cart for checkout
      const response = await axios.get("/api/checkout/validate", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // Set a reasonable timeout
      });

      // Set cart data
      if (response.data && response.data.data) {
        setCart(response.data.data);

        // Handle stock warnings
        const warnings =
          response.data.stockWarnings ||
          response.data.data.items
            .filter((item) => item.stock < 10)
            .map((item) => ({
              id: item.product_id,
              name: item.name,
              stock: item.stock,
              quantity: item.quantity,
            }));

        setStockWarnings(warnings);
      }

      // Pre-fill form with user data if available
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user && !form.name && !form.email) {
        setForm((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
        }));
      }

      return true;
    } catch (err) {
      console.error("Error validating cart:", err);

      if (err.name === "TimeoutError") {
        setStatus((prev) => ({
          ...prev,
          error: "Request timed out. Please try again.",
        }));
      } else if (err.code === "ERR_NETWORK") {
        setStatus((prev) => ({
          ...prev,
          error: "Network error. Please check your connection.",
        }));
      } else if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("validation failed")
      ) {
        setStatus((prev) => ({ ...prev, error: err.response.data.message }));
        if (err.response.data.invalidItems) {
          setStockWarnings(
            err.response.data.invalidItems.map((item) => ({
              id: item.productId,
              name: item.name,
              issue: item.issue,
              message: item.message,
            }))
          );
        }
      } else {
        setStatus((prev) => ({
          ...prev,
          error:
            err.response?.data?.message ||
            "Failed to validate cart for checkout",
        }));
      }
      return false;
    } finally {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        processing: false,
        processingStep: null,
      }));
    }
  };

  // Load cart data on component mount
  useEffect(() => {
    validateCart(false);
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

  // Format credit card number with spaces
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts = [];

    for (let i = 0, len = value.length; i < len; i += 4) {
      parts.push(value.substring(i, i + 4));
    }

    const formattedValue = parts.join(" ");

    setForm((prev) => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        cardNumber: formattedValue,
      },
    }));

    if (formErrors["paymentDetails.cardNumber"]) {
      setFormErrors((prev) => ({ ...prev, "paymentDetails.cardNumber": null }));
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};

    // Basic validations
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

    // Payment method validations
    if (form.paymentMethod === "credit_card") {
      const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv } =
        form.paymentDetails;

      if (!cardNumber.trim())
        errors["paymentDetails.cardNumber"] = "Card number is required";
      else if (!/^[0-9\s]{13,19}$/.test(cardNumber))
        errors["paymentDetails.cardNumber"] =
          "Please enter a valid card number";

      if (!cardHolderName.trim())
        errors["paymentDetails.cardHolderName"] = "Cardholder name is required";

      if (!expiryMonth)
        errors["paymentDetails.expiryMonth"] = "Expiry month is required";

      if (!expiryYear)
        errors["paymentDetails.expiryYear"] = "Expiry year is required";

      if (!cvv.trim()) errors["paymentDetails.cvv"] = "CVV is required";
      else if (!/^[0-9]{3,4}$/.test(cvv))
        errors["paymentDetails.cvv"] = "Please enter a valid CVV";

      // Check if card is expired
      if (expiryYear && expiryMonth) {
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        const expYear = parseInt(expiryYear);
        const expMonth = parseInt(expiryMonth);

        if (
          expYear < currentYear ||
          (expYear === currentYear && expMonth < currentMonth)
        ) {
          errors["paymentDetails.expiryYear"] = "Card is expired";
        }
      }
    } else if (form.paymentMethod === "paypal") {
      const { email } = form.paymentDetails;
      if (!email.trim())
        errors["paymentDetails.email"] = "PayPal email is required";
      else if (!emailRegex.test(email))
        errors["paymentDetails.email"] = "Please enter a valid email address";
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

    // Force address validation first, before any other validation
    if (form.address.trim().length < 10) {
      toast.error("Address must be at least 10 characters long", {
        toastId: "address-validation-error",
      });

      // Highlight the address field
      setFormErrors((prev) => ({
        ...prev,
        address: "Address must be at least 10 characters long",
      }));

      // Scroll to and focus the address field
      const addressField = document.querySelector('[name="address"]');
      if (addressField) {
        addressField.scrollIntoView({ behavior: "smooth", block: "center" });
        addressField.focus();
      }
      return; // Stop form submission
    }

    // Continue with full form validation
    if (!validateForm()) {
      // Show toast for validation errors
      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }

      // Highlight fields with errors
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(
          `[name="${firstErrorField}"]`
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          errorElement.focus();
        }
      }
      return;
    }

    // First verify cart is still valid
    const isCartValid = await validateCart();
    if (!isCartValid) return;

    try {
      setStatus((prev) => ({
        ...prev,
        processing: true,
        processingStep: "payment",
        error: null,
      }));

      const token = localStorage.getItem("token");
      if (!token) {
        setStatus((prev) => ({
          ...prev,
          error: "You must be logged in to checkout",
        }));
        return;
      }

      // Process checkout
      setStatus((prev) => ({ ...prev, processingStep: "creating_order" }));
      const response = await axios.post("/api/checkout/process", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle successful order
      setStatus((prev) => ({ ...prev, processingStep: "completed" }));
      onOrderComplete(response.data.data);
    } catch (err) {
      console.error("Error processing checkout:", err);

      if (err.code === "ERR_NETWORK") {
        setStatus((prev) => ({
          ...prev,
          error: "Network error. Please check your connection and try again.",
        }));
      } else if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("Payment processing failed")
      ) {
        setStatus((prev) => ({
          ...prev,
          error: `Payment failed: ${err.response.data.message.replace(
            "Payment processing failed: ",
            ""
          )}`,
        }));
      } else if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("validation failed")
      ) {
        setStatus((prev) => ({ ...prev, error: err.response.data.message }));
        // Re-validate cart to show updated stock information
        validateCart();
      } else {
        setStatus((prev) => ({
          ...prev,
          error: err.response?.data?.message || "Failed to process checkout",
        }));
      }

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
      setStatus((prev) => ({
        ...prev,
        processing: false,
        processingStep: null,
      }));
    }
  };

  // Get processing message based on current step
  const getProcessingMessage = () => {
    switch (status.processingStep) {
      case "validating":
        return "Validating cart...";
      case "payment":
        return "Processing payment...";
      case "creating_order":
        return "Creating your order...";
      case "completed":
        return "Order completed!";
      default:
        return "Processing...";
    }
  };

  // Render a placeholder for missing images
  const renderImagePlaceholder = (itemName) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400">
      <FontAwesomeIcon icon={faImage} className="text-xl mb-1" />
      <span className="text-xs text-center px-1 truncate w-full">
        {itemName}
      </span>
    </div>
  );

  // Loading state
  if (status.loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status.error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-600 mt-1 mr-3"
              />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700">{status.error}</p>

                {stockWarnings.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-red-800 font-medium text-sm">
                      Stock Issues:
                    </h4>
                    <ul className="list-disc pl-5 text-sm mt-1">
                      {stockWarnings.map((warning, idx) => (
                        <li key={idx} className="text-red-700">
                          {warning.message ||
                            `${warning.name}: Only ${warning.stock} available (requested ${warning.quantity})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Return to Cart
            </button>
            <button
              onClick={() => {
                setStatus((prev) => ({ ...prev, error: null }));
                validateCart(false);
              }}
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
            disabled={status.processing}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-xl font-bold text-black">Checkout</h1>
        </div>

        {stockWarnings.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="font-medium text-amber-800 mb-2 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              Inventory Notice
            </h3>
            <ul className="text-sm text-amber-700 space-y-1">
              {stockWarnings.map((warning, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span>
                    {warning.name}: Only {warning.stock} units left in stock
                    (you're ordering {warning.quantity})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Left Column - Contact and Shipping */}
              <div className="md:col-span-3 space-y-6">
                {/* Contact Information */}
                <div>
                  <h2 className="text-lg font-medium mb-4 pb-2 border-b text-black">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full p-3 border ${
                          formErrors.name ? "border-red-500" : "border-gray-300"
                        } rounded-md text-black`}
                        placeholder="Your full name"
                        disabled={status.processing}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full p-3 border ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md text-black`}
                        placeholder="your@email.com"
                        disabled={status.processing}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={`w-full p-3 border ${
                          formErrors.phone
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md text-black`}
                        placeholder="+62 812 3456 7890"
                        disabled={status.processing}
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div>
                  <h2 className="text-lg font-medium mb-4 pb-2 border-b text-black">
                    Shipping Address
                  </h2>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Full Address *
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={`w-full p-3 border ${
                        formErrors.address
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md text-black`}
                      placeholder="Enter your complete address, including street, building/house number, city, postal code, and country"
                      rows="3"
                      disabled={status.processing}
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-medium mb-4 pb-2 border-b text-black">
                    Payment Method
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {/* Credit Card option */}
                    <label
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer transition-colors ${
                        form.paymentMethod === "credit_card"
                          ? "border-black bg-gray-50"
                          : "border-gray-300 hover:bg-gray-50"
                      } ${
                        status.processing
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={form.paymentMethod === "credit_card"}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={status.processing}
                      />
                      <FontAwesomeIcon
                        icon={faCreditCard}
                        className={`text-2xl mb-2 ${
                          form.paymentMethod === "credit_card"
                            ? "text-black"
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          form.paymentMethod === "credit_card"
                            ? "font-medium text-black"
                            : "text-gray-700"
                        }`}
                      >
                        Credit Card
                      </span>
                    </label>

                    {/* PayPal option */}
                    <label
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer transition-colors ${
                        form.paymentMethod === "paypal"
                          ? "border-black bg-gray-50"
                          : "border-gray-300 hover:bg-gray-50"
                      } ${
                        status.processing
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={form.paymentMethod === "paypal"}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={status.processing}
                      />
                      <FontAwesomeIcon
                        icon={faPaypal}
                        className={`text-2xl mb-2 ${
                          form.paymentMethod === "paypal"
                            ? "text-black"
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          form.paymentMethod === "paypal"
                            ? "font-medium text-black"
                            : "text-gray-700"
                        }`}
                      >
                        PayPal
                      </span>
                    </label>

                    {/* Bank Transfer option */}
                    <label
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer transition-colors ${
                        form.paymentMethod === "bank_transfer"
                          ? "border-black bg-gray-50"
                          : "border-gray-300 hover:bg-gray-50"
                      } ${
                        status.processing
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={form.paymentMethod === "bank_transfer"}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={status.processing}
                      />
                      <FontAwesomeIcon
                        icon={faMoneyBill}
                        className={`text-2xl mb-2 ${
                          form.paymentMethod === "bank_transfer"
                            ? "text-black"
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          form.paymentMethod === "bank_transfer"
                            ? "font-medium text-black"
                            : "text-gray-700"
                        }`}
                      >
                        Bank Transfer
                      </span>
                    </label>

                    {/* Cash on Delivery option */}
                    <label
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer transition-colors ${
                        form.paymentMethod === "cod"
                          ? "border-black bg-gray-50"
                          : "border-gray-300 hover:bg-gray-50"
                      } ${
                        status.processing
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={form.paymentMethod === "cod"}
                        onChange={handleChange}
                        className="sr-only"
                        disabled={status.processing}
                      />
                      <FontAwesomeIcon
                        icon={faTruck}
                        className={`text-2xl mb-2 ${
                          form.paymentMethod === "cod"
                            ? "text-black"
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          form.paymentMethod === "cod"
                            ? "font-medium text-black"
                            : "text-gray-700"
                        }`}
                      >
                        Cash on Delivery
                      </span>
                    </label>
                  </div>

                  {/* Payment Details */}
                  {form.paymentMethod === "credit_card" && (
                    <div className="bg-gray-50 p-4 rounded-md space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="paymentDetails.cardNumber"
                          value={form.paymentDetails.cardNumber}
                          onChange={handleCardNumberChange}
                          className={`w-full p-3 border ${
                            formErrors["paymentDetails.cardNumber"]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md text-black`}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          disabled={status.processing}
                        />
                        {formErrors["paymentDetails.cardNumber"] && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors["paymentDetails.cardNumber"]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
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
                          } rounded-md text-black`}
                          placeholder="Name on card"
                          disabled={status.processing}
                        />
                        {formErrors["paymentDetails.cardHolderName"] && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors["paymentDetails.cardHolderName"]}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <div className="w-1/3">
                          <label className="block text-sm text-gray-700 mb-1">
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
                            } rounded-md text-black`}
                            disabled={status.processing}
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
                          <label className="block text-sm text-gray-700 mb-1">
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
                            } rounded-md text-black`}
                            disabled={status.processing}
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
                          <label className="block text-sm text-gray-700 mb-1">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="paymentDetails.cvv"
                            value={form.paymentDetails.cvv}
                            onChange={handleChange}
                            className={`w-full p-3 border ${
                              formErrors["paymentDetails.cvv"]
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md text-black`}
                            placeholder="123"
                            maxLength="4"
                            disabled={status.processing}
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
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          PayPal Email *
                        </label>
                        <input
                          type="email"
                          name="paymentDetails.email"
                          value={form.paymentDetails.email || ""}
                          onChange={handleChange}
                          className={`w-full p-3 border ${
                            formErrors["paymentDetails.email"]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md text-black`}
                          placeholder="your@email.com"
                          disabled={status.processing}
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
                    <div className="bg-gray-50 p-4 rounded-md space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          name="paymentDetails.bankName"
                          value={form.paymentDetails.bankName || ""}
                          onChange={handleChange}
                          className={`w-full p-3 border ${
                            formErrors["paymentDetails.bankName"]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md text-black`}
                          placeholder="Bank name"
                          disabled={status.processing}
                        />
                        {formErrors["paymentDetails.bankName"] && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors["paymentDetails.bankName"]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Account Name *
                        </label>
                        <input
                          type="text"
                          name="paymentDetails.accountName"
                          value={form.paymentDetails.accountName || ""}
                          onChange={handleChange}
                          className={`w-full p-3 border ${
                            formErrors["paymentDetails.accountName"]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md text-black`}
                          placeholder="Account holder name"
                          disabled={status.processing}
                        />
                        {formErrors["paymentDetails.accountName"] && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors["paymentDetails.accountName"]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          name="paymentDetails.accountNumber"
                          value={form.paymentDetails.accountNumber || ""}
                          onChange={handleChange}
                          className={`w-full p-3 border ${
                            formErrors["paymentDetails.accountNumber"]
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md text-black`}
                          placeholder="Account number"
                          disabled={status.processing}
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
                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-blue-500 mt-1 mr-3"
                        />
                        <p className="text-sm text-gray-600">
                          Payment will be collected upon delivery. Please ensure
                          someone is available to receive the package and make
                          the payment.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="md:col-span-2">
                <div className="bg-gray-50 p-5 rounded-lg sticky top-6">
                  <h2 className="text-lg font-medium mb-4 pb-2 border-b text-black">
                    Order Summary
                  </h2>

                  <div className="max-h-60 overflow-y-auto mb-4 pr-1">
                    {cart.items && cart.items.length > 0 ? (
                      cart.items.map((item) => (
                        <div
                          key={item.cart_item_id}
                          className="flex items-start py-3 border-b last:border-b-0"
                        >
                          <div className="w-16 h-16 bg-gray-200 mr-3 flex-shrink-0 overflow-hidden rounded">
                            {item.image ? (
                              <img
                                src={`data:image/jpeg;base64,${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.parentElement.replaceWith(
                                    renderImagePlaceholder(item.name)
                                  );
                                }}
                              />
                            ) : (
                              renderImagePlaceholder(item.name)
                            )}
                          </div>

                          <div className="flex-grow">
                            <h3 className="text-sm font-medium text-black">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {item.subtitle || "Product"}
                            </p>
                            <p className="text-xs text-black mt-1">
                              {item.quantity} × {formatCurrency(item.price)}
                            </p>
                            {item.stock < 10 && (
                              <p className="text-xs text-amber-600 mt-1">
                                Only {item.stock} left in stock
                              </p>
                            )}
                          </div>

                          <div className="ml-2 text-right">
                            <p className="font-medium text-sm text-black">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No items in cart
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="text-black">
                        {formatCurrency(cart.summary?.subtotal || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Tax (10%)</span>
                      <span className="text-black">
                        {formatCurrency(cart.summary?.tax || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t">
                      <span className="text-black">Total</span>
                      <span className="text-black">
                        {formatCurrency(cart.summary?.total || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Warning message if address is too short */}
                  {form.address.trim().length < 10 && (
                    <div className="mt-4 mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium text-center">
                        ⚠️ Your address is too short. Add at least{" "}
                        {10 - form.address.trim().length} more characters.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 disabled:bg-gray-400 mt-6 rounded flex items-center justify-center"
                    disabled={
                      status.processing ||
                      !cart.items ||
                      cart.items.length === 0
                    }
                  >
                    {status.processing && (
                      <span className="inline-block h-5 w-5 border-t-2 border-white rounded-full animate-spin mr-2"></span>
                    )}
                    {status.processing ? getProcessingMessage() : "Place Order"}
                  </button>

                  {status.processing && status.processingStep && (
                    <div className="flex justify-center mt-3">
                      <ul className="flex items-center space-x-2 text-xs">
                        <li
                          className={`flex items-center ${
                            status.processingStep === "validating"
                              ? "text-blue-500 font-bold"
                              : status.processingStep === "payment" ||
                                status.processingStep === "creating_order" ||
                                status.processingStep === "completed"
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center mr-1 ${
                              status.processingStep === "validating"
                                ? "bg-blue-100 border border-blue-500"
                                : status.processingStep === "payment" ||
                                  status.processingStep === "creating_order" ||
                                  status.processingStep === "completed"
                                ? "bg-green-100"
                                : "bg-gray-100"
                            }`}
                          >
                            1
                          </span>
                          Validating
                        </li>
                        <li className="text-gray-400">→</li>
                        <li
                          className={`flex items-center ${
                            status.processingStep === "payment"
                              ? "text-blue-500 font-bold"
                              : status.processingStep === "creating_order" ||
                                status.processingStep === "completed"
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center mr-1 ${
                              status.processingStep === "payment"
                                ? "bg-blue-100 border border-blue-500"
                                : status.processingStep === "creating_order" ||
                                  status.processingStep === "completed"
                                ? "bg-green-100"
                                : "bg-gray-100"
                            }`}
                          >
                            2
                          </span>
                          Payment
                        </li>
                        <li className="text-gray-400">→</li>
                        <li
                          className={`flex items-center ${
                            status.processingStep === "creating_order"
                              ? "text-blue-500 font-bold"
                              : status.processingStep === "completed"
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center mr-1 ${
                              status.processingStep === "creating_order"
                                ? "bg-blue-100 border border-blue-500"
                                : status.processingStep === "completed"
                                ? "bg-green-100"
                                : "bg-gray-100"
                            }`}
                          >
                            3
                          </span>
                          Order
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
