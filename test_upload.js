const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'dm9xpokyp',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Since I don't have the user's API key, I can't test it directly unless CLOUDINARY_URL is in the env.
// Let's just create a dummy script and try to run it.
