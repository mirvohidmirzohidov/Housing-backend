const bcrypt = require('bcrypt'); const jwt = require('jsonwebtoken'); const User = require('../models/User');
exports.register = async (req, res) => { const { firstname, lastname, email, password } = req.body; const hashedPassword = await bcrypt.hash(password, 10); try { const newUser = await User.create({ firstname, lastname, email, password: hashedPassword }); res.json({ message: 'User registered successfully' }); } catch (err) { res.status(400).json({ message: 'Error registering user' }); } };
exports.login = async (req, res) => { const { email, password } = req.body; const user = await User.findOne({ email }); if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: 'Invalid email or password' }); const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); res.json({ token }); };

const User = require('../models/User');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Parolni ko‘rsatmaymiz
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

module.exports = { register, login, getAllUsers };
