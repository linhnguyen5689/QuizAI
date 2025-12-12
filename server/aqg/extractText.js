const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const docxParser = require("docx-parser");

exports.extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  }

  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf8");
  }

  if (ext === ".docx") {
    return new Promise((resolve, reject) => {
      docxParser.parseDocx(filePath, (data) => {
        if (!data) reject("Failed to parse DOCX");
        resolve(data);
      });
    });
  }

  throw new Error("Unsupported file type.");
};
