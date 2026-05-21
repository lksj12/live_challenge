class SpreadsheetData {
    constructor(rowCount = 9, colCount = 9) {
        this.MIN_ROW_COUNT = 1;
        this.MIN_COL_COUNT = 1;

        this.rowCount = rowCount;
        this.colCount = colCount;
        this.gridData = this.createEmptyGridData(rowCount, colCount);
    }

    createEmptyGridData(rows, cols) {
        const data = [];

        for (let row = 0; row < rows; row++) {
            const rowData = [];

            for (let col = 0; col < cols; col++) {
                rowData.push("");
            }

            data.push(rowData);
        }

        return data;
    }

    setState(state) {
        this.rowCount = state.rowCount || 9;
        this.colCount = state.colCount || 9;
        this.gridData = state.gridData || this.createEmptyGridData(this.rowCount, this.colCount);

        this.normalizeGridData();
    }

    getState() {
        return {
            rowCount: this.rowCount,
            colCount: this.colCount,
            gridData: this.gridData
        };
    }

    normalizeGridData() {
        for (let row = 0; row < this.rowCount; row++) {
            if (!this.gridData[row]) {
                this.gridData[row] = [];
            }

            for (let col = 0; col < this.colCount; col++) {
                if (this.gridData[row][col] === undefined) {
                    this.gridData[row][col] = "";
                }
            }

            this.gridData[row] = this.gridData[row].slice(0, this.colCount);
        }

        this.gridData = this.gridData.slice(0, this.rowCount);
    }

    getColumnName(index) {
        let columnName = "";
        let number = index + 1;

        while (number > 0) {
            const remainder = (number - 1) % 26;

            columnName = String.fromCharCode(65 + remainder) + columnName;
            number = Math.floor((number - 1) / 26);
        }

        return columnName;
    }

    getCellValue(row, col) {
        if (this.gridData[row] && this.gridData[row][col] !== undefined) {
            return this.gridData[row][col];
        }

        return "";
    }

    setCellValue(row, col, value) {
        this.gridData[row][col] = value;
    }

    collectGridData() {
        const data = [];

        for (let row = 0; row < this.rowCount; row++) {
            const rowData = [];

            for (let col = 0; col < this.colCount; col++) {
                rowData.push(this.getCellValue(row, col));
            }

            data.push(rowData);
        }

        return data;
    }

    addRow() {
        const newRow = [];

        for (let col = 0; col < this.colCount; col++) {
            newRow.push("");
        }

        this.gridData.push(newRow);
        this.rowCount++;
    }

    deleteRow(rowIndex) {
        if (this.rowCount <= this.MIN_ROW_COUNT) {
            alert("최소 1개의 행은 유지해야 합니다.");
            return false;
        }

        this.gridData.splice(rowIndex, 1);
        this.rowCount--;

        return true;
    }

    addColumn() {
        for (let row = 0; row < this.rowCount; row++) {
            this.gridData[row].push("");
        }

        this.colCount++;
    }

    deleteColumn(colIndex) {
        if (this.colCount <= this.MIN_COL_COUNT) {
            alert("최소 1개의 열은 유지해야 합니다.");
            return false;
        }

        for (let row = 0; row < this.rowCount; row++) {
            this.gridData[row].splice(colIndex, 1);
        }

        this.colCount--;

        return true;
    }
}

class StorageManager {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    save(state) {
        localStorage.setItem(this.storageKey, JSON.stringify(state));
    }

    load() {
        const savedState = localStorage.getItem(this.storageKey);

        if (!savedState) {
            return null;
        }

        try {
            return JSON.parse(savedState);
        } catch (error) {
            console.error("localStorage 데이터를 불러오는 중 오류가 발생했습니다.", error);
            return null;
        }
    }
}

class SelectionManager {
    constructor(cellPositionElement, spreadsheetData) {
        this.cellPositionElement = cellPositionElement;
        this.spreadsheetData = spreadsheetData;

        this.selectedRow = null;
        this.selectedCol = null;
    }

