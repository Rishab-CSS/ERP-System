function applyEmptyState() {
  const tbodies = document.querySelectorAll('tbody');
  tbodies.forEach(tbody => {
    if (tbody.children.length === 0) {
      const table = tbody.closest('table');
      let colspanCount = 1;

      if (table) {
        const headerCells = table.querySelectorAll('thead th');
        if (headerCells.length > 0) {
          colspanCount = headerCells.length;
        } else {
          // If no thead th, count th in the table
          const firstRowCells = table.querySelectorAll('tr:first-child th, tr:first-child td');
          if (firstRowCells.length > 0) {
            // Count colspans correctly just in case
            colspanCount = Array.from(firstRowCells).reduce((acc, cell) => acc + (parseInt(cell.getAttribute('colspan')) || 1), 0);
          }
        }
      }

      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = colspanCount;
      td.textContent = 'No contents to display';
      td.style.textAlign = 'center';
      td.style.padding = '20px';

      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  });
}
