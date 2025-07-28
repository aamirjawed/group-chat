import Message from '../model/messageModel.js';
import User from '../model/userModel.js';

const getUserMessage = async (req, res) => {
  try {

   const id = req.userId

   /* The code snippet `const users = await User.findAll({ attributes:['id','fullName'] })` is querying
   the database to retrieve all users from the `User` model, but it is only selecting the `id` and
   `fullName` attributes for each user. This means that the query will return an array of user
   objects, where each object contains only the `id` and `fullName` properties. */
   const users = await User.findAll({
    attributes:['id','fullName']
   })

    
    /* This code snippet is querying the database to retrieve messages from the `Message` model. Here's
    a breakdown of what it's doing: */
    const sortedMessage = await Message.findAll({
      attributes: ['userMessage', 'userId', 'createdAt'], 
      order: [['createdAt', 'DESC']],
      limit:10
    });

    const messages = sortedMessage.reverse()


    res.status(200).json({ id,messages, users });
  } catch (error) {
    console.error('Error in getUserMessage:', error.message);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

export default getUserMessage;
