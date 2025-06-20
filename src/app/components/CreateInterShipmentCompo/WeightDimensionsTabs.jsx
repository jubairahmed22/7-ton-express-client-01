"use client";
import React, { useState, useEffect } from "react";

const WeightDimensionsTabs = ({
  activeTab,
  setActiveTab,
  packageWeight,
  setPackageWeight,
  setSelectedRate
}) => {
  const [weightInputs, setWeightInputs] = useState([
    { id: 1, value: 0.5, description: "Package 1" }
  ]);
  const [dimensionInputs, setDimensionInputs] = useState([
    { id: 1, length: 0, width: 0, height: 0, description: "Package 1" }
  ]);
  const [totalWeight, setTotalWeight] = useState(0.5);
  const [volumetricWeights, setVolumetricWeights] = useState([0]);
  const [totalVolumetricWeight, setTotalVolumetricWeight] = useState(0);

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

  // Weight input handlers
  const addWeightInput = () => {
    if (weightInputs.length < 5) {
      const newId = weightInputs.length + 1;
      setWeightInputs([
        ...weightInputs,
        { id: newId, value: 0, description: `Package ${newId}` }
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
          ? { ...input, [field]: field === "value" ? parseFloat(value) || 0 : value }
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
        { id: newId, length: 0, width: 0, height: 0, description: `Package ${newId}` }
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
          ? { ...input, [field]: field === "description" ? value : parseInt(value) || 0 }
          : input
      )
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex border-b border-gray-200 mb-4">
        <button
          type="button"
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "weight"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("weight")}
        >
          Weight (kg)
        </button>
        <button
          type="button"
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "dimensions"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("dimensions")}
        >
          Dimensions (cm) - L × W × H
        </button>
      </div>

      {activeTab === "weight" ? (
        <div className="space-y-4">
          {weightInputs.map((input, index) => (
            <div key={input.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">Package {index + 1}</h4>
                {weightInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWeightInput(input.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={input.value}
                    onChange={(e) => updateWeightInput(input.id, "value", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={input.description}
                    onChange={(e) => updateWeightInput(input.id, "description", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Package contents"
                  />
                </div>
              </div>
            </div>
          ))}

          {weightInputs.length < 5 && (
            <button
              type="button"
              onClick={addWeightInput}
              className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
            >
              + Add Package
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Total Weight</h4>
              <p className="text-2xl font-bold text-blue-700">
                {totalWeight.toFixed(2)} <span className="text-lg font-normal">kg</span>
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Final Package Weight</h4>
              <p className="text-2xl font-bold text-green-700">
                {packageWeight.toFixed(2)} <span className="text-lg font-normal">kg</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {dimensionInputs.map((input, index) => (
            <div key={input.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">Package {index + 1}</h4>
                {dimensionInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDimensionInput(input.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={input.length}
                    onChange={(e) => updateDimensionInput(input.id, "length", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
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
                    onChange={(e) => updateDimensionInput(input.id, "width", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
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
                    onChange={(e) => updateDimensionInput(input.id, "height", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={input.description}
                    onChange={(e) => updateDimensionInput(input.id, "description", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Package contents"
                  />
                </div>
              </div>
              {input.length > 0 && input.width > 0 && input.height > 0 && (
                <div className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                  <p>
                    Volumetric Weight: <strong>{volumetricWeights[index].toFixed(2)} kg</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    (Calculation: {input.length}cm × {input.width}cm × {input.height}cm ÷ 5000)
                  </p>
                </div>
              )}
            </div>
          ))}

          {dimensionInputs.length < 5 && (
            <button
              type="button"
              onClick={addDimensionInput}
              className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
            >
              + Add Package
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Total Volumetric Weight</h4>
              <p className="text-2xl font-bold text-blue-700">
                {totalVolumetricWeight.toFixed(2)} <span className="text-lg font-normal">kg</span>
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Final Package Weight</h4>
              <p className="text-2xl font-bold text-green-700">
                {packageWeight.toFixed(2)} <span className="text-lg font-normal">kg</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightDimensionsTabs;