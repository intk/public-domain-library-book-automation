import * as fs from "node:fs";
import { readFile, writeFile } from "../helpers";

export function modifyPdfCss(pdfSrcPath: string): void {
  // Update public-domain.css for general PDF styles
  const publicDomainCssPath = `${pdfSrcPath}/css/pdl/public-domain.css`;
  if (fs.existsSync(publicDomainCssPath)) {
    let cssContent = readFile(publicDomainCssPath);
    const pdfSpecificCSS = `
      /* PDF-specific styles */
      @page {
        margin: 1in;
        size: A4;
      }
      body {
        font-family: "Times New Roman", serif;
        line-height: 1.5;
        margin: 0;
        padding: 0;
      }
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      p {
        page-break-inside: avoid;
        orphans: 3;
        widows: 3;
      }
      img {
        max-width: 100%;
        height: auto;
        page-break-inside: avoid;
      }
      table {
        page-break-inside: avoid;
      }
      .chapter, .section {
        page-break-before: auto;
      }
    `;
    cssContent += pdfSpecificCSS;
    writeFile(publicDomainCssPath, cssContent);
  }

  // Update titlepage.css for large title/author/translator text
  const titlePageCssPath = `${pdfSrcPath}/css/pdl/titlepage.css`;
  if (fs.existsSync(titlePageCssPath)) {
    let titleCss = readFile(titlePageCssPath);
    const pdfTitleCss = `
      /* PDF-specific title page styles */
      #title-text {
        font-size: 5.6rem !important;
        font-family: 'League Gothic', sans-serif !important;
        text-align: left !important;
        margin-top: 2rem !important;
      }
      #author-text {
        font-size: 3.2rem !important;
        font-family: 'League Gothic', sans-serif !important;
        text-align: left !important;
        margin-top: 2rem !important;
      }
      #translator-text {
        font-size: 2.2rem !important;
        font-family: 'League Gothic', sans-serif !important;
        text-align: left !important;
        margin-top: 2rem !important;
      }
    `;
    titleCss += pdfTitleCss;
    writeFile(titlePageCssPath, titleCss);
  }
}
