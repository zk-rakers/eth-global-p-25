import { ServiceChat } from "../../components/ServiceChat";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Service",
  description: "Post a new service to the marketplace",
};

export default function PostPage() {
  return (
    <div className="container mx-auto">
      <ServiceChat />
    </div>
  );
}
