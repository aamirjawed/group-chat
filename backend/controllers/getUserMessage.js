import Message from '../model/messageModel.js';

const getUserMessage = async (req, res) => {
  try {

   const id = req.userId

    /* This code snippet is using Sequelize, an ORM for Node.js, to retrieve messages from a database
    table called `Message`. */
    const messages = await Message.findAll({
      attributes: ['userMessage', 'userId', 'createdAt'], 
      order: [['createdAt', 'ASC']], 
    });

    res.status(200).json({ id,messages });
  } catch (error) {
    console.error('Error in getUserMessage:', error.message);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

export default getUserMessage;
