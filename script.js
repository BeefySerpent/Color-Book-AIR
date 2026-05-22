document.addEventListener("DOMContentLoaded", () => {
    const FILE_URL = "color_book.xlsx";
    let workbook = null;
    let activeSheetData = [];
    let moodColumnIndices = [];

    const loadingStatus = document.getElementById("loading-status");
    const tabsContainer = document.getElementById("sheet-tabs");
    const thead = document.getElementById("table-head");
    const tbody = document.getElementById("table-body");
    const table = document.getElementById("excel-table");

    // Start Application
    async function loadExcelFile() {
        try {
            const response = await fetch(FILE_URL);
            if (!response.ok) throw new Error("File not found");
            const arrayBuffer = await response.arrayBuffer();

            workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            loadingStatus.innerText = "";
            buildTabs();
            
            // Loading first sheet by default
            const firstSheet = workbook.worksheets[0];
            if (firstSheet) renderSheet(firstSheet, 0);

        } catch (error) {
            loadingStatus.innerText = "Error loading database. Make sure you are running a local server.";
            console.error("Error reading Excel:", error);
        }
    }

    // Excel sheet selection tab
    function buildTabs() {
        tabsContainer.innerHTML = "";
        workbook.worksheets.forEach((sheet, index) => {
            const btn = document.createElement("button");
            btn.className = "sheet-tab";
            if (index === 0) btn.classList.add("active");
            btn.innerText = sheet.name;
            btn.onclick = () => {
                document.querySelectorAll(".sheet-tab").forEach(t => t.classList.remove("active"));
                btn.classList.add("active");
                renderSheet(sheet, index);
            };
            tabsContainer.appendChild(btn);
        });
    }

    // excel rgb fill to hex fill
    function argbToHex(argb) {
        if (!argb) return "";
        if (argb.length === 8) {
            return "#" + argb.substring(2);
        }
        return "#" + argb;
    }

    // Main render function 
    function renderSheet(sheet, sheetIndex) {
        thead.innerHTML = "";
        tbody.innerHTML = "";
        activeSheetData = [];
        moodColumnIndices = [];

        table.className = `sheet-${sheetIndex + 1}`;

        const headerRowCount = Math.min(sheet.rowCount, 2); 
        let maxCol = sheet.columnCount;
        
        // 1. Headers
        for (let r = 1; r <= headerRowCount; r++) {
            const tr = document.createElement("tr");
            const row = sheet.getRow(r);
            
            for (let c = 1; c <= maxCol; c++) {
                if (isCellMergedDependent(sheet, r, c)) continue;

                const cell = row.getCell(c);
                const th = document.createElement("th");
                
                let cellValue = cell.value ? cell.value.toString() : "";
                if (cell.value && cell.value.richText) {
                    cellValue = cell.value.richText.map(rt => rt.text).join("");
                }
                
                th.innerText = cellValue;

                // SL column sheets 1 to 5
                if (c === 1 && sheetIndex < 5) {
                    th.classList.add("sl-cell");
                }

                if (cellValue.toLowerCase().includes("mood")) {
                    moodColumnIndices.push(c);
                }

                const mergeData = getMergeData(sheet, r, c);
                if (mergeData) {
                    if (mergeData.colspan > 1) th.colSpan = mergeData.colspan;
                    if (mergeData.rowspan > 1) th.rowSpan = mergeData.rowspan;
                }

                th.className = "sortable";
                th.onclick = () => sortTableByColumn(c - 1);
                
                tr.appendChild(th);
            }
            thead.appendChild(tr);
        }

        // 2. Filtering Row
        if (sheetIndex < 5) {
            const filterTr = document.createElement("tr");
            filterTr.className = "filter-row";
            
            for (let c = 1; c <= maxCol; c++) {
                const th = document.createElement("th");
                
                if (c === 1) th.classList.add("sl-cell");

                //  filtering access to column 2
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

        // 3. Render Data tbody
        for (let r = headerRowCount + 1; r <= sheet.rowCount; r++) {
            const row = sheet.getRow(r);
            if (!row.hasValues) continue;
            
            const tr = document.createElement("tr");
            const rowData = [];

            // Extract the Color Name (from column 5) to use as link text later
            let colorNameCell = row.getCell(5).value;
            let colorName = "";
            if (colorNameCell !== null) {
                if (typeof colorNameCell === "object") {
                    colorName = colorNameCell.richText ? colorNameCell.richText.map(rt => rt.text).join("") : (colorNameCell.result || colorNameCell.text || "");
                } else {
                    colorName = colorNameCell.toString();
                }
            }
            // Fallback text if Color Name is completely blank
            colorName = colorName.trim() || "View Link";

            for (let c = 1; c <= maxCol; c++) {
                const cell = row.getCell(c);
                const td = document.createElement("td");
                
                let val = cell.value !== null ? cell.value : "";
                
                if (val && typeof val === "object") {
                    if (val.hyperlink) {
                        val = val.text || val.hyperlink;
                    } else if (val.result) {
                        val = val.result;
                    } else if (val.richText) {
                        val = val.richText.map(rt => rt.text).join("");
                    }
                }

                rowData.push(val.toString().toLowerCase());

                // Lock down width on the SL Column
                if (c === 1 && sheetIndex < 5) {
                    td.classList.add("sl-cell");
                }

                if (moodColumnIndices.includes(c)) {
                    td.className = "mood-cell";
                    if (cell.fill && cell.fill.fgColor && cell.fill.fgColor.argb) {
                        td.style.backgroundColor = argbToHex(cell.fill.fgColor.argb);
                    }
                } 
                // Custom Link Logic for Sheet 1 (Index 0), Columns 26 and 27
                else if (sheetIndex === 0 && (c === 26 || c === 27)) {
                    let urlStr = val ? val.toString().trim() : "";
                    if (urlStr !== "") {
                        const a = document.createElement("a");
                        // Ensure it has a valid protocol so the browser doesn't treat it as a local file path
                        a.href = urlStr.startsWith("http") ? urlStr : "https://" + urlStr;
                        a.target = "_blank";
                        a.className = "excel-link";
                        a.innerText = colorName; // Use the Color Name from Col 5
                        td.appendChild(a);
                    } else {
                        td.innerText = "";
                    }
                }
                // Native Excel Hyperlinks
                else if (cell.hyperlink) {
                    const a = document.createElement("a");
                    a.href = cell.hyperlink;
                    a.target = "_blank";
                    a.className = "excel-link";
                    a.innerText = val || cell.hyperlink;
                    td.appendChild(a);
                }
                else {
                    td.innerText = val;
                }

                tr.appendChild(td);
            }
            
            tr.dataset.rowData = JSON.stringify(rowData);
            tbody.appendChild(tr);
        }
    }

    function getMergeData(sheet, row, col) {
        const address = sheet.getRow(row).getCell(col).address;
        if (!sheet.model.merges) return null;
        for (const merge of sheet.model.merges) {
            const [start, end] = merge.split(":");
            if (address === start) {
                const startCell = sheet.getCell(start);
                const endCell = sheet.getCell(end);
                return {
                    colspan: endCell.col - startCell.col + 1,
                    rowspan: endCell.row - startCell.row + 1
                };
            }
        }
        return null;
    }

    function isCellMergedDependent(sheet, row, col) {
        const cell = sheet.getRow(row).getCell(col);
        return cell.isMerged && cell.address !== cell.master.address;
    }

    // Filter Logic
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

    // Sorting Logic
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

    loadExcelFile();
});