import React from "react";

const ShippingHeader = ({
  title,
  selectedCompany,
  companies,
  onCompanyChange,
  onAddCompany,
  onAddZone,
  onSaveChanges,
  hasChanges,
  isSaving,
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="fontPoppins font-semibold text-black text-2xl">{title}</h1>
      <div className="flex gap-4 cursor-pointer">
        <select
          value={selectedCompany}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="bg-gray-50 cursor-pointer border w-56 border-gray-300 text-black text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
        >
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
        <button
          onClick={onAddCompany}
          className="bg-blue-500 cursor-pointer text-white py-2.5 px-5 font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add New Company
        </button>
        <button
          onClick={onAddZone}
          className="bg-blue-500 cursor-pointer text-white py-2.5 px-5 font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add New Zone
        </button>
        <button
          onClick={onSaveChanges}
          disabled={!hasChanges || isSaving}
          className={`bg-green-500 cursor-pointer text-white py-2.5 px-5 font-medium rounded-lg hover:bg-green-600 transition-colors ${
            !hasChanges || isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
};

export default ShippingHeader;