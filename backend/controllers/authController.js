import bcrypt from 'bcryptjs'; // or 'bcrypt'
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

        // Validate input formats
        const validationErrors = validateInputs(fullName, email, phoneNumber, password);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: "Validation failed",
                messages: validationErrors
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
        
        // Handle specific database errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path;
            return res.status(409).json({ 
                success: false,
                error: "Duplicate entry",
                message: `${field} already exists`
            });
        }
        
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({ 
                success: false,
                error: "Validation error",
                messages: validationErrors
            });
        }

        res.status(500).json({ 
            success: false,
            error: "Internal server error",
            message: "Something went wrong while creating your account"
        });
    }
};

// Helper function for input validation
const validateInputs = (fullName, email, phoneNumber, password) => {
    const errors = [];

    // Full name validation
    if (fullName.trim().length < 2) {
        errors.push("Full name must be at least 2 characters long");
    }
    if (fullName.trim().length > 100) {
        errors.push("Full name must not exceed 100 characters");
    }
    if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim())) {
        errors.push("Full name can only contain letters, spaces, hyphens, and apostrophes");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push("Please provide a valid email address");
    }
    if (email.length > 254) {
        errors.push("Email address is too long");
    }


    // Password validation
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    if (password.length > 128) {
        errors.push("Password must not exceed 128 characters");
    }
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push("Password must contain at least one special character (@$!%*?&)");
    }

    return errors;
};

// Optional: Export validation function for testing
export { validateInputs };
