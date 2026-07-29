require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({ secure: true });

cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", { folder: 'test' })
  .then(res => console.log('Success:', res.secure_url))
  .catch(err => console.error('Error:', err));
