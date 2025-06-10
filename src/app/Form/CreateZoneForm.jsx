"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

export default function CreateZoneForm({ fetchData }) {
  const [formData, setFormData] = useState({
    name: "",
    countryList: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://server-gs-two.vercel.app/api/countryList");
        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }
        const data = await response.json();
        setCountries(data.data);
        setFilteredCountries(data.data);
      } catch (err) {
        toast.error("Failed to load countries");
        console.error(err);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchTerm, countries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountrySelect = (country) => {
    // Check if country is already selected
    if (selectedCountries.some(c => c.country === country.name)) {
      toast.warning(`${country.name} is already selected`);
      return;
    }

    setSelectedCountries(prev => [
      ...prev,
      {
        country: country.name,
        countryCode: country.code
      }
    ]);

    // Update formData with the new countryList
    setFormData(prev => ({
      ...prev,
      countryList: [
        ...prev.countryList,
        {
          country: country.name,
          countryCode: country.code
        }
      ]
    }));

    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const removeCountry = (countryToRemove) => {
    setSelectedCountries(prev => 
      prev.filter(country => country.country !== countryToRemove)
    );
    setFormData(prev => ({
      ...prev,
      countryList: prev.countryList.filter(
        country => country.country !== countryToRemove
      )
    }));
  };

  const validateZoneName = (name) => {
    return /^[A-Z]$/.test(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.name || formData.countryList.length === 0) {
      toast.error("Please fill all required fields and select at least one country");
      setIsSubmitting(false);
      return;
    }

    // Validate zone name is a single capital letter
    if (!validateZoneName(formData.name)) {
      toast.error("Zone name must be a single capital letter (A-Z)");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("https://server-gs-two.vercel.app/api/zone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create zone");
      }

      toast.success("Zone created successfully!");
      setFormData({
        name: "",
        countryList: [],
      });
      setSelectedCountries([]);
      if (fetchData) {
        fetchData();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Zone Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            pattern="[A-Z]{1}"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Countries <span className="text-red-500">*</span>
          </label>
          {isLoadingCountries ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
              Loading countries...
            </div>
          ) : (
            <div className="space-y-2" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country._id}
                          onClick={() => handleCountrySelect(country)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                        >
                          <span>{country.name}</span>
                          <span className="text-gray-500">{country.code}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No countries found</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected countries list */}
              {selectedCountries.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">Selected countries:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountries.map((country) => (
                      <div 
                        key={country.country} 
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>
                          {country.country} ({country.countryCode})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCountry(country.country)}
                          className="ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoadingCountries}
          className={`w-full cursor-pointer py-2 px-4 rounded-md text-white font-medium ${
            isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {isSubmitting ? "Submitting..." : "Create Zone"}
        </button>
      </form>
    </div>
  );
}