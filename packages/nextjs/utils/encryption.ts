import axios from "axios";
import { keccak256, toUtf8Bytes } from "ethers";

interface ServiceData {
  title: string;
  description: string;
}

// interface PinataResponse {
//   IpfsHash: string;
//   PinSize: number;
//   Timestamp: string;
// }

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const pinataApiUrl = "https://api.pinata.cloud";

// Test the API credentials first
const testPinataConnection = async () => {
  try {
    const response = await axios.get(`${pinataApiUrl}/data/testAuthentication`, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });
    console.log("Pinata authentication successful:", response.data);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Pinata Authentication Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return false;
    }
    return false;
  }
};

export async function hashAndStoreData(data: ServiceData) {
  try {
    console.log("Starting hashAndStoreData...");

    // 1. Convert data to string
    const dataString = JSON.stringify(data);
    console.log("Data stringified:", dataString);

    // 2. Create hash of the data
    const dataHash = keccak256(toUtf8Bytes(dataString));
    console.log("Data hashed:", dataHash);

    // 3. Test Pinata authentication
    const isAuthenticated = await testPinataConnection();
    if (!isAuthenticated) {
      throw new Error("Failed to authenticate with Pinata. Please check your API credentials.");
    }

    // 4. Upload to Pinata
    const formData = new FormData();
    const blob = new Blob([dataString], { type: "application/json" });
    formData.append("file", blob, "data.json");

    // Prepare metadata
    const metadataString = JSON.stringify({
      name: "Service Data",
      keyvalues: {
        title: data.title,
        description: data.description,
      },
    });
    formData.append("pinataMetadata", metadataString);

    // Prepare pinata options
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    try {
      console.log("Uploading to Pinata...");
      const response = await axios.post(`${pinataApiUrl}/pinning/pinFileToIPFS`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.status !== 200) {
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}`);
      }

      const ipfsHash = response.data.IpfsHash;
      console.log("Data added to IPFS:", ipfsHash);

      return {
        hash: dataHash,
        ipfsHash,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Pinata API Error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
        throw new Error(`Pinata API error: ${error.response?.data?.message || error.message}`);
      }
      console.error("Failed to upload to IPFS:", error);
      throw new Error("Failed to upload data to IPFS. Please try again later.");
    }
  } catch (error) {
    console.error("Error in hashAndStoreData:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    throw error;
  }
}

export async function retrieveData(ipfsHash: string): Promise<ServiceData> {
  try {
    console.log("Starting retrieveData for hash:", ipfsHash);

    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      console.log("Data retrieved successfully");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Pinata Gateway Error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        throw new Error(`Pinata Gateway error: ${error.response?.data?.message || error.message}`);
      }
      console.error("Failed to retrieve from IPFS:", error);
      throw new Error("Failed to retrieve data from IPFS. Please check the hash and try again.");
    }
  } catch (error) {
    console.error("Error in retrieveData:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    throw error;
  }
}