    updateFocusedCell(row, col) {
        this.selectedRow = row;
        this.selectedCol = col;

        const columnName = this.spreadsheetData.getColumnName(col);
        const rowNumber = row + 1;

        this.cellPositionElement.textContent = `Cell: ${columnName}${rowNumber}`;
    }

    highlightHeaders(row, col) {
        this.removePreviousHighlights();

        const currentColumnHeader = document.querySelector(
            `.column-header[data-col="${col}"]`
        );

        const currentRowHeader = document.querySelector(
            `.row-header[data-row="${row}"]`
        );

        const currentCell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

        if (currentColumnHeader) {
            currentColumnHeader.classList.add("highlight-header");
        }

        if (currentRowHeader) {
            currentRowHeader.classList.add("highlight-header");
        }

        if (currentCell) {
            currentCell.classList.add("selected-cell");
        }
    }

    removePreviousHighlights() {
        const highlightedHeaders = document.querySelectorAll(".highlight-header");

        highlightedHeaders.forEach((header) => {
            header.classList.remove("highlight-header");
        });

        const selectedCells = document.querySelectorAll(".selected-cell");

        selectedCells.forEach((cell) => {
            cell.classList.remove("selected-cell");
        });
    }

    restoreSelection(rowCount, colCount) {
        if (this.selectedRow === null || this.selectedCol === null) {
            this.clearSelection();
            return;
        }

        if (this.selectedRow < rowCount && this.selectedCol < colCount) {
            this.updateFocusedCell(this.selectedRow, this.selectedCol);
            this.highlightHeaders(this.selectedRow, this.selectedCol);
        } else {
            this.clearSelection();
        }
    }

    clearSelection() {
        this.selectedRow = null;
        this.selectedCol = null;
        this.cellPositionElement.textContent = "Cell: -";
        this.removePreviousHighlights();
    }

    getSelectedRow(defaultRow) {
        if (this.selectedRow !== null) {
            return this.selectedRow;
        }

        return defaultRow;
    }

    getSelectedCol(defaultCol) {
        if (this.selectedCol !== null) {
            return this.selectedCol;
        }

        return defaultCol;
    }
}

class GridRenderer {
    constructor(spreadsheetElement, spreadsheetData, selectionManager, onCellInput) {
        this.spreadsheetElement = spreadsheetElement;
        this.spreadsheetData = spreadsheetData;
        this.selectionManager = selectionManager;
        this.onCellInput = onCellInput;
    }

    render() {
        this.spreadsheetElement.innerHTML = "";

        this.spreadsheetElement.style.gridTemplateColumns = `50px repeat(${this.spreadsheetData.colCount}, 90px)`;
        this.spreadsheetElement.style.gridTemplateRows = `36px repeat(${this.spreadsheetData.rowCount}, 40px)`;

        this.createCornerHeader();
        this.createColumnHeaders();
        this.createRowsAndCells();

        this.selectionManager.restoreSelection(
            this.spreadsheetData.rowCount,
            this.spreadsheetData.colCount
        );
    }

    createCornerHeader() {
        const cornerHeader = document.createElement("div");

        cornerHeader.classList.add("header", "corner-header");
        this.spreadsheetElement.appendChild(cornerHeader);
    }

    createColumnHeaders() {
        for (let col = 0; col < this.spreadsheetData.colCount; col++) {
            const columnHeader = document.createElement("div");

            columnHeader.textContent = this.spreadsheetData.getColumnName(col);
            columnHeader.classList.add("header", "column-header");
            columnHeader.dataset.col = col;

            this.spreadsheetElement.appendChild(columnHeader);
        }
    }

    createRowsAndCells() {
        for (let row = 0; row < this.spreadsheetData.rowCount; row++) {
            this.createRowHeader(row);

            for (let col = 0; col < this.spreadsheetData.colCount; col++) {
                this.createCell(row, col);
            }
        }
    }

    createRowHeader(row) {
        const rowHeader = document.createElement("div");

        rowHeader.textContent = row + 1;
        rowHeader.classList.add("header", "row-header");
        rowHeader.dataset.row = row;

        this.spreadsheetElement.appendChild(rowHeader);
    }

