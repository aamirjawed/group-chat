import jwt from 'jsonwebtoken'
import User from '../model/userModel.js'

export const authUser = async(req, res, next) => {

try {
    const {token} = req.cookies

    if(!token){
        throw new Error("Token is not valid")
    }

    const decodedMessage =  await jwt.verify(token, process.env.JWT_SECRET)
    const {id} = decodedMessage

    const user = await User.findByPk(id)

    if(!user){
        throw new Error("User not found")
    }

    
    req.user = user

    next()
} catch (error) {
    console.log("Error in auth middleware", error.message)
    res.status(400).json({
        success:false,
        error:"Invalid token",
        message:"Token not valid"
    })
}
    
}