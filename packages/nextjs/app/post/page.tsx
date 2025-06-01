"use client";

import { ServiceForm } from "../../components/ServiceForm";

export default function PostService() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Post a Service</h1>
            <p className="text-base-content/60">
              Create a new service listing. Your data will be encrypted and stored securely.
            </p>
          </div>
          <ServiceForm />
        </div>
      </div>
    </div>
  );
}
