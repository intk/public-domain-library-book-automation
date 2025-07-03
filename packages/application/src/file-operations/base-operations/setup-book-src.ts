import * as fs from "fs";
import {
  BOOKS_FOLDER_PATH,
  GIT_BOOK_SOURCES_FOLDER_PATH,
  PUBLIC_DOMAIN_LIBRARY_ASSETS_FOLDER,
} from "~constants";
import type { BookFolders, BookTypes } from "~types";

type BookSrc = Record<BookTypes, string>;

export function setupBookSrc(bookName: string): BookFolders {
  const bookSrc: BookSrc = {
    epub: `${BOOKS_FOLDER_PATH}/${bookName}/src-epub`,
    kepub: `${BOOKS_FOLDER_PATH}/${bookName}/src-kepub`,
    azw3: `${BOOKS_FOLDER_PATH}/${bookName}/src-azw3`,
    pdf: `${BOOKS_FOLDER_PATH}/${bookName}/src-pdf`,
  };

  for (const src of Object.keys(bookSrc) as (keyof BookSrc)[]) {
    if (fs.existsSync(bookSrc[src])) {
      fs.rmSync(bookSrc[src], { recursive: true, force: true });
    }
    fs.mkdirSync(bookSrc[src], { recursive: true });
  }

  return {
    ...bookSrc,
    base: `${BOOKS_FOLDER_PATH}/${bookName}`,
    assets: `${BOOKS_FOLDER_PATH}/${bookName}/${PUBLIC_DOMAIN_LIBRARY_ASSETS_FOLDER}`,
    git: `${GIT_BOOK_SOURCES_FOLDER_PATH}/${bookName}`,
  };
}
