-- Script de vérification du super administrateur
-- À exécuter pour vérifier que admin@easybail.pro a bien les bons privilèges

-- Vérifier le profil admin
SELECT 
  email,
  first_name,
  last_name,
  role,
  plan,
  subscription_status,
  company_name,
  phone,
  trial_ends_at,
  created_at
FROM profiles 
WHERE email = 'admin@easybail.pro';

-- Vérifier les utilisateurs avec des rôles admin
SELECT 
  email,
  first_name || ' ' || last_name as full_name,
  role,
  plan,
  subscription_status
FROM profiles 
WHERE role IN ('admin', 'super_admin')
ORDER BY created_at;

-- Vérifier les dernières activités de l'admin
SELECT 
  type,
  action,
  title,
  description,
  created_at
FROM activities 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'admin@easybail.pro')
ORDER BY created_at DESC
LIMIT 5;
