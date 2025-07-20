require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const User = require('../model/User');
const multer = require('../middleware/multer');
const bcrypt = require('bcrypt');

// Home route
router.get('/', (req, res) => {
    res.send("This is Home Page of Pet Rescue Department....!!!");
});

// Register rescue
router.post('/register_rescuer', multer.single('image'), async (req, res) => {
    try {
        const { userid, name, password, address, contact, pet_type } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const existingUser = await User.findOne({ userid });
        if (existingUser) {
            return res.status(409).json({ error: 'User ID already exists' });
        }

        const hash = await bcrypt.hash(password, 10);

        const newUser = new User({
            userid,
            name,
            password: hash,
            contact,
            address,
            pet_type,
            image: req.file.filename,
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login route
router.post('/login', async function (req, res) {
    try {
        const { userid, password } = req.body;

        if (!userid || !password) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        let user = await User.findOne({ userid });

        if (!user) {
            return res.status(400).json({
                message: "Incorrect userid or password.",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect userid or password.",
                success: false,
            });
        }

        const tokenData = {
            userId: user._id
        };

        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            name: user.name,
            userid: user.userid,
            contact: user.contact,
        };

        return res.status(200)
            .cookie("token", token, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'strict'
            })
            .json({
                message: `Welcome back ${user.name}`,
                user,
                success: true
            });
    } catch (error) {
        console.log("Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all volunteers
router.get('/get', async (req, res) => {
    try {
        const users = await User.find();

        const usersWithImageUrl = users.map(u => ({
            ...u._doc,
            image: `${req.protocol}://${req.get('host')}/uploads/${u.image}`,
        }));

        res.json(usersWithImageUrl);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update pet info
router.patch('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await User.findByIdAndUpdate(id, updatedData, options);

        res.send(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete pet info
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await User.findByIdAndDelete(id);
        res.send(`Document with name ${data.name} has been deleted.`);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all pets
router.get('/get_all', async (req, res) => {
    try {
        const users = await User.find();

        const usersWithImageUrl = users.map(u => ({
            ...u._doc,
            image: `${req.protocol}://${req.get('host')}/uploads/${u.image}`,
        }));

        res.json(usersWithImageUrl);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
