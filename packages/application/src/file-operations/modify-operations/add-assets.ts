import * as fse from "fs-extra";
import * as fs from "node:fs";
import {
  COVER_FOLDER_PATH,
  COVER_NAME,
  PUBLIC_DOMAIN_LIBRARY_ASSETS_FOLDER_PATH,
  TITLE_FOLDER,
  TITLE_NAME,
} from "~constants";
import logger from "~logger";
import type { Book } from "~types";

export function addAssets(
  azw3: string,
  epub: string,
  kepub: string,
  pdf: string,
  book: Book,
  name: string
): void {
  const { Title, ID } = book || {};
  const assetFolders = ["text", "images", "fonts", "css"];

  assetFolders.forEach((folder) => {
    const sourcePath = `${PUBLIC_DOMAIN_LIBRARY_ASSETS_FOLDER_PATH}/${folder}`;
    const azw3Path = `${azw3}/${folder}`;
    const epubPath = `${epub}/${folder}`;
    const kepubPath = `${kepub}/${folder}`;
    const pdfPath = `${pdf}/${folder}`;

    if (fs.existsSync(sourcePath)) {
      fse.copySync(sourcePath, azw3Path, { overwrite: true });
      fse.copySync(sourcePath, epubPath, { overwrite: true });
      fse.copySync(sourcePath, kepubPath, { overwrite: true });
      fse.copySync(sourcePath, pdfPath, { overwrite: true });
    } else {
      throw new Error(
        `The '${folder}' common folder is missing in the public domain library assets.`
      );
    }
  });

  const coverImg = `${COVER_FOLDER_PATH}/${name}_cover.jpg`;
  const titleSvg = `${TITLE_FOLDER}/${name}_title.svg`;

  if (fs.existsSync(coverImg)) {
    fse.copySync(coverImg, `${azw3}${COVER_NAME}`, { overwrite: true });
    fse.copySync(coverImg, `${epub}${COVER_NAME}`, { overwrite: true });
    fse.copySync(coverImg, `${kepub}${COVER_NAME}`, { overwrite: true });
    fse.copySync(coverImg, `${pdf}${COVER_NAME}`, { overwrite: true });
  } else {
    logger.warning(`The cover image for the '${Title}' book is missing.`, {
      ID,
    });
  }

  if (fs.existsSync(titleSvg)) {
    fse.copySync(titleSvg, `${azw3}${TITLE_NAME}`, { overwrite: true });
    fse.copySync(titleSvg, `${epub}${TITLE_NAME}`, { overwrite: true });
    fse.copySync(titleSvg, `${kepub}${TITLE_NAME}`, { overwrite: true });
    fse.copySync(titleSvg, `${pdf}${TITLE_NAME}`, { overwrite: true });
  } else {
    logger.warning(`The title svg for the '${Title}' book is missing.`, {
      ID,
    });
  }
}
