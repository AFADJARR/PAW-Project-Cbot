// middlewares/uploadBukti.js
// Menerima satu file "bukti" (multipart) ke memori, dibatasi ukuran dan jumlahnya.
// Kesalahan upload tidak dilempar sebagai error, tetapi ditaruh di req.uploadError
// supaya controller bisa menampilkannya sebagai pesan yang ramah.
const multer = require('multer');
const { MAX_BYTES } = require('../utils/bukti');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1, fields: 5, fieldSize: 100, parts: 8 },
}).single('bukti');

function uploadBukti(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      req.uploadError =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran file terlalu besar. Maksimal 2 MB.'
          : err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT'
            ? 'Kirim satu file saja.'
            : 'File tidak dapat diproses. Coba lagi.';
    }
    next();
  });
}

module.exports = uploadBukti;
