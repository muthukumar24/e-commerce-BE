const express = require('express');
const router = express.Router();
const Products = require('../models/Products');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
require('dotenv').config();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const items = await Products.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Products.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error fetching inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new product
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  upload.array('images', 5), // 'images' to match form field
  async (req, res) => {
    const { name, description, price, quantity, category } = req.body;

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Upload media files to Cloudinary
      const mediaUrls = await Promise.all(
        req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { resource_type: 'auto' }, // Can handle various file types
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  return reject(error);
                }
                resolve(result.secure_url);
              }
            );
            uploadStream.end(file.buffer);
          });
        })
      );

      // Save product with image URLs
      const newItem = new Products({
        name,
        description,
        price,
        quantity,
        category,
        images: mediaUrls.filter(url => url.endsWith('.jpg') || url.endsWith('.png')), // Save all image URLs (without filtering by file type)
      });

      const item = await newItem.save();
      res.status(201).json(item);
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;

