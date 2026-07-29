require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const prisma = new PrismaClient();
cloudinary.config({ secure: true }); // Uses process.env.CLOUDINARY_URL

const files = [
  'C:\\Users\\yesah\\.gemini\\antigravity\\brain\\483fd009-6cdd-4602-beaf-635ae1b7e7df\\media__1780191618113.png',
  'C:\\Users\\yesah\\.gemini\\antigravity\\brain\\483fd009-6cdd-4602-beaf-635ae1b7e7df\\media__1780191639366.jpg',
  'C:\\Users\\yesah\\.gemini\\antigravity\\brain\\483fd009-6cdd-4602-beaf-635ae1b7e7df\\media__1780191698980.jpg'
];

async function main() {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log('File not found:', file);
      continue;
    }
    
    console.log('Uploading:', file);
    try {
      const result = await cloudinary.uploader.upload(file, { folder: 'lapd-mdt-gallery' });
      console.log('Uploaded to Cloudinary:', result.secure_url);
      
      const siteImage = await prisma.siteImage.create({
        data: {
          url: result.secure_url,
          type: 'GALERI'
        }
      });
      console.log('Saved to DB:', siteImage);
    } catch (err) {
      console.error('Error processing', file, err);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Done!');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
