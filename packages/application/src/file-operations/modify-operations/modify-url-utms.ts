import * as fs from "fs";
import { kebabCase } from "lodash";
import type { ModificationFolders } from "~types";
import { readFile, writeFile } from "../helpers";

const UTM_PLACEHOLDER = "title+author" as const;
const UTM_CAMPAIGN = `utm_campaign=${UTM_PLACEHOLDER}&amp`;

export function modifyUrlUtms(
  BookPaths: ModificationFolders,
  rawTitle: string | undefined,
  rawAuthors: string | undefined
): void {
  const { azw3, epub, kepub, pdf } = BookPaths;
  const title = rawTitle || "";
  const authors = rawAuthors || "";
  const hasData = !!(title || authors);
  const titlePageAlt = hasData ? `${title} by ${authors}` : "Titlepage SVG";

  for (const path of [azw3, epub, kepub, pdf]) {
    const modifiablePages = [
      `${path}/text/donate.xhtml`,
      `${path}/text/titlepage.xhtml`,
      `${path}/text/public-domain.xhtml`,
    ];

    for (const page of modifiablePages) {
      if (fs.existsSync(page)) {
        const data = readFile(page);
        const utmFixedData =
          page === `${path}/text/titlepage.xhtml` && hasData
            ? data.replaceAll(UTM_PLACEHOLDER, titlePageAlt)
            : hasData
              ? data.replaceAll(
                  UTM_PLACEHOLDER,
                  kebabCase(`${title} ${authors}`)
                )
              : data.replaceAll(UTM_CAMPAIGN, "");

        writeFile(page, utmFixedData);
      }
    }
  }
}
