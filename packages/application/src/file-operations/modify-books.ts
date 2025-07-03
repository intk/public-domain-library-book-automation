import {
  addAssets,
  checkAddablePages,
  modifyAzw3Css,
  modifyContent,
  modifyCoreCss,
  modifyKepubCss,
  modifyPdfCss,
  modifyPublicDomainPageContent,
  modifySvgCss,
  modifyTitlePageContent,
  modifyToc,
  modifyUrlUtms,
  removeAssets,
  removeMentions,
} from "~file-operations";
import { Book, BookFolders } from "~types";

export async function modifyBooks(
  book: Book,
  BookPaths: BookFolders,
  name: string,
  bookUrl: string
): Promise<void> {
  const { azw3, epub, kepub, pdf } = BookPaths;
  const azw3SrcPath = `${azw3}/epub`;
  const epubSrcPath = `${epub}/epub`;
  const kepubSrcPath = `${kepub}/epub`;
  const pdfSrcPath = `${pdf}/epub`;

  removeAssets(azw3SrcPath, epubSrcPath, kepubSrcPath, pdfSrcPath);
  removeMentions(azw3SrcPath, epubSrcPath, kepubSrcPath, pdfSrcPath);
  addAssets(azw3SrcPath, epubSrcPath, kepubSrcPath, pdfSrcPath, book, name);
  modifyCoreCss({
    epub: epubSrcPath,
    kepub: kepubSrcPath,
    azw3: azw3SrcPath,
    pdf: pdfSrcPath,
  });

  const addablePages = checkAddablePages(book, {
    epub: epubSrcPath,
    kepub: kepubSrcPath,
    azw3: azw3SrcPath,
    pdf: pdfSrcPath,
  });

  await modifyToc(
    {
      epub: epubSrcPath,
      kepub: kepubSrcPath,
      azw3: azw3SrcPath,
      pdf: pdfSrcPath,
    },
    addablePages
  );

  await modifyContent(
    {
      epub: epubSrcPath,
      kepub: kepubSrcPath,
      azw3: azw3SrcPath,
      pdf: pdfSrcPath,
    },
    addablePages,
    bookUrl
  );

  const { Title: title, "Author(s)": authors } = book || {};
  modifyUrlUtms(
    {
      epub: epubSrcPath,
      kepub: kepubSrcPath,
      azw3: azw3SrcPath,
      pdf: pdfSrcPath,
    },
    title,
    authors
  );

  await modifyTitlePageContent(book, BookPaths);
  await modifyPublicDomainPageContent(book, BookPaths);
  await modifySvgCss({
    epub: epubSrcPath,
    kepub: kepubSrcPath,
    azw3: azw3SrcPath,
    pdf: pdfSrcPath,
  });

  modifyKepubCss(kepubSrcPath);
  modifyAzw3Css(azw3SrcPath);
  modifyPdfCss(pdfSrcPath);
}
