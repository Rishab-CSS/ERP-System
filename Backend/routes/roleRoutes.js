const express = require("express");
const router = express.Router();

const Role = require("../models/Role");


// =========================
// GET ALL ROLES
// =========================
router.get("/", async (req, res) => {
    try {
        const roles = await Role.find().sort({ roleName: 1 });
        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// =========================
// CREATE ROLE
// =========================
router.post("/", async (req, res) => {
    try {

        const existing = await Role.findOne({
            roleName: req.body.roleName
        });

        if (existing) {
            return res.status(400).json({
                message: "Role already exists"
            });
        }

        const role = new Role({
            roleName: req.body.roleName,
            permissions: req.body.permissions
        });

        await role.save();

        res.status(201).json(role);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});


// =========================
// UPDATE ROLE
// =========================
router.put("/:id", async (req, res) => {

    try {

        const updated = await Role.findByIdAndUpdate(
            req.params.id,
            {
                roleName: req.body.roleName,
                permissions: req.body.permissions
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        res.json(updated);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});


// =========================
// DELETE ROLE
// =========================
router.delete("/:id", async (req, res) => {

    try {

        const deleted = await Role.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        res.json({
            message: "Role deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }

});


module.exports = router;