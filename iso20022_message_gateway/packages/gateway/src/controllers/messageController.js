const path = require('path');
const fs = require('fs').promises;
const isoProcessor = require('../services/isoProcessor');

exports.receiveMessage = async (req, res) => {
  const xmlContent = req.body;  // Assuming the XML content is sent as a string in the request body

  try {
    const xsdPath = path.join(__dirname, '../../../../../resources/files/definitions', 'pain.001.001.12.xsd');
    const xsdContent = await fs.readFile(xsdPath, 'utf-8');

    // Validate the XML content against the XSD schema using the isoProcessor
    const validationResult = await isoProcessor.validateXML(xmlContent, xsdContent);

    if (!validationResult.valid) {
      return res.status(400).json({
        message: 'Invalid XML message',
        errors: validationResult.errors
      });
    }

    // TODO parse message (remember error handling)
    // TODO save message to database

    res.status(201).send('Message received and processed');
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing the message', error: error.message });
  }
};
