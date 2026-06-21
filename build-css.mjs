import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import * as fs from 'fs';

const inputFile = './src/renderer/tailwind.css';
const outputFile = './src/renderer/output.css';

async function buildCSS() {
  try {
    const input = fs.readFileSync(inputFile, 'utf8');
    
    const result = await postcss([tailwindcss()]).process(input, {
      from: inputFile,
      to: outputFile,
    });
    
    fs.writeFileSync(outputFile, result.css);
    console.log(`✓ Built ${outputFile}`);
  } catch (error) {
    console.error('Failed to build CSS:', error);
    process.exit(1);
  }
}

buildCSS();
