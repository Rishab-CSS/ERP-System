const API_URL = "http://localhost:3000/api/roles";

let editingRoleId = null;

const roleName = document.getElementById("roleName");
const saveRoleBtn = document.getElementById("saveRoleBtn");
const cancelBtn = document.getElementById("cancelBtn");
const rolesTableBody = document.getElementById("rolesTableBody");
const searchRole = document.getElementById("searchRole");

document.addEventListener("DOMContentLoaded", () => {
    loadRoles();
});


// ===============================
// GET ALL PERMISSIONS
// ===============================

function getPermissions() {

    return {

        analytics: document.getElementById("analytics").checked,

        createInvoice: document.getElementById("createInvoice").checked,
        viewInvoices: document.getElementById("viewInvoices").checked,

        purchaseOrders: document.getElementById("purchaseOrders").checked,
        purchaseInvoices: document.getElementById("purchaseInvoices").checked,

        incomingPayments: document.getElementById("incomingPayments").checked,
        outgoingPayments: document.getElementById("outgoingPayments").checked,

        productionTracking: document.getElementById("productionTracking").checked,
        viewProduction: document.getElementById("viewProduction").checked,

        customers: document.getElementById("customers").checked,
        products: document.getElementById("products").checked,
        employees: document.getElementById("employees").checked,
        routeCards: document.getElementById("routeCards").checked,

        userManagement: document.getElementById("userManagement").checked,
        roleManagement: document.getElementById("roleManagement").checked

    };

}



// ===============================
// CLEAR FORM
// ===============================

function clearForm() {

    editingRoleId = null;

    roleName.value = "";

    document.querySelectorAll("input[type='checkbox']").forEach(cb => {

        cb.checked = false;

    });

    saveRoleBtn.textContent = "Save Role";

}



// ===============================
// LOAD ROLES
// ===============================

async function loadRoles() {

    try {

        const res = await fetch(API_URL);

        const roles = await res.json();

        rolesTableBody.innerHTML = "";

        roles.forEach(role => {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${role.roleName}</td>

<td>

    <div class="action-cell">

        <button
            class="btn"
            onclick="editRole('${role._id}')">

            Edit

        </button>

        <button
            class="btn btn-danger"
            onclick="deleteRole('${role._id}')">

            Delete

        </button>

    </div>

</td>

            `;

            rolesTableBody.appendChild(row);

        });

    }

    catch(err){

        console.error(err);

        alert("Failed to load roles.");

    }

}



// ===============================
// SAVE ROLE
// ===============================

saveRoleBtn.addEventListener("click", async () => {

    const role = {

        roleName: roleName.value.trim(),

        permissions: getPermissions()

    };

    if(role.roleName === ""){

        alert("Please enter Role Name");

        return;

    }

    try{

        const url = editingRoleId
            ? `${API_URL}/${editingRoleId}`
            : API_URL;

        const method = editingRoleId
            ? "PUT"
            : "POST";

        const res = await fetch(url,{

            method,

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(role)

        });

        const data = await res.json();

        if(!res.ok){

            alert(data.message);

            return;

        }

        alert(editingRoleId ? "Role Updated Successfully" : "Role Created Successfully");

        clearForm();

        loadRoles();

    }

    catch(err){

        console.error(err);

        alert("Error saving role.");

    }

});



// ===============================
// CANCEL BUTTON
// ===============================

cancelBtn.addEventListener("click", () => {

    clearForm();

});



// ===============================
// EDIT ROLE
// ===============================

async function editRole(id) {

    try {

        const res = await fetch(API_URL);

        const roles = await res.json();

        const role = roles.find(r => r._id === id);

        if (!role) return;

        editingRoleId = id;

        roleName.value = role.roleName;

        const permissions = role.permissions;

        document.getElementById("analytics").checked = permissions.analytics || false;

        document.getElementById("createInvoice").checked = permissions.createInvoice || false;
        document.getElementById("viewInvoices").checked = permissions.viewInvoices || false;

        document.getElementById("purchaseOrders").checked = permissions.purchaseOrders || false;
        document.getElementById("purchaseInvoices").checked = permissions.purchaseInvoices || false;

        document.getElementById("incomingPayments").checked = permissions.incomingPayments || false;
        document.getElementById("outgoingPayments").checked = permissions.outgoingPayments || false;

        document.getElementById("productionTracking").checked = permissions.productionTracking || false;
        document.getElementById("viewProduction").checked = permissions.viewProduction || false;

        document.getElementById("customers").checked = permissions.customers || false;
        document.getElementById("products").checked = permissions.products || false;
        document.getElementById("employees").checked = permissions.employees || false;
        document.getElementById("routeCards").checked = permissions.routeCards || false;

        document.getElementById("userManagement").checked = permissions.userManagement || false;
        document.getElementById("roleManagement").checked = permissions.roleManagement || false;

        saveRoleBtn.textContent = "Update Role";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

    catch (err) {

        console.error(err);

        alert("Failed to load role.");

    }

}



// ===============================
// DELETE ROLE
// ===============================

async function deleteRole(id) {

    const confirmDelete = confirm("Are you sure you want to delete this role?");

    if (!confirmDelete) return;

    try {

        const res = await fetch(`${API_URL}/${id}`, {

            method: "DELETE"

        });

        const data = await res.json();

        if (!res.ok) {

            alert(data.message);

            return;

        }

        alert("Role Deleted Successfully");

        if (editingRoleId === id) {

            clearForm();

        }

        loadRoles();

    }

    catch (err) {

        console.error(err);

        alert("Error deleting role.");

    }

}



// ===============================
// SEARCH ROLE
// ===============================

searchRole.addEventListener("keyup", function () {

    const value = this.value.toLowerCase();

    const rows = rolesTableBody.querySelectorAll("tr");

    rows.forEach(row => {

        const role = row.children[0].innerText.toLowerCase();

        row.style.display = role.includes(value)
            ? ""
            : "none";

    });

});