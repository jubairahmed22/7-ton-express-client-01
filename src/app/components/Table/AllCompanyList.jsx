import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const AllCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://server-gs-two.vercel.app/api/zone/pricing"
      );
      setCompanies(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch companies");
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCompanies();

    // Set up interval for real-time updates (1000ms = 1 second)
    intervalRef.current = setInterval(fetchCompanies, 1000);

    // Clean up interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        // Clear the interval temporarily during delete operation
        clearInterval(intervalRef.current);

        await axios.delete(`https://server-gs-two.vercel.app/api/delete/company/${id}`);
        // Refresh the list immediately after deletion
        await fetchCompanies();

        // Restart the interval
        intervalRef.current = setInterval(fetchCompanies, 1000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete company");
        console.error("Error deleting company:", err);
        // Restart the interval even if delete fails
        intervalRef.current = setInterval(fetchCompanies, 1000);
      }
    }
  };

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 shadow rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {company.company}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {company.company === "FedEx" ? (
                    ""
                  ) : (
                    <button
                      onClick={() => handleDelete(company._id)}
                      className="text-red-600 hover:text-red-900 mr-4"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllCompanyList;
