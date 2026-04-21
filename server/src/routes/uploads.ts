import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { Router } from 'express'

const uploadsRouter = Router()
const uploadsRoot = path.resolve(process.cwd(), 'uploads')
const teachersDir = path.join(uploadsRoot, 'teachers')
const postersDir = path.join(uploadsRoot, 'posters')
const brandingDir = path.join(uploadsRoot, 'branding')

mkdirSync(teachersDir, { recursive: true })
mkdirSync(postersDir, { recursive: true })
mkdirSync(brandingDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    if (req.path.includes('teacher-photo')) {
      cb(null, teachersDir)
      return
    }
    if (req.path.includes('school-logo')) {
      cb(null, brandingDir)
      return
    }
    cb(null, postersDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp'])
    if (!allowed.has(file.mimetype)) {
      cb(new Error('Unsupported file type'))
      return
    }
    cb(null, true)
  },
})

uploadsRouter.post('/teacher-photo', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' })
  }
  const relativePath = `teachers/${req.file.filename}`
  return res.status(201).json({
    path: relativePath,
    url: `/uploads/${relativePath}`,
  })
})

uploadsRouter.post('/poster', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' })
  }
  const relativePath = `posters/${req.file.filename}`
  return res.status(201).json({
    path: relativePath,
    url: `/uploads/${relativePath}`,
  })
})

uploadsRouter.post('/school-logo', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' })
  }
  const relativePath = `branding/${req.file.filename}`
  return res.status(201).json({
    path: relativePath,
    url: `/uploads/${relativePath}`,
  })
})

export { uploadsRouter }
