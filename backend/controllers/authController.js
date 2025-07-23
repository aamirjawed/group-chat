
import User from "../model/userModel.js"
import bcrypt from 'bcryptjs'

export const signupController = async (req, res) => {
    const{fullName, email, phoneNumber, password} = req.body

    if(!fullName || !email || !phoneNumber || !password){
        return res.status(400).json({error:"All fields are required"})
    }

    const existingEmail = await User.findOne({where:{email}})

    if(existingEmail){
        return res.status(409).json({error:"Email already exist"})
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user =await User.create({
            fullName:fullName,
            email:email,
            phoneNumber:phoneNumber,
            password:hashedPassword
        })

        if(!user){
            return res.status(500).json({error:"Error creating user"})
        }

        res.status(201).json({message:"User created successfully"})

    } catch (error) {
        console.log("Error in signup controller in", error.message);
        res.status(500).json({error:"Server side error while creating user"})
    }
}


