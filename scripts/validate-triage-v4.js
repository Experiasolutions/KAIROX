import fs from 'fs';
import path from 'path';

// Pega arquivos recursivamente
function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Valida se o conteúdo do markdown adere às 10 Fases
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let errors = [];
  
  // Validações do Frontmatter (Fases 1-6)
  if (!content.includes('triage_fase_1')) errors.push('Missing triage_fase_1_intencao no Frontmatter');
  if (!content.includes('triage_fase_2')) errors.push('Missing triage_fase_2_persona no Frontmatter');
  if (!content.includes('triage_fase_3')) errors.push('Missing triage_fase_3_advisory no Frontmatter');
  if (!content.includes('triage_fase_4')) errors.push('Missing triage_fase_4_squad no Frontmatter');
  if (!content.includes('triage_fase_5')) errors.push('Missing triage_fase_5_surface no Frontmatter');
  if (!content.includes('triage_fase_6')) errors.push('Missing triage_fase_6_ecosystem no Frontmatter');
  
  // Validações do Corpo (Fases 7-10)
  if (!content.includes('[Fase 7]')) errors.push('Missing seção [Fase 7] Executar/Protocolo');
  if (!content.includes('[Fase 8]')) errors.push('Missing seção [Fase 8] Quality Gate');
  if (!content.includes('[Fase 9]')) errors.push('Missing seção [Fase 9] Session State');
  if (!content.includes('[Fase 10]')) errors.push('Missing seção [Fase 10] Output Encapsulado');
  
  return errors;
}

const target = process.argv[2] || 'squads/experia-commerce/tasks';
const targetPath = path.resolve(process.cwd(), target);

console.log(`\n🔍 Verificando aderência ao Engine Triage v4 em: ${target}\n`);

const files = getFiles(targetPath);
let validCount = 0;
let invalidCount = 0;

for (const file of files) {
  const errors = validateFile(file);
  const relativePath = path.relative(process.cwd(), file);
  if (errors.length === 0) {
    validCount++;
    console.log(`✅ [OK] ${relativePath}`);
  } else {
    invalidCount++;
    console.log(`❌ [FALHA] ${relativePath}`);
    errors.forEach(err => console.log(`   - ${err}`));
  }
}

console.log(`\n📊 Relatório: ${validCount} conformes, ${invalidCount} legados/inválidos.`);
if (invalidCount > 0) {
  console.log(`⚠️ ATENÇÃO: As tasks legadas precisam ser refatoradas para o novo padrão de 10 Fases antes da execução via Agent.`);
} else {
  console.log(`🚀 SUCESSO: Todas as tasks verificadas aderem ao Engine Triage v4!`);
}
