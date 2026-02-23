import re

with open('src/components/ImageStudio/QuickEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Layout Types
content = content.replace(
    "layout: 'nametag' as 'classic' | 'modern_pill' | 'pro_banner' | 'nametag' | 'tag_orange' | 'tag_luxury' | 'tag_blue',",
    "layout: 'tag_orange' as 'tag_orange' | 'tag_luxury' | 'tag_blue',"
)

# 2. Update Sidebar UI
# Remove text input
ui_remove_text_pattern = re.compile(
    r'<h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">\s*<Stamp size={16} /> Chữ đóng dấu \(Hàng loạt\)\s*</h3>\s*<div className="space-y-3">\s*<input[^>]+placeholder="Ví dụ: BĐS CHÍNH CHỦ"\s*/>',
    re.MULTILINE | re.DOTALL
)
content = ui_remove_text_pattern.sub(
    '<h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">\n                                    <Stamp size={16} /> Logo Sàn Bất Động Sản\n                                </h3>\n                                <div className="space-y-3">',
    content
)

# Replace Layout Mapping
layout_map_pattern = re.compile(
    r'\{\[\s*\{ id: \'tag_orange\', label: \'Mẫu 1: Cam\' \},\s*\{ id: \'tag_luxury\', label: \'Mẫu 2: Gold\' \},\s*\{ id: \'tag_blue\', label: \'Mẫu 3: Blue\' \},\s*\{ id: \'nametag\', label: \'Mẫu 4: Pill\' \},\s*\{ id: \'modern_pill\', label: \'Viên thuốc\' \},\s*\{ id: \'pro_banner\', label: \'Banner\' \},\s*\]\.map\(lay => \('
)
content = layout_map_pattern.sub(
    '{[\n                                        { id: \'tag_orange\', label: \'Mẫu 1: Cam\' },\n                                        { id: \'tag_luxury\', label: \'Mẫu 2: Gold\' },\n                                        { id: \'tag_blue\', label: \'Mẫu 3: Blue\' },\n                                    ].map(lay => (',
    content
)

# 3. Simplify generateWatermarkGroup
generate_func_start = content.find("const generateWatermarkGroup = async")
generate_func_end = content.find("const gw = group.getScaledWidth();", generate_func_start)

# Instead of complex string manipulation, let's write out the new generate function body
new_func_body = """const generateWatermarkGroup = async (canvas: fabric.Canvas, bgImg: fabric.Image): Promise<fabric.Group | null> => {
        if (!bgImg.width || !bgImg.height || !bgImg.scaleX) return null;

        const actualWidth = bgImg.width! * bgImg.scaleX!;
        const actualHeight = bgImg.height! * (bgImg.scaleY || bgImg.scaleX!);
        const originLeft = bgImg.left! - actualWidth / 2;
        const originTop = bgImg.top! - actualHeight / 2;

        const elements: fabric.Object[] = [];

        const tagW = 450;
        const tagH = 130;
        const tagScale = (actualWidth * 0.35) / tagW;
        const tagElements: fabric.Object[] = [];

        if (watermark.layout === 'tag_orange') {
            const primary = '#f6b21b';
            tagElements.push(new fabric.Rect({ width: tagW, height: tagH, fill: '#ffffff', rx: tagH / 2, ry: tagH / 2, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 20, offsetY: 8 }), originX: 'center', originY: 'center', left: 0, top: 0 }));
            tagElements.push(new fabric.Circle({ radius: 55, fill: primary, left: 65 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center' }));
            const avatar: fabric.Image | null = await new Promise((resolve) => {
                fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                    const s = 104 / (img.width || 1);
                    img.set({ scaleX: s, scaleY: s, left: 65 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center', clipPath: new fabric.Circle({ radius: (img.width || 1) / 2, originX: 'center', originY: 'center' }) });
                    resolve(img);
                }, { crossOrigin: 'anonymous' });
            });
            if (avatar) tagElements.push(avatar);

            if (watermark.logoUrl) {
                const logoImg: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(watermark.logoUrl!, (img) => {
                        const maxLogoH = 50;
                        const s = maxLogoH / (img.height || 1);
                        img.set({ scaleX: s, scaleY: s, left: tagW / 2 - 60, top: 65 - tagH / 2, originX: 'center', originY: 'center' });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (logoImg) tagElements.push(logoImg);
            }

            const textLeft = 145 - tagW / 2;
            tagElements.push(new fabric.Text((profile?.full_name || 'ĐẠI LÝ BĐS').toUpperCase(), { left: textLeft, top: 22 - tagH / 2, fontSize: 24, fontWeight: '900', fill: '#1a1a1a', fontFamily: 'Montserrat' }));
            tagElements.push(new fabric.Text((profile?.job_title || 'MÔI GIỚI TẬN TÂM').toUpperCase(), { left: textLeft, top: 52 - tagH / 2, fontSize: 13, fill: '#64748b', fontWeight: '800', fontFamily: 'Inter', charSpacing: 50 }));
            tagElements.push(new fabric.Text('HOTLINE: ' + (profile?.phone || '09xx.xxx.xxx'), { left: textLeft, top: 72 - tagH / 2, fontSize: 15, fill: '#1a1a1a', fontWeight: '800', fontFamily: 'Inter' }));
            if (!watermark.logoUrl) {
                tagElements.push(new fabric.Text((profile?.agency || 'CENLAND GROUP').toUpperCase(), { left: textLeft, top: 96 - tagH / 2, fontSize: 10, fill: primary, fontWeight: '900', fontFamily: 'Inter', charSpacing: 100 }));
            }
        }
        else if (watermark.layout === 'tag_luxury') {
            const gold = '#c5a059';
            tagElements.push(new fabric.Rect({ width: tagW, height: tagH, fill: '#0a0a0a', rx: 12, ry: 12, stroke: gold, strokeWidth: 2, shadow: new fabric.Shadow({ color: 'rgba(197, 160, 89, 0.4)', blur: 30, offsetY: 10 }), originX: 'center', originY: 'center', left: 0, top: 0 }));
            tagElements.push(new fabric.Rect({ width: tagW - 40, height: 3, fill: gold, left: 20 - tagW / 2, top: (tagH - 15) - tagH / 2, rx: 1.5, originX: 'left' }));
            tagElements.push(new fabric.Path('M 75 25 L 110 45 L 110 85 L 75 105 L 40 85 L 40 45 Z', { fill: 'transparent', stroke: gold, strokeWidth: 1.5, left: 75 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center' }));
            const avatar: fabric.Image | null = await new Promise((resolve) => {
                fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                    const s = 104 / (img.width || 1);
                    img.set({ scaleX: s, scaleY: s, left: 75 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center', clipPath: new fabric.Circle({ radius: (img.width || 1) / 2, originX: 'center', originY: 'center' }) });
                    resolve(img);
                }, { crossOrigin: 'anonymous' });
            });
            if (avatar) tagElements.push(avatar);

            if (watermark.logoUrl) {
                const logoImg: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(watermark.logoUrl!, (img) => {
                        const maxLogoH = 50;
                        const s = maxLogoH / (img.height || 1);
                        img.set({ scaleX: s, scaleY: s, left: tagW / 2 - 60, top: 65 - tagH / 2, originX: 'center', originY: 'center' });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (logoImg) tagElements.push(logoImg);
            }

            const textLeft = 160 - tagW / 2;
            tagElements.push(new fabric.Text((profile?.full_name || 'ĐẠI LÝ BĐS').toUpperCase(), { left: textLeft, top: 22 - tagH / 2, fontSize: 24, fontWeight: '900', fill: gold, fontFamily: 'Montserrat', charSpacing: 50 }));
            tagElements.push(new fabric.Text((profile?.job_title || 'MÔI GIỚI TẬN TÂM').toUpperCase(), { left: textLeft, top: 52 - tagH / 2, fontSize: 10, fill: gold, fontWeight: '800', fontFamily: 'Inter', charSpacing: 100, opacity: 0.7 }));
            tagElements.push(new fabric.Rect({ left: textLeft, top: 70 - tagH / 2, width: tagW - (textLeft + tagW / 2) - 40, height: 1, fill: gold, opacity: 0.2 }));
            tagElements.push(new fabric.Text('HOTLINE: ' + (profile?.phone || '09xx.xxx.xxx'), { left: textLeft, top: 80 - tagH / 2, fontSize: 15, fill: '#ffffff', fontWeight: '800', fontFamily: 'Inter', charSpacing: 50 }));
        }
        else if (watermark.layout === 'tag_blue') {
            const primaryBlue = '#0984e3';
            tagElements.push(new fabric.Rect({ width: tagW, height: tagH, fill: '#ffffff', rx: 65, ry: 65, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 15, offsetY: 5 }), originX: 'center', originY: 'center', left: 0, top: 0 }));
            tagElements.push(new fabric.Rect({ width: 4, height: 60, fill: primaryBlue, left: 140 - tagW / 2, top: 35 - tagH / 2, rx: 2, ry: 2, originX: 'left' }));
            const avatar: fabric.Image | null = await new Promise((resolve) => {
                fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                    const s = 110 / (img.width || 1);
                    img.set({ scaleX: s, scaleY: s, left: 75 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center', clipPath: new fabric.Circle({ radius: (img.width || 1) / 2, originX: 'center', originY: 'center' }) });
                    resolve(img);
                }, { crossOrigin: 'anonymous' });
            });
            if (avatar) tagElements.push(avatar);

            if (watermark.logoUrl) {
                const logoImg: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(watermark.logoUrl!, (img) => {
                        const maxLogoH = 50;
                        const s = maxLogoH / (img.height || 1);
                        img.set({ scaleX: s, scaleY: s, left: tagW / 2 - 60, top: 65 - tagH / 2, originX: 'center', originY: 'center' });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (logoImg) tagElements.push(logoImg);
            }

            const textLeft = 165 - tagW / 2;
            tagElements.push(new fabric.Text((profile?.full_name || 'ĐẠI LÝ BĐS').toUpperCase(), { left: textLeft, top: 18 - tagH / 2, fontSize: 24, fontWeight: '900', fill: '#2d3436', fontFamily: 'Montserrat' }));
            tagElements.push(new fabric.Text((profile?.job_title || 'MÔI GIỚI TẬN TÂM').toUpperCase(), { left: textLeft, top: 50 - tagH / 2, fontSize: 12, fill: '#636e72', fontWeight: '800', fontFamily: 'Inter', charSpacing: 50 }));
            tagElements.push(new fabric.Text('Zalo: ' + (profile?.phone || '09xx.xxx.xxx'), { left: textLeft, top: 72 - tagH / 2, fontSize: 18, fill: '#2d3436', fontWeight: '800', fontFamily: 'Inter' }));
            if (!watermark.logoUrl) {
                tagElements.push(new fabric.Text((profile?.agency || 'CENLAND GROUP').toUpperCase(), { left: textLeft, top: 100 - tagH / 2, fontSize: 9, fill: primaryBlue, fontWeight: '900', charSpacing: 100 }));
            }
        }

        tagElements.forEach(obj => {
            obj.set({ scaleX: (obj.scaleX || 1) * tagScale, scaleY: (obj.scaleY || 1) * tagScale, left: (obj.left || 0) * tagScale, top: (obj.top || 0) * tagScale });
            elements.push(obj);
        });

        const group = new fabric.Group(elements, {"""
                
end_catch_all = content.find("const group = new fabric.Group(elements, {", generate_func_start)
content = content[:generate_func_start] + new_func_body + content[end_catch_all + len("const group = new fabric.Group(elements, {"):]

with open('src/components/ImageStudio/QuickEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS")
