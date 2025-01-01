export interface CategoryCreationDTO {
  name: string;
  imageUrl: string;
  books: Array<string> | null;
}
