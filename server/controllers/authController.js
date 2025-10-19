const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "3d"
    });
};

exports.register = async (req, res) => {
    try {

        const {
            username,
            firstName,
            lastName,
            password,
            email
        } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            username,
            firstName,
            lastName,
            password,
            email
        });

        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).json({
            token: generateToken(user.id),
            user: userWithoutPassword
        });


    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({
            email
        });

        if (user && (await user.matchPassword(password))) {
            const { password: _, ...userWithoutPassword } = user.toObject();
            res.json({
                token: generateToken(user.id),
                user: userWithoutPassword
            });
        } else {
            res.status(401).json({
                message: 'Invalid email or password'
            });
        }

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}