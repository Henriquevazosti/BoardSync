import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens e documentos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

/**
 * @route POST /api/v1/upload/image
 * @desc Upload de imagem
 * @access Private
 */
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  res.json({
    message: 'Imagem enviada com sucesso',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    }
  });
});

/**
 * @route POST /api/v1/upload/file
 * @desc Upload de arquivo
 * @access Private
 */
router.post('/file', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  res.json({
    message: 'Arquivo enviado com sucesso',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    }
  });
});

export default router;
