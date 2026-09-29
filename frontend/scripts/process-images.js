import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, '../src/assets');
const configDir = path.join(__dirname, '../src/config');

const images = [
  { file: 'background.png', id: 'background', desc: 'Gentle penguins on snow with calm water and a large snow-covered mountain on the right under a pale blue sky.', focus: '20% 60%', credit: 'Photo: NCPOR', album: 'Wildlife' },
  { file: 'image.png', id: 'orv_sagar_kanya', desc: 'Research vessel ORV Sagar Kanya navigating through icy waters.', focus: '50% 50%', credit: 'Photo: NCPOR', album: 'Stations and field work' },
  { file: 'image copy.png', id: 'sa_agulhas', desc: 'Large group of researchers posing in front of the red research vessel S.A. Agulhas.', focus: '50% 60%', credit: 'Photo: NCPOR', album: 'Stations and field work' },
  { file: 'image copy 2.png', id: 'multinational_team', desc: 'Large group of international researchers in orange gear on a ship deck helipad holding flags.', focus: '50% 50%', credit: 'Photo: NCPOR', album: 'Stations and field work' },
  { file: 'image copy 3.png', id: 'ncpor_campus', desc: 'Main entrance gate and campus buildings of NCPOR in Goa with palm trees.', focus: '50% 50%', credit: 'Photo: NCPOR', album: 'Stations and field work' },
  { file: 'image copy 4.png', id: 'ncpor_staff', desc: 'Large group of staff and researchers sitting on the lawn at the NCPOR campus.', focus: '50% 50%', credit: 'Photo: NCPOR', album: 'Stations and field work' },
  { file: 'image copy 5.png', id: 'ice_drilling', desc: 'Two researchers setting up ice drilling equipment on a vast snow plain near red containers.', focus: '70% 60%', credit: 'Photo: NCPOR', album: 'Stations and field work' },
  { file: 'image copy 6.png', id: 'polar_team', desc: 'Team of researchers wearing extreme weather gear talking in a snowy polar landscape.', focus: '40% 50%', credit: 'Photo: NCPOR', album: 'Stations and field work' },
  { file: 'image copy 7.png', id: 'south_pole_2010', desc: 'Team of the 1st Indian Scientific Expedition to the South Pole holding a banner and the Indian flag.', focus: '50% 60%', credit: 'Photo: NCPOR', album: 'Antarctica' },
  { file: 'image copy 8.png', id: 'expedition_40', desc: 'Team in blue protective suits holding a banner for the 40th Indian Scientific Expedition to Antarctica on a ship.', focus: '50% 60%', credit: 'Photo: NCPOR', album: 'Antarctica' }
];

async function processImages() {
  const photos = [];
  
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

  for (const img of images) {
    const srcPath = path.join(assetsDir, img.file);
    if (!fs.existsSync(srcPath)) continue;

    const sizes = [1920, 1280, 640];
    if (img.id === 'background') sizes.push(2560);
    
    for (const size of sizes) {
      await sharp(srcPath)
        .resize({ width: size, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(assetsDir, `${img.id}-${size}.webp`));
    }
    
    // placeholder
    const placeholderBuffer = await sharp(srcPath)
      .resize({ width: 24 })
      .blur(1.5)
      .webp({ quality: 20 })
      .toBuffer();
    const placeholderB64 = `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;

    const metadata = await sharp(srcPath).metadata();
    const orientation = metadata.width > metadata.height ? 'landscape' : 'portrait';

    photos.push({
      filename: img.file,
      id: img.id,
      description: img.desc,
      orientation,
      tones: 'cool',
      focal_point: img.focus,
      alt: img.desc,
      credit: img.credit,
      album: img.album,
      placeholder: placeholderB64
    });
  }
  
  fs.writeFileSync(path.join(configDir, 'photos.json'), JSON.stringify(photos, null, 2));
  console.log('Processed images and generated photos.json');
}

processImages().catch(console.error);
