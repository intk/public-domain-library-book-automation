import { copyFiles, setupBookSrc } from "~file-operations";
import { pullBookSources } from "~helpers";
import type { Book, BookFolders } from "~types";

export async function getBooks(
  book: Book,
  bookFileName: string
): Promise<BookFolders> {
  const { "StandardEbooks Github": github } = book;

  const bookPaths = setupBookSrc(bookFileName);
  const { azw3, epub, kepub, pdf, git } = bookPaths;

  await pullBookSources(git, github);
  for (const file of [azw3, epub, kepub, pdf]) {
    await copyFiles(`${git}/src/*`, file);
  }

  return bookPaths;
}
