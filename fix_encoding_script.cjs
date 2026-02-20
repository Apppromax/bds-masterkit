const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ImageStudio', 'AiStudio.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove corrupted line and add normal string
content = content.replace(/e x p o r t   d e f a u l t   A i S t u d i o ;[\s\S]*/, '\nexport default AiStudio;\n');


fs.writeFileSync(filePath, content, { encoding: 'utf8' });
console.log('Fixed AiStudio export');
