// =========================
// AUTH CHECK
// =========================
const role = localStorage.getItem("role");

if(!role){
  window.location.href = "login.html";
}

const API_URL = "https://erp-system-303n.onrender.com/api/production";


window.addEventListener("focus", loadProductions);

function getProductionViewStatus(prod) {
  if (!prod.processes || prod.processes.length === 0) {
    return "Not Started";
  }

  const processes = prod.processes;
  let lastCompletedProcess = null;

  for (let i = 0; i < processes.length; i++) {
    const proc = processes[i];

    if (proc.startDate && !proc.endDate) {
      return `${proc.processName} Started`;
    }

    if (!proc.startDate) {
      if (i === 0) {
        return "Not Started";
      }
      const prev = processes[i - 1];
      if (prev.endDate) {
        return `${prev.processName} Ended`;
      }
      if (prev.startDate && !prev.endDate) {
        return `${prev.processName} Started`;
      }
      return "Not Started";
    }

    if (proc.startDate && proc.endDate) {
      lastCompletedProcess = proc;
    }
  }

  const lastProcess = processes[processes.length - 1];
  if (lastProcess.processName === "Inspection & Dispatch" && lastProcess.endDate) {
    return "Completed";
  }

  if (lastCompletedProcess) {
    return `${lastCompletedProcess.processName} Ended`;
  }

  return "Not Started";
}

// =========================
// LOAD ALL PRODUCTS
// =========================
async function loadProductions() {

  const res = await fetch(API_URL);
  const data = await res.json();


  const rcRes = await fetch("https://erp-system-303n.onrender.com/api/route-cards");
  const routeCards = await rcRes.json();

  const table = document.getElementById("productionList");
  table.innerHTML = "";

data.forEach(prod => {
  const statusText = getProductionViewStatus(prod);
  const existingRC = routeCards.find(rc => rc.productionId === prod._id);

  table.innerHTML += `
    <tr>
      <td>${prod.productName}</td>
      <td>${prod.totalQty}</td>
      <td>${statusText}</td>
      <td>
        <button onclick="openProduction('${prod._id}')">Open</button>
${
existingRC
    ? `<button class="btn btn-green" disabled>
          Route Card Created: ${existingRC.rcNo}
       </button>`
    : `<button
          ${statusText !== "Completed" ? "class=\"paid-button\" disabled" : ""}
          onclick="createRouteCard('${prod._id}', '${prod.productName}', '${prod.totalQty}')"
       >
          Create Route Card (${prod.routeCardNo})
       </button>`

}
        <button onclick="deleteProduction('${prod._id}', '${prod.routeCardNo}')">Delete</button>
      </td>
    </tr>
  `;
});

  applyEmptyState();
}


loadProductions();

// =========================
// OPEN PRODUCTION
// =========================
function openProduction(id) {
  console.log("Opening ID:", id);

  window.location.href = `production-tracking.html?id=${id}`;
}


async function deleteProduction(id, routeCardNo) {

  console.log(id, routeCardNo);

  if (!confirm("Delete this production?")) return;

  let cancelRouteCard = false;

  if (routeCardNo) {
    cancelRouteCard = confirm(
      `A Route Card Number ${routeCardNo} has been reserved.\n\nDo you want to cancel this Route Card Number?`
    );
  }

  const res = await fetch(
    `${API_URL}/${id}?cancelRouteCard=${cancelRouteCard}`,
    {
      method: "DELETE"
    }
  );

  if (!res.ok) {
    alert("Failed to delete production.");
    return;
  }

  alert("Deleted!");
  loadProductions();
}



let currentRCData = null;

async function createRouteCard(prodId, productName, qty) {

  currentRCData = {
    prodId,
    productName,
    qty
  };

  document.getElementById("rcModal").style.display = "flex";

 
}















async function submitRC(){


  const invoiceNo = document.getElementById("rcInvoiceNo").value;



  if(!invoiceNo){
    alert("Enter Invoice No");
    return;
  }

  try {

    // =========================
    // GET PRODUCT
    // =========================
    const prodRes = await fetch("https://erp-system-303n.onrender.com/api/products");
    const products = await prodRes.json();

const product = products.find(
    p => p.partName === currentRCData.productName
);

    if(!product){
      alert("Product not found");
      return;
    }

    // =========================
    // ✅ GET FULL PRODUCTION DATA (IMPORTANT FIX)
    // =========================
    const productionRes = await fetch(`https://erp-system-303n.onrender.com/api/production/${currentRCData.prodId}`);
    const productionData = await productionRes.json();

    const customer = productionData.customer;
const customerId = productionData.customerId;

    // =========================
    // MAP PROCESSES (FULL DATA)
    // =========================
    const processes = productionData.processes.map(p => ({
      process: p.processName,
      machine: p.machineOrVendor || "",
      startDate: p.startDate || "",
      endDate: p.endDate || "",
      producedQty: p.producedQty || 0,
      acceptedQty: p.acceptedQty || 0,
      reworkQty: 0,
      rejectedQty: p.rejectedQty || 0,
      operator: p.operator || ""
    }));

    // =========================
    // GENERATE RC NO
    // =========================
    const rcRes = await fetch("https://erp-system-303n.onrender.com/api/route-cards");
    const rcData = await rcRes.json();

    let max = 0;
    rcData.forEach(rc => {
      let num = parseInt(rc.rcNo?.split("/")[2]);
      if(num > max) max = num;
    });

    const rcNo = "RPIC/RC/" + String(max+1).padStart(2,"0");

    // =========================
    // CREATE ROUTE CARD
    // =========================
    await fetch("https://erp-system-303n.onrender.com/api/route-cards/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
body: JSON.stringify({
    rcNo,

    productionId: currentRCData.prodId,

    customer,
    customerId,

    product: currentRCData.productName,
    productId: product._id,

    partNumber: productionData.partNumber,
    qty: productionData.totalQty,
    poNo: productionData.poNo || "",

    invoiceNo,
    processes
})
    });

alert("Route Card Created!");

closeRCModal();      // close popup
loadProductions();   // refresh table

  } catch (err) {
    console.error(err);
    alert("Error creating route card");
  }


console.log("SENDING DATA:", {
    partNumber: productionData.partNumber,
    poNo: productionData.poNo,
    invoiceNo
});

}



function closeRCModal(){
  document.getElementById("rcModal").style.display = "none";
}