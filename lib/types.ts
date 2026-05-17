export type Category = "films" | "animaties" | "fotos" | "projecten";
export type MediaType = "video" | "image";
export type Status = "published" | "hidden";

export type MediaItem = {
  id: string;
  title: string;
  description: string;
  category: Category;
  mediaType: MediaType;
  filePath: string;        // URL to media (blob URL or static path)
  thumbnailPath: string;   // URL to thumbnail
  status: Status;
  sortOrder: number;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export const CATEGORY_LABELS: Record<Category, string> = {
  films: "Films",
  animaties: "Animaties",
  fotos: "Foto's",
  projecten: "Projecten",
};
