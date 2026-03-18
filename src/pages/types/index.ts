/* eslint-disable @typescript-eslint/no-explicit-any */
import { BasicPage } from "@/features/basic-page/model/types";
import { BlogListResponse, BlogPost } from "@/features/blog/model/types";
import { LandingPage } from "@/features/landing/model/types";
import { Product } from "@/features/products/model/types";

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
}

export type CatchAllPageProps =
  | {
      pageType: "product";
      data: Product;
      meta: PageMeta;
    }
  | {
      pageType: "product_listing";
      data: any;
      meta: PageMeta;
    }
  | {
      pageType: "blog";
      data: BlogPost;
      meta: PageMeta;
    }
  | {
      pageType: "blog_listing";
      data: {
        listing: BlogListResponse;
        categoryName: string;
      };
      meta: PageMeta;
    }
  | {
      pageType: "basic_page";
      data: BasicPage;
      meta: PageMeta;
    }
  | {
      pageType: "landing_page";
      data: LandingPage;
      meta: PageMeta;
    }
  | {
      pageType: "gone";
      data: null;
      meta: PageMeta;
    };
