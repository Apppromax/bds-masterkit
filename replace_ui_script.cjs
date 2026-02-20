const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ImageStudio', 'AiStudio.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<div>\s*<label className="text-xs font-bold text-slate-500 uppercase block mb-2">Phong cách kiến trúc<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;

const replacement = `<div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Phong cách kiến trúc</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['Hiện đại (Modern Luxury)', 'Tân cổ điển (Neo-Classical)', 'Tối giản (Minimalist)', 'Indochine (Đông Dương)', 'Địa Trung Hải (Mediterranean)'].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => setCreatorForm({ ...creatorForm, style })}
                                            className={\`p-3 text-left rounded-xl transition-all border-2 flex items-center justify-between group h-full \${creatorForm.style === style ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-500/20' : 'border-slate-100 bg-white hover:border-pink-200'}\`}
                                        >
                                            <span className={\`text-sm font-bold block \${creatorForm.style === style ? 'text-pink-700' : 'text-slate-600 group-hover:text-pink-500'}\`}>{style.split(' (')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>`;

content = content.replace(regex, replacement);

fs.writeFileSync(filePath, content);
console.log('AiStudio select card replaced successfully');
