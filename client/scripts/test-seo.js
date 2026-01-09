import fs from 'fs';
import path from 'path';

const CLIENT_DIR = path.join(process.cwd(), 'client');
const DATA_DIR = path.join(CLIENT_DIR, 'src', 'data');
const PUBLIC_DIR = path.join(CLIENT_DIR, 'public');
const TEMPLATE_FILE = path.join(DATA_DIR, 'template.json');
const INDEX_FILE = path.join(CLIENT_DIR, 'index.html');

async function run() {
    console.log('Minimal SEO Start');
    const data = JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf8'));
    const masterHtml = fs.readFileSync(INDEX_FILE, 'utf8');
    console.log('Files loaded');

    const { site, blog } = data;
    const baseUrl = site.url || 'https://shulkwisec.github.io';

    // 1. Update main index.html with something simple
    let mainHtml = masterHtml.replace('<title>shulkwisec</title>', `<title>${site.title.en}</title>`);
    fs.writeFileSync(INDEX_FILE, mainHtml);
    console.log('Main index.html updated');

    // 2. Try to create ONE folder
    const testDir = path.join(PUBLIC_DIR, 'page', 'vision');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'index.html'), masterHtml);
    console.log('Test folder created');
}

run().catch(console.error);
