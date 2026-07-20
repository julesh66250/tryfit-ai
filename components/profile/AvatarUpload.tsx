'use client'

import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AvatarUpload({
  avatarUrl,
  initials,
}: {
  avatarUrl: string | null
  initials: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar_${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('person-images')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('person-images').getPublicUrl(data.path)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
      setPreview(URL.createObjectURL(file))
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const src = preview ?? avatarUrl

  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="relative inline-block mb-3 group"
      title="Changer ma photo"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Photo de profil"
          className={`w-20 h-20 rounded-full object-cover mx-auto shadow-md border-2 border-white ${uploading ? 'opacity-50' : ''}`}
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-md">
          {initials}
        </div>
      )}
      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center border-[3px] border-white group-hover:bg-brand-600 transition-colors">
        <Camera className="w-3.5 h-3.5 text-white" />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </button>
  )
}
