if(localStorage.getItem("adminLoggedIn") !== "true"){
window.location.href = "login.html";
}

const poItems = document.getElementById("poItems");
const customerSelect = document.getElementById("poCustomer");


// =======================
// LOAD CUSTOMERS
// =======================

function loadCustomers(){

let customers = JSON.parse(localStorage.getItem("customers")) || [];

customerSelect.innerHTML = "<option value=''>Select Customer...</option>";

customers.forEach(c => {

let opt = document.createElement("option");
opt.value = c.name;
opt.textContent = c.name;

customerSelect.appendChild(opt);

});

}

loadCustomers();


// =======================
// ADD ITEM ROW
// =======================

function addPOItem(){

let row = document.createElement("tr");

row.innerHTML = `

<td class="sl"></td>

<td><input type="text" class="part"></td>

<td><input type="text" class="partNo"></td>

<td><input type="text" class="hsn"></td>

<td><input type="number" class="qty"></td>

<td><input type="number" class="rate"></td>

<td>
<button onclick="this.parentElement.parentElement.remove(); renumber()">X</button>
</td>

`;

poItems.appendChild(row);

renumber();

}


// =======================
// RENUMBER ITEMS
// =======================

function renumber(){

Array.from(poItems.children).forEach((row,i)=>{

row.querySelector(".sl").innerText = i+1;

});

}


// =======================
// SAVE PURCHASE ORDER
// =======================

function savePO(){

let editData = JSON.parse(localStorage.getItem("editPO"));

let po = {

id: editData ? editData.id : Date.now(),

poNo: document.getElementById("poNo").value,
poDate: document.getElementById("poDate").value,
customer: document.getElementById("poCustomer").value,

items: []

};

Array.from(poItems.children).forEach(row=>{

let item = {

part: row.querySelector(".part").value,
partNo: row.querySelector(".partNo").value,
hsn: row.querySelector(".hsn").value,

orderedQty: Number(row.querySelector(".qty").value),
pendingQty: Number(row.querySelector(".qty").value),

rate: Number(row.querySelector(".rate").value)

};

po.items.push(item);

});

let pos = JSON.parse(localStorage.getItem("purchaseOrders")) || [];

if(editData){

pos = pos.map(p => p.id === po.id ? po : p);
localStorage.removeItem("editPO");

}else{

pos.push(po);

}

localStorage.setItem("purchaseOrders", JSON.stringify(pos));

alert("Purchase Order Saved");

window.location.href = "view-po.html";

}


// =======================
// AUTO ADD FIRST ROW
// =======================

addPOItem();


// =======================
// LOAD PO FOR EDIT
// =======================

let editPOData = JSON.parse(localStorage.getItem("editPO"));

if(editPOData){

document.getElementById("poNo").value = editPOData.poNo;
document.getElementById("poDate").value = editPOData.poDate;
document.getElementById("poCustomer").value = editPOData.customer;

poItems.innerHTML = "";

editPOData.items.forEach(item => {

addPOItem();

let row = poItems.lastElementChild;

row.querySelector(".part").value = item.part;
row.querySelector(".partNo").value = item.partNo;
row.querySelector(".hsn").value = item.hsn;
row.querySelector(".qty").value = item.orderedQty;
row.querySelector(".rate").value = item.rate;

});

}