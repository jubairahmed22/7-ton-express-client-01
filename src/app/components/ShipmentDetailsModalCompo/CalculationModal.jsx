"use client";

import React, { useEffect, useState } from "react";
import TotalShipmentCard from "../AdminCard/TotalShipmentCard";
import FinalWeightCard from "../AdminCard/FinalWeightCard";
import dhl from "../../../assets/dhl3.png";
import fedex from "../../../assets/fedex.png";

const CalculationModal = ({
  receiverCountry,
  receiverCountryName,
  setFormData,
  formData,
}) => {
  ///////////////////////////// start calculation
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedGoods, setSelectedGoods] = useState(
    formData.shipmentDetails.goodsType || []
  );
  useEffect(() => {
    // Update selectedGoods when formData changes
    setSelectedGoods(formData.shipmentDetails.goodsType || []);
  }, [formData.shipmentDetails.goodsType]);
  // const [formData, setFormData] = useState({
  //   senderFullName: "",
  //   senderEmail: "",
  //   senderPhone: "",
  //   pickupAddress: "",
  //   senderCountry: "Bangladesh",
  //   senderCountryCode: "BD",
  //   senderDistrictState: "",
  //   receiverFullName: "",
  //   receiverEmail: "",
  //   receiverPhone: "",
  //   deliveryAddress: "",
  //   receiverCountry: "",
  //   receiverCountryCode: "",
  //   goodsType: [],
  //   receiverStateCity: "",
  //   receiverZipCode: "",
  //   startDate: null,
  //   endDate: null,
  // });

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
    "Garments Sample",
  ];
  const handleGoodsSelection = (goods) => {
    const newSelectedGoods = selectedGoods.includes(goods)
      ? selectedGoods.filter((item) => item !== goods)
      : [...selectedGoods, goods];

    setSelectedGoods(newSelectedGoods);

    // Update formData directly
    setFormData((prev) => ({
      ...prev,
      shipmentDetails: {
        ...prev.shipmentDetails,
        goodsType: newSelectedGoods,
      },
    }));
  };

  const clearAllGoods = () => {
    setSelectedGoods([]);
    setFormData((prev) => ({
      ...prev,
      shipmentDetails: {
        ...prev.shipmentDetails,
        goodsType: [],
      },
    }));
  };

  const [zones, setZones] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [error, setError] = useState(null);

  // Selection states
  // const [receiverCountry, setReceiverCountry] = useState("");
  const [receiverParcelType, setReceiverParcelType] = useState(
    formData.shipmentDetails.parcelType || "DOX"
  );
  const [activeTab, setActiveTab] = useState("weight"); // 'weight' or 'dimensions'
  const [selectedRate, setSelectedRate] = useState(null); // Store selected rate

  // Weight/Dimension inputs
  const [weightInputs, setWeightInputs] = useState([
    {
      id: 1,
      value: 0.5,
      description: "Package 1",
    },
  ]);

  const [dimensionInputs, setDimensionInputs] = useState([
    {
      id: 1,
      length: 0,
      width: 0,
      height: 0,
      description: "Package 1",
    },
  ]);

  // Available options
  const [weightOptions, setWeightOptions] = useState([0.5]);
  const [parcelTypeOptions, setParcelTypeOptions] = useState(["DOX"]);

  // Calculated values
  const [volumetricWeights, setVolumetricWeights] = useState([0]);
  const [totalVolumetricWeight, setTotalVolumetricWeight] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0.5);
  const [packageWeight, setPackageWeight] = useState(0.5);
  const [receiverRates, setReceiverRates] = useState([]);
  const [receiverZone, setReceiverZone] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryRes, zoneRes, pricingRes] = await Promise.all([
          fetch("https://server-gs-two.vercel.app/api/countryList"),
          fetch("https://server-gs-two.vercel.app/api/zone"),
          fetch("https://server-gs-two.vercel.app/api/zone/pricing"),
        ]);

        if (!countryRes.ok || !zoneRes.ok || !pricingRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [countryData, zoneData, pricingData] = await Promise.all([
          countryRes.json(),
          zoneRes.json(),
          pricingRes.json(),
        ]);

        if (!countryData.success || !zoneData.success || !pricingData.success) {
          throw new Error("Invalid data format");
        }

        setCountries(countryData.data);
        setZones(zoneData.data);
        setPricingData(pricingData.data);

        if (pricingData.data.length > 0) {
          const weights = [
            ...new Set(pricingData.data[0].rates.map((r) => r.weightKg)),
          ];
          const types = [
            ...new Set(pricingData.data[0].rates.map((r) => r.parcelType)),
          ];
          setWeightOptions(weights.sort());
          setParcelTypeOptions(types);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total weight whenever weight inputs change
  useEffect(() => {
    const sum = weightInputs.reduce(
      (acc, input) => acc + (parseFloat(input.value) || 0),
      0
    );
    setTotalWeight(sum);
  }, [weightInputs]);

  // Calculate volumetric weights whenever dimension inputs change
  useEffect(() => {
    const newVolumetricWeights = dimensionInputs.map((input) => {
      if (input.length > 0 && input.width > 0 && input.height > 0) {
        return (input.length * input.width * input.height) / 5000;
      }
      return 0;
    });
    setVolumetricWeights(newVolumetricWeights);

    const sum = newVolumetricWeights.reduce((acc, weight) => acc + weight, 0);
    setTotalVolumetricWeight(sum);
  }, [dimensionInputs]);

  // Determine package weight based on active tab
  useEffect(() => {
    if (activeTab === "weight") {
      setPackageWeight(totalWeight);
    } else {
      setPackageWeight(totalVolumetricWeight);
    }
  }, [totalWeight, totalVolumetricWeight, activeTab]);

  // Round up to nearest weight option
  useEffect(() => {
    if (packageWeight > 0 && weightOptions.length > 0) {
      const roundedWeight = Math.max(
        weightOptions.find((w) => w >= packageWeight) ||
          weightOptions[weightOptions.length - 1],
        weightOptions[0]
      );
      setPackageWeight(roundedWeight);
    }
  }, [packageWeight, weightOptions]);

  // Recalculate rates whenever selections change
  useEffect(() => {
    calculateRates();
  }, [receiverCountry, receiverParcelType, packageWeight, pricingData]);

  const calculateRates = () => {
    if (!pricingData.length) return;

    if (receiverCountry) {
      const zone = findZoneForCountry(receiverCountry);
      setReceiverZone(zone);
      if (zone) {
        const rates = pricingData.map((company) => {
          const pricingEntry = company.rates.find(
            (rate) =>
              rate.weightKg === packageWeight &&
              rate.parcelType === receiverParcelType
          );
          return {
            company: company.company,
            rate: pricingEntry?.rates[`Zone${zone.name}`] || null,
          };
        });
        setReceiverRates(rates);
      } else {
        setReceiverRates([]);
      }
    } else {
      setReceiverRates([]);
      setReceiverZone(null);
    }
  };

  const findZoneForCountry = (countryCode) => {
    if (!countryCode) return null;
    for (const zone of zones) {
      const foundCountry = zone.countryList.find(
        (c) => c.countryCode === countryCode
      );
      if (foundCountry) return zone;
    }
    return null;
  };

  const handleRateSelection = (rate) => {
    setSelectedRate(rate);
    // 2. Update ONLY price in formData
    setFormData((prev) => ({
      ...prev,
      shipmentDetails: {
        ...prev.shipmentDetails,
        company: rate.company,
        price: rate.rate,
        packageWeight: packageWeight,
        totalWeight: totalWeight,
        parcelType: receiverParcelType,
        weight: packageWeight,
        weightDetails:
          activeTab === "weight"
            ? weightInputs.map((pkg) => ({
                type: "weight",
                value: pkg.value,
                description: pkg.description,
              }))
            : dimensionInputs.map((pkg) => ({
                type: "dimensions",
                length: pkg.length,
                width: pkg.width,
                height: pkg.height,
                description: pkg.description,
                volumetricWeight: (pkg.length * pkg.width * pkg.height) / 5000,
              })),
      },
    }));

    localStorage.setItem(
      "selectedShippingRate",
      JSON.stringify({
        company: rate.company,
        price: rate.rate,
        weight: packageWeight,
        parcelType: receiverParcelType,
        country: receiverCountry,
        packages:
          activeTab === "weight"
            ? weightInputs.map((pkg) => ({
                type: "weight",
                value: pkg.value,
                description: pkg.description,
              }))
            : dimensionInputs.map((pkg) => ({
                type: "dimensions",
                length: pkg.length,
                width: pkg.width,
                height: pkg.height,
                description: pkg.description,
                volumetricWeight: (pkg.length * pkg.width * pkg.height) / 5000,
              })),
      })
    );
  };

  // Weight input handlers
  const addWeightInput = () => {
    if (weightInputs.length < 5) {
      const newId = weightInputs.length + 1;
      setWeightInputs([
        ...weightInputs,
        {
          id: newId,
          value: 0,
          description: `Package ${newId}`,
        },
      ]);
    }
  };

  const removeWeightInput = (id) => {
    if (weightInputs.length > 1) {
      setWeightInputs(weightInputs.filter((input) => input.id !== id));
    }
  };

  const updateWeightInput = (id, field, value) => {
    setWeightInputs(
      weightInputs.map((input) =>
        input.id === id
          ? {
              ...input,
              [field]: field === "value" ? parseFloat(value) || "" : value,
            }
          : input
      )
    );
  };

  // Dimension input handlers
  const addDimensionInput = () => {
    if (dimensionInputs.length < 5) {
      const newId = dimensionInputs.length + 1;
      setDimensionInputs([
        ...dimensionInputs,
        {
          id: newId,
          length: 0,
          width: 0,
          height: 0,
          description: `Package ${newId}`,
        },
      ]);
    }
  };

  const removeDimensionInput = (id) => {
    if (dimensionInputs.length > 1) {
      setDimensionInputs(dimensionInputs.filter((input) => input.id !== id));
    }
  };

  const updateDimensionInput = (id, field, value) => {
    setDimensionInputs(
      dimensionInputs.map((input) =>
        input.id === id
          ? {
              ...input,
              [field]: field === "description" ? value : parseInt(value) || "",
            }
          : input
      )
    );
  };

  ///////////////////////////// END CALCULATION
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <div className="px-6 py-10 border-t border-gray-400">
        
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parcel Type <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center w-[600px] h-10 rounded-md bg-gray-200 overflow-hidden">
              <input
                type="radio"
                id="doxOption"
                name="parcelType"
                value="DOX"
                checked={receiverParcelType === "DOX"}
                onChange={(e) => {
                  setReceiverParcelType(e.target.value);
                  setSelectedRate(null);
                  // Update formData when parcel type changes
                  setFormData((prev) => ({
                    ...prev,
                    shipmentDetails: {
                      ...prev.shipmentDetails,
                      parcelType: e.target.value,
                    },
                  }));
                }}
                className="hidden"
              />
              <input
                type="radio"
                id="wpxOption"
                name="parcelType"
                value="WPX"
                checked={receiverParcelType === "WPX"}
                onChange={(e) => {
                  setReceiverParcelType(e.target.value);
                  setSelectedRate(null);
                  // Update formData when parcel type changes
                  setFormData((prev) => ({
                    ...prev,
                    shipmentDetails: {
                      ...prev.shipmentDetails,
                      parcelType: e.target.value,
                    },
                  }));
                }}
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
            {/* Show current selection */}
            <div className="mt-2 text-sm text-gray-600">
              Current selection:{" "}
              {receiverParcelType === "DOX"
                ? "Documents"
                : "Worldwide Parcel Express"}
            </div>
          </div>
          <div className="relative mt-4 col-span-2 px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-100">
  <div className="flex items-center justify-between">
    <label
      htmlFor="goodsType"
      className="block text-sm font-semibold text-gray-800"
    >
      Goods Type
      <span className="sr-only">selection</span>
    </label>
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 transition-all"
      aria-expanded={isOpen}
      aria-controls="goods-selector-dropdown"
    >
      {isOpen ? (
        <>
          <span className="sr-only">Close</span>
          <span aria-hidden="true">Close</span>
        </>
      ) : (
        <>
          <span className="sr-only">Edit goods selection</span>
          <span aria-hidden="true">Edit Goods</span>
        </>
      )}
    </button>
  </div>

  {/* Display selected goods */}
  <div className="mt-3">
    {selectedGoods.length > 0 ? (
      <div 
        className="flex flex-wrap gap-2 min-h-10"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectedGoods.map((goods) => (
          <span
            key={goods}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
          >
            {goods}
            <button
              type="button"
              onClick={() => handleGoodsSelection(goods)}
              className="ml-1.5 -mr-0.5 text-blue-600 hover:text-blue-900 focus:outline-none"
              aria-label={`Remove ${goods}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    ) : (
      <p className="mt-2 text-sm text-gray-500 italic">No goods selected</p>
    )}
  </div>

  {/* Dropdown for selecting goods */}
  {isOpen && (
    <div 
      id="goods-selector-dropdown"
      className="absolute z-10 mt-3 w-full md:w-96 bg-white shadow-lg rounded-lg border border-gray-200 focus:outline-none"
      role="listbox"
    >
      <div className="p-2 max-h-60 overflow-y-auto">
        {goodsTypes.map((goods) => (
          <div
            key={goods}
            role="option"
            aria-selected={selectedGoods.includes(goods)}
            className={`flex items-center p-2 mt-1 hover:bg-blue-50 rounded-lg transition-colors duration-100 cursor-pointer ${
              selectedGoods.includes(goods) ? 'bg-blue-50' : ''
            }`}
            onClick={() => handleGoodsSelection(goods)}
          >
            <input
              id={`goods-${goods}`}
              type="checkbox"
              checked={selectedGoods.includes(goods)}
              onChange={() => handleGoodsSelection(goods)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              aria-labelledby={`goods-label-${goods}`}
            />
            <label
              id={`goods-label-${goods}`}
              htmlFor={`goods-${goods}`}
              className="ml-3 text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              {goods}
            </label>
            {selectedGoods.includes(goods) && (
              <svg
                className="w-4 h-4 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
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
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 rounded-b-lg flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {selectedGoods.length} selected
          </span>
          <button
            type="button"
            onClick={clearAllGoods}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )}
</div>
          {/* Weight/Dimensions Tabs */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 cursor-pointer font-medium ${
                  activeTab === "weight"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("weight")}
              >
                Weight (kg)
              </button>
              <button
                className={`py-2 px-4 cursor-pointer font-medium ${
                  activeTab === "dimensions"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("dimensions")}
              >
                Dimensions (cm) - L x W x H
              </button>
            </div>

            {activeTab === "weight" ? (
              <div>
                <div className="space-y-3">
                  {weightInputs.map((input, index) => (
                    <div key={input.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Package {index + 1}</h4>
                        {weightInputs.length > 1 && (
                          <button
                            onClick={() => removeWeightInput(input.id)}
                            className="p-1 text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove Package
                          </button>
                        )}
                      </div>
                      <div className="flex flex-row  items-start gap-5 bg-gray-100 p-4">
                        <div className="flex items-start flex-col w-96 gap-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Value
                          </label>
                          <input
                            type="number"
                            min="0.0"
                            step="0.5"
                            value={input.value}
                            onChange={(e) =>
                              updateWeightInput(
                                input.id,
                                "value",
                                e.target.value
                              )
                            }
                            className="flex-1 p-2 w-96 border border-gray-300 rounded"
                            placeholder={`Weight (kg)`}
                          />
                        </div>
                        <div className="flex items-start flex-col gap-2 w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={input.description}
                            onChange={(e) =>
                              updateWeightInput(
                                input.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="Package description"
                            rows={2} // You can adjust the number of rows as needed
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {weightInputs.length < 5 && (
                  <button
                    onClick={addWeightInput}
                    className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  >
                    + Add More Weight
                  </button>
                )}

                <div className="grid grid-cols-2 gap-5">
                  <TotalShipmentCard
                    weightInputs={weightInputs}
                    totalWeight={totalWeight}
                  />
                  <FinalWeightCard packageWeight={packageWeight} />
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-4">
                  {dimensionInputs.map((input, index) => (
                    <div key={input.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Package {index + 1}</h4>
                        {dimensionInputs.length > 1 && (
                          <button
                            onClick={() => removeDimensionInput(input.id)}
                            className="p-1 text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove Package
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2 bg-gray-100 p-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Length (cm)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={input.length}
                            onChange={(e) =>
                              updateDimensionInput(
                                input.id,
                                "length",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Width (cm)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={input.width}
                            onChange={(e) =>
                              updateDimensionInput(
                                input.id,
                                "width",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={input.height}
                            onChange={(e) =>
                              updateDimensionInput(
                                input.id,
                                "height",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="block text-sm text-gray-600 mb-1">
                            Description
                          </label>
                          <textarea
                            value={input.description}
                            onChange={(e) =>
                              updateDimensionInput(
                                input.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded mb-2"
                            placeholder="Package description"
                            rows={3} // Default rows, adjust as needed
                          />
                        </div>
                      </div>
                      {input.length > 0 &&
                        input.width > 0 &&
                        input.height > 0 && (
                          <div className="p-2 bg-gray-50 rounded text-sm">
                            <p>
                              Volumetric Weight:{" "}
                              {volumetricWeights[index].toFixed(2)} kg
                            </p>
                            <p className="text-xs text-gray-500">
                              (L {input.length}cm × W {input.width}cm × H{" "}
                              {input.height}cm / 5000)
                            </p>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                {dimensionInputs.length < 5 && (
                  <button
                    onClick={addDimensionInput}
                    className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  >
                    + Add Another Package
                  </button>
                )}

                <div className="grid grid-cols-2 gap-5">
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="font-medium">
                      Total Volumetric Weight:{" "}
                      {totalVolumetricWeight.toFixed(2)} kg
                    </p>
                    <p className="text-sm text-gray-600">
                      Based on {dimensionInputs.length} package
                      {dimensionInputs.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-medium">
                      Final Package Weight: {packageWeight} kg
                    </p>
                    <p className="text-sm text-gray-600">
                      {activeTab === "weight"
                        ? "Based on total actual weight"
                        : "Based on total volumetric weight"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goods Type Section */}
        <div className="">
          <div className="mb-6">
            {/* <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipment Details</h2> */}

            {/* Shipping Calculation Section */}
            <div className="">
              {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Calculation</h3> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}

                {/* Right Column - Shipping Rates */}
                <div className="mt-5">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 h-full">
                    <h3 className="font-bold text-lg mb-3 text-gray-800">
                      Shipping Rates
                    </h3>
                    {receiverZone ? (
                      <>
                        <div className="mb-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-3xl backdrop-blur-sm bg-opacity-90">
                          <div className="flex flex-wrap items-stretch gap-x-8 gap-y-4 text-sm">
                            {/* Country */}
                            <div className="flex items-center min-w-[120px]">
                              <div className="p-2 mr-3 bg-blue-50 rounded-lg">
                                <svg
                                  className="w-5 h-5 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                  Country
                                </p>
                                <p className="font-medium text-gray-900 text-[15px]">
                                  {receiverCountryName}
                                </p>
                              </div>
                            </div>

                            {/* Vertical Divider */}
                            <div className="hidden md:block w-px h-auto bg-gradient-to-b from-transparent via-gray-200 to-transparent my-1"></div>

                            {/* Zone */}
                            <div className="flex items-center min-w-[120px]">
                              <div className="p-2 mr-3 bg-purple-50 rounded-lg">
                                <svg
                                  className="w-5 h-5 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                  Zone
                                </p>
                                <p className="font-medium text-gray-900 text-[15px]">
                                  {receiverZone.name}
                                </p>
                              </div>
                            </div>

                            {/* Vertical Divider */}
                            <div className="hidden md:block w-px h-auto bg-gradient-to-b from-transparent via-gray-200 to-transparent my-1"></div>

                            {/* Weight */}
                            <div className="flex items-center min-w-[120px]">
                              <div className="p-2 mr-3 bg-amber-50 rounded-lg">
                                <svg
                                  className="w-5 h-5 text-amber-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                  Weight
                                </p>
                                <p className="font-medium text-gray-900 text-[15px]">
                                  {packageWeight} kg
                                </p>
                              </div>
                            </div>

                            {/* Vertical Divider */}
                            <div className="hidden md:block w-px h-auto bg-gradient-to-b from-transparent via-gray-200 to-transparent my-1"></div>

                            {/* Parcel Type */}
                            <div className="flex items-center min-w-[120px]">
                              <div className="p-2 mr-3 bg-emerald-50 rounded-lg">
                                <svg
                                  className="w-5 h-5 text-emerald-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                  Type
                                </p>
                                <p className="font-medium text-gray-900 text-[15px]">
                                  {receiverParcelType === "DOX"
                                    ? "Documents"
                                    : receiverParcelType === "WPX"
                                    ? "Worldwide Parcel Express"
                                    : receiverParcelType.toLowerCase()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-5">
                          {receiverRates.length > 0 ? (
                            receiverRates.map((rate, index) => (
                              <div
                                key={index}
                                onClick={() => handleRateSelection(rate)}
                                className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                  selectedRate?.company === rate.company
                                    ? "bg-blue-50 border-2 border-blue-500 shadow-sm"
                                    : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                                }`}
                                role="button"
                                tabIndex={0}
                                aria-pressed={
                                  selectedRate?.company === rate.company
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleRateSelection(rate)
                                }
                              >
                                <div className="flex items-center space-x-4">
                                  <div
                                    className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                                      selectedRate?.company === rate.company
                                        ? "bg-blue-500 border-blue-500"
                                        : "bg-white border-gray-300"
                                    }`}
                                  >
                                    {selectedRate?.company === rate.company && (
                                      <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    {rate.company === "FedEx" ? (
                                      <img
                                        className="h-6 w-auto"
                                        src={fedex.src}
                                        alt="FedEx"
                                      />
                                    ) : rate.company === "DHL" ? (
                                      <img
                                        className="h-6 w-auto"
                                        src={dhl.src}
                                        alt="DHL"
                                      />
                                    ) : (
                                      <span className="font-medium text-gray-700">
                                        {rate.company}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="block text-lg font-bold text-gray-900">
                                    ${rate.rate ? rate.rate.toFixed(2) : "N/A"}
                                  </span>
                                  {rate.deliveryDays && (
                                    <span className="block text-sm text-gray-500">
                                      Est. {rate.deliveryDays}{" "}
                                      {rate.deliveryDays === 1 ? "day" : "days"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 p-3 bg-gray-50 rounded">
                              No rates available for selected options
                            </p>
                          )}
                        </div>

                        {selectedRate && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-blue-800 flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Selected Shipping Option
                              </h4>
                              {selectedRate.company === "FedEx" ? (
                                <img
                                  className="h-6 w-auto"
                                  src={fedex.src}
                                  alt="FedEx"
                                />
                              ) : selectedRate.company === "DHL" ? (
                                <img
                                  className="h-6 w-auto"
                                  src={dhl.src}
                                  alt="DHL"
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-700">
                                  {selectedRate.company}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                              {/* Price Box */}
                              <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 group">
                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <svg
                                      className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span className="font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                                      Price
                                    </span>
                                  </div>
                                  <div className="text-2xl font-bold text-blue-700">
                                    ${selectedRate.rate.toFixed(2)}
                                  </div>
                                  <div className="text-lg font-semibold  rounded-md inline-block">
                                    ৳ {(selectedRate.rate * 120).toFixed(0)}
                                  </div>
                                </div>
                              </div>

                              {/* Package Weight Box */}
                              <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 group">
                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <svg
                                      className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                      />
                                    </svg>
                                    <span className="font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                                      Package Weight
                                    </span>
                                  </div>
                                  <div className="text-2xl font-semibold text-gray-800">
                                    {packageWeight}{" "}
                                    <span className="text-lg font-medium text-gray-500">
                                      kg
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Parcel Type Box */}
                              <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 group">
                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <svg
                                      className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                      />
                                    </svg>
                                    <span className="font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                                      Parcel Type
                                    </span>
                                  </div>
                                  <div className="text-2xl font-semibold text-gray-800 capitalize">
                                    {receiverParcelType.toLowerCase()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded text-center">
                        <p className="mt-2 text-gray-500">
                          Select destination country to see rates
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationModal;
