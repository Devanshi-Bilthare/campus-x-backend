import { Request, Response } from 'express';
import cloudinary from '../../config/cloudinary';
import { Readable } from 'stream';

export class UploadController {
  // Upload single file
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file provided'
        });
        return;
      }

      // Convert buffer to stream
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Automatically detect image, video, raw, etc.
          folder: 'campusx' // Optional: organize files in a folder
        },
        (error, result) => {
          if (error) {
            res.status(500).json({
              success: false,
              message: 'File upload failed',
              error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
            return;
          }

          if (!result) {
            res.status(500).json({
              success: false,
              message: 'Upload failed - no result returned'
            });
            return;
          }

          // Return the secure URL as a string
          res.status(200).send(result.secure_url);
        }
      );

      // Pipe the buffer to the upload stream
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(stream);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Upload multiple files
  async uploadFiles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        res.status(400).json({
          success: false,
          message: 'No files provided'
        });
        return;
      }

      // Ensure files is an array
      const filesArray: Express.Multer.File[] = Array.isArray(req.files) 
        ? req.files 
        : Object.values(req.files).flat();

      if (filesArray.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files provided'
        });
        return;
      }

      const uploadPromises = filesArray.map((file: Express.Multer.File) => {
        return new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'campusx'
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }
              if (!result) {
                reject(new Error('Upload failed - no result returned'));
                return;
              }
              resolve(result.secure_url);
            }
          );

          const bufferStream = new Readable();
          bufferStream.push(file.buffer);
          bufferStream.push(null);
          bufferStream.pipe(stream);
        });
      });

      const urls = await Promise.all(uploadPromises);

      // Return URLs as comma-separated string
      res.status(200).send(urls.join(','));
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete file from Cloudinary
  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        res.status(400).json({
          success: false,
          message: 'Public ID is required'
        });
        return;
      }

      // Extract public ID from URL if full URL is provided
      let idToDelete = publicId;
      if (publicId.includes('/')) {
        const parts = publicId.split('/');
        const filename = parts[parts.length - 1];
        idToDelete = filename.split('.')[0];
        // Reconstruct with folder if needed
        if (publicId.includes('campusx/')) {
          idToDelete = `campusx/${idToDelete}`;
        }
      }

      const result = await cloudinary.uploader.destroy(idToDelete);

      if (result.result === 'ok') {
        res.status(200).json({
          success: true,
          message: 'File deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'File not found or already deleted'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'File deletion failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

