export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  body: string;
  summary: string;
  image: string;
  author: string;
  categoryId: number;
  categoryName: string;
  publishedAt: string;
  tags: string[];
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}
