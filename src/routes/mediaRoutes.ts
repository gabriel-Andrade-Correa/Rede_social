import { Router } from 'express';
import multer from 'multer';
import {
  uploadMediaController,
  getMediaController,
  getUserMediaController,
  deleteMediaController,
  updateMediaMetadataController,
} from '../controllers/mediaController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Rotas para mídia
router.post('/upload', upload.single('file'), uploadMediaController);
router.get('/:id', getMediaController);
router.get('/user/:userId/:type', getUserMediaController);
router.delete('/:id', deleteMediaController);
router.patch('/:id/metadata', updateMediaMetadataController);

export default router; 