const axios = require('axios');
const fs = require('fs');
const path = require('path');

const logos = [
    { name: 'vinhomes.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Vinhomes_logo.svg/512px-Vinhomes_logo.svg.png' },
    { name: 'novaland.png', url: 'https://upload.wikimedia.org/wikipedia/vi/thumb/e/e0/Novaland_logo.png/512px-Novaland_logo.png' },
    { name: 'datxanh.png', url: 'https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-Dat-Xanh-Group-Vertical.png' },
    { name: 'masterise.png', url: 'https://masterisehomes.com/assets/images/logo.svg' },
    { name: 'sungroup.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Logo_Sun_Group.png/320px-Logo_Sun_Group.png' },
    { name: 'cenland.png', url: 'https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-CEN-Land-V.png' },
    { name: 'namlong.png', url: 'https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-Nam-Long-GroupNLG.png' },
    { name: 'khangdien.png', url: 'https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-Khang-Dien-V.png' },
    { name: 'hungthinh.png', url: 'https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-Hung-Thinh-Corporation-H.png' },
    { name: 'vingroup.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vingroup_logo.svg/512px-Vingroup_logo.svg.png' }
];

async function download() {
    for (let l of logos) {
        try {
            console.log('Downloading', l.name);
            const res = await axios({
                url: l.url,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });
            fs.writeFileSync(path.join(__dirname, 'public/logos', l.name), res.data);
            console.log('Success', l.name);
        } catch (e) {
            console.log('Failed', l.name, e.message);
        }
    }
}
download();
