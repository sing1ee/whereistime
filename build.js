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

// Chrome Extension 必要文件列表
const filesToCopy = [
    'manifest.json',
    'background.js',
    'popup.html',
    'popup.js',
    'style.css',
    'privacy.html'
];

// 创建 lib 目录用于第三方库
const libDir = path.join(distDir, 'lib');
fs.mkdirSync(libDir, { recursive: true });

// 复制核心文件
filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const targetPath = path.join(distDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`已复制: ${file}`);
    } else {
        console.warn(`警告: 文件不存在 ${file}`);
    }
});

// 复制并压缩 Chart.js
const chartJsSource = path.join(__dirname, 'node_modules', 'chart.js', 'dist', 'chart.umd.js');
const chartJsTarget = path.join(libDir, 'chart.min.js');

if (fs.existsSync(chartJsSource)) {
    // 读取 Chart.js 文件内容并进行简单的压缩
    let chartJsContent = fs.readFileSync(chartJsSource, 'utf8');
    // 移除注释和多余的空白字符
    chartJsContent = chartJsContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    chartJsContent = chartJsContent.replace(/\s+/g, ' ');
    // 写入压缩后的文件
    fs.writeFileSync(chartJsTarget, chartJsContent);
    console.log('已复制并压缩: Chart.js');
} else {
    console.error('错误: Chart.js 库不存在，请先运行 npm install');
    process.exit(1);
}

// 复制 _locales 目录（多语言支持）
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
} else {
    console.error('错误: _locales 目录不存在');
    process.exit(1);
}

// 复制图标文件（必需）
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
} else {
    console.error('错误: public 目录不存在（缺少图标文件）');
    process.exit(1);
}

// 创建 release 目录
const releaseDir = path.join(__dirname, 'release');
if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true });
}
fs.mkdirSync(releaseDir);

// 将 dist 目录的内容复制到 release 目录
const copyDirRecursive = (src, dest) => {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

copyDirRecursive(distDir, releaseDir);

console.log('构建完成！');
console.log('- 开发文件已输出到 dist 目录');
console.log('- 发布文件已输出到 release 目录');
