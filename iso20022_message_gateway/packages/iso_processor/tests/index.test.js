const { validateXML } = require('../src/index');
const fs = require('fs');
const path = require('path');

describe('XML Processor Library', () => {
    test('validateXML should return valid for a correct XML file', async () => {
        const xmlPath = path.join(__dirname, '../../../../resources/files/messages', 'pain.001.001.12.xml');
        const xsdPath = path.join(__dirname, '../../../../resources/files/definitions', 'pain.001.001.12.xsd');

        const data = fs.readFileSync(xmlPath); 
        const xsdContent = fs.readFileSync(xsdPath); 
        const result = await validateXML(data.toString(), xsdContent);
        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
    });

    test('validateXML should return errors for an incorrect XML file', async () => {
        const xmlPath = path.join(__dirname, '../../../../resources/files/messages', 'errorMessage.xml');
        const xsdPath = path.join(__dirname, '../../../../resources/files/definitions', 'pain.001.001.12.xsd');

        const data = fs.readFileSync(xmlPath); 
        const xsdContent = fs.readFileSync(xsdPath); 
        const result = await validateXML(data.toString(), xsdContent);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    }); 
});
