const multer = require('multer');
const sharp = require('sharp');


const storage = multer.memoryStorage();
const upload = multer({ storage });

const processImage = (req, res, next) => {

    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Erreur lors du téléchargement du fichier.' });
      }
      if (req.file) {
        const name = req.file.originalname.split(' ').join('_').replace('.', '');
        const ref = name + Date.now() + '.webp';
        await sharp(req.file.buffer)
          .webp({ quality: 20 })
          .toFile("./images/" + ref, (sharpErr) => {
            if (sharpErr) {
              return res.status(500).json({ error: 'Erreur lors du traitement de l\'image.' });
            }
            req.imageUrl = ref;

            next();
          });
      } else {
        next();
      }
    });
};

module.exports = processImage;
