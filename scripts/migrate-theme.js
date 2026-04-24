const fs = require('fs');
const path = require('path');

// Colors to transition:
// From hardcoded DARK to DARK under 'dark:' variant, while having LIGHT as default.
// Example: bg-slate-900 -> bg-slate-50 dark:bg-slate-900
const classMap = {
    // Backgrounds
    'bg-slate-950': 'bg-white dark:bg-slate-950',
    'bg-slate-900': 'bg-slate-50 dark:bg-slate-900',
    'bg-slate-800': 'bg-slate-100 dark:bg-slate-800',
    'bg-slate-700': 'bg-slate-200 dark:bg-slate-700',
    // Text
    'text-slate-200': 'text-slate-800 dark:text-slate-200',
    'text-slate-300': 'text-slate-700 dark:text-slate-300',
    'text-slate-400': 'text-slate-600 dark:text-slate-400',
    // Borders
    'border-slate-800': 'border-slate-200 dark:border-slate-800',
    'border-slate-700': 'border-slate-300 dark:border-slate-700',
    'border-slate-600': 'border-slate-400 dark:border-slate-600',
};

// We will only do simple substring replacements for classes exactly matching word boundaries
// to avoid messing up arbitrary prefixes/suffixes. 

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // A regex to safely match tailwind classes within className strings.
    // e.g. "bg-slate-900" with word boundaries to ensure we don't match "hover:bg-slate-900" improperly
    // Actually, handling hover:/focus: is important. Let's just do a naive replace first on boundaries, 
    // but ignoring if it starts with 'dark:'.

    Object.keys(classMap).forEach(darkClass => {
        const replacement = classMap[darkClass];
        
        // This regex looks for exact boundaries, and explicitly ensures it's not preceded by "dark:"
        // `(?<!dark:)` is a negative lookbehind.
        const regexStr = '(?<!dark:)(?<![A-Za-z0-9\-])' + darkClass.replace(/\-/g, '\\-') + '(?![A-Za-z0-9\-])';
        const regex = new RegExp(regexStr, 'g');

        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function processDir(dirPath) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (item !== 'node_modules' && item !== '.next') {
                processDir(fullPath);
            }
        } else if (/\.tsx?$/.test(item)) {
            processFile(fullPath);
        }
    }
}

console.log('Starting theme migration...');
processDir(path.join(__dirname, '../app'));
processDir(path.join(__dirname, '../components'));
console.log('Migration complete.');
