const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\GABS\\Documents\\Haha²\\.agent\\workflows';
const destBaseDir = 'C:\\Users\\GABS\\Documents\\My KAIROS\\.claude\\skills';

if (!fs.existsSync(destBaseDir)) {
  fs.mkdirSync(destBaseDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const name = path.basename(file, '.md');
  const srcPath = path.join(srcDir, file);
  const destDir = path.join(destBaseDir, name);
  const destPath = path.join(destDir, 'SKILL.md');

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  let content = fs.readFileSync(srcPath, 'utf8');

  // se nao tiver yaml frontmatter, colocar
  if (!content.startsWith('---')) {
    content = `---\nname: ${name}\ndescription: Ativa o fluxo/persona ${name}\n---\n\n${content}`;
  } else {
    // Inject name: if missing
    content = content.replace(/^---\n(.*?)---/ms, (match, fm) => {
      let newFm = fm;
      if (!newFm.includes('name:')) {
        newFm = `name: ${name}\n` + newFm;
      }
      return `---\n${newFm}---`;
    });
  }

  fs.writeFileSync(destPath, content, 'utf8');
  console.log(`Created skill: ${name}`);
}
