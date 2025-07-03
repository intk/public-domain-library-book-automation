import * as fs from "node:fs";

export function removeAssets(
  azw3: string,
  epub: string,
  kepub: string,
  pdf: string
): void {
  const textPaths = [
    `${azw3}/text`,
    `${epub}/text`,
    `${kepub}/text`,
    `${pdf}/text`,
  ];
  const imagePaths = [
    `${azw3}/images`,
    `${epub}/images`,
    `${kepub}/images`,
    `${pdf}/images`,
  ];

  textPaths.forEach((path) => {
    if (fs.existsSync(`${path}/imprint.xhtml`)) {
      fs.rmSync(`${path}/imprint.xhtml`, { force: true });
    }

    if (fs.existsSync(`${path}/colophon.xhtml`)) {
      fs.rmSync(`${path}/colophon.xhtml`, { force: true });
    }

    if (fs.existsSync(`${path}/uncopyright.xhtml`)) {
      fs.rmSync(`${path}/uncopyright.xhtml`, { force: true });
    }
  });

  imagePaths.forEach((path) => {
    if (fs.existsSync(`${path}/cover.svg`)) {
      fs.rmSync(`${path}/cover.svg`, { force: true });
    }

    if (fs.existsSync(`${path}/logo.svg`)) {
      fs.rmSync(`${path}/logo.svg`, { force: true });
    }

    if (fs.existsSync(`${path}/titlepage.svg`)) {
      fs.rmSync(`${path}/titlepage.svg`, { force: true });
    }
  });
}
