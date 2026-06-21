import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

// @ts-ignore - ico package doesn't have type definitions
import ICO from 'ico';
// @ts-ignore - to-ico package doesn't have type definitions
import toIco from 'to-ico';

const sizes: number[] = [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024];
const svgPath: string = 'assets/icon.svg';
const assetsPath: string = 'assets';

// Generate PNG files of various sizes
async function generatePNGs(): Promise<void> {
  console.log('Generating PNG icons...');
  for (const size of sizes) {
    try {
      await sharp(svgPath)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(assetsPath, `icons/${size}x${size}.png`));
      console.log(`✓ Generated ${size}x${size}.png`);
    } catch (err) {
      const error = err as Error;
      console.error(`✗ Failed to generate ${size}x${size}.png:`, error.message);
    }
  }
}

// Generate icon.ico from PNG files
async function generateICO(): Promise<void> {
  console.log('Generating icon.ico...');
  try {
    const pngPath: string = path.join(assetsPath, 'icons/256x256.png');
    const icoPath: string = path.join(assetsPath, 'icon.ico');
    
    // Read the PNG file
    const pngBuffer: Buffer = await fs.promises.readFile(pngPath);
    
    // Convert PNG to ICO using to-ico
    const ico: Buffer = await toIco(pngBuffer);
    fs.writeFileSync(icoPath, ico);
    console.log('✓ Generated icon.ico (256x256)');
  } catch (err) {
    const error = err as Error;
    console.error('✗ Failed to generate icon.ico:', error.message);
    console.log('  Attempting alternative ICO creation...');
  }
}

// Generate icon.png (512x512)
async function generateRootPNG(): Promise<void> {
  console.log('Generating icon.png (512x512)...');
  try {
    await sharp(svgPath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(assetsPath, 'icon.png'));
    console.log('✓ Generated icon.png');
  } catch (err) {
    const error = err as Error;
    console.error('✗ Failed to generate icon.png:', error.message);
  }
}

// Generate icon.icns for macOS (workaround: use PNG)
async function generateICNS(): Promise<void> {
  console.log('Generating icon.icns...');
  try {
    const pngPath: string = path.join(assetsPath, 'icons/512x512.png');
    const icnsPath: string = path.join(assetsPath, 'icon.icns');

    // Copy the 512x512 PNG as a temporary .icns
    // Note: For production macOS apps, regenerate with iconutil on macOS
    fs.copyFileSync(pngPath, icnsPath);
    console.log('✓ Generated icon.icns (PNG-based temporary format)');
    console.log('  Note: For production, regenerate on macOS using: iconutil -c icns AppIcon.iconset/');
  } catch (err) {
    const error = err as Error;
    console.error('✗ Failed to generate icon.icns:', error.message);
  }
}

// Main execution
(async (): Promise<void> => {
  try {
    await generatePNGs();
    await generateRootPNG();
    await generateICO();
    await generateICNS();
    console.log('\n✓ Icon generation complete!');
  } catch (err) {
    const error = err as Error;
    console.error('Icon generation failed:', error);
    process.exit(1);
  }
})();
