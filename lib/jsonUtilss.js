const fs = require("fs");
const path = require("path");

function loadJsonFile(filePath) {
    const file = fs.readFileSync(filePath, "utf-8");
    if (!file) {
        throw new Error(`ファイルが見つかりません: ${filePath}`);
    }
    return JSON.parse(file);
}

function saveJsonFile(filePath, data) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData, "utf-8");

    return true;
}

function resetJsonFile(filePath, defaultData) {
    const jsonData = JSON.stringify(defaultData, null, 2);
    fs.writeFileSync(filePath, jsonData, "utf-8");

    return true;
}

module.exports = {
    loadJsonFile,
    saveJsonFile,
    resetJsonFile
};