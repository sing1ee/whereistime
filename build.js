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

// 创建 lib 目录用于第三方库
const libDir = path.join(distDir, 'lib');
fs.mkdirSync(libDir, { recursive: true });

// 复制文件
filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const targetPath = path.join(distDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`已复制: ${file}`);
    }
});

// 复制 Chart.js（使用 UMD 版本，这是最适合浏览器的版本）
const chartJsSource = path.join(__dirname, 'node_modules', 'chart.js', 'dist', 'chart.umd.js');
const chartJsTarget = path.join(libDir, 'chart.min.js');

// 读取 Chart.js 文件内容并进行简单的压缩
let chartJsContent = fs.readFileSync(chartJsSource, 'utf8');
// 移除注释和多余的空白字符
chartJsContent = chartJsContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
chartJsContent = chartJsContent.replace(/\s+/g, ' ');
// 写入压缩后的文件
fs.writeFileSync(chartJsTarget, chartJsContent);
console.log('已复制并压缩: Chart.js');

// 复制 _locales 目录
const localesDir = path.join(__dirname, '_locales');
if (fs.existsSync(localesDir)) {
    const targetLocalesDir = path.join(distDir, '_locales');
    fs.mkdirSync(targetLocalesDir, { recursive: true });
    
    // 复制所有语言目录
    const languages = fs.readdirSync(localesDir);
    languages.forEach(lang => {
        const sourceLangDir = path.join(localesDir, lang);
        const targetLangDir = path.join(targetLocalesDir, lang);
        
        if (fs.statSync(sourceLangDir).isDirectory()) {
            fs.mkdirSync(targetLangDir, { recursive: true });
            
            // 复制语言目录中的所有文件
            const langFiles = fs.readdirSync(sourceLangDir);
            langFiles.forEach(file => {
                const sourceFile = path.join(sourceLangDir, file);
                const targetFile = path.join(targetLangDir, file);
                fs.copyFileSync(sourceFile, targetFile);
                console.log(`已复制: _locales/${lang}/${file}`);
            });
        }
    });
}

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
