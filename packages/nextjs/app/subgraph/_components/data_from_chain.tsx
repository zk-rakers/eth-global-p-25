"use client";

import { useEffect, useState } from "react";
import { type Request, getUserRequests } from "./queryFunctions";
import { useAccount } from "wagmi";

const DataFromChain = () => {
  const { address } = useAccount();
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const data = await getUserRequests(address);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch user requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [address]);

  if (error) return <div className="text-red-500">❌ Error: {error.message}</div>;
  if (!address) return <div>Please connect your wallet</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={fetchData} className="btn btn-primary mb-4">
        Refresh Data
      </button>
      <pre>{JSON.stringify(requests, null, 2)}</pre>
    </div>
  );
};

export default DataFromChain;
