import { apiClient } from "@/core/api/apiClient";
import { LANDING_ENDPOINT } from "@/core/api/endpoints";
import type { LandingPage } from "../model/types";

export async function fetchLandingPage(
  id: number
): Promise<LandingPage | null> {
  try {
    const { data } = await apiClient.get<LandingPage>(`${LANDING_ENDPOINT}/${id}`);
    return data;
  } catch {
    return null;
  }
}
