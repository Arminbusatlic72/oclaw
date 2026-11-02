import type {ContactLocale} from './contact-form'

export const MAX_CONTACT_FILES = 5
export const MAX_CONTACT_FILE_BYTES = 15 * 1024 * 1024
export const MAX_CONTACT_UPLOAD_BYTES = 25 * 1024 * 1024
export const MAX_CONTACT_REQUEST_BYTES = MAX_CONTACT_UPLOAD_BYTES + 2 * 1024 * 1024

export type ContactUpload = {file: File; safeName: string}
export type UploadValidationResult = {ok: true; files: ContactUpload[]} | {ok: false; message: string}

const allowedExtensions = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])

function extension(name: string) {
  return name.toLowerCase().split('.').pop() || ''
}

function safeFileName(name: string, index: number) {
  const ext = extension(name)
  const base = name.slice(0, Math.max(0, name.length - ext.length - 1)).normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `document-${index + 1}`
  return `${base}.${ext}`
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value)
}

async function matchesContent(file: File, ext: string) {
  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 128 * 1024)).arrayBuffer())
  if (ext === 'pdf') return startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])
  if (ext === 'png') return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (ext === 'jpg' || ext === 'jpeg') return startsWith(bytes, [0xff, 0xd8, 0xff])
  if (ext === 'doc') return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
  if (ext === 'docx' && startsWith(bytes, [0x50, 0x4b])) {
    const listing = new TextDecoder('latin1').decode(bytes)
    return listing.includes('[Content_Types].xml') && listing.includes('word/')
  }
  return false
}

export async function validateContactUploads(input: File[], locale: ContactLocale): Promise<UploadValidationResult> {
  const message = (en: string, es: string) => locale === 'es' ? es : en
  if (input.length > MAX_CONTACT_FILES) return {ok: false, message: message(`Upload no more than ${MAX_CONTACT_FILES} files.`, `Cargue un máximo de ${MAX_CONTACT_FILES} archivos.`)}
  if (input.reduce((sum, file) => sum + file.size, 0) > MAX_CONTACT_UPLOAD_BYTES) return {ok: false, message: message('The combined upload is too large.', 'El tamaño total de los archivos es demasiado grande.')}

  const files: ContactUpload[] = []
  for (const [index, file] of input.entries()) {
    const ext = extension(file.name)
    if (!file.size || file.size > MAX_CONTACT_FILE_BYTES) return {ok: false, message: message(`Each file must be no larger than 15 MB.`, 'Cada archivo debe tener un tamaño máximo de 15 MB.')}
    if (!allowedExtensions.has(ext) || !(await matchesContent(file, ext))) return {ok: false, message: message('Only valid PDF, DOC, DOCX, JPG, and PNG files are accepted.', 'Solo se aceptan archivos PDF, DOC, DOCX, JPG y PNG válidos.')}
    files.push({file, safeName: safeFileName(file.name, index)})
  }
  return {ok: true, files}
}
