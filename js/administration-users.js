const API_URL = "http://localhost:3000/api/users";
const ROLE_API = "http://localhost:3000/api/roles";

let editingUserId = null;

const username = document.getElementById("username");
const password = document.getElementById("password");
const roleSelect = document.getElementById("roleSelect");
const active = document.getElementById("active");

const saveUserBtn = document.getElementById("saveUserBtn");
const cancelBtn = document.getElementById("cancelBtn");

const usersTableBody = document.getElementById("usersTableBody");
const searchUser = document.getElementById("searchUser");


document.addEventListener("DOMContentLoaded", () => {

    loadRoles();
    loadUsers();

});


// ==============================
// LOAD ROLES
// ==============================

async function loadRoles() {

    try {

        const res = await fetch(ROLE_API);

        const roles = await res.json();

        roleSelect.innerHTML = `
            <option value="">Select Role</option>
        `;

        roles.forEach(role => {

            roleSelect.innerHTML += `
                <option value="${role._id}">
                    ${role.roleName}
                </option>
            `;

        });

    }

    catch(err){

        console.error(err);

        alert("Failed to load roles.");

    }

}



// ==============================
// LOAD USERS
// ==============================

async function loadUsers() {

    try {

        const res = await fetch(API_URL);

        const users = await res.json();

        usersTableBody.innerHTML = "";

        users.forEach(user => {

            const row = document.createElement("tr");

row.innerHTML = `

    <td>${user.username}</td>

    <td>${user.role?.roleName || "-"}</td>

    <td>${user.active ? "Active" : "Inactive"}</td>

    <td>
        <div class="action-cell">

            <button
                class="btn"
                onclick="editUser('${user._id}')">
                Edit
            </button>

            <button
                class="btn btn-danger"
                onclick="deleteUser('${user._id}')">
                Delete
            </button>

        </div>
    </td>

`;

            usersTableBody.appendChild(row);

        });

    }

    catch(err){

        console.error(err);

        alert("Failed to load users.");

    }

}



// ==============================
// CLEAR FORM
// ==============================

function clearForm(){

    editingUserId = null;

    username.value = "";
    password.value = "";

    roleSelect.value = "";

    active.checked = true;

    saveUserBtn.textContent = "Save User";

}



// ==============================
// SAVE USER
// ==============================

saveUserBtn.addEventListener("click", async () => {

    if(username.value.trim() === ""){

        alert("Enter Username");

        return;

    }

   if (!editingUserId && password.value.trim() === "") {

    alert("Enter Password");
    return;

}

    if(roleSelect.value === ""){

        alert("Select Role");

        return;

    }

    const user = {

        username: username.value.trim(),

        password: password.value,

        role: roleSelect.value,

        active: active.checked

    };


    try{

        const url = editingUserId
            ? `${API_URL}/${editingUserId}`
            : API_URL;

        const method = editingUserId
            ? "PUT"
            : "POST";

        const res = await fetch(url,{

            method,

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(user)

        });

        const data = await res.json();

        if(!res.ok){

            alert(data.message);

            return;

        }

        alert(
            editingUserId
            ? "User Updated Successfully"
            : "User Created Successfully"
        );

        clearForm();

        loadUsers();

    }

    catch(err){

        console.error(err);

        alert("Error saving user.");

    }

});



// ==============================
// CANCEL
// ==============================

cancelBtn.addEventListener("click", () => {

    clearForm();

});



// ==============================
// EDIT USER
// ==============================

async function editUser(id) {

    try {

        const res = await fetch(API_URL);

        const users = await res.json();

        const user = users.find(u => u._id === id);

        if (!user) return;

        editingUserId = id;

        username.value = user.username;

        // Leave password empty while editing
        password.value = "";
        password.placeholder = "Leave blank to keep current password";

        roleSelect.value = user.role?._id || "";

        active.checked = user.active;

        saveUserBtn.textContent = "Update User";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

    catch (err) {

        console.error(err);

        alert("Failed to load user.");

    }

}



// ==============================
// DELETE USER
// ==============================

async function deleteUser(id) {

    const confirmDelete = confirm("Are you sure you want to delete this user?");

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

        alert("User Deleted Successfully");

        if (editingUserId === id) {

            clearForm();

        }

        loadUsers();

    }

    catch (err) {

        console.error(err);

        alert("Error deleting user.");

    }

}



// ==============================
// SEARCH USER
// ==============================

searchUser.addEventListener("keyup", function () {

    const value = this.value.toLowerCase();

    const rows = usersTableBody.querySelectorAll("tr");

    rows.forEach(row => {

        const username = row.children[0].innerText.toLowerCase();

        row.style.display = username.includes(value)
            ? ""
            : "none";

    });

});