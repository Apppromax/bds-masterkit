const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ImageStudio', 'AiStudio.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    /const handleEnhanceUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?reader\.readAsDataURL\(file\);\s*}\s*};/m,
    `const handleEnhanceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const optimizedUrl = await optimizeImage(file, 1500, 1500, 0.85);
                setEnhanceImage(optimizedUrl);
                setEnhancedResult(null);
            } catch (err) {
                toast.error('Lỗi khi nén ảnh: ' + (err as Error).message);
            }
        }
    };`
);

content = content.replace(
    /alert\('Không thể phân tích ảnh\. Vui lòng thử lại\.'\);/g,
    "toast.error('Không thể phân tích ảnh. Vui lòng thử lại.');"
);
content = content.replace(
    /alert\('Không thể tạo ảnh nâng cấp\. Vui lòng thử lại\.'\);/g,
    "toast.error('Không thể tạo ảnh nâng cấp. Vui lòng thử lại.');"
);
content = content.replace(
    /alert\('Có lỗi xảy ra: ' \+ \(error instanceof Error \? error\.message : 'Unknown error'\)\);/g,
    "toast.error('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));"
);
content = content.replace(
    /alert\('Lỗi tạo ảnh: ' \+ \(error instanceof Error \? error\.message : "Unknown error"\)\);/g,
    "toast.error('Lỗi tạo ảnh: ' + (error instanceof Error ? error.message : 'Unknown error'));"
);

// Add creator success toast
content = content.replace(
    /setCreatedImages\(results\);/g,
    "setCreatedImages(results);\n            toast.success('Mời bạn xem thành quả!');\n"
);

fs.writeFileSync(filePath, content);
console.log('AiStudio modified successfully');
