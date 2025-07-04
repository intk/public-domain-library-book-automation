import * as cheerio from "cheerio";
import * as fs from "node:fs";
import * as path from "node:path";
import { CURRENT_DATE } from "~constants";
import { readFile, writeFile } from "../helpers";

export function removeMentions(
  azw3SrcPath: string,
  epubSrcPath: string,
  kepubSrcPath: string,
  pdfSrcPath: string
): void {
  const folders = [
    `${azw3SrcPath}/text`,
    `${epubSrcPath}/text`,
    `${kepubSrcPath}/text`,
    `${pdfSrcPath}/text`,
  ];

  folders.forEach((folder) => {
    const files = fs.readdirSync(folder);
    files.forEach((file) => {
      const filePath = path.join(folder, file);
      const data = readFile(filePath);

      // Replace se: with pdl: in specific contexts only
      const newData = data
        .replace(/epub:type="se:/gu, 'epub:type="pdl:')
        .replace(
          /epub:prefix="[^"]*se: https:\/\/standardebooks\.org\/vocab\/1\.0[^"]*"/gu,
          'epub:prefix="z3998: http://www.daisy.org/z3998/2012/vocab/structure/, pdl: https://publicdomainlibrary.org/vocab/1.0"'
        );

      writeFile(filePath, newData);
    });

    const tocFile = path.join(folder, "../toc.xhtml");
    if (fs.existsSync(tocFile)) {
      const data = readFile(tocFile);

      // Replace se: with pdl: in specific contexts only
      const newData = data
        .replace(/epub:type="se:/gu, 'epub:type="pdl:')
        .replace(
          /epub:prefix="[^"]*se: https:\/\/standardebooks\.org\/vocab\/1\.0[^"]*"/gu,
          'epub:prefix="z3998: http://www.daisy.org/z3998/2012/vocab/structure/, pdl: https://publicdomainlibrary.org/vocab/1.0"'
        );

      writeFile(tocFile, newData);
    }

    const onixFile = path.join(folder, "../onix.xml");
    if (fs.existsSync(onixFile)) {
      const data = readFile(onixFile);
      const $ = cheerio.load(data, { xmlMode: true });

      $("SenderName").text("Public Domain Library");
      $("SentDateTime").text(CURRENT_DATE);

      const descriptiveDetail = $("DescriptiveDetail");
      descriptiveDetail.children().slice(-2).remove();

      const cleanedHtml = $.html().replace(/^\s*[\r\n]/gmu, "");
      writeFile(onixFile, cleanedHtml);
    }
  });
}