    createCell(row, col) {
        const cell = document.createElement("input");

        cell.type = "text";
        cell.classList.add("cell");
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.value = this.spreadsheetData.getCellValue(row, col);

        cell.addEventListener("focus", () => {
            this.selectionManager.updateFocusedCell(row, col);
            this.selectionManager.highlightHeaders(row, col);
        });

        cell.addEventListener("click", () => {
            this.selectionManager.updateFocusedCell(row, col);
            this.selectionManager.highlightHeaders(row, col);
        });

        cell.addEventListener("input", () => {
            this.spreadsheetData.setCellValue(row, col, cell.value);
            this.selectionManager.updateFocusedCell(row, col);
            this.onCellInput();
        });

        this.spreadsheetElement.appendChild(cell);
    }
}

class SpreadsheetExporter {
    async export(data) {
        if (window.showSaveFilePicker) {
            await this.exportWithSaveFilePicker(data);
        } else {
            alert("현재 브라우저는 로컬 저장 창을 지원하지 않습니다. 기본 xlsx 파일로 다운로드합니다.");
            this.exportAsXLSXDownload(data, "mini-spreadsheet.xlsx");
        }
    }

    async exportWithSaveFilePicker(data) {
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: "mini-spreadsheet.xlsx",
                types: [
                    {
                        description: "Excel Workbook (*.xlsx)",
                        accept: {
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
                                ".xlsx"
                            ]
                        }
                    },
                    {
                        description: "CSV File (*.csv)",
                        accept: {
                            "text/csv": [
                                ".csv"
                            ]
                        }
                    }
                ]
            });

            const file = await fileHandle.getFile();
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith(".csv")) {
                await this.saveCSVFile(fileHandle, data);
            } else if (fileName.endsWith(".xlsx")) {
                await this.saveXLSXFile(fileHandle, data);
            } else {
                alert("파일 확장자는 .xlsx 또는 .csv로 저장해야 합니다.");
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error(error);
                alert("파일 저장 중 오류가 발생했습니다.");
            }
        }
    }

    async saveXLSXFile(fileHandle, data) {
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        const workbookArrayBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const writable = await fileHandle.createWritable();

        await writable.write(workbookArrayBuffer);
        await writable.close();
    }

    async saveCSVFile(fileHandle, data) {
        const worksheet = XLSX.utils.aoa_to_sheet(data);

        const csvText = XLSX.utils.sheet_to_csv(worksheet, {
            blankrows: true
        });

        const csvBlob = new Blob(["\uFEFF" + csvText], {
            type: "text/csv;charset=utf-8;"
        });

        const writable = await fileHandle.createWritable();

        await writable.write(csvBlob);
        await writable.close();
    }

    exportAsXLSXDownload(data, fileName) {
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        XLSX.writeFile(workbook, fileName);
    }
}

class MiniSpreadsheetApp {
    constructor() {
        this.STORAGE_KEY = "miniSpreadsheetState";

        this.spreadsheetElement = document.getElementById("spreadsheet");
        this.cellPositionElement = document.getElementById("cell-position");

        this.addRowButton = document.getElementById("add-row-button");
        this.deleteRowButton = document.getElementById("delete-row-button");
        this.addColumnButton = document.getElementById("add-column-button");
        this.deleteColumnButton = document.getElementById("delete-column-button");
        this.exportButton = document.getElementById("export-button");

        this.spreadsheetData = new SpreadsheetData();
        this.storageManager = new StorageManager(this.STORAGE_KEY);
        this.selectionManager = new SelectionManager(
            this.cellPositionElement,
            this.spreadsheetData
        );
        this.exporter = new SpreadsheetExporter();

        this.gridRenderer = new GridRenderer(
            this.spreadsheetElement,
            this.spreadsheetData,
            this.selectionManager,
            () => {
                this.saveState();
            }
        );

        this.init();
    }

    init() {
        this.loadState();
        this.bindButtonEvents();
        this.gridRenderer.render();
    }

    loadState() {
        const savedState = this.storageManager.load();

        if (savedState) {
            this.spreadsheetData.setState(savedState);
        }
    }

    saveState() {
        this.storageManager.save(this.spreadsheetData.getState());
    }

