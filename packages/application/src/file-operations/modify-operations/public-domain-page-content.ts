import * as cheerio from "cheerio";
import * as fs from "fs";
import { readFile, writeFile } from "~file-operations";
import { pretifyData } from "~helpers";
import { Book, BookFolders } from "~types";

export async function modifyPublicDomainPageContent(
  book: Book,
  bookConfigs: BookFolders
): Promise<void> {
  const { azw3, epub, kepub, pdf } = bookConfigs;
  const {
    "PD - Title": publicDomaiPageTitle,
    "PD - Text": publicDomaiPageContent,
  } = book;

  if (!publicDomaiPageTitle && !publicDomaiPageContent) {
    return;
  }

  for (const srcPath of [azw3, epub, kepub, pdf]) {
    const path = `${srcPath}/epub/text/public-domain.xhtml`;
    if (!fs.existsSync(path)) {
      continue;
    }

    const data = readFile(path);
    const $ = cheerio.load(data, { xml: true });

    if (publicDomaiPageTitle) {
      $("#public-domain-page-title").text(publicDomaiPageTitle);
    }

    if (publicDomaiPageContent) {
      const contentContainer = $("#public-domain-page-content");
      contentContainer.append(`${publicDomaiPageContent}`);
    }

    const html = $.html();
    const formattedHtml = await pretifyData(html, "html");

    writeFile(path, formattedHtml);
  }
}
