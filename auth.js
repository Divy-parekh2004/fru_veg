const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Adjust path based on your folder structure

// Route for user registration
router.post('/signup', async (req, res) => {
    try {
        // Check if user with email already exists
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Check if user with mobile already exists
        const mobileExists = await User.findOne({ mobile: req.body.mobile });
        if (mobileExists) {
            return res.status(400).json({ message: 'Mobile number already exists' });
        }

        // Check if passwords match
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        const newUser = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            mobile: req.body.mobile,
            password: hashedPassword
        });

        // Save the user
        const savedUser = await newUser.save();
        
        // Return success response without password
        const { password, ...userWithoutPassword } = savedUser.toObject();
        res.status(201).json({ 
            message: 'User registered successfully', 
            user: userWithoutPassword 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;