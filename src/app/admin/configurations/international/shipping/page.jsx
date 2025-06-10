"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ModalCreateZone from "../../../../components/ModalAdmin/ModalCreateZone";
import SpinnerBlur from "../../../../components/Spinner/SpinnerBlur";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [allRatesData, setAllRatesData] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(searchParams.get("company") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zoneKeys, setZoneKeys] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://server-7tons.vercel.app/api/zone/pricing");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setAllRatesData(data.data);

      const initialCompany = searchParams.get("company") || data.data[0]?.company;
      setSelectedCompany(initialCompany);

      const filtered = data.data.filter(
        (companyData) => companyData.company === initialCompany
      );
      setFilteredRates(filtered);

      const firstCompanyWithRates = data.data.find(
        (company) => company.rates && company.rates.length > 0
      );
      if (firstCompanyWithRates) {
        const firstRateWithZones = firstCompanyWithRates.rates.find(
          (rate) => rate.rates
        );
        if (firstRateWithZones) {
          setZoneKeys(Object.keys(firstRateWithZones.rates));
        }
      }

      setHasChanges(false);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = allRatesData.filter(
      (companyData) => companyData.company === selectedCompany
    );
    setFilteredRates(filtered);
  }, [selectedCompany, allRatesData]);

  const handleCompanyChange = (value) => {
    setSelectedCompany(value);
    const params = new URLSearchParams(window.location.search);
    params.set("company", value);
    router.push(`/admin/configurations/international/shipping?${params.toString()}`);
  };

  const handleRateChange = (companyIndex, rateIndex, zone, value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const updatedRates = [...allRatesData];
      updatedRates[companyIndex].rates[rateIndex].rates[zone] = value;
      setAllRatesData(updatedRates);
      setHasChanges(true);
    }
  };

  const handleParcelTypeChange = (companyIndex, rateIndex, value) => {
    const updatedRates = [...allRatesData];
    updatedRates[companyIndex].rates[rateIndex].parcelType = value;
    setAllRatesData(updatedRates);
    setHasChanges(true);
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      const updates = allRatesData.map((companyData) => ({
        _id: companyData._id,
        rates: companyData.rates.map((rate) => ({
          _id: rate._id,
          weightKg: rate.weightKg,
          parcelType: rate.parcelType,
          rates: Object.fromEntries(
            Object.entries(rate.rates).map(([zone, value]) => [
              zone,
              value === "" ? "" : Number(value),
            ])
          ),
        })),
      }));

      const response = await fetch("https://server-7tons.vercel.app/api/zone/bulk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) throw new Error("Failed to save changes");

      const data = await response.json();
      toast.success(data.message || "All changes saved successfully");
      setHasChanges(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Error saving changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewPricing = async (newPricing) => {
    try {
      const ratesObject = {};
      zoneKeys.forEach((zone) => {
        ratesObject[zone] = newPricing[zone] || "";
      });

      const response = await fetch("https://server-7tons.vercel.app/api/zone/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: newPricing.company,
          weightKg: newPricing.weightKg,
          parcelType: newPricing.parcelType,
          rates: ratesObject,
        }),
      });

      if (!response.ok) throw new Error("Failed to add new pricing");

      const data = await response.json();
      toast.success(data.message || "New pricing added successfully");
      fetchData();
      setIsZoneModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Error adding new pricing");
    }
  };

  const companies = [...new Set(allRatesData.map((item) => item.company))];

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
         <SpinnerBlur></SpinnerBlur>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="flex flex-col gap-6 w-full">
          
          <h1 className="fontPoppins font-semibold text-black text-xl mb-10">
            Shipping Configuration
          </h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong>Error: </strong> {error}
            <button
              onClick={fetchData}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex justify-center items-center fontPoppins">
 
      <div className="flex flex-col gap-6 w-full ">
             
        <div className="flex justify-between items-center">
          <h1 className="fontPoppins font-semibold text-black text-2xl">
            Shipping Configuration
          </h1>

          <div className="flex gap-4 cursor-pointer">
            <select
              value={selectedCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="bg-gray-50 cursor-pointer border w-56 border-gray-300 text-black text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              {companies.map((company) => (
                <option  key={company} value={company}>
                  <span className="cursor-pointer">{company}</span>
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsZoneModalOpen(true)}
              className="bg-blue-500  cursor-pointer text-white py-2.5 px-5 font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add New Pricing
            </button>

            <button
              onClick={saveAllChanges}
              disabled={!hasChanges || isSaving}
              className={`bg-green-500 cursor-pointer text-white py-2.5 px-5 font-medium rounded-lg hover:bg-green-600 transition-colors ${
                !hasChanges || isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>

        {filteredRates.map((companyData) => (
          <div key={companyData._id} className="mb-8 p-5 rounded-xl bg-white">
            <h2 className="text-xl font-semibold mb-4">
              {companyData.company} Rates
            </h2>
            <div className="bg-white shadow-lg rounded-lg  border border-black overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 border border-black">
      <thead className="bg-blue-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider border border-black">
            Weight (kg)
          </th>
          <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider border border-black">
            Parcel Type
          </th>
          {zoneKeys.map((zone) => (
            <th
              key={zone}
              className="px-6 py-4 text-center text-sm font-bold text-black uppercase tracking-wider border border-black"
            >
              {zone.replace("Zone", "Zone ")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {companyData.rates.map((item, rateIndex) => (
          <tr key={item._id || rateIndex} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-center text-md font-semibold text-black border border-black bg-blue-200">
              {item.weightKg}
            </td>
            <td className="px-6  py-4 border border-black">
              <select
                value={item.parcelType}
                onChange={(e) =>
                  handleParcelTypeChange(
                    allRatesData.findIndex((c) => c._id === companyData._id),
                    rateIndex,
                    e.target.value
                  )
                }
                className="bg-gray-50 border border-gray-300 text-black text-md rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
              >
                <option value="DOX">DOX</option>
                <option value="WPX">WPX</option>
              </select>
            </td>
            {zoneKeys.map((zone) => (
              <td key={zone} className="px-6 py-4 border border-black">
                <input
                  type="text"
                  value={item.rates[zone] || ""}
                  onChange={(e) =>
                    handleRateChange(
                      allRatesData.findIndex((c) => c._id === companyData._id),
                      rateIndex,
                      zone,
                      e.target.value
                    )
                  }
                  className="border border-gray-300 text-black font-medium rounded px-3 py-2 w-full max-w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
          </div>
        ))}

        {filteredRates.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No shipping rates found. Add new pricing to get started.
            </p>
          </div>
        )}
      </div>

      <ModalCreateZone
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        title="Add New Shipping Pricing"
        onSubmit={handleAddNewPricing}
        companies={allRatesData.map((company) => ({
          id: company._id,
          name: company.company,
        }))}
        zoneKeys={zoneKeys}
        fetchData={fetchData}
      />
    </div>
  );
};

export default Page;
