import React from "react";
import DatePicker from "react-datepicker";

const SenderInfo = ({
  formData,
  handleChange,
  handleCountryChange,
  handleStartDateChange,
  handleEndDateChange,
  countries,
  missingFields,
  errors
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
            name="sender.fullName"
            value={formData.sender.fullName}
            onChange={handleChange}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("sender.fullName")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder="Enter sender's full name"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="sender.email"
              value={formData.sender.email}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("sender.email") || errors.senderEmail
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="sender@example.com"
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
              name="sender.phone"
              value={formData.sender.phone}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("sender.phone") || errors.senderPhone
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="1234567890"
            />
            {errors.senderPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.senderPhone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="sender.address"
            value={formData.sender.address}
            onChange={handleChange}
            rows={3}
            className={`w-full rounded-md shadow-sm ${
              missingFields.includes("sender.address")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder="Enter complete pickup address"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              name="sender.country"
              value={formData.sender.country || "Bangladesh"}
              onChange={(e) => handleCountryChange(e, "sender")}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("sender.country") ||
                missingFields.includes("sender.countryCode")
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
              name="sender.districtState"
              value={formData.sender.districtState}
              onChange={handleChange}
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("sender.districtState")
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="Enter district or state"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Start Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={formData.sender.pickupDateRange.start}
              onChange={handleStartDateChange}
              minDate={new Date()}
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
              dateFormat="MMMM d, yyyy"
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("sender.pickupDateRange.start")
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
              selected={formData.sender.pickupDateRange.end}
              onChange={handleEndDateChange}
              minDate={formData.sender.pickupDateRange.start || new Date()}
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
              dateFormat="MMMM d, yyyy"
              className={`w-full rounded-md shadow-sm ${
                missingFields.includes("sender.pickupDateRange.end") || errors.endDate
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