import crypto from 'crypto';

/**
 * POST /api/v1/uploads
 * Upload one or multiple images (up to 6)
 */
export function uploadImages(req, res) {
  if (!req.files || req.files.length === 0) {
    if (req.file) {
      // Single file upload
      const url = `/uploads/${req.file.filename}`;
      return res.status(201).json({
        success: true,
        data: {
          url,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: { code: 'NO_FILES', message: 'No image files provided for upload.' },
    });
  }

  const urls = req.files.map((f) => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
    size: f.size,
    mimetype: f.mimetype,
  }));

  res.status(201).json({
    success: true,
    data: {
      files: urls,
      urls: urls.map(u => u.url),
    },
  });
}

/**
 * POST /api/v1/uploads/presign
 * Presigned upload metadata for cloud storage integration
 */
export function presignUpload(req, res) {
  const { filename = 'image.jpg', contentType = 'image/jpeg' } = req.body;
  const uniqueId = crypto.randomUUID();
  const storageKey = `listings/${Date.now()}-${uniqueId}-${filename}`;

  res.json({
    success: true,
    data: {
      uploadUrl: `/api/v1/uploads`,
      storageKey,
      fileUrl: `/uploads/${storageKey}`,
      headers: {
        'Content-Type': contentType,
      },
    },
  });
}
