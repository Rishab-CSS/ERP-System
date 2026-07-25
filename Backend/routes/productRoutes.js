const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// CREATE PRODUCT
router.post("/add", async (req, res) => {
  try {
    const product = new Product({
      partNumber: req.body.partNumber,
      partName: req.body.partName
    });

    await product.save();
    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ partNumber: 1 });
  res.json(products);
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        partNumber: req.body.partNumber,
        partName: req.body.partName
      },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted Successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;