"use client";
import React, { useState } from "react";

const goodsTypes = [
  "Toys",
  "Clothing",
  "Medicine",
  "Accessories",
  "Liquid",
  "Cosmetics",
  "Pickles",
  "Books",
  "Dry Food",
  "Documents",
  "Non DG parts",
  "Garments Sample"
];

const GoodsTypeSection = ({
  receiverParcelType,
  setReceiverParcelType,
  selectedGoods,
  setSelectedGoods,
  setSelectedRate
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleGoodsSelection = (goods) => {
    const newSelectedGoods = selectedGoods.includes(goods)
      ? selectedGoods.filter(item => item !== goods)
      : [...selectedGoods, goods];
    
    setSelectedGoods(newSelectedGoods);
    setSelectedRate(null);
    
    // Update formData.goodsType
    setReceiverParcelType(prev => ({
      ...prev,
      goodsType: newSelectedGoods
    }));
  };

  const clearAllGoods = () => {
    setSelectedGoods([]);
    setSelectedRate(null);
  };

  const handleParcelTypeChange = (type) => {
    setReceiverParcelType(type);
    setSelectedRate(null);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Parcel Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parcel Type <span className="text-red-500">*</span>
        </label>
        <div className="relative flex items-center w-full h-10 rounded-md bg-gray-200 overflow-hidden">
          <input
            type="radio"
            id="doxOption"
            name="parcelType"
            value="DOX"
            checked={receiverParcelType === "DOX"}
            onChange={() => handleParcelTypeChange("DOX")}
            className="hidden"
          />
          <label
            htmlFor="doxOption"
            className={`flex-1 h-full flex items-center justify-center cursor-pointer transition-colors ${
              receiverParcelType === "DOX"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            DOX (Documents)
          </label>

          <input
            type="radio"
            id="wpxOption"
            name="parcelType"
            value="WPX"
            checked={receiverParcelType === "WPX"}
            onChange={() => handleParcelTypeChange("WPX")}
            className="hidden"
          />
          <label
            htmlFor="wpxOption"
            className={`flex-1 h-full flex items-center justify-center cursor-pointer transition-colors ${
              receiverParcelType === "WPX"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            WPX (Worldwide Parcel Express)
          </label>
        </div>
      </div>

      {/* Goods Type Multi-Select Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Goods Type (MultiSelect) <span className="text-red-500">*</span>
        </label>
        
        <button
          type="button"
          onClick={toggleDropdown}
          className="w-full md:w-96 text-left bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2.5 flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`truncate ${selectedGoods.length === 0 ? "text-gray-400" : "text-gray-800"}`}>
            {selectedGoods.length > 0 ? selectedGoods.join(", ") : "Select Goods Types"}
          </span>
          <div className="flex items-center">
            {selectedGoods.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2 py-0.5 rounded-full">
                {selectedGoods.length}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full md:w-96 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="p-1 max-h-60 overflow-y-auto">
              {goodsTypes.map((goods) => (
                <div
                  key={goods}
                  className="flex items-center p-2 hover:bg-blue-50 rounded-lg transition-colors duration-100 cursor-pointer"
                  onClick={() => handleGoodsSelection(goods)}
                >
                  <input
                    id={`goods-${goods}`}
                    type="checkbox"
                    checked={selectedGoods.includes(goods)}
                    readOnly
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor={`goods-${goods}`}
                    className="ml-3 text-sm font-medium text-gray-700 flex-1 cursor-pointer"
                  >
                    {goods}
                  </label>
                  {selectedGoods.includes(goods) && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            {selectedGoods.length > 0 && (
              <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 rounded-b-lg">
                <button
                  type="button"
                  onClick={clearAllGoods}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoodsTypeSection;