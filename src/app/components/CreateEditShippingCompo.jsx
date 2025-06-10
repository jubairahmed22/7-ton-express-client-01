"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalculatePricingCompo from "../../../components/CalculatePricingCompo";

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
  const [weightInputs, setWeightInputs] = useState([{ id: 1, value: 0.5 }]);
  const [dimensionInputs, setDimensionInputs] = useState([
    { id: 1, length: 0, width: 0, height: 0 },
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
    localStorage.setItem(
      "selectedShippingRate",
      JSON.stringify({
        company: rate.company,
        price: rate.rate,
        weight: totalWeight.toFixed(2),
        parcelType: receiverParcelType,
        country: receiverCountry,
      })
    );
  };

  // Weight input handlers
  const addWeightInput = () => {
    if (weightInputs.length < 5) {
      const newId = weightInputs.length + 1;
      setWeightInputs([...weightInputs, { id: newId, value: 0 }]);
    }
  };

  const removeWeightInput = (id) => {
    if (weightInputs.length > 1) {
      setWeightInputs(weightInputs.filter((input) => input.id !== id));
    }
  };

  const updateWeightInput = (id, value) => {
    setWeightInputs(
      weightInputs.map((input) =>
        input.id === id ? { ...input, value: parseFloat(value) || 0 } : input
      )
    );
  };

  // Dimension input handlers
  const addDimensionInput = () => {
    if (dimensionInputs.length < 5) {
      const newId = dimensionInputs.length + 1;
      setDimensionInputs([
        ...dimensionInputs,
        { id: newId, length: 0, width: 0, height: 0 },
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
        input.id === id ? { ...input, [field]: parseInt(value) || 0 } : input
      )
    );
  };

  ///////////////////////////// END CALCULATION

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://server-gs-two.vercel.app/api/countryList");
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
      "senderCountry",
      "senderCountryCode",
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
      };

      const response = await fetch(
        "https://server-gs-two.vercel.app/api/create-inter-shipment",
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
        alert(
          `Shipment created successfully! Tracking Number: ${data.trackingNumber}`
        );
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
      <div className="bg-white rounded-xl w-full min-h-screen shadow border border-gray-300 p-6">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          {missingFields.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              <p className="font-semibold">
                Please fill in all required fields:
              </p>
              <ul className="list-disc pl-5">
                {missingFields.map((field) => (
                  <li key={field}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sender Information Column */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">
                Sender Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="senderFullName"
                  value={formData.senderFullName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderFullName")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email*
                </label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderEmail") || errors.senderEmail
                      ? "border-red-500"
                      : "border"
                  }`}
                />
                {errors.senderEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.senderEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone*
                </label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderPhone") || errors.senderPhone
                      ? "border-red-500"
                      : "border"
                  }`}
                />
                {errors.senderPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.senderPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pickup Address*
                </label>
                <textarea
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("pickupAddress")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sender Country*
                </label>
                <select
                  name="senderCountry"
                  value={formData.senderCountry}
                  onChange={(e) => handleCountryChange(e, "sender")}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderCountry") ||
                    missingFields.includes("senderCountryCode")
                      ? "border-red-500"
                      : "border"
                  }`}
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country.name}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                {formData.senderCountryCode && (
                  <p className="mt-1 text-sm text-gray-500">
                    Country Code: {formData.senderCountryCode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  District/State*
                </label>
                <input
                  type="text"
                  name="senderDistrictState"
                  value={formData.senderDistrictState}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("senderDistrictState")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pickup Start Date*
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("startDate")
                      ? "border-red-500"
                      : "border"
                  }`}
                  placeholderText="Select start date"
                  required
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pickup End Date*
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("endDate") || errors.endDate
                      ? "border-red-500"
                      : "border"
                  }`}
                  placeholderText="Select end date"
                  required
                  isClearable
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Receiver Information Column */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">
                Receiver Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="receiverFullName"
                  value={formData.receiverFullName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverFullName")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email*
                </label>
                <input
                  type="email"
                  name="receiverEmail"
                  value={formData.receiverEmail}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverEmail") ||
                    errors.receiverEmail
                      ? "border-red-500"
                      : "border"
                  }`}
                />
                {errors.receiverEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.receiverEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone*
                </label>
                <input
                  type="tel"
                  name="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverPhone") ||
                    errors.receiverPhone
                      ? "border-red-500"
                      : "border"
                  }`}
                />
                {errors.receiverPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.receiverPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Address*
                </label>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("deliveryAddress")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Receiver Country*
                </label>
                <select
                  name="receiverCountry"
                  value={formData.receiverCountry}
                  onChange={(e) => handleCountryChange(e, "receiver")}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverCountry") ||
                    missingFields.includes("receiverCountryCode")
                      ? "border-red-500"
                      : "border"
                  }`}
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country.name}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                {formData.receiverCountryCode && (
                  <p className="mt-1 text-sm text-gray-500">
                    Country Code: {formData.receiverCountryCode}
                  </p>
                )}
              </div> */}

              {/* CALCULATE DATA START */}
              <div>
                <label
                  htmlFor="receiverCountry"
                  className="block mb-2 font-medium"
                >
                  Destination Country:
                </label>
                <select
                  id="receiverCountry"
                  value={receiverCountry}
                  onChange={(e) => {
                    const selectedCountry = countries.find(
                      (country) => country.code === e.target.value
                    );

                    // Update the receiverCountry state
                    setReceiverCountry(e.target.value);

                    // Update the formData state
                    setFormData((prev) => ({
                      ...prev,
                      receiverCountry: selectedCountry?.name || "",
                      receiverCountryCode: selectedCountry?.code || "",
                      // Reset these fields when country changes
                      receiverStateCity: "",
                      receiverZipCode: "",
                    }));

                    setSelectedRate(null); // Reset selection when country changes
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
              {/* CALCULATE DATA END   */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State/City*
                </label>
                <input
                  type="text"
                  name="receiverStateCity"
                  value={formData.receiverStateCity}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverStateCity")
                      ? "border-red-500"
                      : "border"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Zip Code*
                </label>
                <input
                  type="text"
                  name="receiverZipCode"
                  value={formData.receiverZipCode}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    missingFields.includes("receiverZipCode") ||
                    errors.receiverZipCode
                      ? "border-red-500"
                      : "border"
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

          <div className="mb-4 relative">
            <label className="block text-gray-700 font-bold mb-2">
              Goods Type (MultiSelect)
            </label>

            {/* Dropdown button */}
            <button
              onClick={toggleDropdown}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
            >
              {selectedGoods.length > 0
                ? selectedGoods.join(", ")
                : "Select Goods Types"}
              <svg
                className={`w-2.5 h-2.5 ms-3 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
              <div className="z-10 absolute mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-60 dark:bg-gray-700 dark:divide-gray-600">
                <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                  {goodsTypes.map((goods) => (
                    <li key={goods}>
                      <div className="flex p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                        <div className="flex items-center h-5">
                          <input
                            id={`goods-${goods}`}
                            type="checkbox"
                            checked={selectedGoods.includes(goods)}
                            onChange={() => handleGoodsSelection(goods)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                        </div>
                        <div className="ms-2 text-sm">
                          <label
                            htmlFor={`goods-${goods}`}
                            className="font-medium text-gray-900 dark:text-gray-300"
                          >
                            <div>{goods}</div>
                          </label>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setIsOpen(false)}
              ></div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Shipment"}
            </button>
          </div>
        </form>
        {/* CALCULATION PART START */}
        <div className="space-y-4 p-4 max-w-4xl mx-auto">
          {/* Country Selector */}

          {/* Parcel Type Selector */}
          <div>
            <label
              htmlFor="receiverParcelType"
              className="block mb-2 font-medium"
            >
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
                    <div key={input.id} className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={input.value}
                        onChange={(e) =>
                          updateWeightInput(input.id, e.target.value)
                        }
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder={`Weight ${index + 1} (kg)`}
                      />
                      {weightInputs.length > 1 && (
                        <button
                          onClick={() => removeWeightInput(input.id)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
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

                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="font-medium">
                    Total Volumetric Weight: {totalVolumetricWeight.toFixed(2)}{" "}
                    kg
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
        {/* CALCULATION PART END */}
      </div>
    </div>
  );
};
export default CreateShipment;
