import * as cheerio from "cheerio";
import * as fs from "node:fs";
import * as path from "node:path";
import { CURRENT_DATE } from "~constants";
import { readFile, writeFile } from "../helpers";

const TEXT_CUT = ", se: https://standardebooks.org/vocab/1.0" as const;

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
      const newData = data.replace(new RegExp(TEXT_CUT, "giu"), "");
      writeFile(filePath, newData);
    });

    const tocFile = path.join(folder, "../toc.xhtml");
    if (fs.existsSync(tocFile)) {
      const data = readFile(tocFile);
      const newData = data.replace(new RegExp(TEXT_CUT, "giu"), "");
      writeFile(tocFile, newData);
    }

    const onixFile = path.join(folder, "../onix.xml");
    if (fs.existsSync(onixFile)) {
      const data = readFile(onixFile);
      const newData = data.replace(new RegExp(TEXT_CUT, "giu"), "");
      const $ = cheerio.load(newData, { xmlMode: true });

      $("SenderName").text("Public Domain Library");
      $("SentDateTime").text(CURRENT_DATE);

      const descriptiveDetail = $("DescriptiveDetail");
      descriptiveDetail.children().slice(-2).remove();

      const cleanedHtml = $.html().replace(/^\s*[\r\n]/gmu, "");
      writeFile(onixFile, cleanedHtml);
    }
  });
}
