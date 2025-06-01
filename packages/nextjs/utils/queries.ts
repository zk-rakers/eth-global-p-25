import { keccak256, toBytes } from "viem";
import { GetAllRequestsDocument, GetRequestsDocument, execute } from "~~/.graphclient";

export interface Request {
  id: string;
  title: string;
  bidCount: number;
  isActive: boolean;
  timestamp: string;
  userIdentifier: string;
  commitment: string;
}

/**
 * Returns all requests from the blockchain
 * @returns {Promise<Request[]>} JSON array of all requests
 */
export async function getAllRequests(): Promise<Request[]> {
  try {
    const { data } = await execute(GetAllRequestsDocument, {});
    return data?.requests || [];
  } catch (error) {
    console.error("Error fetching all requests:", error);
    throw error;
  }
}

/**
 * Returns requests for a specific user address
 * @param {string} address - User's Ethereum address
 * @returns {Promise<Request[]>} JSON array of user's requests
 */
export async function getUserRequests(address: string): Promise<Request[]> {
  try {
    if (!address) {
      throw new Error("Address is required");
    }

    const identifier = keccak256(toBytes(address)).toLowerCase();
    const { data } = await execute(GetRequestsDocument, {
      identifier,
    });

    return data?.requests || [];
  } catch (error) {
    console.error("Error fetching user requests:", error);
    throw error;
  }
}
