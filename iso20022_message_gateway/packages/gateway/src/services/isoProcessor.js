const { validateXML } = require('../utils/isoProcessor');

exports.validateXML = async (xmlContent, xsdContent) => {
  const result = await validateXML(xmlContent, xsdContent);
  return result; 
};
