# Rhéto 2026–2027 · ISND — guide de maintenance

## Structure
- `index.html` : accueil et textes (À propos…)
- `css/style.css` : apparence · `js/main.js` : fonctionnement
- `data/students.json` : élèves · `data/events.json` : timeline
- `photos/` : **vos photos**, un dossier par catégorie
- `build.py` + `.github/workflows/deploy.yml` : génération automatique (ne pas toucher)

Les miniatures, les images optimisées et `photos.json` sont créés automatiquement à chaque publication.

## Mise en ligne (une seule fois)
1. Créez un compte sur github.com, puis un dépôt **public** (ex. `rheto`).
2. Envoyez-y tout le contenu du dossier (Add file → Upload files). Pensez au dossier `.github` (sinon utilisez GitHub Desktop).
3. Settings → Pages → Source : **GitHub Actions**.
4. Onglet Actions : attendez la coche verte (1–3 min). Le lien est indiqué dans Settings → Pages. Mettez-le dans le QR code.

## Ajouter une photo
1. Redimensionnez-la si possible (≈ 2000 px, JPG ; pas de HEIC). Nommez-la `2027-04-15_Voyage à Rome.jpg` (date et titre sont optionnels : `photo.jpg` fonctionne aussi).
2. Dans le dépôt : `photos` → dossier de la catégorie → Add file → Upload files → Commit changes (max 100 photos à la fois).
3. Attendez 1–3 min : la photo apparaît.

## Supprimer une photo
Ouvrez-la dans `photos/…`, cliquez sur la corbeille, Commit. Elle disparaît du site en 1–3 min.

## Modifier le titre ou la date
Renommez le fichier (crayon → nouveau nom → Commit).

## Catégories
Une catégorie = un dossier dans `photos/`. Le préfixe `01 `, `02 `… fixe l'ordre et n'est pas affiché. Pour en ajouter une, créez un dossier en y envoyant une première photo. Une catégorie vide n'apparaît pas.

## Timeline
`data/events.json` → crayon. Ajoutez ou supprimez un bloc `{ "month": "Mars", "title": "Titre", "text": "Texte" }` (virgule entre les blocs, pas après le dernier).

## Élèves
`data/students.json` : une ligne par élève `{ "name": "Prénom", "surname": "Nom", "class": "6A" }`. Pour supprimer, effacez la ligne. Classement et groupes par classe sont automatiques.

## Texte de l'accueil
`index.html` : modifiez le texte dans la section `<!-- ACCUEIL -->`. Pensez aussi à votre contact dans la section About.

## Publier
Chaque modification validée (Commit) sur `main` publie le site automatiquement.

## Tester chez soi (facultatif)
`pip install pillow`, puis `python build.py`, puis `cd _site` et `python -m http.server`, puis http://localhost:8000.

## Sur plusieurs années
- Aucun service payant, aucune dépendance à maintenir : gardez simplement le compte GitHub.
- Téléchargez régulièrement une copie du dépôt (Code → Download ZIP).
- Si le site cesse de se mettre à jour : onglet Actions → ouvrir la dernière exécution pour lire l'erreur.
- Limite : environ 1 Go de photos dans le dépôt.
- Le site est public pour qui a le lien : ne publiez que des photos consenties, et retirez toute photo sur demande.
