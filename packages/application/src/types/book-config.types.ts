export type BookConfigFileKeys =
  | "Author(s)"
  | "ID"
  | "PD - Text"
  | "PD - Title"
  | "PDL book"
  | "StandardEbooks Github"
  | "Title"
  | "Translator(s)";

/* Note: 
  Unused Names, add these to config if you use them in code
  Sheet name: "Ebooks", page: "Books"
  | "Lan"
  | "PDL Author"	
  | "Birth"	
  | "Death"	
  | "𝕏"	
  | "Apple"
  | "Amazon"
  | "Kobo"
  | "Color"	
  | "Notes"
*/

export type Book = Record<BookConfigFileKeys, string>;

export type Books = Book[];

export type BookTypes = "azw3" | "epub" | "kepub" | "pdf";

export type ModificationFolders = Record<BookTypes, string>;

export interface BookFolders extends Record<BookTypes, string> {
  base: string;
  assets: string;
  git: string;
}
