"use client";

import React, { useState, useEffect } from "react";

const CalculatePricingCompo = () => {
  const [countries, setCountries] = useState([]);
  const [zones, setZones] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selection states
  const [receiverCountry, setReceiverCountry] = useState("");
  const [receiverParcelType, setReceiverParcelType] = useState("DOX");
  const [activeTab, setActiveTab] = useState("weight"); // 'weight' or 'dimensions'
  const [selectedRate, setSelectedRate] = useState(null); // Store selected rate

  // Weight/Dimension inputs
  const [weightInputs, setWeightInputs] = useState([{ 
    id: 1, 
    value: 0.5,
    description: "Package 1" 
  }]);
  
  const [dimensionInputs, setDimensionInputs] = useState([
    { 
      id: 1, 
      length: 0, 
      width: 0, 
      height: 0,
      description: "Package 1" 
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
          fetch("https://server-7tons.vercel.app/api/countryList"),
          fetch("https://server-7tons.vercel.app/api/zone"),
          fetch("https://server-7tons.vercel.app/api/zone/pricing"),
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
    localStorage.setItem(
      "selectedShippingRate",
      JSON.stringify({
        company: rate.company,
        price: rate.rate,
        weight: packageWeight,
        parcelType: receiverParcelType,
        country: receiverCountry,
        packages: activeTab === 'weight' ? 
          weightInputs.map(pkg => ({
            type: 'weight',
            value: pkg.value,
            description: pkg.description
          })) : 
          dimensionInputs.map(pkg => ({
            type: 'dimensions',
            length: pkg.length,
            width: pkg.width,
            height: pkg.height,
            description: pkg.description,
            volumetricWeight: (pkg.length * pkg.width * pkg.height) / 5000
          }))
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
          description: `Package ${newId}`
        }
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
        input.id === id ? { ...input, [field]: field === 'value' ? (parseFloat(value) || 0) : value } : input
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
          description: `Package ${newId}`
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
        input.id === id ? { 
          ...input, 
          [field]: field === 'description' ? value : (parseInt(value) || 0) 
        } : input
      )
    );
  };

  if (loading) return <div className="p-4">Loading data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4 p-4 max-w-4xl mx-auto">
      {/* Country Selector */}
      <div>
        <label htmlFor="receiverCountry" className="block mb-2 font-medium">
          Destination Country:
        </label>
        <select
          id="receiverCountry"
          value={receiverCountry}
          onChange={(e) => {
            setReceiverCountry(e.target.value);
            setSelectedRate(null);
          }}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select a country</option>
          {countries.map((country) => (
            <option key={country._id} value={country.code}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
      </div>

      {/* Parcel Type Selector */}
      <div>
        <label htmlFor="receiverParcelType" className="block mb-2 font-medium">
          Parcel Type:
        </label>
        <select
          id="receiverParcelType"
          value={receiverParcelType}
          onChange={(e) => {
            setReceiverParcelType(e.target.value);
            setSelectedRate(null);
          }}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {parcelTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Weight/Dimensions Tabs */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "weight"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("weight")}
          >
            Weight (kg)
          </button>
          <button
            className={`py-2 px-4 font-medium ${
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
                  <input
                    type="text"
                    value={input.description}
                    onChange={(e) => updateWeightInput(input.id, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                    placeholder="Package description"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={input.value}
                      onChange={(e) => updateWeightInput(input.id, 'value', e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded"
                      placeholder={`Weight (kg)`}
                    />
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

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="font-medium">
                Total Weight: {totalWeight.toFixed(2)} kg
              </p>
              <p className="text-sm text-gray-600">
                Based on {weightInputs.length} package
                {weightInputs.length !== 1 ? "s" : ""}
              </p>
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
                  <input
                    type="text"
                    value={input.description}
                    onChange={(e) => updateDimensionInput(input.id, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                    placeholder="Package description"
                  />
                  <div className="grid grid-cols-3 gap-2">
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
                  </div>
                  {input.length > 0 && input.width > 0 && input.height > 0 && (
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <p>
                        Volumetric Weight: {volumetricWeights[index].toFixed(2)}{" "}
                        kg
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

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="font-medium">
                Total Volumetric Weight: {totalVolumetricWeight.toFixed(2)} kg
              </p>
              <p className="text-sm text-gray-600">
                Based on {dimensionInputs.length} package
                {dimensionInputs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

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

      {/* Results */}
      <div className="bg-green-100 p-4 rounded-lg border border-green-300">
        <h3 className="font-bold text-lg mb-2">Shipping Rates</h3>
        {receiverZone ? (
          <>
            <p className="text-sm text-gray-600 mb-2">
              Zone: {receiverZone.name}, Weight: {packageWeight}kg, Type:{" "}
              {receiverParcelType}
            </p>
            <div className="space-y-2">
              {receiverRates.length > 0 ? (
                receiverRates.map((rate, index) => (
                  <div
                    key={index}
                    onClick={() => handleRateSelection(rate)}
                    className={`flex justify-between items-center p-3 rounded cursor-pointer transition-colors ${
                      selectedRate?.company === rate.company
                        ? "bg-blue-100 border-2 border-blue-400"
                        : "bg-white hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      {selectedRate?.company === rate.company && (
                        <svg
                          className="w-5 h-5 mr-2 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      <span className="font-medium">{rate.company}</span>
                    </div>
                    <span className="font-bold">${rate.rate || "N/A"}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No rates available for selected options
                </p>
              )}
            </div>

            {/* Selected Rate Details */}
            {selectedRate && (
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <h4 className="font-bold mb-2">Selected Shipping Option</h4>
                <div className="grid grid-cols-2 gap-2">
                  <p>
                    <span className="font-medium">Company:</span>
                  </p>
                  <p>{selectedRate.company}</p>
                  <p>
                    <span className="font-medium">Price:</span>
                  </p>
                  <p>${selectedRate.rate}</p>
                  <p>
                    <span className="font-medium">Weight:</span>
                  </p>
                  <p>{packageWeight} kg</p>
                  <p>
                    <span className="font-medium">Parcel Type:</span>
                  </p>
                  <p>{receiverParcelType}</p>
                </div>
                <div className="mt-3">
                  <h5 className="font-medium mb-1">Package Details:</h5>
                  {activeTab === 'weight' ? (
                    <div className="space-y-2">
                      {weightInputs.map((pkg, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                          <p><span className="font-medium">Package {idx + 1}:</span> {pkg.description}</p>
                          <p>Weight: {pkg.value} kg</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dimensionInputs.map((pkg, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                          <p><span className="font-medium">Package {idx + 1}:</span> {pkg.description}</p>
                          <p>Dimensions: {pkg.length}cm × {pkg.width}cm × {pkg.height}cm</p>
                          <p>Volumetric Weight: {((pkg.length * pkg.width * pkg.height) / 5000).toFixed(2)} kg</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">
            Select destination country to see rates
          </p>
        )}
      </div>
    </div>
  );
};

export default CalculatePricingCompo;