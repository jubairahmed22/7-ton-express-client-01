"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiFilter, FiX, FiCalendar, FiMail, FiPhone, FiTruck, FiGlobe, FiPackage, FiCheckCircle } from "react-icons/fi";

const FilterSection = ({
  filters,
  countries,
  companies,
  handleFilterChange,
  handleDateChange,
  applyFilters,
  resetFilters,
}) => {
  return (
    <div className="w-full bg-white p-6 rounded-lg mb-6 shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiFilter className="mr-2" /> Filter Shipments
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm cursor-pointer text-gray-500 hover:text-gray-700 flex items-center"
        >
          <FiX className="mr-1" /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range Filter */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiCalendar className="mr-2" /> Pickup Date Range
          </label>
          <div className="flex items-center gap-3 ">
            <div className="flex-1 relative">
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                selectsStart
                startDate={filters.startDate}
                endDate={filters.endDate}
                placeholderText="Start Date"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="MMM d, yyyy"
              />
              <FiCalendar className="absolute left-3 top-3 text-gray-400" />
            </div>
            <span className="text-gray-400">to</span>
            <div className="flex-1 relative">
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                selectsEnd
                startDate={filters.startDate}
                endDate={filters.endDate}
                minDate={filters.startDate}
                placeholderText="End Date"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="MMM d, yyyy"
              />
              <FiCalendar className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Sender Filters */}
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiMail className="mr-2" /> Sender Email
          </label>
          <div className="relative">
            <input
              type="text"
              name="senderEmail"
              value={filters.senderEmail}
              onChange={handleFilterChange}
              placeholder="sender@example.com"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FiMail className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiPhone className="mr-2" /> Sender Phone
          </label>
          <div className="relative">
            <input
              type="text"
              name="senderPhone"
              value={filters.senderPhone}
              onChange={handleFilterChange}
              placeholder="+1 (123) 456-7890"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FiPhone className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Receiver Filters */}
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiMail className="mr-2" /> Receiver Email
          </label>
          <div className="relative">
            <input
              type="text"
              name="receiverEmail"
              value={filters.receiverEmail}
              onChange={handleFilterChange}
              placeholder="receiver@example.com"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FiMail className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiPhone className="mr-2" /> Receiver Phone
          </label>
          <div className="relative">
            <input
              type="text"
              name="receiverPhone"
              value={filters.receiverPhone}
              onChange={handleFilterChange}
              placeholder="+1 (123) 456-7890"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FiPhone className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Tracking, Country, and Company Filters */}
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiPackage className="mr-2" /> Tracking Number
          </label>
          <div className="relative">
            <input
              type="text"
              name="trackingNumber"
              value={filters.trackingNumber}
              onChange={handleFilterChange}
              placeholder="TRK123456789"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FiPackage className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiGlobe className="mr-2" /> Receiver Country
          </label>
          <div className="relative">
            <select
              name="receiverCountry"
              value={filters.receiverCountry}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country._id} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            <FiGlobe className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiTruck className="mr-2" /> Shipping Company
          </label>
          <div className="relative">
            <select
              name="company"
              value={filters.company}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">All Companies</option>
              {Array.from(new Set(companies)).map((company, index) => (
                <option key={index} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <FiTruck className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        {/* <div>
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiCheckCircle className="mr-2" /> Status
          </label>
          <div className="relative">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <FiCheckCircle className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div> */}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={resetFilters}
          className="cursor-pointer px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
        >
          <FiX className="mr-2" /> Reset
        </button>
        <button
          onClick={applyFilters}
          className="cursor-pointer px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <FiFilter className="mr-2" /> Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSection;