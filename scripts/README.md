# Scripts d'administration EasyBail

## make-admin-super-user.sql

Ce script configure l'utilisateur `admin@easybail.pro` comme super administrateur de l'application.

### Utilisation

1. **Ouvrir l'éditeur SQL de Supabase** :
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet EasyBail
   - Cliquer sur "SQL Editor" dans le menu de gauche

2. **Exécuter le script** :
   - Copier le contenu de `make-admin-super-user.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" pour exécuter

### Ce que fait le script

1. **Met à jour le profil existant** si admin@easybail.pro existe déjà
2. **Crée le profil** si l'utilisateur n'existe pas encore
3. **Configure les privilèges** :
   - Rôle : `admin`
   - Plan : `expert`
   - Statut : `active`
   - Essai étendu de 10 ans
   - Informations de contact EasyBail SAS
4. **Enregistre une activité** pour tracer cette action
5. **Affiche le résultat** pour confirmation

### Prérequis

- L'utilisateur `admin@easybail.pro` doit avoir créé un compte via l'interface de l'application
- Vous devez avoir les droits d'administration sur le projet Supabase

### Vérification

Après exécution, vous pouvez vérifier que tout fonctionne :

```sql
SELECT email, role, plan, subscription_status 
FROM profiles 
WHERE email = 'admin@easybail.pro';
```

### Sécurité

- Ce script ne peut être exécuté que par les administrateurs Supabase
- Il ne créera pas d'utilisateur d'authentification, seulement le profil
- L'utilisateur doit d'abord s'inscrire normalement via l'interface
