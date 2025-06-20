"use client";
import React from "react";

const ReceiverInfo = ({
  formData,
  handleChange,
  countries,
  missingFields,
  errors,
  receiverCountry,
  setReceiverCountry,
  setReceiverCountryName,
  setSelectedRate
}) => {
  const handleCountrySelection = (e) => {
    const selectedCountry = countries.find(
      (country) => country.code === e.target.value
    );
    setReceiverCountry(e.target.value);
    setReceiverCountryName(selectedCountry?.name || "");
    setSelectedRate(null);

    // Update formData
    handleChange({
      target: {
        name: "receiverCountry",
        value: selectedCountry?.name || ""
      }
    });
    handleChange({
      target: {
        name: "receiverCountryCode",
        value: selectedCountry?.code || ""
      }
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="receiverFullName"
            value={formData.receiverFullName}
            onChange={handleChange}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("receiverFullName")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="receiverEmail"
              value={formData.receiverEmail}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("receiverEmail") || errors.receiverEmail
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errors.receiverEmail && (
              <p className="mt-1 text-sm text-red-600">
                {errors.receiverEmail}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="receiverPhone"
              value={formData.receiverPhone}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("receiverPhone") || errors.receiverPhone
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errors.receiverPhone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.receiverPhone}
              </p>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            rows={3}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("deliveryAddress")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
        </div>

        {/* Destination Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Country <span className="text-red-500">*</span>
          </label>
          <select
            id="receiverCountry"
            value={receiverCountry}
            onChange={handleCountrySelection}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("receiverCountry") ||
              missingFields.includes("receiverCountryCode")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country._id} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>

        {/* State/City and Zip Code */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="receiverStateCity"
              value={formData.receiverStateCity}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("receiverStateCity")
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="receiverZipCode"
              value={formData.receiverZipCode}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("receiverZipCode") || errors.receiverZipCode
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
    </div>
  );
};

export default ReceiverInfo;