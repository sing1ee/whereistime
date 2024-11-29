import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

// 获取 __dirname 等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 源目录和目标目录
const releaseDir = path.join(__dirname, 'release');
const outputZipPath = path.join(releaseDir, 'whereistime.zip');

// 创建输出流
const output = fs.createWriteStream(outputZipPath);
const archive = archiver('zip', {
    zlib: { level: 9 } // 最高压缩级别
});

// 监听错误和完成事件
output.on('close', () => {
    console.log(`✅ Archive created successfully! Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

archive.on('error', (err) => {
    throw err;
});

// 将输出流连接到归档
archive.pipe(output);

// 从 release 目录添加所有文件，但排除 .zip 文件
fs.readdirSync(releaseDir).forEach(file => {
    if (file.endsWith('.zip')) return; // 跳过 zip 文件
    
    const fullPath = path.join(releaseDir, file);
    const relativePath = file; // 保持在根目录的相对路径
    
    if (fs.lstatSync(fullPath).isDirectory()) {
        archive.directory(fullPath, relativePath);
    } else {
        archive.file(fullPath, { name: relativePath });
    }
});

// 完成归档
archive.finalize();
