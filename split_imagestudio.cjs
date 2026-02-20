const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ImageStudio.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const componentsDir = path.join(__dirname, 'src', 'components', 'ImageStudio');
if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

// Extract QuickEditor
const qeStart = content.indexOf('const QuickEditor = ({ onBack }: { onBack: () => void }) => {');
const aiStart = content.indexOf('const AiStudio = ({ onBack }: { onBack: () => void }) => {');
const mainStart = content.indexOf('export default function ImageStudio() {');

if (qeStart > -1 && aiStart > -1 && mainStart > -1) {
    const imports = `import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Stamp, LayoutTemplate, ArrowRight } from 'lucide-react';
import { generateId } from '../../utils/idGenerator';
import { useAuth } from '../../contexts/AuthContext';\n\n`;

    const quickEditorCode = content.substring(qeStart, aiStart);
    fs.writeFileSync(path.join(componentsDir, 'QuickEditor.tsx'), imports + quickEditorCode);

    const aiImports = `import React, { useState } from 'react';
import { Upload, Download, Wand2, Sparkles, RefreshCw, Palette, ArrowRight } from 'lucide-react';
import { enhanceImageWithAI, analyzeImageWithGemini, generateImageWithAI, generateContentWithAI } from '../../services/aiService';
import toast from 'react-hot-toast';
import { optimizeImage } from '../../utils/imageUtils';\n\n`;

    const aiStudioCode = content.substring(aiStart, mainStart);
    fs.writeFileSync(path.join(componentsDir, 'AiStudio.tsx'), aiImports + aiStudioCode);

    const mainImports = `import React, { useState } from 'react';
import { Stamp, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import QuickEditor from '../components/ImageStudio/QuickEditor';
import AiStudio from '../components/ImageStudio/AiStudio';

const StickerIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
        <path d="M15 3v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h8" />
        <path d="M8 9h2" />
    </svg>
);\n\n`;

    const mainCode = content.substring(mainStart).replace(/\/\/\s*Icon helper[\s\S]*$/, '');
    fs.writeFileSync(filePath, mainImports + mainCode);
    console.log("Extraction successful!");
} else {
    console.log("Could not find boundaries.");
}
