import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建输出目录
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
    // 清空目标目录
    fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// 需要复制的文件列表
const filesToCopy = [
    'manifest.json',
    'background.js',
    'popup.html',
    'popup.js',
    'style.css',
    'counter.js',
    'main.js',
    'index.html'
];

// 复制文件
filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const targetPath = path.join(distDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`已复制: ${file}`);
    }
});

// 复制 Chart.js
const chartJsDir = path.join(distDir, 'node_modules', 'chart.js', 'dist');
fs.mkdirSync(chartJsDir, { recursive: true });
const chartJsSource = path.join(__dirname, 'node_modules', 'chart.js', 'dist', 'chart.umd.js');
const chartJsTarget = path.join(chartJsDir, 'chart.umd.js');
fs.copyFileSync(chartJsSource, chartJsTarget);
console.log('已复制: Chart.js 库');

// 如果有public目录，复制整个目录
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
    const targetPublicDir = path.join(distDir, 'public');
    fs.mkdirSync(targetPublicDir, { recursive: true });
    
    const files = fs.readdirSync(publicDir);
    files.forEach(file => {
        const sourcePath = path.join(publicDir, file);
        const targetPath = path.join(targetPublicDir, file);
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`已复制: public/${file}`);
    });
}

console.log('构建完成！文件已输出到 dist 目录');
