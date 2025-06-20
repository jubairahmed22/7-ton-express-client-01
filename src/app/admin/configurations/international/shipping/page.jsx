"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ModalCreateZone from "../../../../components/ModalAdmin/ModalCreateZone";
import ModalCreateCompany from "../../../../components/ModalAdmin/ModalCreateCompany";
import SpinnerBlur from "../../../../components/Spinner/SpinnerBlur";
import ShippingHeader from "../../../../components/InternationalConfiguration/ShippingHeader";
import ShippingError from "../../../../components/InternationalConfiguration/ShippingError";
import ShippingTable from "../../../../components/InternationalConfiguration/ShippingTable";

const ShippingConfigurationPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [allRatesData, setAllRatesData] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(
    searchParams.get("company") || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zoneKeys, setZoneKeys] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://server-gs-two.vercel.app/api/zone/pricing");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setAllRatesData(data.data);

      const initialCompany =
        searchParams.get("company") || data.data[0]?.company;
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
    router.push(
      `/admin/configurations/international/shipping?${params.toString()}`
    );
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

  // Add this new handler function
const handleWeightChange = (companyIndex, rateIndex, value) => {
  if (value === "" || /^\d*\.?\d*$/.test(value)) {
    const updatedRates = [...allRatesData];
    updatedRates[companyIndex].rates[rateIndex].weightKg = value;
    setAllRatesData(updatedRates);
    setHasChanges(true);
  }
};

// Update the saveAllChanges function
const saveAllChanges = async () => {
  setIsSaving(true);
  try {
    const updates = allRatesData.map((companyData) => ({
      _id: companyData._id,
      rates: companyData.rates.map((rate) => ({
        _id: rate._id,
        weightKg: rate.weightKg === "" ? "" : Number(rate.weightKg),
        parcelType: rate.parcelType,
        rates: Object.fromEntries(
          Object.entries(rate.rates).map(([zone, value]) => [
            zone,
            value === "" ? "" : Number(value),
          ])
        ),
      })),
    }));

    const response = await fetch("https://server-gs-two.vercel.app/api/zone/bulk", {
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

      const response = await fetch("https://server-gs-two.vercel.app/api/zone/pricing", {
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

  const handleDuplicateRow = async (companyId, rowIndex) => {
    try {
      const response = await fetch(
        `https://server-gs-two.vercel.app/api/add-row/${companyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rowIndex: rowIndex,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to duplicate row");

      const result = await response.json();

      setFilteredRates((prevRates) =>
        prevRates.map((company) =>
          company._id === companyId
            ? { ...company, rates: result.data.rates }
            : company
        )
      );
    } catch (error) {
      console.error("Error duplicating row:", error);
      toast.error("Failed to duplicate row");
    }
  };

  const handleDeleteRow = async (companyId, rowIndex) => {
  try {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this row? This action cannot be undone."
    );
    
    if (!confirmDelete) return; // Exit if user cancels

    // Show loading state
    toast.info("Deleting row...", { autoClose: false, toastId: "deleting-row" });

    const response = await fetch(
      `https://server-gs-two.vercel.app/api/delete-row/${companyId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rowIndex: rowIndex,
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to delete row");

    const result = await response.json();

    // Update state
    setFilteredRates((prevRates) =>
      prevRates.map((company) =>
        company._id === companyId
          ? { ...company, rates: result.data.rates }
          : company
      )
    );

    // Show success message
    toast.dismiss("deleting-row");
    toast.success("Row deleted successfully");
    
  } catch (error) {
    console.error("Error deleting row:", error);
    toast.dismiss("deleting-row");
    toast.error("Failed to delete row");
  }
};

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <SpinnerBlur></SpinnerBlur>
      </div>
    );
  }

  if (error) {
    return <ShippingError error={error} onRetry={fetchData} />;
  }

  const companies = [...new Set(allRatesData.map((item) => item.company))];

  return (
    <div className="p-8 flex justify-center flex-col items-center fontPoppins">
      <div className="flex flex-col gap-6 w-full">
        <ShippingHeader
          title="Shipping Configuration"
          selectedCompany={selectedCompany}
          companies={companies}
          onCompanyChange={handleCompanyChange}
          onAddCompany={() => setIsCompanyModalOpen(true)}
          onAddZone={() => setIsZoneModalOpen(true)}
          onSaveChanges={saveAllChanges}
          hasChanges={hasChanges}
          isSaving={isSaving}
        />

        {filteredRates.length > 0 ? (
          filteredRates.map((companyData) => (
            <ShippingTable
              key={companyData._id}
              companyData={companyData}
              zoneKeys={zoneKeys}
              allRatesData={allRatesData}
              onRateChange={handleRateChange}
              onParcelTypeChange={handleParcelTypeChange}
              onDuplicateRow={handleDuplicateRow}
              onDeleteRow={handleDeleteRow}
              handleWeightChange={handleWeightChange}
            />
          ))
        ) : (
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
        title="Add New Zone"
        onSubmit={handleAddNewPricing}
        companies={allRatesData.map((company) => ({
          id: company._id,
          name: company.company,
        }))}
        zoneKeys={zoneKeys}
        fetchData={fetchData}
      />
      <ModalCreateCompany
        isOpen={isCompanyModalOpen}
        fetchData={fetchData}
        onClose={() => setIsCompanyModalOpen(false)}
        title="Add New Company"
      />
    </div>
  );
};

export default ShippingConfigurationPage;