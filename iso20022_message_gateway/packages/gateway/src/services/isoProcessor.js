const { validateXML, parseXML } = require("../utils/isoProcessor");

exports.validateXML = async (xmlContent, xsdContent) => {
  const result = await validateXML(xmlContent, xsdContent);
  return result;
};

exports.parseXML = xmlContent => {
  const data = parseXML(xmlContent);
  return data;
};
