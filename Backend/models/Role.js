const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
{
    roleName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    permissions: {

    // Dashboard
    analytics: { type: Boolean, default: false },

    // Invoice
    createInvoice: { type: Boolean, default: false },
    viewInvoices: { type: Boolean, default: false },

    // Purchase
    purchaseOrders: { type: Boolean, default: false },
    purchaseInvoices: { type: Boolean, default: false },

    // Payment Tracker
    incomingPayments: { type: Boolean, default: false },
    outgoingPayments: { type: Boolean, default: false },

    // Production
    productionTracking: { type: Boolean, default: false },
    viewProduction: { type: Boolean, default: false },

    // ISO Informations
    customers: { type: Boolean, default: false },
    products: { type: Boolean, default: false },
    employees: { type: Boolean, default: false },
    routeCards: { type: Boolean, default: false },

    // Administration
    userManagement: { type: Boolean, default: false },
    roleManagement: { type: Boolean, default: false }

}
},
{
    timestamps: true
});

module.exports = mongoose.model("Role", roleSchema);