    bindButtonEvents() {
        this.addRowButton.addEventListener("click", () => {
            this.addRow();
        });

        this.deleteRowButton.addEventListener("click", () => {
            this.deleteRow();
        });

        this.addColumnButton.addEventListener("click", () => {
            this.addColumn();
        });

        this.deleteColumnButton.addEventListener("click", () => {
            this.deleteColumn();
        });

        this.exportButton.addEventListener("click", () => {
            this.exportSpreadsheet();
        });
    }

    addRow() {
        this.spreadsheetData.addRow();
        this.saveState();
        this.gridRenderer.render();
    }

    deleteRow() {
        const rowToDelete = this.selectionManager.getSelectedRow(
            this.spreadsheetData.rowCount - 1
        );

        const isDeleted = this.spreadsheetData.deleteRow(rowToDelete);

        if (!isDeleted) {
            return;
        }

        this.selectionManager.clearSelection();
        this.saveState();
        this.gridRenderer.render();
    }

    addColumn() {
        this.spreadsheetData.addColumn();
        this.saveState();
        this.gridRenderer.render();
    }

    deleteColumn() {
        const colToDelete = this.selectionManager.getSelectedCol(
            this.spreadsheetData.colCount - 1
        );

        const isDeleted = this.spreadsheetData.deleteColumn(colToDelete);

        if (!isDeleted) {
            return;
        }

        this.selectionManager.clearSelection();
        this.saveState();
        this.gridRenderer.render();
    }

    async exportSpreadsheet() {
        const data = this.spreadsheetData.collectGridData();

        await this.exporter.export(data);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new MiniSpreadsheetApp();
});


//Without Class
// const STORAGE_KEY = "miniSpreadsheetState";

// const MIN_ROW_COUNT = 1;
// const MIN_COL_COUNT = 1;

// let rowCount = 9;
// let colCount = 9;
// let gridData = [];

// let selectedRow = null;
// let selectedCol = null;

// const spreadsheet = document.getElementById("spreadsheet");
// const cellPosition = document.getElementById("cell-position");

// const addRowButton = document.getElementById("add-row-button");
// const deleteRowButton = document.getElementById("delete-row-button");
// const addColumnButton = document.getElementById("add-column-button");
// const deleteColumnButton = document.getElementById("delete-column-button");
// const exportButton = document.getElementById("export-button");

// /**
//  * 숫자 index를 스프레드시트 열 이름으로 변환합니다.
//  *
//  * 예:
//  * 0  -> A
//  * 8  -> I
//  * 9  -> J
//  * 25 -> Z
//  * 26 -> AA
//  */
// function getColumnName(index) {
//     let columnName = "";
//     let number = index + 1;

//     while (number > 0) {
//         const remainder = (number - 1) % 26;

//         columnName = String.fromCharCode(65 + remainder) + columnName;
//         number = Math.floor((number - 1) / 26);
//     }

//     return columnName;
// }

// /**
//  * 비어 있는 2차원 배열을 생성합니다.
//  */
// function createEmptyGridData(rows, cols) {
//     const data = [];

//     for (let row = 0; row < rows; row++) {
//         const rowData = [];

//         for (let col = 0; col < cols; col++) {
//             rowData.push("");
//         }

//         data.push(rowData);
//     }

//     return data;
// }

// /**
//  * localStorage에서 저장된 스프레드시트 상태를 불러옵니다.
//  * 저장된 값이 없으면 기본 9 x 9 데이터를 생성합니다.
//  */
// function loadStateFromLocalStorage() {
//     const savedState = localStorage.getItem(STORAGE_KEY);

//     if (!savedState) {
//         gridData = createEmptyGridData(rowCount, colCount);
//         return;
//     }

//     try {
//         const state = JSON.parse(savedState);

//         rowCount = state.rowCount || 9;
//         colCount = state.colCount || 9;
//         gridData = state.gridData || createEmptyGridData(rowCount, colCount);

//         normalizeGridData();
//     } catch (error) {
//         rowCount = 9;
//         colCount = 9;
//         gridData = createEmptyGridData(rowCount, colCount);
//     }
// }

