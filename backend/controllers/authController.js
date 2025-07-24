import bcrypt from 'bcryptjs'; // or 'bcrypt'
import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

export const signupController = async (req, res) => {
    try {
        console.log('Received signup request:', req.body);

        const { fullName, email, phoneNumber, password } = req.body;

        // Validate required fields
        if (!fullName || !email || !phoneNumber || !password) {
            return res.status(400).json({
                success: false,
                error: "All fields are required",
                message: "Please provide fullName, email, phoneNumber, and password"
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ where: { email: email.toLowerCase() } });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                error: "Email already exists",
                message: "An account with this email already exists"
            });
        }


        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await User.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            phoneNumber: phoneNumber,
            password: hashedPassword
        });

        if (!user) {
            return res.status(500).json({
                success: false,
                error: "User creation failed",
                message: "Unable to create user account"
            });
        }

        // Remove password from response
        const { password: _, ...userResponse } = user.toJSON();

        console.log('User created successfully:', user.id);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                user: userResponse
            }
        });

    } catch (error) {
        console.log("Error in signup controller:", error.message);
        console.error("Full error:", error);

        res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "Something went wrong while creating your account"
        });
    }
};




export const loginController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "All fields are required",
            message: "Please provide email and password"
        });
    }

    try {
        const user = await User.findOne({ where: { email } })

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User with this email does not exist"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {

            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
                message: "Invalid email or password"
            })
        }


        
        const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
        console.log(jwtToken)

        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: false, // Set to true in production (requires HTTPS)
            sameSite: 'Lax',
            maxAge: 10 * 60 * 1000 // 1 day
        });

        res.status(200).json({
            success: true,
            message: "Login Successful"
        })
    } catch (error) {
        console.log("Error in login controller", error.message)
        res.status(500).json({
            success: false,
            error: "Server side error",
            message: "Something went wrong while logging in"
        })
    }
}