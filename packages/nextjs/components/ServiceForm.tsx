"use client";

import { useState } from "react";
import { usePrivacyMarketplace } from "../hooks/scaffold-eth/usePrivacyMarketplace";
import { hashAndStoreData } from "../utils/encryption";

export const ServiceForm = () => {
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { submitService, isLoading } = usePrivacyMarketplace();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      console.log("Starting form submission...");
      const data = {
        location,
        description,
        timestamp: new Date().toISOString(),
      };

      console.log("Hashing and storing data...");
      const { hash, ipfsHash } = await hashAndStoreData(data);
      console.log("Data stored, hash:", hash);
      console.log("IPFS hash:", ipfsHash);

      console.log("Submitting to contract...");
      const result = await submitService(hash, ipfsHash);
      console.log("Contract submission result:", result);

      if (result) {
        setSuccess("Service submitted successfully!");
        setLocation("");
        setDescription("");
      }
    } catch (err) {
      console.error("Error submitting service:", err);
      setError(err instanceof Error ? err.message : "Failed to submit service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-8 px-4 lg:px-8 max-w-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Submit a Service</h2>
        <p className="text-gray-500">Fill out the form below to submit your service.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="input input-bordered w-full rounded-none"
            placeholder="Enter location"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full h-32 rounded-none"
            placeholder="Enter service description"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full rounded-none" disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? "Submitting..." : "Submit Service"}
        </button>

        {error && (
          <div className="alert alert-error rounded-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert bg-success/20 border-success text-success-content rounded-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        )}
      </form>
    </div>
  );
};
