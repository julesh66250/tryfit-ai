export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  credits: number
  is_premium: boolean
  premium_expires_at: string | null
  created_at: string
  updated_at: string
}

export type Generation = {
  id: string
  user_id: string
  person_image_url: string
  garment_image_url: string
  garment_source_url: string | null
  result_image_url: string | null
  garment_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
}

export type CreditTransaction = {
  id: string
  user_id: string
  amount: number
  type: 'free_signup' | 'purchase' | 'subscription' | 'usage'
  description: string | null
  created_at: string
}
