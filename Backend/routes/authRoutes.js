const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const User = require("../models/User");

router.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findOne({ username })
            .populate("role");

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });

        }

        if (!user.active) {

            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });

        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {

            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });

        }

        res.json({

            success: true,

            user: {

                _id: user._id,

                username: user.username,

                active: user.active,

                role: {
                    _id: user.role._id,
                    roleName: user.role.roleName
                },

                permissions: user.role.permissions

            }

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});

module.exports = router;