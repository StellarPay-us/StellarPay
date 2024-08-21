const messageService = require('../services/messageService');

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await messageService.getAllMessages();
    res.send(messages);
  } catch (error) {
    res.status(500).send(error.message);
  }
};