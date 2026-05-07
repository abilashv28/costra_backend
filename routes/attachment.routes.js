const express = require('express');
const { generatePresignedUrl, getS3FileUrl } = require('../services/s3.service');

const router = express.Router();

// Generate pre-signed URL for S3 upload
router.post('/presigned-url', async (req, res) => {
  try {
    const { key, contentType, expiresIn } = req.body;

    if (!key || !contentType) {
      return res.status(400).json({ error: 'key and contentType are required' });
    }

    const signedUrl = await generatePresignedUrl(key, contentType, expiresIn);

    res.json({ signedUrl });
  } catch (error) {
    console.error('Error in presigned URL route:', error);
    res.status(500).json({ error: 'Failed to generate pre-signed URL' });
  }
});

// Get permanent S3 URL for uploaded file
router.post('/get-url', async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'key is required' });
    }

    const fileUrl = getS3FileUrl(key);

    res.json({ fileUrl });
  } catch (error) {
    console.error('Error in get URL route:', error);
    res.status(500).json({ error: 'Failed to get file URL' });
  }
});

module.exports = router;