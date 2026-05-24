const owner = "QWJkdWxsYWhfSWJuYV9SYWhtYW4=";

console.log(atob(owner));
console.log(atob("aHR0cHM6Ly9naXRodWIuY29tL0JlZWZ5U2VycGVudA=="));
console.log(atob("aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL2FpcnByYW50bw=="));

document.addEventListener("DOMContentLoaded", () => {
    const FILE_URL = atob(owner) + ".json";
    let workbookData = null;
    let moodColumnIndices = [];

    const loadingStatus = document.getElementById("loading-status");
    const tabsContainer = document.getElementById("sheet-tabs");
    const thead = document.getElementById("table-head");
    const tbody = document.getElementById("table-body");
    const table = document.getElementById("excel-table");

    // Initialize Application - Fetch Native JSON instead of parsing Excel
    async function loadJsonDatabase() {
        try {
            const response = await fetch(FILE_URL);
            if (!response.ok) throw new Error("JSON file not found");
            
            workbookData = await response.json();

            loadingStatus.innerText = "";
            buildTabs();
            
            // Render first sheet layout by default
            if (workbookData && workbookData[0]) {
                renderSheet(workbookData[0], 0);
            }

        } catch (error) {
            loadingStatus.innerText = "Error loading database. Ensure color_book.json is in the directory.";
            console.error("Error reading database payload:", error);
        }
    }

    // Build the bottom tabs navigation
    function buildTabs() {
        tabsContainer.innerHTML = "";
        workbookData.forEach((sheet, index) => {
            const btn = document.createElement("button");
            btn.className = "sheet-tab";
            if (index === 0) btn.classList.add("active");
            btn.innerText = sheet.sheetName;
            btn.onclick = () => {
                document.querySelectorAll(".sheet-tab").forEach(t => t.classList.remove("active"));
                btn.classList.add("active");
                renderSheet(sheet, index);
            };
            tabsContainer.appendChild(btn);
        });
    }

    // Main render function converting compiled JSON matrix into DOM rows
    function renderSheet(sheetData, sheetIndex) {
        thead.innerHTML = "";
        tbody.innerHTML = "";
        moodColumnIndices = [];

        // Apply structural layout tags for sheet styling selections
        table.className = `sheet-${sheetIndex + 1}`;
        
        if (!sheetData.rows || sheetData.rows.length === 0) return;

        // 1. Process and Render Headers
        sheetData.headers.forEach((rowHeaders) => {
            const tr = document.createElement("tr");
            
            rowHeaders.forEach(h => {
                const th = document.createElement("th");
                th.innerText = h.value;

                if (h.colspan > 1) th.colSpan = h.colspan;
                if (h.rowspan > 1) th.rowSpan = h.rowspan;

                // Match specific styling target indicators
                if (h.colIndex === 1 && sheetIndex < 5) {
                    th.classList.add("sl-cell");
                }

                if (h.value.toLowerCase().includes("mood")) {
                    if (!moodColumnIndices.includes(h.colIndex)) {
                        moodColumnIndices.push(h.colIndex);
                    }
                }

                th.className = "sortable";
                th.onclick = () => sortTableByColumn(h.colIndex - 1);
                
                tr.appendChild(th);
            });
            thead.appendChild(tr);
        });

        // 2. Add Filtering Row UI (Excluding layout tracking for Sheet 6)
        if (sheetIndex < 5 || sheetIndex === 6) {
            const filterTr = document.createElement("tr");
            filterTr.className = "filter-row";
            
            const totalCols = sheetData.rows[0].length;
            for (let c = 1; c <= totalCols; c++) {
                const th = document.createElement("th");
                if (c === 1) th.classList.add("sl-cell");

                // Restrict filtering access exclusively to column 2
                if (c === 2) {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.className = "filter-input";
                    input.placeholder = "Filter...";
                    input.dataset.colIndex = c - 1;
                    input.onkeyup = applyFilters;
                    th.appendChild(input);
                }
                filterTr.appendChild(th);
            }
            thead.appendChild(filterTr);
        }

        // 3. Process and Render Data Body
        sheetData.rows.forEach(rowCells => {
            const tr = document.createElement("tr");
            const rowData = [];

            // Extract text string safely from Column 5 (Index 4) for custom links text routing
            let colorName = "";
            if (rowCells[4] && rowCells[4].v) {
                colorName = rowCells[4].v.trim();
            }
            if (!colorName) colorName = "View Link";

            rowCells.forEach((cell, cIdx) => {
                const c = cIdx + 1; // 1-based column position mapping
                const td = document.createElement("td");
                const val = cell.v || "";

                rowData.push(val.toLowerCase());

                if (c === 1 && sheetIndex < 5) {
                    td.classList.add("sl-cell");
                }

                // Handle Mood background maps dynamically
                if (moodColumnIndices.includes(c) || cell.c) {
                    td.className = "mood-cell";
                    if (cell.c) {
                        td.style.backgroundColor = cell.c;
                    }
                }
                
                // Plain Text URL conversion tracking on Sheet 1 (Columns 32 & 33)
                else if (sheetIndex === 0 && (c === 32 || c === 33)) {
                    if (val.trim() !== "") {
                        const a = document.createElement("a");
                        let urlStr = val.trim();
                        a.href = urlStr.startsWith("http") ? urlStr : "https://" + urlStr;
                        a.target = "_blank";
                        a.className = "excel-link";
                        a.innerText = colorName; 
                        td.appendChild(a);
                    } else {
                        td.innerText = "";
                    }
                }
                // Handle Native Hyperlinks embedded from the initial file mapping ('l' tag)
                else if (cell.l) {
                    const a = document.createElement("a");
                    a.href = cell.l;
                    a.target = "_blank";
                    a.className = "excel-link";
                    a.innerText = val || cell.l;
                    td.appendChild(a);
                }
                else {
                    td.innerText = val;
                }

                tr.appendChild(td);
            });
            
            tr.dataset.rowData = JSON.stringify(rowData);
            tbody.appendChild(tr);
        });
    }

    // Filtering system lookup
    function applyFilters() {
        const inputs = document.querySelectorAll(".filter-input");
        const filters = [];
        inputs.forEach(input => {
            if (input.value.trim() !== "") {
                filters.push({ index: parseInt(input.dataset.colIndex), term: input.value.trim().toLowerCase() });
            }
        });

        const rows = Array.from(tbody.getElementsByTagName("tr"));
        rows.forEach(tr => {
            const data = JSON.parse(tr.dataset.rowData);
            let show = true;
            for (let f of filters) {
                if (data[f.index] === undefined || !data[f.index].includes(f.term)) {
                    show = false;
                    break;
                }
            }
            tr.style.display = show ? "" : "none";
        });
    }

    // Natural Sorting tracking
    let currentSort = { col: -1, asc: true };
    function sortTableByColumn(colIndex) {
        const rows = Array.from(tbody.getElementsByTagName("tr"));
        const asc = currentSort.col === colIndex ? !currentSort.asc : true;
        currentSort = { col: colIndex, asc: asc };

        rows.sort((a, b) => {
            const aData = JSON.parse(a.dataset.rowData)[colIndex] || "";
            const bData = JSON.parse(b.dataset.rowData)[colIndex] || "";
            return aData.localeCompare(bData, undefined, { numeric: true, sensitivity: 'base' }) * (asc ? 1 : -1);
        });

        tbody.innerHTML = "";
        rows.forEach(row => tbody.appendChild(row));
    }

    // Run Engine
    loadJsonDatabase();
});
