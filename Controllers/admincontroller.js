require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Admin = require('../model/admin'); // Admin model
const multer = require('../middleware/multer');


// Home Route
router.get('/', (req, res) => {
    res.send("This is Home Page of Admin Department....!!!");
});

// Register Admin with image
router.post('/register', multer.single('image'), async (req, res) => {
    try {
        const { userid, name, password, address, contact } = req.body;

        if (!userid || !name || !password || !address || !contact || !req.file) {
            return res.status(400).json({ error: "All fields including image are required" });
        }

        const existingAdmin = await Admin.findOne({ userid });
        if (existingAdmin) {
            return res.status(409).json({ error: 'User ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            userid,
            name,
            password: hashedPassword,
            address,
            contact,
            image: req.file.filename
        });

        await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully!", user: newAdmin });

    } catch (error) {
        console.error("Admin Register Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login Admin
router.post('/login', async (req, res) => {
    try {
        const { userid, password } = req.body;

        const admin = await Admin.findOne({ userid });
        if (!admin) {
            return res.status(400).json({ error: "Invalid userid or password" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid userid or password" });
        }

        const tokenData = { adminId: admin._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        res.status(200)
            .cookie('adminToken', token, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'strict'
            })
            .json({
                message: `Welcome back ${admin.name}`,
                admin: {
                    _id: admin._id,
                    name: admin.name,
                    userid: admin.userid,
                    contact: admin.contact,
                },
                success: true
            });

    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get
router.get('/get', async (req, res) => {
    try {
        const admins = await Admin.find();

        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get all 
router.get('/get_all', async (req, res) => {
    try {
        const admins = await Admin.find();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Admin
router.patch('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const options = { new: true };

        const updatedAdmin = await Admin.findByIdAndUpdate(id, updates, options);
        res.json(updatedAdmin);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete Admin
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedAdmin = await Admin.findByIdAndDelete(id);

        if (!deletedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({ message: `Admin ${deletedAdmin.name} deleted successfully` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
