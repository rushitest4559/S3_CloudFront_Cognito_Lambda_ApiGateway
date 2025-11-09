import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const fetchRdsDatabases = async () => {
  const apiUrl = "https://0clmunin76.execute-api.ap-south-1.amazonaws.com/prod/list-rds";
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return JSON.parse(data.body);
};

const DbsRdsPage = () => {
  const [rdsByRegion, setRdsByRegion] = useState(null);

  // TanStack Query (manual fetch)
  const { data, status, error, refetch, isFetching } = useQuery({
    queryKey: ["rds"],
    queryFn: fetchRdsDatabases,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: false,
  });

  // Load cached RDS data from localStorage
  useEffect(() => {
    const cachedData = localStorage.getItem("rdsByRegion");
    if (cachedData) {
      try {
        setRdsByRegion(JSON.parse(cachedData));
      } catch {
        localStorage.removeItem("rdsByRegion");
      }
    }
  }, []);

  // Save fetched data into localStorage
  useEffect(() => {
    if (data) {
      setRdsByRegion(data);
      localStorage.setItem("rdsByRegion", JSON.stringify(data));
    }
  }, [data]);

  return (
    <div className="mt-6 w-full max-w-4xl mx-auto">
      <div className="mb-4 text-right">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="py-2 px-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isFetching ? "Loading..." : "Refresh RDS Instances"}
        </button>
      </div>

      {status === "loading" && <p className="text-gray-500 mt-4">Loading RDS databases...</p>}
      {status === "error" && <p className="text-red-500 mt-4">Error fetching RDS data: {error.message}</p>}

      {(!rdsByRegion || Object.keys(rdsByRegion).length === 0) && (
        <p className="text-gray-500 mt-4">No RDS data available to display.</p>
      )}

      {rdsByRegion && Object.entries(rdsByRegion).map(([region, instances]) => (
        <div key={region} className="mb-8 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
          <h4 className="text-xl font-semibold text-blue-600 mb-3 border-b pb-2">
            🗺️ {region} ({instances.length} databases)
          </h4>

          {instances.length === 0 ? (
            <p className="text-gray-500">No RDS databases found in this region.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DB Identifier
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engine
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability Zone
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.map((db) => (
                    <tr
                      key={db.DBInstanceIdentifier}
                      className={db.Status === "available" ? "bg-green-50" : "bg-red-50"}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {db.DBInstanceIdentifier}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {db.Engine}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {db.DBInstanceClass}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {db.AvailabilityZone}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 rounded-full ${
                            db.Status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {db.Status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(db.InstanceCreateTime).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DbsRdsPage;
