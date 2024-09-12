const path = require("path");
const fs = require("fs");
const os = require("os");
const libxmljs = require("libxmljs2");
const { DOMParser } = require("xmldom");
const { promisify } = require("util");

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

async function validateXML(xmlContent, xsdContent) {
  const tempDir = os.tmpdir();

  // Create temporary files for the XML and XSD content
  const xmlPath = path.join(tempDir, "temp.xml");
  const xsdPath = path.join(tempDir, "temp.xsd");

  await writeFileAsync(xmlPath, xmlContent);
  await writeFileAsync(xsdPath, xsdContent);

  try {
    const xmlDoc = libxmljs.parseXml(xmlContent);
    const xsdDoc = libxmljs.parseXml(xsdContent);

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

function parseXML(xmlContent) {
  function getElementTextContent(element, tagName) {
    const tag = element.getElementsByTagName(tagName)[0];
    if (!tag || !tag.textContent) {
      throw new Error(`Missing or empty <${tagName}> element.`);
    }
    return tag.textContent;
  }

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

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  // Group Header Block
  const grpHdr = xmlDoc.getElementsByTagName("GrpHdr")[0];
  if (!grpHdr) throw new Error("Missing <GrpHdr> block.");

  // InitgPty Block
  const initgPty = grpHdr.getElementsByTagName("InitgPty")[0];
  if (!initgPty) throw new Error("Missing <InitgPty> block.");

  // Payment Information Block
  const pmtInf = xmlDoc.getElementsByTagName("PmtInf")[0];
  if (!pmtInf) throw new Error("Missing <PmtInf> block.");

  // Combined message object
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

  // Transactions
  const transactions = [];
  const transactionElements = pmtInf.getElementsByTagName("CdtTrfTxInf");
  for (let i = 0; i < transactionElements.length; i++) {
    const transaction = transactionElements[i];

    // Ensure that the <Amt> block and the <InstdAmt> element with Ccy attribute exist
    const instdAmt = getElementTextContentWithAttr(
      transaction,
      "InstdAmt",
      "Ccy",
    );

    // Ensure that the <XchgRateInf> block exists
    const xchgRateInf = transaction.getElementsByTagName("XchgRateInf")[0];
    if (!xchgRateInf) {
      throw new Error("Missing <XchgRateInf> block.");
    }

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
    transactions.push(transactionInfo);
  }

  return {
    message,
    transactions,
  };
}

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
