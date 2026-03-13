/** @purpose Shared file writing utility for upgrade scripts — ensures directory creation and logging */
const fs = require('fs');
const path = require('path');

/**
 * @purpose Write content to a file, creating directories as needed
 * @inputs {string} file - target file path
 * @inputs {string} content - content to write
 * @outputs {void}
 */
function write(file, content) {
    const dir = path.dirname(file);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, content);
    console.log('  OK: ' + file);
}

module.exports = { write };
