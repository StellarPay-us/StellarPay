const { validateXML } = require('../utils/isoProcessor');

exports.validateXML = (xmlContent, xsdContent) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await validateXML(xmlContent, xsdContent);
      resolve(result);  // Resolve the promise with the validation result
    } catch (error) {
      reject(error);  // Reject the promise if an error occurs
    }
  });
};
