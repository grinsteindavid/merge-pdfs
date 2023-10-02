#!/usr/bin/env node

const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fs = require('fs').promises;

async function getPdfInDirectory(directoryPath) {
  const filesContent = [];

  try {
    const files = await fs.readdir(directoryPath);

    for (const file of files.filter((file) => file.endsWith('.pdf'))) {
      const filePath = path.join(directoryPath, file);

      try {
        const data = await fs.readFile(filePath);
        filesContent.push(data);
      } catch (fileReadError) {
        console.error(`Error reading file ${file}:`, fileReadError);
      }
    }
  } catch (dirReadError) {
    console.error('Error reading directory:', dirReadError);
  }

  return filesContent;
}

async function loadPdfDocuments(files) {
  const pdfs = [];

  for (const file of files) {
    try {
      const pdfDoc = await PDFDocument.load(file);
      pdfs.push(pdfDoc);

      // Process the data from the file here
    } catch (fileReadError) {
      console.error(`Error reading file ${file}:`, fileReadError);
    }
  }

  return pdfs;
}

async function mergePDFs(filename) {
  const currentDirectory = process.cwd();
  const files = await getPdfInDirectory(currentDirectory);

  // Create PDFDocument instances
  const pdfs = await loadPdfDocuments(files);

  // Create a new PDFDocument to merge the pages into
  const mergedPdf = await PDFDocument.create();

  // Copy pages from each PDF into the merged PDF
  for (const pdfDoc of pdfs) {
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  // Serialize the merged PDF to a buffer
  const mergedPdfData = await mergedPdf.save();

  // Write the merged PDF to the output file
  await fs.writeFile(`./${filename}.pdf`, mergedPdfData);

  console.log(`Merged PDF saved to ${currentDirectory}/${filename}.pdf`);
}

if (process.argv.length < 3) {
  console.log('Usage: node script.js <argument>');
  process.exit(1); // Exit with a non-zero status code to indicate an error
}

const filename = process.argv[2]

mergePDFs(filename)
  .catch((err) => console.error(err));
