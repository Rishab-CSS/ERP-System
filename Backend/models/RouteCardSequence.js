const mongoose = require("mongoose");

const RouteCardSequenceSchema = new mongoose.Schema({
    routeCardNo: {
        type: String,
        required: true,
        unique: true
    },

    productionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductionTracking",
        default: null
    },

    status: {
        type: String,
        enum: ["Reserved", "Generated", "Cancelled"],
        default: "Reserved"
    }

}, { timestamps: true });

module.exports = mongoose.model("RouteCardSequence", RouteCardSequenceSchema);