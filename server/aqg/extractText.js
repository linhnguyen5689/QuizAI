// server/aqg/extractText.js
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const docxParser = require("docx-parser");

exports.extractTextFromFile = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const filePath = file.path;

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
        if (!data) reject(new Error("Failed to parse DOCX"));
        resolve(data);
      });
    });
  }

  throw new Error("Unsupported file type.");
};
