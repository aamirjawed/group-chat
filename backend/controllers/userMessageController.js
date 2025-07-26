import User from '../model/userModel.js'
import Message from '../model/messageModel.js'

export const userMessageController = async (req, res) => {
    const {userMessage} = req.body

    try {
        

        if(!userMessage){
            return res.status(400).json({
                success:false,
                error:"Empty input, no message",
                message:"Input must contain a message"
            })
        }

       

        const message = await Message.create({
            userMessage:userMessage,
            userId:req.userId
        })

        if(!message){
            return res.status(400).json({
                success:false,
                error:"No message found",
                message:"Unable to send message"
            })
        }


        res.status(200).json({message})




    } catch (error) {
        console.log("Error in user message controller", error.message);
        res.status(500).json({
            success:false,
            error:"Internal Server error",
            "message":"Server error"
        })
    }
}