import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { uploadMedia, getMedia, getUserMedia, deleteMedia, updateMediaMetadata } from '../services/media';

export const uploadMediaController = async (req: Request, res: Response) => {
  try {
    const { userId, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const mediaId = await uploadMedia(
      userId,
      type,
      file.buffer,
      file.mimetype,
      {
        size: file.size,
      }
    );

    res.status(201).json({ mediaId });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getMediaController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const media = await getMedia(id);

    if (!media) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    res.set('Content-Type', media.mimeType);
    res.set('Cache-Control', 'public, max-age=31557600');
    res.send(media.data.buffer);

  } catch (error) {
    console.error('Erro ao buscar mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getUserMediaController = async (req: Request, res: Response) => {
  try {
    const { userId, type } = req.params;
    const medias = await getUserMedia(userId, type as any);
    res.json(medias);
  } catch (error) {
    console.error('Erro ao buscar mídias do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteMediaController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const deleted = await deleteMedia(id, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar mídia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateMediaMetadataController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, metadata } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const updated = await updateMediaMetadata(id, userId, metadata);

    if (!updated) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    res.status(200).json({ message: 'Metadados atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar metadados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 