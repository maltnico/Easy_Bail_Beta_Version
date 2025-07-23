-- Script pour passer admin@easybail.pro en super administrateur
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Mettre à jour le profil admin@easybail.pro s'il existe
UPDATE profiles 
SET 
  role = 'admin',
  plan = 'expert',
  subscription_status = 'active',
  company_name = 'EasyBail SAS',
  phone = '04 66 89 68 30',
  trial_ends_at = NOW() + INTERVAL '10 years',
  updated_at = NOW()
WHERE email = 'admin@easybail.pro';

-- 2. Si le profil n'existe pas, le créer (nécessite que l'utilisateur se soit inscrit d'abord)
-- Cette partie ne s'exécutera que si l'email n'existe pas encore
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  company_name,
  phone,
  plan,
  trial_ends_at,
  subscription_status,
  role,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'admin@easybail.pro',
  'Admin',
  'EasyBail',
  'EasyBail SAS',
  '04 66 89 68 30',
  'expert',
  NOW() + INTERVAL '10 years',
  'active',
  'admin',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'admin@easybail.pro'
);

-- 3. Vérifier le résultat
SELECT 
  email,
  first_name,
  last_name,
  role,
  plan,
  subscription_status,
  company_name,
  phone,
  trial_ends_at
FROM profiles 
WHERE email = 'admin@easybail.pro';

-- 4. Optionnel : Créer une activité pour tracer cette action
INSERT INTO activities (
  user_id,
  type,
  action,
  title,
  description,
  priority,
  category,
  created_at
) VALUES (
  (SELECT id FROM profiles WHERE email = 'admin@easybail.pro'),
  'system',
  'super_admin_promotion',
  'Super administrateur configuré',
  'Le compte admin@easybail.pro a été configuré comme super administrateur',
  'high',
  'success',
  NOW()
);