'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadProductImage } from '@/app/actions/upload'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  currentImage?: string | null
  onClear?: () => void
}

export function ImageUpload({ onImageUploaded, currentImage, onClear }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setError(null)
    
    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadProductImage(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      onImageUploaded(result.imageUrl!)
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClear?.()
  }

  return (
    <div className="space-y-3">
      <Label>Product Image</Label>
      
      {/* Preview Area */}
      {preview ? (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
          <img 
            src={preview} 
            alt="Product preview" 
            className="w-full h-full object-contain"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={handleClear}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload image</p>
          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF (max 5MB)</p>
        </div>
      )}

      {/* File Input (Hidden) */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {/* Upload Button */}
      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </>
          )}
        </Button>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Helper Text */}
      {!preview && !error && (
        <p className="text-xs text-muted-foreground">
          Upload from your device. Works great on mobile too! 📱
        </p>
      )}
    </div>
  )
}
