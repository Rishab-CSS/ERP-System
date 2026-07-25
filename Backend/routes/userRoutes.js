const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const User = require("../models/User");
const Role = require("../models/Role");


router.get("/", async (req, res) => {

    try {

        const users = await User.find()
            .populate("role", "roleName")
            .sort({ username: 1 });

        res.json(users);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


router.post("/", async (req, res) => {

    try {

        const { username, password, role } = req.body;

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        const roleExists = await Role.findById(role);

        if (!roleExists) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashedPassword,
            role
        });

        await user.save();

        res.status(201).json(user);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


router.put("/:id", async (req, res) => {

    try {

        const { username, password, role, active } = req.body;

        const updateData = {
            username,
            role,
            active
        };

        // Only update password if provided
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(user);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


router.delete("/:id", async (req, res) => {

    try {

        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: "User deleted successfully."
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


module.exports = router;