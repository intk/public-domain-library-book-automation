import * as cheerio from "cheerio";
import * as fs from "fs";
import { TOC_BACK_ADDITIONS } from "~constants";
import { readFile, writeFile } from "~file-operations";
import { pretifyData } from "~helpers";
import type { AvailablePage, BookTypes, ModificationFolders } from "~types";
import type { AddablePages } from "./index";

async function swapTocContent(
  tocXhtml: string,
  addablePage: AvailablePage
): Promise<string> {
  const { toc } = addablePage;
  const $ = cheerio.load(tocXhtml, { xml: true });
  let nav = $("nav#toc");
  if (nav.length === 0) {
    nav = $("nav").first().attr("id", "toc");
  }

  const ol = nav.find("ol").first();

  ol.children("li").slice(0, 2).remove();
  ol.children("li").slice(-2).remove();

  if (toc) {
    ol.prepend(toc.trim());
  }

  ol.append(TOC_BACK_ADDITIONS.trim());

  ol.contents()
    .filter(function () {
      return this.type === "text" && !/\S/u.test(this.nodeValue);
    })
    .remove();

  const landmarks = $("#landmarks");
  const landmarksOl = landmarks.find("ol").first();

  if (landmarksOl) {
    landmarksOl.prepend(`
        <li>
          <a href="text/titlepage.xhtml" epub:type="title-page">Titlepage</a>
        </li>
      `);
  }

  const html = $.html();

  return pretifyData(html, "html", true);
}

export async function modifyToc(
  modInfo: ModificationFolders,
  addablePages: AddablePages
): Promise<void> {
  for (const [source, path] of Object.entries(modInfo) as [
    BookTypes,
    string,
  ][]) {
    const tocXhtmlPath = `${path}/toc.xhtml`;
    if (path && fs.existsSync(tocXhtmlPath)) {
      const xhtmlData = readFile(tocXhtmlPath);
      const newToc = await swapTocContent(xhtmlData, addablePages[source]);
      writeFile(tocXhtmlPath, newToc);
    }
  }
}
