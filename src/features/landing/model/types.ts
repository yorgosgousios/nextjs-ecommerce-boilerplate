export interface LandingPage {
  id: number;
  title: string;
  sections: LandingSection[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface LandingSection {
  id: string;
  type: "hero" | "products" | "text" | "banner" | "categories";
  title?: string;
  content?: string;
  image?: string;
  /** For product/category sections */
  items?: LandingItem[];
}

export interface LandingItem {
  id: string;
  title: string;
  image: string;
  url: string;
  price?: number;
}
