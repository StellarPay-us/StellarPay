# ISO20022 Processor

This project provides a library for validating and parsing ISO20022 payment initiation messages (`pain.001.001.12` schema). It supports XML validation against XSD schemas and extraction of relevant transaction data from XML documents.

## Features

- **XML Validation**: Validate XML files against provided XSD schema.
- **XML Parsing**: Parse XML files and extract predefined elements and transaction data.
- **Error Handling**: Detailed error reporting for missing elements and validation failures.

## Usage
### XML Validation

You can validate an XML file against an XSD schema using the `validateXML` function.

```js
const { validateXML } = require('path-to-library');

// Load XML and XSD content
const xmlContent = fs.readFileSync('path/to/xmlfile.xml', 'utf8');
const xsdContent = fs.readFileSync('path/to/schema.xsd', 'utf8');

// Validate XML
validateXML(xmlContent, xsdContent).then((result) => {
  if (result.valid) {
    console.log("XML is valid.");
  } else {
    console.error("XML is invalid. Errors:", result.errors);
  }
});
```
### XML Parsing

You can parse the XML file and extract transaction data using the `parseXML` function.

```js
const { parseXML } = require('path-to-library');

// Load and parse XML content
const xmlContent = fs.readFileSync('path/to/xmlfile.xml', 'utf8');
const result = parseXML(xmlContent);

// Access parsed data
console.log(result.message);
console.log(result.transactions);
```

## Running Tests

To run tests for validation and parsing, make sure to have the appropriate test files available. 
Run the following command:

```bash
pnpm jest test
```