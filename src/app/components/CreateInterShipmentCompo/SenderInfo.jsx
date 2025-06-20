"use client";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SenderInfo = ({ 
  formData, 
  handleChange, 
  handleCountryChange, 
  countries, 
  missingFields, 
  errors 
}) => {
  const handleStartDateChange = (date) => {
    handleChange({
      target: {
        name: "startDate",
        value: date
      }
    });
  };

  const handleEndDateChange = (date) => {
    handleChange({
      target: {
        name: "endDate",
        value: date
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
            name="senderFullName"
            value={formData.senderFullName}
            onChange={handleChange}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("senderFullName")
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
              name="senderEmail"
              value={formData.senderEmail}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("senderEmail") || errors.senderEmail
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errors.senderEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.senderEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="senderPhone"
              value={formData.senderPhone}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("senderPhone") || errors.senderPhone
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errors.senderPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.senderPhone}</p>
            )}
          </div>
        </div>

        {/* Pickup Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            rows={3}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("pickupAddress")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
        </div>

        {/* Country and District/State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              name="senderCountry"
              value={formData.senderCountry || "Bangladesh"}
              onChange={(e) => handleCountryChange(e, "sender")}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("senderCountry") ||
                missingFields.includes("senderCountryCode")
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country._id} value={country.name}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District/State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="senderDistrictState"
              value={formData.senderDistrictState}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("senderDistrictState")
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
          </div>
        </div>

        {/* Pickup Dates */}
        <div className="grid grid-cols-2">
          <div className="">
            <label className="block w-full text-sm font-medium text-gray-700 mb-1">
              Pickup Start Date <span className="text-red-500">*</span>
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
              className={`w-64 rounded-md shadow-sm ${
                missingFields.includes("startDate")
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholderText="Select start date"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup End Date <span className="text-red-500">*</span>
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
              className={`w-64 rounded-md shadow-sm ${
                missingFields.includes("endDate") || errors.endDate
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholderText="Select end date"
              isClearable
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenderInfo;