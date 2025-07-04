import * as cheerio from "cheerio";
import * as fs from "fs";
import {
  ADDED_ITEMS,
  ADDED_ITEM_REFS_BACK,
  CURRENT_DATE,
  REMOVED_ITEMS_IDS,
  REMOVED_ITEM_ID_REFS,
} from "~constants";
import { readFile, writeFile } from "~file-operations";
import { pretifyData } from "~helpers";
import type { AvailablePage, BookTypes, ModificationFolders } from "~types";
import type { AddablePages } from "./index";

function removeSingleEmptyLines(content: string): string {
  return content.replace(/^\s*[\r\n]/gmu, "");
}

function removeLinkWithSurrounding(content: string): string {
  // Regex to match github.com/standardebooks and surrounding text until ., !, ?, ,, or end of string
  const regex =
    /[^.!?,]*https?:\/\/github\.com\/standardebooks\S*[^.!?,]*[.!?,]?/giu;
  let result = content.replace(regex, "").trim();

  // Check if the last character is a comma and swap it to a period
  if (result.charAt(result.length - 1) === ",") {
    result = `${result.slice(0, -1)}.`;
  }

  return result;
}

async function adjustContentFile(
  contentOpf: string,
  addablePage: AvailablePage
): Promise<string> {
  const { contentItemRefs, contentItems } = addablePage;
  const $ = cheerio.load(contentOpf, { xml: true });
  const manifest = $("manifest");
  const spine = $("spine");

  const items = manifest.children("item");
  const itemRefs = spine.children("itemref");

  for (const id of REMOVED_ITEMS_IDS) {
    const item = items.filter(`[id="${id}"]`);
    if (item.length) {
      item.remove();
    }
  }

  for (const idRef of REMOVED_ITEM_ID_REFS) {
    const itemRef = itemRefs.filter(`[idref="${idRef}"]`);
    if (itemRef.length) {
      itemRef.remove();
    }
  }

  manifest.append(`${ADDED_ITEMS} ${contentItems}`);
  spine.prepend(contentItemRefs);
  spine.append(ADDED_ITEM_REFS_BACK);

  const manifestHtml = $.html("manifest");
  const spineHtml = $.html("spine");
  const packageHtml = $.html("package");
  const guideHtml = $("guide");

  if (packageHtml.includes("<guide>")) {
    guideHtml.prepend(`
      <reference type="text" title="Start" href="text/titlepage.xhtml" />
    `);
  } else {
    const newGuide = `
    <guide>
      <reference type="text" title="Start" href="text/titlepage.xhtml" />
    </guide>
    `;
    $("package").append(newGuide);
  }

  const formattedManifestHtml = await pretifyData(manifestHtml, "xml");
  const formattedSpineHtml = await pretifyData(spineHtml, "xml");
  $("manifest").replaceWith(formattedManifestHtml);
  $("spine").replaceWith(formattedSpineHtml);

  const html = $.html();

  return removeSingleEmptyLines(html);
}

function modifyMetaData(contentOpf: string, bookUrl: string): string {
  const $ = cheerio.load(contentOpf, { xml: true });

  const pdlText = "Public Domain Library";
  const regex = /<a href="(?<url>[^&]+)">/gu;

  // Set the new package element attributes
  const packageElement = $("package");
  packageElement.attr("dir", "ltr");
  packageElement.attr(
    "prefix",
    "pdl: https://publicdomainlibrary.org/vocab/1.0"
  );
  packageElement.attr("xml:lang", "en-US");

  // Remove old xmlns attributes if they exist
  packageElement.removeAttr("xmlns:dc");
  packageElement.removeAttr("xmlns:pdl");
  const metadata = $("metadata");
  const meta = metadata.children("meta");
  const date = metadata.children("dc\\:date").first().text();

  metadata.children("dc\\:publisher").first().text(pdlText);
  metadata.children("dc\\:identifier").first().text(`url:${bookUrl}`);

  meta.each((index, element) => {
    const metaTag = $(element);
    const metaText = metaTag.text();
    const metaProperty = metaTag.attr("property");

    if (metaProperty?.trim().toLocaleLowerCase() === "se:url.vcs.github") {
      metaTag.remove();
    } else if (
      metaProperty?.trim().toLocaleLowerCase() === "se:long-description"
    ) {
      const updatedMetaText = metaText.replace(regex, `<a href="${bookUrl}">`);
      metaTag.text(updatedMetaText);
    } else if (
      metaText &&
      metaText.trim().toLocaleLowerCase() === "standard ebooks"
    ) {
      metaTag.text(pdlText);
    } else if (
      metaText &&
      metaText.trim().toLocaleLowerCase() === "https://standardebooks.org"
    ) {
      metaTag.text("https://publicdomainlibrary.org");
    } else if (metaText && metaText === date) {
      metaTag.text(CURRENT_DATE);
    }

    if (metaProperty && metaProperty.includes("se:")) {
      const updatedMetaProperty = metaProperty.replace("se:", "pdl:");
      metaTag.attr("property", updatedMetaProperty);
    }

    if (metaText.includes("github.com/standardebooks")) {
      const removedLinkText = removeLinkWithSurrounding(metaText);

      metaTag.text(removedLinkText);
    }
  });

  metadata.children("dc\\:date").first().text(CURRENT_DATE);
  const html = $.html();

  return removeSingleEmptyLines(html);
}

export async function modifyContent(
  modInfo: ModificationFolders,
  addablePages: AddablePages,
  bookUrl: string
): Promise<void> {
  for (const [source, path] of Object.entries(modInfo) as [
    BookTypes,
    string,
  ][]) {
    const contentOpfPath = `${path}/content.opf`;
    if (path && fs.existsSync(contentOpfPath)) {
      const opfData = readFile(contentOpfPath);
      const newOpf = await adjustContentFile(opfData, addablePages[source]);
      const metaFixedOpf = modifyMetaData(newOpf, bookUrl);
      writeFile(contentOpfPath, metaFixedOpf);
    }
  }
}
