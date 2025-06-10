import React from "react";

const ReceiverInfo = ({
  formData,
  handleChange,
  receiverCountry,
  handleReceiverCountryChange,
  countries,
  missingFields,
  errors,
}) => {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="receiver.fullName"
            value={formData.receiver.fullName}
            onChange={handleChange}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("receiver.fullName")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder="Enter receiver's full name"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="receiver.email"
              value={formData.receiver.email}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("receiver.email") || errors.receiverEmail
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="receiver@example.com"
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
              name="receiver.phone"
              value={formData.receiver.phone}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("receiver.phone") || errors.receiverPhone
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="1234567890"
            />
            {errors.receiverPhone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.receiverPhone}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="receiver.address"
            value={formData.receiver.address}
            onChange={handleChange}
            rows={3}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("receiver.address")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder="Enter complete delivery address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Country <span className="text-red-500">*</span>
          </label>
          <select
            value={receiverCountry}
            onChange={handleReceiverCountryChange}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("receiver.country") ||
              missingFields.includes("receiver.countryCode")
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

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="receiver.stateCity"
              value={formData.receiver.stateCity}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("receiver.stateCity")
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="Enter state or city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="receiver.zipCode"
              value={formData.receiver.zipCode}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("receiver.zipCode") ||
                errors.receiverZipCode
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="Enter postal code"
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
