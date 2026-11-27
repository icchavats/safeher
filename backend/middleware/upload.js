import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('uploads/evidence');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `evidence-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept audio and video recordings (webm, wav, mp3, ogg, m4a, mp4 audio)
  if (
    file.mimetype.startsWith('audio/') ||
    file.mimetype.startsWith('video/') ||
    file.originalname.match(/\.(webm|wav|mp3|ogg|m4a|mp4|aac)$/i)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only audio/voice evidence files are permitted'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB max
  },
  fileFilter,
});
