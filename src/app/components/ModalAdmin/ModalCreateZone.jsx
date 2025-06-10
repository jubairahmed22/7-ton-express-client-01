"use client";
import React, { useEffect, useState } from "react";
import CreateZoneForm from "../../Form/CreateZoneForm";

const ModalCreateZone = ({ isOpen, onClose, title, children, fetchData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState({}); // {zoneId: {countryCode, countryName}}
  

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchZones();
      fetchCountries();
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const fetchZones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("https://server-7tons.vercel.app/api/zone");
      const data = await response.json();
      if (data.success) {
        setZones(data.data);
      } else {
        throw new Error("Failed to fetch zones");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching zones:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch("https://server-7tons.vercel.app/api/countryList");
      const data = await response.json();
      if (data.success) {
        setCountries(data.data);
      } else {
        throw new Error("Failed to fetch countries");
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
    }
  };

  const handleCountrySelect = (zoneId, countryCode) => {
    const selectedCountry = countries.find((c) => c.code === countryCode);
    setSelectedCountries((prev) => ({
      ...prev,
      [zoneId]: {
        countryCode,
        country: selectedCountry?.name || "",
      },
    }));
  };

  const handleAddCountry = async (zoneId) => {
    const selectedCountry = selectedCountries[zoneId];
    if (!selectedCountry) return;

    try {
      const response = await fetch(
        `https://server-7tons.vercel.app/api/zone/${zoneId}/add-countries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            countries: [
              {
                country: selectedCountry.country,
                countryCode: selectedCountry.countryCode,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add country");
      }

      if (data.success) {
        // Refresh the zones list
        fetchZones();
        // Clear the selection
        setSelectedCountries((prev) => {
          const newState = { ...prev };
          delete newState[zoneId];
          return newState;
        });
      }
    } catch (err) {
      setError(err.message);
      console.error("Error adding country:", err);
    }
  };

  const handleDeleteCountry = async (zoneId, countryCode) => {
    if (
      !window.confirm(
        `Are you sure you want to remove this country from the zone?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `https://server-7tons.vercel.app/api/zone/${zoneId}/${countryCode}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete country from zone");
      }

      if (data.success) {
        fetchZones();
      }
    } catch (err) {
      setError(err.message);
      console.error("Error deleting country from zone:", err);
    }
  };

  const handleDeleteZone = async (zoneName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Zone ${zoneName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(
        `https://server-7tons.vercel.app/api/zone/${zoneName}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete zone");
      }

      if (data.success) {
        setZones((prevZones) =>
          prevZones.filter((zone) => zone.name !== zoneName)
        );
      } else {
        throw new Error(data.message || "Failed to delete zone");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error deleting zone:", err);
    } finally {
      setDeleteLoading(false);
      fetchData();
    }
  };

  if (!isVisible) return null;
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-[80%] h-[80%] flex flex-col overflow-hidden border border-gray-100 transform transition-all duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6 text-gray-500 hover:text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}

          <div className="flex flex-row gap-4">
            <div className="w-[30%]">
              <CreateZoneForm
                fetchData={fetchData}
                onZoneCreated={fetchZones}
              />
            </div>
            <div className="overflow-y-auto w-[70%]">
              {zones.length === 0 ? (
                <p className="text-gray-500">No zones found</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Countries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Add Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {zones.map((zone) => (
                      <tr key={zone._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {zone.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-2">
                            {zone.countryList.map((country, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {country.country} ({country.countryCode})
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCountry(
                                      zone._id,
                                      country.countryCode
                                    );
                                  }}
                                  className="ml-1 cursor-pointer text-red-500 hover:text-red-700 focus:outline-none"
                                  title="Remove country from zone"
                                >
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <select
                              value={
                                selectedCountries[zone._id]?.countryCode || ""
                              }
                              onChange={(e) =>
                                handleCountrySelect(zone._id, e.target.value)
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="">Select a country</option>
                              {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name} ({country.code})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAddCountry(zone._id)}
                              disabled={!selectedCountries[zone._id]}
                              className="inline-flex cursor-pointer items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Add
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteZone(zone.name)}
                            disabled={deleteLoading}
                            className="inline-flex cursor-pointer items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteLoading ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCreateZone;
