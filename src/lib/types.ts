export type Bookmark = {
  id: string;
  category_id: string;
  label: string;
  url: string;
  position: number;
};

export type Category = {
  id: string;
  name: string;
  position: number;
  bookmarks: Bookmark[];
};
