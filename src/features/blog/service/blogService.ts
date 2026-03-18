import { apiClient } from "@/core/api/apiClient";
import { BLOG_ENDPOINT } from "@/core/api/endpoints";
import type { BlogPost, BlogListResponse } from "../model/types";

export async function fetchBlogPost(id: number): Promise<BlogPost | null> {
  try {
    const { data } = await apiClient.get<BlogPost>(`${BLOG_ENDPOINT}/${id}`);
    return data;
  } catch {
    return null;
  }
}

export async function fetchBlogListing(
  categoryId: number,
  page = 0
): Promise<BlogListResponse> {
  const { data } = await apiClient.get<BlogListResponse>(BLOG_ENDPOINT, {
    params: { category: categoryId, page },
  });
  return data;
}
