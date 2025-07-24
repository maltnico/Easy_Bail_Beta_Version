/*
  # Politique RLS pour permettre aux administrateurs de voir tous les utilisateurs

  1. Nouvelles politiques
    - Permettre aux administrateurs de voir tous les profils utilisateurs
    - Maintenir la sécurité pour les utilisateurs normaux

  2. Sécurité
    - Seuls les utilisateurs avec le rôle 'admin' peuvent voir tous les profils
    - Les utilisateurs normaux ne voient que leur propre profil
*/

-- Créer une politique pour permettre aux administrateurs de voir tous les profils
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Créer une politique pour permettre aux administrateurs de modifier tous les profils
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Créer une politique pour permettre aux administrateurs de supprimer des profils
CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    AND id != auth.uid() -- Empêcher l'auto-suppression
  );