// src/services/imageServices.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Convert image file to buffer for database storage
 * @param {string} filePath - Path to image file
 * @returns {Promise<Buffer>} - Image buffer
 */
export const imageFileToBuffer = async (filePath) => {
  try {
    return await fs.promises.readFile(filePath);
  } catch (error) {
    throw new Error(`Error reading image file: ${error.message}`);
  }
};

/**
 * Save image buffer to file
 * @param {Buffer} buffer - Image buffer from database
 * @param {string} filename - Filename to save as
 * @returns {Promise<string>} - Path to saved file
 */
export const saveImageBufferToFile = async (buffer, filename) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Ensure directory exists
    await fs.promises.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    
    return filePath;
  } catch (error) {
    throw new Error(`Error saving image: ${error.message}`);
  }
};

/**
 * Get content type from image buffer
 * @param {Buffer} buffer - Image buffer
 * @returns {string} - MIME type of image
 */
export const getImageContentType = (buffer) => {
  // Simple signature detection
  if (buffer.length < 4) return 'application/octet-stream';
  
  // Check file signatures
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  } else if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && 
    buffer[3] === 0x47
  ) {
    return 'image/png';
  } else if (
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46
  ) {
    return 'image/gif';
  }
  
  return 'application/octet-stream';
};
