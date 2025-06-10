"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SpinnerBlur from "../../../components/Spinner/SpinnerBlur";
import ShipmentFilters from "../../../components/AllShipmentListItem/ShipmentFilters";
import ShipmentTable from "../../../components/AllShipmentListItem/ShipmentTable";
import AllShipmentPagination from "../../../components/AllShipmentListItem/AllShipmentPagination";

const ShipmentListPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // New state for initial load
  const [filtering, setFiltering] = useState(false); // New state for filtering
  const [paginating, setPaginating] = useState(false); // New state for pagination
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [countries, setCountries] = useState([]);

  // State for current applied filters (used for actual fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate"))
      : null,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate"))
      : null,
    senderEmail: searchParams.get("senderEmail") || "",
    senderPhone: searchParams.get("senderPhone") || "",
    receiverEmail: searchParams.get("receiverEmail") || "",
    receiverPhone: searchParams.get("receiverPhone") || "",
    trackingNumber: searchParams.get("trackingNumber") || "",
    receiverCountry: searchParams.get("receiverCountry") || "",
    company: searchParams.get("company") || "",
    status: searchParams.get("status") || "",
  });

  // State for draft filters (what user is editing)
  const [draftFilters, setDraftFilters] = useState({ ...appliedFilters });

  const itemsPerPage = 5;

  // Fetch shipments function
  const fetchShipments = useCallback(
    async (page, filters) => {
      try {
        setLoading(true);
        if (page !== currentPage) {
          setPaginating(true);
        }

        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", itemsPerPage.toString());

        // Add filters to the request
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "" && value !== null) {
            params.append(
              key,
              value instanceof Date ? value.toISOString() : value
            );
          }
        });

        const response = await fetch(
          `https://server-gs-two.vercel.app/api/inter-shipment-list?${params.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          setShipments(data.data);
          setTotalPages(data.pagination?.totalPages || 1);
          setCurrentPage(data.pagination?.page || 1);
        } else {
          setError(data.message || "Failed to fetch shipments");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setInitialLoad(false);
        setFiltering(false);
        setPaginating(false);
      }
    },
    [itemsPerPage, currentPage]
  );

  // Update URL with current filters and pagination
  const updateUrl = useCallback(
    (page, filters) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          params.set(key, value instanceof Date ? value.toISOString() : value);
        }
      });

      router.push(`?${params.toString()}`, undefined, { shallow: true });
    },
    [router]
  );

  // Fetch companies and countries on component mount
  useEffect(() => {
    const fetchCompaniesAndCountries = async () => {
      try {
        // Fetch companies
        const companiesResponse = await fetch(
          "https://server-gs-two.vercel.app/api/zone/pricing"
        );
        const companiesData = await companiesResponse.json();
        if (companiesData.success) {
          setCompanies(companiesData.data.map((item) => item.company));
        }

        // Fetch countries
        const countriesResponse = await fetch(
          "https://server-gs-two.vercel.app/api/countryList"
        );
        const countriesData = await countriesResponse.json();
        if (countriesData.success) {
          setCountries(countriesData.data);
        }
      } catch (err) {
        console.error("Error fetching companies or countries:", err);
      }
    };

    fetchCompaniesAndCountries();
  }, []);

  // Initial fetch and setup interval
  useEffect(() => {
    // Get initial page from URL or default to 1
    const initialPage = parseInt(searchParams.get("page")) || 1;

    // Initial fetch with applied filters
    fetchShipments(initialPage, appliedFilters);

    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      fetchShipments(currentPage, appliedFilters);
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchShipments, searchParams, currentPage, appliedFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setDraftFilters((prev) => ({ ...prev, [field]: date }));
  };

  const applyFilters = () => {
    setFiltering(true); // Set filtering state to true
    // Update applied filters with draft values
    setAppliedFilters(draftFilters);
    updateUrl(1, draftFilters);
    fetchShipments(1, draftFilters);
  };

  const resetFilters = () => {
    setFiltering(true); // Set filtering state to true
    const newFilters = {
      startDate: null,
      endDate: null,
      senderEmail: "",
      senderPhone: "",
      receiverEmail: "",
      receiverPhone: "",
      trackingNumber: "",
      receiverCountry: "",
      company: "",
      status: "",
    };
    setDraftFilters(newFilters);
    setAppliedFilters(newFilters);
    updateUrl(1, newFilters);
    fetchShipments(1, newFilters);
  };

  const handlePageChange = (page) => {
    setPaginating(true); // Set paginating state to true
    updateUrl(page, appliedFilters);
    fetchShipments(page, appliedFilters);
  };

  return (
    <div className="p-8 gap-6 flex justify-center items-center flex-col fontPoppins">
      <div className="flex justify-between w-full items-center mb-6">
        <h1 className="fontPoppins font-semibold text-black text-2xl">
          All Shipment List
        </h1>
      </div>

      <ShipmentFilters
        filters={draftFilters}
        countries={countries}
        companies={companies}
        handleFilterChange={handleFilterChange}
        handleDateChange={handleDateChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        loading={filtering} // Pass loading state to filters
      />

      {/* Loading overlay for initial load */}
      {initialLoad && <SpinnerBlur></SpinnerBlur>}

      {/* Loading indicator for filtering */}
      {filtering && !initialLoad && <SpinnerBlur></SpinnerBlur>}

      {/* Loading indicator for pagination */}
      {paginating && <SpinnerBlur></SpinnerBlur>}

      {/* Main content */}
      {!initialLoad && (
        <>
          <ShipmentTable shipments={shipments} loading={loading || filtering} />
          <AllShipmentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            loading={paginating}
          />
        </>
      )}
    </div>
  );
};

export default ShipmentListPage;
