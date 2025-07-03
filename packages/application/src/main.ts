import { exec } from "node:child_process";
import {
  azw3Build,
  checkFilesystem,
  epubBuild,
  getBookConfigs,
  getBooks,
  kepubBuild,
  modifyBooks,
  pdfBuild,
} from "~file-operations";
import { createBookFileName } from "~helpers";
import logger from "~logger";
import type { Book } from "~types";

const GENERAL_TAG = "General" as const;

async function processBook(book: Book) {
  try {
    const { Title: title, "Author(s)": author, ID, "PDL book": bookUrl } = book;
    const bookFileName = createBookFileName(title, author, ID);
    const bookPaths = await getBooks(book, bookFileName);
    await modifyBooks(book, bookPaths, bookFileName, bookUrl);
    await Promise.all([
      epubBuild(bookPaths.epub, bookFileName, ID),
      kepubBuild(bookPaths.kepub, bookFileName, ID),
      azw3Build(bookPaths.azw3, bookFileName, ID),
      pdfBuild(bookPaths.pdf, bookFileName, ID, title, author),
    ]);
  } catch (error: unknown) {
    logger.error(`${(error as Error).message}`, { ID: book.ID });
  }
}

async function BookCreationProcess() {
  logger.info("Starting book creation & update process");
  const start = performance.now();

  try {
    checkFilesystem();
    const books = await getBookConfigs();
    await Promise.all(books.map((book) => processBook(book)));
  } catch (error: unknown) {
    logger.error((error as Error).message, { ID: GENERAL_TAG });
  }
  const end = performance.now();

  logger.info(
    `Book creation & update process finished in ${(
      (end - start) /
      60000
    ).toFixed(2)} minutes (${((end - start) / 1000).toFixed(2)}s)`
  );

  exec('say "Book creation completed"');
}

BookCreationProcess();
