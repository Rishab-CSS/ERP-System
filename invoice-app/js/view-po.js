if(localStorage.getItem("adminLoggedIn") !== "true"){
window.location.href = "login.html";
}

const tbody = document.querySelector("#poTable tbody");

function formatDate(date){

let d = new Date(date);

let day = String(d.getDate()).padStart(2,'0');
let month = String(d.getMonth()+1).padStart(2,'0');
let year = d.getFullYear();

return `${day}-${month}-${year}`;

}

function filterPO(type){

let pos = JSON.parse(localStorage.getItem("purchaseOrders")) || [];

tbody.innerHTML = "";

pos.forEach(po => {

let items = po.items;

// Apply filters
if(type === "pending"){
items = items.filter(i => i.pendingQty > 0);
}

if(type === "completed"){
items = items.filter(i => i.pendingQty === 0);
}

if(items.length === 0) return;

items.forEach((i,index) => {

let status = i.pendingQty === 0 ? "Completed" : "Pending";

let row = document.createElement("tr");

let poCells = "";

if(index === 0){

poCells = `
<td rowspan="${items.length}">${po.poNo}</td>

<td rowspan="${items.length}">
${formatDate(po.poDate)}
</td>

<td rowspan="${items.length}">
${po.customer}
</td>
`;

}

row.innerHTML = `

${poCells}

<td>
<div class="po-part">${i.partNo}</div>
<div class="po-desc">${i.part}</div>
</td>

<td>${i.orderedQty}</td>

<td>₹ ${Number(i.rate).toLocaleString("en-IN")}</td>

<td>₹ ${(i.orderedQty * i.rate).toLocaleString("en-IN")}</td>

<td>${i.pendingQty}</td>

<td>₹ ${(i.pendingQty * i.rate).toLocaleString("en-IN")}</td>

<td class="${status === 'Completed' ? 'po-complete' : 'po-pending'}">
${status}
</td>

${index === 0 ? `
<td rowspan="${items.length}">
<div class="po-actions">
<button onclick="editPO(${index}, '${po.poNo}')">Edit</button>
<button onclick="deletePO(${index}, '${po.poNo}')">Delete</button>
</div>
</td>
` : ""}

`;

tbody.appendChild(row);

});

});

}

filterPO("all");


// Delete PO
function deletePO(index, poNo){

if(!confirm("Are you sure you want to delete this PO?")){
return;
}

let pos = JSON.parse(localStorage.getItem("purchaseOrders")) || [];

let poIndex = pos.findIndex((p,i) => i === index && p.poNo === poNo);

if(poIndex !== -1){
pos.splice(poIndex,1);
}

localStorage.setItem("purchaseOrders", JSON.stringify(pos));

filterPO("all");

}


// Edit PO
function editPO(index, poNo){

let pos = JSON.parse(localStorage.getItem("purchaseOrders")) || [];

let po = pos.find((p,i) => i === index && p.poNo === poNo);

if(!po){
alert("PO not found");
return;
}

localStorage.setItem("editPO", JSON.stringify(po));

window.location.href = "create-po.html";

}