// /**
//  * 현재 스프레드시트 상태를 localStorage에 저장합니다.
//  * 새로고침 후에도 셀 값과 행/열 개수가 유지됩니다.
//  */
// function saveStateToLocalStorage() {
//     const state = {
//         rowCount: rowCount,
//         colCount: colCount,
//         gridData: gridData
//     };

//     localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
// }

// /**
//  * rowCount, colCount와 gridData 크기가 서로 맞도록 정리합니다.
//  */
// function normalizeGridData() {
//     for (let row = 0; row < rowCount; row++) {
//         if (!gridData[row]) {
//             gridData[row] = [];
//         }

//         for (let col = 0; col < colCount; col++) {
//             if (gridData[row][col] === undefined) {
//                 gridData[row][col] = "";
//             }
//         }

//         gridData[row] = gridData[row].slice(0, colCount);
//     }

//     gridData = gridData.slice(0, rowCount);
// }

// /**
//  * createGrid()
//  * 스프레드시트 그리드를 동적으로 생성합니다.
//  * 행/열 추가 또는 삭제 후에도 이 함수를 다시 호출해서 화면을 갱신합니다.
//  */
// function createGrid() {
//     spreadsheet.innerHTML = "";

//     spreadsheet.style.gridTemplateColumns = `50px repeat(${colCount}, 90px)`;
//     spreadsheet.style.gridTemplateRows = `36px repeat(${rowCount}, 40px)`;

//     const cornerHeader = document.createElement("div");
//     cornerHeader.classList.add("header", "corner-header");
//     spreadsheet.appendChild(cornerHeader);

//     for (let col = 0; col < colCount; col++) {
//         const columnHeader = document.createElement("div");

//         columnHeader.textContent = getColumnName(col);
//         columnHeader.classList.add("header", "column-header");
//         columnHeader.dataset.col = col;

//         spreadsheet.appendChild(columnHeader);
//     }

//     for (let row = 0; row < rowCount; row++) {
//         const rowHeader = document.createElement("div");

//         rowHeader.textContent = row + 1;
//         rowHeader.classList.add("header", "row-header");
//         rowHeader.dataset.row = row;

//         spreadsheet.appendChild(rowHeader);

//         for (let col = 0; col < colCount; col++) {
//             const cell = document.createElement("input");

//             cell.type = "text";
//             cell.classList.add("cell");
//             cell.dataset.row = row;
//             cell.dataset.col = col;
//             cell.value = gridData[row][col];

//             cell.addEventListener("focus", function () {
//                 updateFocusedCell(row, col);
//                 highlightHeaders(row, col);
//             });

//             cell.addEventListener("click", function () {
//                 updateFocusedCell(row, col);
//                 highlightHeaders(row, col);
//             });

//             cell.addEventListener("input", function () {
//                 gridData[row][col] = cell.value;

//                 updateFocusedCell(row, col);
//                 saveStateToLocalStorage();
//             });

//             spreadsheet.appendChild(cell);
//         }
//     }

//     restoreSelectedCellHighlight();
// }

// /**
//  * createGrid()로 화면을 다시 그린 뒤,
//  * 이전에 선택되어 있던 셀이 아직 존재하면 하이라이트를 복원합니다.
//  */
// function restoreSelectedCellHighlight() {
//     if (selectedRow === null || selectedCol === null) {
//         cellPosition.textContent = "Cell: -";
//         return;
//     }

//     if (selectedRow < rowCount && selectedCol < colCount) {
//         updateFocusedCell(selectedRow, selectedCol);
//         highlightHeaders(selectedRow, selectedCol);
//     } else {
//         selectedRow = null;
//         selectedCol = null;
//         cellPosition.textContent = "Cell: -";
//     }
// }

// /**
//  * updateFocusedCell(row, col)
//  * 현재 선택된 셀 좌표를 Cell: D4 형식으로 화면에 표시합니다.
//  */
// function updateFocusedCell(row, col) {
//     selectedRow = row;
//     selectedCol = col;

//     const columnName = getColumnName(col);
//     const rowNumber = row + 1;

