import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Disable default bodyParser so multer can handle the request
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
// ensure upload dir exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, '_')}`;
    cb(null, safeName);
  },
});

const upload = multer({ storage });

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // single file under field name 'file'
    await runMiddleware(req, res, upload.single('file'));
    // multer attaches file to req.file
    // @ts-ignore
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Return the public URL path that can be used as profile_photo
    const publicPath = `/uploads/${path.basename(file.path)}`;
    return res.status(200).json({ url: publicPath });
  } catch (err: any) {
    console.error('upload error', err);
    return res.status(500).json({ error: err?.message || 'Upload failed' });
  }
}
