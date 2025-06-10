"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalculatePricingCompo from "../../../components/CalculatePricingCompo";
import TotalShipmentCard from "../../../components/AdminCard/TotalShipmentCard";
import FinalWeightCard from "../../../components/AdminCard/FinalWeightCard";
import dhl from "../../../../assets/dhl3.png";
import fedex from "../../../../assets/fedex.png";

const CreateShipment = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    senderFullName: "",
    senderEmail: "",
    senderPhone: "",
    pickupAddress: "",
    senderCountry: "Bangladesh",
    senderCountryCode: "BD",
    senderDistrictState: "",
    receiverFullName: "",
    receiverEmail: "",
    receiverPhone: "",
    deliveryAddress: "",
    receiverCountry: "",
    receiverCountryCode: "",
    goodsType: [],
    receiverStateCity: "",
    receiverZipCode: "",
    startDate: null,
    endDate: null,
  });
  const [errors, setErrors] = useState({});
  const [missingFields, setMissingFields] = useState([]);

  const [selectedGoods, setSelectedGoods] = useState([]);
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
    setSelectedGoods((prev) => {
      if (prev.includes(goods)) {
        // Remove if already selected
        return prev.filter((item) => item !== goods);
      } else {
        // Add if not selected
        return [...prev, goods];
      }
    });

    // Also update formData if needed
    setFormData((prev) => ({
      ...prev,
      goodsType: selectedGoods.includes(goods)
        ? selectedGoods.filter((item) => item !== goods)
        : [...selectedGoods, goods],
    }));
  };

  ///////////////////////////// start calculation

  const [zones, setZones] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [error, setError] = useState(null);

  // Selection states
  const [receiverCountry, setReceiverCountry] = useState("");
  const [receiverParcelType, setReceiverParcelType] = useState("DOX");
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

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://server-7tons.vercel.app/api/countryList");
        const data = await response.json();
        if (data.success) {
          setCountries(data.data);
          // Find Bangladesh in the list and set its code if not already set
          const bangladesh = data.data.find(
            (country) => country.name === "Bangladesh"
          );
          if (bangladesh && formData.senderCountryCode !== bangladesh.code) {
            setFormData((prev) => ({
              ...prev,
              senderCountryCode: bangladesh.code,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [receiverCountryName, setReceiverCountryName] = useState("");

  const handleCountryChange = (e, type) => {
    const selectedCountry = countries.find(
      (country) => country.name === e.target.value
    );

    if (selectedCountry) {
      setFormData((prev) => ({
        ...prev,
        [`${type}Country`]: selectedCountry.name,
        [`${type}CountryCode`]: selectedCountry.code,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [`${type}Country`]: "",
        [`${type}CountryCode`]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "senderFullName",
      "senderEmail",
      "senderPhone",
      "pickupAddress",

      "senderDistrictState",
      "receiverFullName",
      "receiverEmail",
      "receiverPhone",
      "deliveryAddress",
      "receiverZipCode",
    ];

    // Check missing fields
    const missing = requiredFields.filter((field) => !formData[field]);
    setMissingFields(missing);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.senderEmail && !emailRegex.test(formData.senderEmail)) {
      newErrors.senderEmail = "Invalid email format";
    }
    if (formData.receiverEmail && !emailRegex.test(formData.receiverEmail)) {
      newErrors.receiverEmail = "Invalid email format";
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (formData.senderPhone && !phoneRegex.test(formData.senderPhone)) {
      newErrors.senderPhone = "Phone must be 10-15 digits";
    }
    if (formData.receiverPhone && !phoneRegex.test(formData.receiverPhone)) {
      newErrors.receiverPhone = "Phone must be 10-15 digits";
    }

    // Zip code validation
    if (formData.receiverZipCode && isNaN(formData.receiverZipCode)) {
      newErrors.receiverZipCode = "Zip code must be a number";
    }

    setErrors(newErrors);
    return missing.length === 0 && Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const shipmentData = {
        ...formData,
        company: selectedRate.company,
        goodsType: selectedGoods,
        price: selectedRate.rate,
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
      };

      const response = await fetch(
        "https://server-7tons.vercel.app/api/create-inter-shipment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shipmentData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Shipment created successfully!`);
        // Reset form after successful submission
        setFormData({
          senderFullName: "",
          senderEmail: "",
          senderPhone: "",
          pickupAddress: "",
          senderCountry: "",
          senderCountryCode: "",
          senderDistrictState: "",

          receiverFullName: "",
          receiverEmail: "",
          receiverPhone: "",
          deliveryAddress: "",
          receiverCountry: receiverCountry,
          receiverCountryCode: "",
          receiverStateCity: "",
          receiverZipCode: "",
        });
      } else {
        console.error("Error creating shipment:", data.error);
        alert(data.error || "Failed to create shipment");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      startDate: date,
      // Reset end date if it's before the new start date
      endDate:
        prev.endDate && date && prev.endDate < date ? null : prev.endDate,
    }));
  };

  const handleEndDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      endDate: date,
    }));
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="p-8 gap-6 flex justify-center items-center flex-col fontPoppins">
      <div className="flex justify-start w-full">
        <h1 className="fontPoppins font-semibold text-black text-2xl">
          Create International Shipment
        </h1>
      </div>
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="w-full h-16 border-b border-gray-200 flex flex-row bg-gray-50">
          <div className="w-full flex justify-start items-center px-6 font-semibold text-gray-700 border-r border-gray-200">
            <h1 className="text-lg">Sender Information</h1>
          </div>
          <div className="w-full flex justify-start items-center px-6 font-semibold text-gray-700">
            <h1 className="text-lg">Receiver Information</h1>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
          {/* Error Messages */}
          {missingFields.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 border-l-4 border-red-500">
              <p className="font-semibold flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Please fill in all required fields:
              </p>
              <ul className="list-disc pl-7 mt-2 space-y-1">
                {missingFields.map((field) => (
                  <li key={field} className="text-sm">
                    {field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .replace("sender ", "Sender ")
                      .replace("receiver ", "Receiver ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sender and Receiver Information */}
          <div className="w-full grid grid-cols-2 md:grid-cols-2 divide-x divide-gray-200">
            {/* Sender Column */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
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
                        missingFields.includes("senderEmail") ||
                        errors.senderEmail
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {errors.senderEmail && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.senderEmail}
                      </p>
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
                        missingFields.includes("senderPhone") ||
                        errors.senderPhone
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    {errors.senderPhone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.senderPhone}
                      </p>
                    )}
                  </div>
                </div>

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

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="senderCountry"
                      value={formData.senderCountry || "Bangladesh"} // Set Bangladesh as default
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

                <div className="grid grid-cols-2 md:grid-cols-2 ">
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
                      <p className="mt-1 text-sm text-red-600">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Receiver Column */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
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
                        missingFields.includes("receiverEmail") ||
                        errors.receiverEmail
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
                        missingFields.includes("receiverPhone") ||
                        errors.receiverPhone
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="receiverCountry"
                    value={receiverCountry}
                    onChange={(e) => {
                      const selectedCountry = countries.find(
                        (country) => country.code === e.target.value
                      );
                      setReceiverCountry(e.target.value);
                      setReceiverCountryName(selectedCountry?.name);

                      setFormData((prev) => ({
                        ...prev,
                        receiverCountry: selectedCountry?.name || "",
                        receiverCountryCode: selectedCountry?.code || "",
                        receiverStateCity: "",
                        receiverZipCode: "",
                      }));
                      setSelectedRate(null);
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                        missingFields.includes("receiverZipCode") ||
                        errors.receiverZipCode
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
          </div>

          <div className="px-6 py-10">
            {/* parcel type */}
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
                    }}
                    className="hidden"
                  />

                  <label
                    htmlFor="doxOption"
                    className={`flex-1 h-full flex items-center justify-center cursor-pointer transition-colors ${
                      receiverParcelType === "DOX"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    DOX (Documents)
                  </label>

                  <label
                    htmlFor="wpxOption"
                    className={`flex-1 h-full flex items-center justify-center cursor-pointer transition-colors ${
                      receiverParcelType === "WPX"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    WPX (Worldwide Parcel Express)
                  </label>
                </div>
              </div>
              <div className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Goods Type (MultiSelect){" "}
                  <span className="text-red-500">*</span>
                </label>

                <button
                  onClick={toggleDropdown}
                  className="w-full md:w-96 cursor-pointer text-left bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2.5 inline-flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`truncate ${
                      selectedGoods.length === 0
                        ? "text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {selectedGoods.length > 0
                      ? selectedGoods.join(", ")
                      : "Select Goods Types"}
                  </span>
                  <div className="flex items-center">
                    {selectedGoods.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2 py-0.5 rounded-full">
                        {selectedGoods.length}
                      </span>
                    )}
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
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
                          className="flex cursor-pointer items-center p-2 hover:bg-blue-50 rounded-lg  transition-colors duration-100"
                        >
                          <input
                            id={`goods-${goods}`}
                            type="checkbox"
                            checked={selectedGoods.includes(goods)}
                            onChange={() => handleGoodsSelection(goods)}
                            className="h-4 cursor-pointer w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
                      <div className="border-t  border-gray-200 px-3 py-2 bg-gray-50 rounded-b-lg">
                        <button
                          type="button"
                          onClick={() => setSelectedGoods([])}
                          className="text-xs cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
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
                                      e.key === "Enter" &&
                                      handleRateSelection(rate)
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
                                        {selectedRate?.company ===
                                          rate.company && (
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
                                        $
                                        {rate.rate
                                          ? rate.rate.toFixed(2)
                                          : "N/A"}
                                      </span>
                                      {rate.deliveryDays && (
                                        <span className="block text-sm text-gray-500">
                                          Est. {rate.deliveryDays}{" "}
                                          {rate.deliveryDays === 1
                                            ? "day"
                                            : "days"}
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
                                {/* price list */}
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
                                        {receiverParcelType === "DOX"
                                          ? "DOX (Documents)"
                                          : receiverParcelType === "WPX"
                                          ? "WPX (Worldwide Parcel Express)"
                                          : ""}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 mx-auto text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
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

            {/* Submit Button */}
            <div className="py-4  flex justify-start">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Create Shipment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateShipment;
