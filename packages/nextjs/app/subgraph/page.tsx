"use client";

import { useEffect, useState } from "react";
import { type Request, getAllRequests, getUserRequests } from "./_components/queryFunctions";
import { useAccount } from "wagmi";

const Subgraph = () => {
  const { address } = useAccount();
  const [userRequests, setUserRequests] = useState<Request[]>([]);
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all requests
      const allData = await getAllRequests();
      setAllRequests(allData);

      // Fetch user requests if address exists
      if (address) {
        const userData = await getUserRequests(address);
        setUserRequests(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [address]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Orders</h1>

      <button onClick={fetchData} className="btn btn-primary mb-4">
        Refresh Data
      </button>

      {/* User's Orders */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
        {!address ? (
          <div>Please connect your wallet</div>
        ) : userRequests.length === 0 ? (
          <div>No orders found for your address</div>
        ) : (
          <pre className="bg-base-200 p-4 rounded-lg overflow-auto">{JSON.stringify(userRequests, null, 2)}</pre>
        )}
      </div>

      {/* All Orders History */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Orders History</h2>
        {allRequests.length === 0 ? (
          <div>No orders found</div>
        ) : (
          <pre className="bg-base-200 p-4 rounded-lg overflow-auto">{JSON.stringify(allRequests, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default Subgraph;
