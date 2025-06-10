"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalculatePricingCompo from "../../../components/CalculatePricingCompo";

const CreateShippingForm = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    senderFullName: "",
    senderEmail: "",
    senderPhone: "",
    pickupAddress: "",
    senderCountry: "Bangladesh",
    senderCountryCode: "BD",
    senderDistrictState: "",
    receiverFullName: "",
    receiverEmail: "",
    receiverPhone: "",
    deliveryAddress: "",
    receiverCountry: "",
    receiverCountryCode: "",
    receiverStateCity: "",
    receiverZipCode: "",
    startDate: null,
    endDate: null,
  });
  const [errors, setErrors] = useState({});
  const [missingFields, setMissingFields] = useState([]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
    }));
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://server-7tons.vercel.app/api/countryList");
        const data = await response.json();
        if (data.success) {
          setCountries(data.data);
          // Find Bangladesh in the list and set its code if not already set
          const bangladesh = data.data.find(
            (country) => country.name === "Bangladesh"
          );
          if (bangladesh && formData.senderCountryCode !== bangladesh.code) {
            setFormData((prev) => ({
              ...prev,
              senderCountryCode: bangladesh.code,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (e, type) => {
    const selectedCountry = countries.find(
      (country) => country.name === e.target.value
    );
    if (selectedCountry) {
      setFormData((prev) => ({
        ...prev,
        [`${type}Country`]: selectedCountry.name,
        [`${type}CountryCode`]: selectedCountry.code,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [`${type}Country`]: "",
        [`${type}CountryCode`]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "senderFullName",
      "senderEmail",
      "senderPhone",
      "pickupAddress",
      "senderCountry",
      "senderCountryCode",
      "senderDistrictState",
      "receiverFullName",
      "receiverEmail",
      "receiverPhone",
      "deliveryAddress",
      "receiverCountry",
      "receiverCountryCode",
      "receiverStateCity",
      "receiverZipCode",
    ];

    // Check missing fields
    const missing = requiredFields.filter((field) => !formData[field]);
    setMissingFields(missing);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.senderEmail && !emailRegex.test(formData.senderEmail)) {
      newErrors.senderEmail = "Invalid email format";
    }
    if (formData.receiverEmail && !emailRegex.test(formData.receiverEmail)) {
      newErrors.receiverEmail = "Invalid email format";
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (formData.senderPhone && !phoneRegex.test(formData.senderPhone)) {
      newErrors.senderPhone = "Phone must be 10-15 digits";
    }
    if (formData.receiverPhone && !phoneRegex.test(formData.receiverPhone)) {
      newErrors.receiverPhone = "Phone must be 10-15 digits";
    }

    // Zip code validation
    if (formData.receiverZipCode && isNaN(formData.receiverZipCode)) {
      newErrors.receiverZipCode = "Zip code must be a number";
    }

    setErrors(newErrors);
    return missing.length === 0 && Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://server-7tons.vercel.app/api/create-inter-shipment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          `Shipment created successfully! Tracking Number: ${data.trackingNumber}`
        );
        // Reset form after successful submission
        setFormData({
          senderFullName: "",
          senderEmail: "",
          senderPhone: "",
          pickupAddress: "",
          senderCountry: "",
          senderCountryCode: "",
          senderDistrictState: "",

          receiverFullName: "",
          receiverEmail: "",
          receiverPhone: "",
          deliveryAddress: "",
          receiverCountry: "",
          receiverCountryCode: "",
          receiverStateCity: "",
          receiverZipCode: "",
        });
      } else {
        console.error("Error creating shipment:", data.error);
        alert(data.error || "Failed to create shipment");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      startDate: date,
      // Reset end date if it's before the new start date
      endDate:
        prev.endDate && date && prev.endDate < date ? null : prev.endDate,
    }));
  };

  const handleEndDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      endDate: date,
    }));
  };

  return (
    <div className="p-8 gap-6 flex justify-center items-center flex-col fontPoppins">
      <div className="flex justify-start w-full">
        <h1 className="fontPoppins font-semibold text-black text-2xl">
          Create International Shipment
        </h1>
      </div>
      <div className="bg-white rounded-xl w-full min-h-screen shadow border border-gray-300 p-6">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          {missingFields.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              <p className="font-semibold">
                Please fill in all required fields:
              </p>
              <ul className="list-disc pl-5">
                {missingFields.map((field) => (
                  <li key={field}>
                    {field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .replace("sender ", "Sender ")
                      .replace("receiver ", "Receiver ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sender Information Column */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">
                Sender Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="senderFullName"
                  value={formData.senderFullName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderFullName")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email*
                </label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderEmail") || errors.senderEmail
                      ? "border-red-500"
                      : "border"
                  }`}
                />
                {errors.senderEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.senderEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone*
                </label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderPhone") || errors.senderPhone
                      ? "border-red-500"
                      : "border"
                  }`}
                />
                {errors.senderPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.senderPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pickup Address*
                </label>
                <textarea
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("pickupAddress")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sender Country*
                </label>
                <select
                  name="senderCountry"
                  value={formData.senderCountry}
                  onChange={(e) => handleCountryChange(e, "sender")}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderCountry") ||
                    missingFields.includes("senderCountryCode")
                      ? "border-red-500"
                      : "border"
                  }`}
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country.name}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                {formData.senderCountryCode && (
                  <p className="mt-1 text-sm text-gray-500">
                    Country Code: {formData.senderCountryCode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  District/State*
                </label>
                <input
                  type="text"
                  name="senderDistrictState"
                  value={formData.senderDistrictState}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderDistrictState")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pickup Start Date*
                </label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={handleStartDateChange}
                  minDate={new Date()}
                  maxDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    )
                  }
                  dateFormat="MMMM d, yyyy"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("startDate")
                      ? "border-red-500"
                      : "border"
                  }`}
                  placeholderText="Select start date"
                  required
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pickup End Date*
                </label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={handleEndDateChange}
                  minDate={formData.startDate || new Date()}
                  maxDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    )
                  }
                  dateFormat="MMMM d, yyyy"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("endDate") || errors.endDate
                      ? "border-red-500"
                      : "border"
                  }`}
                  placeholderText="Select end date"
                  required
                  isClearable
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Receiver Information Column */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">
                Receiver Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="receiverFullName"
                  value={formData.receiverFullName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverFullName")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email*
                </label>
                <input
                  type="email"
                  name="receiverEmail"
                  value={formData.receiverEmail}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverEmail") ||
                    errors.receiverEmail
                      ? "border-red-500"
                      : "border"
                  }`}
                />
                {errors.receiverEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.receiverEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone*
                </label>
                <input
                  type="tel"
                  name="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverPhone") ||
                    errors.receiverPhone
                      ? "border-red-500"
                      : "border"
                  }`}
                />
                {errors.receiverPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.receiverPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Address*
                </label>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("deliveryAddress")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Receiver Country*
                </label>
                <select
                  name="receiverCountry"
                  value={formData.receiverCountry}
                  onChange={(e) => handleCountryChange(e, "receiver")}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverCountry") ||
                    missingFields.includes("receiverCountryCode")
                      ? "border-red-500"
                      : "border"
                  }`}
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country.name}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                {formData.receiverCountryCode && (
                  <p className="mt-1 text-sm text-gray-500">
                    Country Code: {formData.receiverCountryCode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State/City*
                </label>
                <input
                  type="text"
                  name="receiverStateCity"
                  value={formData.receiverStateCity}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverStateCity")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Zip Code*
                </label>
                <input
                  type="text"
                  name="receiverZipCode"
                  value={formData.receiverZipCode}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverZipCode") ||
                    errors.receiverZipCode
                      ? "border-red-500"
                      : "border"
                  }`}
                />
                {errors.receiverZipCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.receiverZipCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Shipment"}
            </button>
          </div>
        </form>
        <CalculatePricingCompo></CalculatePricingCompo>
      </div>
    </div>
  );
};
export default CreateShippingForm;
