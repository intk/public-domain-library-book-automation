import { DISTROBUTION_FOLDER_PATH } from "~constants";
import { runCommand } from "~helpers";
import logger from "~logger";

export async function pdfBuild(
  path: string,
  name: string,
  ID: string | undefined,
  title?: string,
  author?: string
): Promise<void> {
  try {
    if (!path || !name) {
      throw new Error("The path and name are required to build the pdf file.");
    }
    const ebook = `${name}.pdf`;
    const initialEbook = `${name}_pdf.epub`;
    const distrobutionFile = `../../../${DISTROBUTION_FOLDER_PATH}/${name}.pdf`;
    const titleArg = title ? `--title="${title}"` : "";
    const authorArg = author ? `--authors="${author}"` : "";

    await runCommand(`
      cd ${path} &&
      rm -f ${ebook} &&
      rm -f ${initialEbook} && 
      zip -X0 ${initialEbook} mimetype && 
      zip -r ${initialEbook} META-INF epub && 
      ebook-convert ${initialEbook} ${ebook} --pretty-print --prefer-metadata-cover --pdf-page-numbers --pdf-serif-family="Times New Roman" --pdf-sans-family="Arial" --pdf-mono-family="Courier New" ${titleArg} ${authorArg} &&
      rm -f ${distrobutionFile} &&
      mv ${ebook} ${distrobutionFile}
    `);

    logger.notice(`The '${ebook}' file was created successfully.`, { ID });
  } catch (error) {
    logger.error(`The '${name}' pdf file failed to build.`, { error });
  }
}
