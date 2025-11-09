import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const fetchEksClusters = async () => {
  const apiUrl = "https://0clmunin76.execute-api.ap-south-1.amazonaws.com/prod/list-eks-clusters";
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const json = await response.json();
  return JSON.parse(json.body);
};

const EksClustersPage = () => {
  const [eksByRegion, setEksByRegion] = useState(null);

  const { data, status, error, refetch, isFetching } = useQuery({
    queryKey: ["eksClusters"],
    queryFn: fetchEksClusters,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: false,
  });

  useEffect(() => {
    const cachedData = localStorage.getItem("eksByRegion");
    if (cachedData) {
      try {
        setEksByRegion(JSON.parse(cachedData));
      } catch {
        localStorage.removeItem("eksByRegion");
      }
    }
  }, []);

  useEffect(() => {
    if (data) {
      setEksByRegion(data);
      localStorage.setItem("eksByRegion", JSON.stringify(data));
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
          {isFetching ? "Loading..." : "Refresh EKS Clusters"}
        </button>
      </div>

      {status === "loading" && <p className="text-gray-500 mt-4">Loading EKS clusters...</p>}
      {status === "error" && <p className="text-red-500 mt-4">Error fetching clusters: {error.message}</p>}

      {(!eksByRegion || Object.keys(eksByRegion).length === 0) && (
        <p className="text-gray-500 mt-4">No EKS clusters data available to display.</p>
      )}

      {eksByRegion &&
        Object.entries(eksByRegion).map(([region, clusters]) => (
          <div key={region} className="mb-8 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
            <h4 className="text-xl font-semibold text-blue-600 mb-3 border-b pb-2">
              🏔️ {region} ({clusters.length} cluster{clusters.length !== 1 ? "s" : ""})
            </h4>

            {clusters.length === 0 ? (
              <p className="text-gray-500">No clusters found in this region.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ARN
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clusters.map((cluster) => (
                      <tr
                        key={cluster.Arn}
                        className={cluster.Status === "ACTIVE" || cluster.Status === "active" ? "bg-green-50" : "bg-red-50"}
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cluster.Name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 rounded-full ${
                              cluster.Status === "ACTIVE" || cluster.Status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {cluster.Status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{cluster.Version}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-gray-500">{cluster.Arn}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(cluster.CreatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{cluster.Endpoint}</td>
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

export default EksClustersPage;
