import React, { useEffect, useState } from "react";
import dhl from "../../../assets/dhl3.png";
import fedex from "../../../assets/fedex.png";

const ShippingRates = ({
  receiverCountry,
  receiverParcelType,
  packageWeight,
  selectedRate,
  setSelectedRate,
  receiverCountryName,
}) => {
  const [receiverRates, setReceiverRates] = useState([]);
  const [receiverZone, setReceiverZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState([]);
  const [pricingData, setPricingData] = useState([]);

  // Fetch zones and pricing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zoneRes, pricingRes] = await Promise.all([
          fetch("https://server-gs-two.vercel.app/api/zone"),
          fetch("https://server-gs-two.vercel.app/api/zone/pricing"),
        ]);

        if (!zoneRes.ok || !pricingRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [zoneData, pricingData] = await Promise.all([
          zoneRes.json(),
          pricingRes.json(),
        ]);

        if (zoneData.success && pricingData.success) {
          setZones(zoneData.data);
          setPricingData(pricingData.data);
        }
      } catch (err) {
        console.error("Error fetching shipping data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate rates when inputs change
  useEffect(() => {
    if (receiverCountry && zones.length > 0 && pricingData.length > 0) {
      calculateRates();
    }
  }, [receiverCountry, receiverParcelType, packageWeight, zones, pricingData]);

  const findZoneForCountry = (countryCode) => {
    for (const zone of zones) {
      const foundCountry = zone.countryList.find(
        (c) => c.countryCode === countryCode
      );
      if (foundCountry) return zone;
    }
    return null;
  };

  const calculateRates = () => {
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
          deliveryDays: pricingEntry?.deliveryDays,
        };
      });
      setReceiverRates(rates);
    } else {
      setReceiverRates([]);
    }
  };

  const handleRateSelection = (rate) => {
    if (!rate.rate) return;
    setSelectedRate(rate);
    localStorage.setItem(
      "selectedShippingRate",
      JSON.stringify({
        company: rate.company,
        price: rate.rate,
        weight: packageWeight,
        parcelType: receiverParcelType,
        country: receiverCountry,
        deliveryDays: rate.deliveryDays,
      })
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading shipping rates...</p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="bg-white p-4 rounded-lg border border-gray-200 h-full">
        <h3 className="font-bold text-lg mb-3 text-gray-800">Shipping Rates</h3>
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
                        : receiverParcelType}
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
                    aria-pressed={selectedRate?.company === rate.company}
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
                          <img className="h-6 w-auto" src={dhl.src} alt="DHL" />
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
                    <img className="h-6 w-auto" src={fedex.src} alt="FedEx" />
                  ) : selectedRate.company === "DHL" ? (
                    <img className="h-6 w-auto" src={dhl.src} alt="DHL" />
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
  );
};

export default ShippingRates;
