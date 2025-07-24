/*
  # Corriger la récursion infinie des politiques RLS

  1. Problème résolu
    - Suppression des politiques administrateur qui causent la récursion infinie
    - Les politiques admin tentaient de lire la table profiles pour vérifier le rôle, créant une boucle
    
  2. Solution appliquée
    - Retour aux politiques de base sécurisées
    - Les utilisateurs ne peuvent voir que leur propre profil
    - Suppression des politiques admin problématiques
    
  3. Note importante
    - Pour la gestion admin, il faudra utiliser une approche différente
    - Possibilité d'utiliser une fonction ou une vue dédiée
*/

-- Supprimer toutes les politiques admin problématiques
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Conserver uniquement les politiques de base sécurisées
-- (Ces politiques existent déjà, mais on les recrée pour être sûr)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Recréer les politiques de base
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);