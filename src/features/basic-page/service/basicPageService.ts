import { apiClient } from "@/core/api/apiClient";
import { PAGES_ENDPOINT } from "@/core/api/endpoints";
import type { BasicPage } from "../model/types";

export async function fetchBasicPage(id: number): Promise<BasicPage | null> {
  try {
    const { data } = await apiClient.get<BasicPage>(`${PAGES_ENDPOINT}/${id}`);
    return data;
  } catch {
    return null;
  }
}
