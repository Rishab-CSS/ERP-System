fetch("navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;

    // ✅ NOW navbar is loaded → safe to modify
    const role = localStorage.getItem("role");

    if (role === "qc") {

      document.getElementById("navInvoice")?.closest(".nav-item")?.remove();
      document.getElementById("navPurchase")?.closest(".nav-item")?.remove();
      document.getElementById("navPayment")?.closest(".nav-item")?.remove();
      document.getElementById("navISO")?.closest(".nav-item")?.remove();
      document.getElementById("navDashboard")?.closest(".nav-item")?.remove();

    }

  });


  function toggleMenu() {
    const nav = document.querySelector(".navbar");
    nav.classList.toggle("active");
}


document.addEventListener("click", function (e) {

    if (window.innerWidth > 768) return;

    const link = e.target.closest("a");
    const item = e.target.closest(".nav-item, .dropdown-submenu");

    // ✅ Allow logout BEFORE anything blocks it
    if (link && link.id === "navLogout") {
        return;
    }

    // Click outside → close all
    if (!item) {
        document.querySelectorAll(".nav-item, .dropdown-submenu").forEach(el => {
            el.classList.remove("active");
        });
        return;
    }

    // 🔥 NOW block other handlers
    e.stopImmediatePropagation();

    // FINAL LINK → allow navigation
    if (link && !link.parentElement.querySelector(":scope > .dropdown")) {
        return;
    }

    // HAS SUBMENU → toggle
    if (link && link.parentElement.querySelector(":scope > .dropdown")) {
        e.preventDefault();
        link.parentElement.classList.toggle("active");
    }

}, true);