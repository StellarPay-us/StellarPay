const path = require('path');
const fs = require('fs');
const os = require('os');
const libxmljs = require('libxmljs2');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

async function validateXML(xmlContent, xsdContent) {
    const tempDir = os.tmpdir();

    // Create temporary files for the XML and XSD content
    const xmlPath = path.join(tempDir, 'temp.xml');
    const xsdPath = path.join(tempDir, 'temp.xsd');

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

module.exports = {
    validateXML
}