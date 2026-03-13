if(localStorage.getItem("adminLoggedIn") !== "true"){
window.location.href = "login.html";
}

const processRows = document.getElementById("processRows");

let editIndex = -1;


// =======================
// GET PRODUCTS
// =======================

function getProducts(){
return JSON.parse(localStorage.getItem("products")) || [];
}


// =======================
// ADD PROCESS ROW
// =======================

function addProcessRow(){

let row = document.createElement("tr");

row.innerHTML = `

<td class="sl"></td>

<td>
<input type="text" class="processName">
</td>

<td>
<button onclick="this.parentElement.parentElement.remove(); renumber()">X</button>
</td>

`;

processRows.appendChild(row);

renumber();

}


// =======================
// RENUMBER ROWS
// =======================

function renumber(){

Array.from(processRows.children).forEach((row,i)=>{

row.querySelector(".sl").innerText = i+1;

});

}


// =======================
// SAVE PRODUCT
// =======================

function saveProduct(){

let productName = document.getElementById("productName").value.trim();

if(!productName){
alert("Enter product name");
return;
}

let processes = [];

Array.from(processRows.children).forEach(row=>{

let proc = row.querySelector(".processName").value.trim();

if(proc){
processes.push(proc);
}

});

let products = getProducts();

if(editIndex === -1){

products.push({
productName:productName,
processes:processes
});

}else{

products[editIndex] = {
productName:productName,
processes:processes
};

editIndex = -1;

}

localStorage.setItem("products",JSON.stringify(products));

alert("Product Saved");

clearForm();

loadProducts();

}


// =======================
// LOAD PRODUCTS TABLE
// =======================

function loadProducts(){

let products = getProducts();

let table = document.getElementById("productTable");

table.innerHTML = "";

products.forEach((p,index)=>{

let processList = "<ul>";

p.processes.forEach(proc=>{
processList += `<li>${proc}</li>`;
});

processList += "</ul>";

table.innerHTML += `

<tr>

<td>${p.productName}</td>

<td>${processList}</td>

<td>

<button onclick="editProduct(${index})">Edit</button>

<button onclick="deleteProduct(${index})">Delete</button>

</td>

</tr>

`;

});

}


// =======================
// EDIT PRODUCT
// =======================

function editProduct(index){

let products = getProducts();

let product = products[index];

document.getElementById("productName").value = product.productName;

processRows.innerHTML = "";

product.processes.forEach(proc=>{

addProcessRow();

let row = processRows.lastElementChild;

row.querySelector(".processName").value = proc;

});

editIndex = index;

}


// =======================
// DELETE PRODUCT
// =======================

function deleteProduct(index){

if(!confirm("Delete this product?")) return;

let products = getProducts();

products.splice(index,1);

localStorage.setItem("products",JSON.stringify(products));

loadProducts();

}


// =======================
// CLEAR FORM
// =======================

function clearForm(){

document.getElementById("productName").value = "";

processRows.innerHTML = "";

addProcessRow();

}


// =======================
// INIT
// =======================

addProcessRow();

loadProducts();