//     cellPosition.textContent = `Cell: ${columnName}${rowNumber}`;
// }

// /**
//  * highlightHeaders(row, col)
//  * 기존 하이라이트를 제거한 뒤,
//  * 현재 선택된 셀의 열 헤더와 행 헤더를 하이라이트합니다.
//  * 현재 선택된 셀 자체도 시각적으로 표시합니다.
//  */
// function highlightHeaders(row, col) {
//     const highlightedHeaders = document.querySelectorAll(".highlight-header");

//     highlightedHeaders.forEach(function (header) {
//         header.classList.remove("highlight-header");
//     });

//     const selectedCells = document.querySelectorAll(".selected-cell");

//     selectedCells.forEach(function (cell) {
//         cell.classList.remove("selected-cell");
//     });

//     const currentColumnHeader = document.querySelector(
//         `.column-header[data-col="${col}"]`
//     );

//     const currentRowHeader = document.querySelector(
//         `.row-header[data-row="${row}"]`
//     );

//     const currentCell = document.querySelector(
//         `.cell[data-row="${row}"][data-col="${col}"]`
//     );

//     if (currentColumnHeader) {
//         currentColumnHeader.classList.add("highlight-header");
//     }

//     if (currentRowHeader) {
//         currentRowHeader.classList.add("highlight-header");
//     }

//     if (currentCell) {
//         currentCell.classList.add("selected-cell");
//     }
// }

// /**
//  * collectGridData()
//  * 모든 셀 값을 2차원 배열로 반환합니다.
//  * 빈 셀은 빈 문자열 ""로 저장합니다.
//  */
// function collectGridData() {
//     const data = [];

//     for (let row = 0; row < rowCount; row++) {
//         const rowData = [];

//         for (let col = 0; col < colCount; col++) {
//             if (gridData[row] && gridData[row][col] !== undefined) {
//                 rowData.push(gridData[row][col]);
//             } else {
//                 rowData.push("");
//             }
//         }

//         data.push(rowData);
//     }

//     return data;
// }

// /**
//  * 마지막 위치에 새 행을 추가합니다.
//  */
// function addRow() {
//     const newRow = [];

//     for (let col = 0; col < colCount; col++) {
//         newRow.push("");
//     }

//     gridData.push(newRow);
//     rowCount++;

//     saveStateToLocalStorage();
//     createGrid();
// }

// /**
//  * 현재 선택된 행을 삭제합니다.
//  * 선택된 셀이 없으면 마지막 행을 삭제합니다.
//  */
// function deleteRow() {
//     if (rowCount <= MIN_ROW_COUNT) {
//         alert("최소 1개의 행은 유지해야 합니다.");
//         return;
//     }

//     let rowToDelete = rowCount - 1;

//     if (selectedRow !== null && selectedRow < rowCount) {
//         rowToDelete = selectedRow;
//     }

//     gridData.splice(rowToDelete, 1);
//     rowCount--;

//     selectedRow = null;
//     selectedCol = null;
//     cellPosition.textContent = "Cell: -";

//     saveStateToLocalStorage();
//     createGrid();
// }

// /**
//  * 마지막 위치에 새 열을 추가합니다.
//  */
// function addColumn() {
//     for (let row = 0; row < rowCount; row++) {
//         gridData[row].push("");
//     }

//     colCount++;

//     saveStateToLocalStorage();
//     createGrid();
// }

// /**
//  * 현재 선택된 열을 삭제합니다.
//  * 선택된 셀이 없으면 마지막 열을 삭제합니다.
//  */
// function deleteColumn() {
//     if (colCount <= MIN_COL_COUNT) {
//         alert("최소 1개의 열은 유지해야 합니다.");
//         return;
//     }

//     let colToDelete = colCount - 1;

//     if (selectedCol !== null && selectedCol < colCount) {
//         colToDelete = selectedCol;
//     }

//     for (let row = 0; row < rowCount; row++) {
//         gridData[row].splice(colToDelete, 1);
//     }

//     colCount--;

//     selectedRow = null;
//     selectedCol = null;
//     cellPosition.textContent = "Cell: -";

