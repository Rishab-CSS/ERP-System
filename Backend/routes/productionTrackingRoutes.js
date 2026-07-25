const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Production = require("../models/ProductionTracking");
const ProductProcess = require("../models/ProductProcess");
const RouteCardSequence = require("../models/RouteCardSequence");



// =========================
// GENERATE NEXT ROUTE CARD NUMBER
// =========================
async function generateNextRouteCardNo() {

  const latest = await RouteCardSequence.findOne().sort({ createdAt: -1 });

  if (!latest) {
    return "RPIC/RC/01";
  }

  const currentNo = parseInt(latest.routeCardNo.split("/")[2]);

  return "RPIC/RC/" + String(currentNo + 1).padStart(2, "0");
}

// =========================
// CREATE PRODUCT
// =========================
router.post("/create", async (req, res) => {
  try {

  console.log("Step 1");

  const rcNo = await generateNextRouteCardNo();
  console.log("Generated RC:", rcNo);

  const data = new Production({
    ...req.body,
    productId: req.body.productId,
    routeCardNo: rcNo
  });

  await data.save();
  console.log("Production saved");

  // =========================
// AUTO ADD TO PRODUCTS MASTER
// =========================
const existingProduct = await Product.findOne({
  partNumber: req.body.partNumber
});

if (!existingProduct) {
  await Product.create({
    partNumber: req.body.partNumber,
    partName: req.body.productName
  });

  console.log("New product added to Products Master");
}

  await RouteCardSequence.create({
    routeCardNo: rcNo,
    productionId: data._id,
    status: "Reserved"
  });

  console.log("RouteCardSequence saved");

  res.json(data);

} catch (err) {
  console.error("ERROR:", err);
  res.status(500).json({ error: err.message });
}
});


// =========================
// GET ALL
// =========================
router.get("/", async (req, res) => {
  const data = await Production.find().sort({ createdAt: -1 });
  res.json(data);
});

// =========================
// GET ONE
// =========================
router.get("/:id", async (req, res) => {
  try {
    const data = await Production.findById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// ADD PROCESS
// =========================
router.post("/add-process/:id", async (req, res) => {
  try {

    const product = await Production.findById(req.params.id);
    let process = req.body;

    // =========================
    // LOSS CALCULATION
    // =========================
    const produced = Number(process.producedQty || 0);
    const accepted = Number(process.acceptedQty || 0);

    let missing = 0;
    if (accepted > 0) {
      missing = produced - accepted;
    }

    process.missingQty = missing > 0 ? missing : 0;

    if (missing > 0) {
      process.rejectedQty = missing;
      process.finalFlowQty = accepted;
    } else {
      process.rejectedQty = 0;
      process.finalFlowQty = accepted;
    }

    // =========================
    // INVENTORY HANDLING
    // =========================
    if (missing > 0) {
      if (process.useInventory === true) {
        process.takenFromInventory = missing;
        process.finalFlowQty = accepted + missing;
      } else {
        process.rejectedQty = missing;
        process.finalFlowQty = accepted;
      }
    } else {
      process.finalFlowQty = accepted;
    }

    // =========================
    // OPERATOR VALIDATION
    // =========================
    if (
      process.machineOrVendor &&
      process.machineOrVendor.toLowerCase() !== "outsourcing"
    ) {
      if (!process.operator) {
        return res.status(400).json({
          error: "Operator required for in-house process"
        });
      }
    }

    // =========================
    // UPDATE TOTAL PRODUCED
    // =========================
    if (process.finalFlowQty) {
      product.producedQty = process.finalFlowQty;
    }

    // =========================
    // SAVE / UPDATE PROCESS
    // =========================
    if (req.body.processId) {

      const existing = product.processes.id(req.body.processId);

      if (existing) {
        existing.processName = process.processName;
        existing.producedQty = process.producedQty;
        existing.acceptedQty = process.acceptedQty;
        existing.startDate = process.startDate;
        existing.endDate = process.endDate;
        existing.machineOrVendor = process.machineOrVendor;
        existing.operator = process.operator;
      }

    } else {

      const exists = product.processes.find(p =>
        p.processName === process.processName &&
        p.startDate === process.startDate
      );

      if (!exists) {
        product.processes.push(process);
      }
    }

    // =========================
    // AUTO COMPLETE STATUS
    // =========================
    if (
      process.processName &&
      process.processName.toLowerCase().includes("inspection") &&
      process.endDate
    ) {
      product.status = "Completed";
    }

    await product.save();

    // =========================
    // SYNC WITH PRODUCT PROCESS (FINAL FIX)
    // =========================
    const newProcesses = product.processes.map(p => ({
      name: p.processName
    }));

const masterProduct = await Product.findOne({
  partNumber: product.partNumber
});

if (!masterProduct) {
  return res.status(404).json({
    error: "Product not found in Products Master"
  });
}

let existingProcess = await ProductProcess.findOne({
  productId: masterProduct._id
});

    if (existingProcess) {

      let merged = existingProcess.processes || [];

      newProcesses.forEach(np => {

        const exists = merged.find(mp =>
          mp.name.toLowerCase() === np.name.toLowerCase()
        );

        if (!exists) {
          merged.push(np);
        }

      });

      existingProcess.processes = merged;
      await existingProcess.save();

    } else {

await ProductProcess.create({
  productId: masterProduct._id,
  processes: newProcesses
});

    }

    // =========================
    // RESPONSE
    // =========================
    const newProcess = product.processes[product.processes.length - 1];

    res.json({
      productId: product.productId,
      processId: newProcess._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// COMPLETE
// =========================
router.put("/complete/:id", async (req, res) => {
  try {
    const updated = await Production.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// CLEAR PROCESSES
// =========================
router.put("/clear-processes/:id", async (req, res) => {
  try {
    const product = await Production.findById(req.params.id);

    product.processes = [];
    product.producedQty = 0;
    product.status = "In Progress";

    await product.save();

    res.json({ message: "Processes cleared" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// DISPATCH
// =========================
router.post("/dispatch/:id", async (req, res) => {
  try {

    const product = await Production.findById(req.params.id);
    const dispatchQty = req.body.dispatchedQty || 0;
    const produced = product.producedQty || 0;

    if (dispatchQty > produced) {
      return res.status(400).json({
        error: "Dispatch qty cannot be more than produced qty"
      });
    }

    product.dispatchedQty = dispatchQty;
    product.remainingStock = produced - dispatchQty;
    product.status = "Completed";

    await product.save();
    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// DELETE
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const { cancelRouteCard } = req.query;

    const production = await Production.findById(req.params.id);

    if (!production) {
      return res.status(404).json({ message: "Production not found" });
    }

    if (cancelRouteCard === "true") {
      await RouteCardSequence.findOneAndUpdate(
        { productionId: production._id },
        { status: "Cancelled" }
      );
    }

    await Production.findByIdAndDelete(req.params.id);

    res.json({
      message: "Production deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;