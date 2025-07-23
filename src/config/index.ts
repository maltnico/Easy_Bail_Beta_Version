// Configuration centralisée de l'application
export const config = {
  app: {
    name: 'EasyBail',
    version: '1.0.0',
    environment: import.meta.env.MODE,
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  ui: {
    itemsPerPage: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    supportedDocumentTypes: ['application/pdf', 'application/msword'],
  },
} as const;