//     saveStateToLocalStorage();
//     createGrid();
// }

// /**
//  * exportSpreadsheet()
//  * Export 버튼을 누르면 로컬 파일 저장 창을 엽니다.
//  *
//  * 저장 창에서 사용자가 직접 할 수 있는 것:
//  * 1. 저장 위치 선택
//  * 2. 파일명 입력
//  * 3. 파일 형식 선택: .xlsx 또는 .csv
//  */
// async function exportSpreadsheet() {
//     const data = collectGridData();

//     if (window.showSaveFilePicker) {
//         await exportWithSaveFilePicker(data);
//     } else {
//         alert("현재 브라우저는 로컬 저장 창을 지원하지 않습니다. 기본 xlsx 파일로 다운로드합니다.");
//         exportAsXLSXDownload(data, "mini-spreadsheet.xlsx");
//     }
// }

// /**
//  * showSaveFilePicker()를 사용해서
//  * 운영체제의 로컬 파일 저장 창을 엽니다.
//  */
// async function exportWithSaveFilePicker(data) {
//     try {
//         const fileHandle = await window.showSaveFilePicker({
//             suggestedName: "mini-spreadsheet.xlsx",
//             types: [
//                 {
//                     description: "Excel Workbook (*.xlsx)",
//                     accept: {
//                         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
//                             ".xlsx"
//                         ]
//                     }
//                 },
//                 {
//                     description: "CSV File (*.csv)",
//                     accept: {
//                         "text/csv": [
//                             ".csv"
//                         ]
//                     }
//                 }
//             ]
//         });

//         const file = await fileHandle.getFile();
//         const fileName = file.name.toLowerCase();

//         if (fileName.endsWith(".csv")) {
//             await saveCSVFile(fileHandle, data);
//         } else if (fileName.endsWith(".xlsx")) {
//             await saveXLSXFile(fileHandle, data);
//         } else {
//             alert("파일 확장자는 .xlsx 또는 .csv로 저장해야 합니다.");
//         }
//     } catch (error) {
//         if (error.name !== "AbortError") {
//             console.error(error);
//             alert("파일 저장 중 오류가 발생했습니다.");
//         }
//     }
// }

// /**
//  * 선택한 위치에 xlsx 파일을 저장합니다.
//  */
// async function saveXLSXFile(fileHandle, data) {
//     const worksheet = XLSX.utils.aoa_to_sheet(data);
//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

//     const workbookArrayBuffer = XLSX.write(workbook, {
//         bookType: "xlsx",
//         type: "array"
//     });

//     const writable = await fileHandle.createWritable();

//     await writable.write(workbookArrayBuffer);
//     await writable.close();
// }

// /**
//  * 선택한 위치에 csv 파일을 저장합니다.
//  */
// async function saveCSVFile(fileHandle, data) {
//     const worksheet = XLSX.utils.aoa_to_sheet(data);

//     const csvText = XLSX.utils.sheet_to_csv(worksheet, {
//         blankrows: true
//     });

//     const csvBlob = new Blob(["\uFEFF" + csvText], {
//         type: "text/csv;charset=utf-8;"
//     });

//     const writable = await fileHandle.createWritable();

//     await writable.write(csvBlob);
//     await writable.close();
// }

// /**
//  * showSaveFilePicker()를 지원하지 않는 브라우저용 fallback입니다.
//  * 기본 xlsx 파일로 다운로드합니다.
//  */
// function exportAsXLSXDownload(data, fileName) {
//     const worksheet = XLSX.utils.aoa_to_sheet(data);
//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

//     XLSX.writeFile(workbook, fileName);
// }

// /**
//  * 버튼 이벤트 연결
//  */
// addRowButton.addEventListener("click", addRow);
// deleteRowButton.addEventListener("click", deleteRow);
// addColumnButton.addEventListener("click", addColumn);
// deleteColumnButton.addEventListener("click", deleteColumn);
// exportButton.addEventListener("click", exportSpreadsheet);

// /**
//  * 페이지 시작 시 저장된 상태를 불러오고 그리드를 생성합니다.
//  */
// loadStateFromLocalStorage();
// createGrid();