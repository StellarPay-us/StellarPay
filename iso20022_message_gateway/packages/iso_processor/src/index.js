const path = require("path");
const fs = require("fs");
const os = require("os");
const libxmljs = require("libxmljs2");
const { DOMParser } = require("@xmldom/xmldom");
const { promisify } = require("util");


const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

/**
 * Validates an XML document against a provided XSD schema.
 * Temporarily writes the XML and XSD content to files for validation.
 *
 * @param {string} xmlContent - The XML document content.
 * @param {string} xsdContent - The XSD schema content.
 * @returns {Promise<Object>} - Returns an object with validation status and errors.
 */
async function validateXML(xmlContent, xsdContent) {
  const tempDir = os.tmpdir();

  // Create temporary file paths for the XML and XSD content
  const xmlPath = path.join(tempDir, "temp.xml");
  const xsdPath = path.join(tempDir, "temp.xsd");

  // Write XML and XSD to temporary files
  await writeFileAsync(xmlPath, xmlContent);
  await writeFileAsync(xsdPath, xsdContent);

  try {
    // Parse the XML and XSD documents using libxmljs
    const xmlDoc = libxmljs.parseXml(xmlContent);
    const xsdDoc = libxmljs.parseXml(xsdContent);

    // Validate XML against the XSD
    const isValid = xmlDoc.validate(xsdDoc);
    if (isValid) {
      return { valid: true, errors: [] };
    } else {
      const errors = parseLibxmljsErrors(xmlDoc.validationErrors);
      return { valid: false, errors: errors };
    }
  } catch (error) {
    return { valid: false, errors: [error.message] };
  } finally {
    // Clean up temporary files
    await unlinkAsync(xmlPath);
    await unlinkAsync(xsdPath);
  }
}

/**
 * Parses XML content and extracts relevant information from predefined blocks.
 *
 * @param {string} xmlContent - The XML content to parse.
 * @returns {Object} - Returns a parsed message object and transactions array.
 */
function parseXML(xmlContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  // Helper function to extract text content from a tag
  function getElementTextContent(element, tagName) {
    const tag = element.getElementsByTagName(tagName)[0];
    if (!tag || !tag.textContent) {
      throw new Error(`Missing or empty <${tagName}> element.`);
    }
    return tag.textContent;
  }

  // Helper function to extract text content and an attribute from a tag
  function getElementTextContentWithAttr(element, tagName, attrName) {
    const tag = element.getElementsByTagName(tagName)[0];
    if (!tag || !tag.textContent) {
      throw new Error(`Missing or empty <${tagName}> element.`);
    }
    const attr = tag.getAttribute(attrName);
    if (!attr) {
      throw new Error(
        `Missing or empty attribute "${attrName}" in <${tagName}> element.`,
      );
    }
    return { textContent: tag.textContent, attr };
  }

  // Parsing <GrpHdr> block
  const grpHdr = xmlDoc.getElementsByTagName("GrpHdr")[0];
  if (!grpHdr) throw new Error("Missing <GrpHdr> block.");

  // Parsing <InitgPty> block
  const initgPty = grpHdr.getElementsByTagName("InitgPty")[0];
  if (!initgPty) throw new Error("Missing <InitgPty> block.");

  // Parsing <PmtInf> block
  const pmtInf = xmlDoc.getElementsByTagName("PmtInf")[0];
  if (!pmtInf) throw new Error("Missing <PmtInf> block.");

  // Creating message object with parsed data
  const message = {
    msgId: getElementTextContent(grpHdr, "MsgId"),
    creDtTm: getElementTextContent(grpHdr, "CreDtTm"),
    nbOfTxs: getElementTextContent(grpHdr, "NbOfTxs"),
    ctrlSum: getElementTextContent(grpHdr, "CtrlSum"),
    initgPty: {
      name: getElementTextContent(initgPty, "Nm"),
      orgId: getElementTextContent(initgPty, "Id"),
    },
    pmtInfId: getElementTextContent(pmtInf, "PmtInfId"),
    pmtMtd: getElementTextContent(pmtInf, "PmtMtd"),
    svcLvl: getElementTextContent(
      pmtInf.getElementsByTagName("SvcLvl")[0],
      "Cd",
    ),
    reqdExctnDt: getElementTextContent(pmtInf, "ReqdExctnDt"),
    dbtr: {
      name: getElementTextContent(pmtInf.getElementsByTagName("Dbtr")[0], "Nm"),
    },
    dbtrAcct: {
      iban: getElementTextContent(
        pmtInf.getElementsByTagName("DbtrAcct")[0],
        "IBAN",
      ),
      currency: getElementTextContent(
        pmtInf.getElementsByTagName("DbtrAcct")[0],
        "Ccy",
      ),
    },
    dbtrAgt: {
      bicfi: getElementTextContent(
        pmtInf.getElementsByTagName("DbtrAgt")[0],
        "BICFI",
      ),
    },
  };

  // Parsing transactions in <CdtTrfTxInf> elements
  const transactions = [];
  const transactionElements = pmtInf.getElementsByTagName("CdtTrfTxInf");
  for (let i = 0; i < transactionElements.length; i++) {
    const transaction = transactionElements[i];

    // Extract amount and currency from <InstdAmt> with attribute Ccy
    const instdAmt = getElementTextContentWithAttr(
      transaction,
      "InstdAmt",
      "Ccy",
    );

    // Extract exchange rate information from <XchgRateInf>
    const xchgRateInf = transaction.getElementsByTagName("XchgRateInf")[0];
    if (!xchgRateInf) {
      throw new Error("Missing <XchgRateInf> block.");
    }

    // Creating transaction object
    const transactionInfo = {
      endToEndId: getElementTextContent(
        transaction.getElementsByTagName("PmtId")[0],
        "EndToEndId",
      ),
      instdAmt: {
        amount: instdAmt.textContent,
        currency: instdAmt.attr,
      },
      xchgRateInf: {
        unitCcy: getElementTextContent(xchgRateInf, "UnitCcy"),
        xchgRate: getElementTextContent(xchgRateInf, "XchgRate"),
      },
      cdtrAgt: {
        bicfi: getElementTextContent(
          transaction.getElementsByTagName("CdtrAgt")[0],
          "BICFI",
        ),
      },
      cdtrAcct: {
        iban: getElementTextContent(
          transaction.getElementsByTagName("CdtrAcct")[0],
          "IBAN",
        ),
      },
    };

    // Add transaction to the transactions array
    transactions.push(transactionInfo);
  }

  return {
    message,
    transactions,
  };
}

/**
 * Parses libxmljs validation errors and returns them in a structured format.
 *
 * @param {Array} validationErrors - List of libxmljs validation errors.
 * @returns {Array<Object>} - Returns a list of parsed error objects.
 */
function parseLibxmljsErrors(validationErrors) {
  return validationErrors.map(error => ({
    message: error.message,
    line: error.line,
    column: error.column,
  }));
}

module.exports = {
  validateXML,
  parseXML,
};
