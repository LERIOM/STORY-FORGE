# Brainstorming Story Forge

## But du document

Construire un cadrage clair pour le site web de Story Forge afin de pouvoir ensuite demander a Codex de concevoir et coder le produit avec des choix coherents.

Le brainstorming se fait etape par etape. Le document est mis a jour au fil des questions, decisions et arbitrages.

## Objectifs deja exprimes

- Faire un site responsive.
- Avoir un design moderne et dans l'air du temps.
- Garder une experience simple et facile d'utilisation.
- Permettre la connexion via Spotify.
- Recuperer ce qu'ecoute l'utilisateur.
- Integrer une musique de l'utilisateur dans les stories.
- Construire une base robuste.
- Stocker les utilisateurs, stories et autres donnees de maniere fiable.
- Ne pas etre oblige de reprendre tel quel le contenu des slides existantes.
- Avoir une interface hybride telephone / ordinateur, avec une priorite claire au mobile.

## Vision produit clarifiee

Story Forge est une interface web qui permet a un utilisateur de generer une story a partir de:

- une ou plusieurs images fournies par l'utilisateur
- un contexte ecrit par l'utilisateur
- les habitudes musicales Spotify de l'utilisateur

Pipeline produit vise:

- l'utilisateur se connecte
- il ajoute des images
- il ecrit un contexte ou une intention
- un modele IA deja code par l'equipe genere le visuel de la story
- un autre modele deja code choisit une musique Spotify coherente avec le contexte parmi les habitudes d'ecoute de l'utilisateur
- l'interface assemble le rendu final et permet la consultation, l'eventuelle regeneration et le partage

Le coeur du travail a cadrer ici est donc surtout:

- l'experience utilisateur
- l'architecture web du site
- les choix de pages et de parcours
- la robustesse de stockage et d'integration

## Contraintes et axes importants

- Le site doit rester credibile techniquement, pas seulement joli.
- L'integration Spotify doit respecter les limites du service et des autorisations.
- Le produit doit avoir une logique claire de creation, sauvegarde et consultation des stories.
- Le choix de stack et de base de donnees devra privilegier la fiabilite et la maintenabilite.

## Questions ouvertes

### Q1. Positionnement produit

Question:
Est-ce que Story Forge doit etre d'abord un generateur automatique de stories a partir d'une musique Spotify, ou plutot un editeur guide ou l'utilisateur garde la main sur la structure et le contenu ?

Conseil:
Pour un premier produit solide, je recommande un **editeur guide avec generation assistee**. C'est plus robuste qu'un outil 100% automatique, plus simple a expliquer, et ca permet de garder un bon equilibre entre magie produit et controle utilisateur.

Reponse:
Le produit est un generateur de story a partir d'images et d'un contexte ecrit, avec une musique Spotify choisie automatiquement a partir des habitudes de l'utilisateur. L'interface doit etre mobile-first, tout en restant belle et fonctionnelle sur ordinateur.

Statut:
Tranche.

### Q2. Format de sortie principal

Question:
Pour la V1, est-ce que la sortie principale doit etre une seule story verticale 9:16 avec une musique associee, ou une mini-sequence de plusieurs stories generees en une fois ?

Conseil:
Je recommande de commencer par **une seule story verticale 9:16 + une musique**. C'est beaucoup plus net pour l'interface, la generation, le stockage, la previsualisation et le partage. Les sequences multi-stories pourront venir ensuite comme evolution.

Reponse:
Une seule story verticale.

Statut:
Tranche.

### Q3. Niveau de controle apres generation

Question:
Apres la generation, est-ce que l'utilisateur doit pouvoir regenerer separement le visuel et la musique, ou seulement relancer une generation complete ?

Conseil:
Je recommande de permettre **trois actions simples**:

- regenerer l'image
- changer la musique
- regenerer toute la story

Ca donne une sensation de controle tres utile sans rendre l'interface trop complexe. En plus, c'est un bon compromis produit si vos modules image et musique sont deja separes.

Reponse:
L'utilisateur doit pouvoir regenerer les deux elements.

Interpretation retenue:

- regenerer l'image separement
- regenerer la musique separement

Statut:
Tranche.

### Q4. Moment de la connexion Spotify

Question:
Est-ce que l'utilisateur doit connecter Spotify des l'arrivee sur le site, ou seulement au moment de creer sa premiere story ?

Conseil:
Je recommande un parcours en deux temps:

- visite libre de la landing page sans connexion
- connexion Spotify demandee au moment de lancer la premiere creation

Ca reduit la friction d'entree, tout en gardant un parcours logique puisque la musique personnalisee depend de Spotify.

Reponse:
Connexion Spotify demandee juste avant la premiere generation.

Statut:
Tranche.

### Q5. Spotify obligatoire ou mode degrade

Question:
Est-ce que la generation d'une story doit etre impossible sans connexion Spotify, ou bien faut-il prevoir un mode degrade sans personnalisation musicale ?

Conseil:
Pour une V1 propre et robuste, je recommande de rendre **Spotify obligatoire pour generer**. Ca simplifie beaucoup:

- le parcours utilisateur
- les messages d'erreur
- la logique backend
- la promesse produit

Le mode degrade sans Spotify peut venir plus tard si vous voulez elargir le public.

Reponse:
La generation doit etre inaccessible sans Spotify.

Statut:
Tranche.

### Q6. Confidentialite des stories

Question:
Quand une story est generee, est-ce qu'elle doit etre privee par defaut, ou partageable publiquement via un lien ?

Conseil:
Je recommande **privee par defaut avec option de partage par lien**. C'est le meilleur compromis:

- plus rassurant pour l'utilisateur
- plus propre juridiquement si des photos de tiers sont utilisees
- plus robuste pour la V1

Et si vous ajoutez le partage, faites-le comme une action explicite apres generation, pas comme un comportement automatique.

Reponse:
La story doit etre privee et telechargeable directement.

Interpretation retenue:

- story privee par defaut
- pas de partage public necessaire en V1
- telechargement direct du resultat comme action principale

Statut:
Tranche.

### Q7. Nombre d'images autorisees

Question:
Pour une story, est-ce que tu veux limiter l'utilisateur a un petit nombre d'images, ou lui laisser en envoyer beaucoup ?

Conseil:
Je recommande de fixer une plage simple pour la V1, par exemple **1 a 5 images maximum**. C'est meilleur pour:

- la lisibilite de l'interface mobile
- les temps d'upload
- la stabilite de la generation
- la comprehension du produit

Si vous laissez un nombre trop grand des le debut, vous compliquez le formulaire, le backend et les cas d'erreur.

Reponse:
Minimum 1 image, maximum 5 images.

Interpretation retenue:

- 1 image minimum obligatoire
- 5 images maximum en V1
- cette limite doit pouvoir etre modifiee plus tard facilement
- la regle doit etre configurable, pas codee en dur dans l'interface ou le backend

Statut:
Tranche.

### Q8. Historique des stories

Question:
Est-ce que tu veux que chaque story generee soit enregistree dans un historique utilisateur consultable plus tard, ou est-ce que le site doit surtout produire la story puis laisser l'utilisateur la telecharger sans la conserver longtemps ?

Conseil:
Je recommande **un historique utilisateur prive**. C'est meilleur pour:

- retrouver une story sans la regenerer
- donner de la valeur au tableau de bord
- justifier un vrai systeme de comptes et de stockage
- permettre plus tard des fonctions comme duplication ou regeneration a partir d'une ancienne story

Si vous voulez rester sobres, vous pouvez garder un historique simple sans fonctions sociales.

Reponse:
Chaque story generee doit etre conservee dans un historique prive de l'utilisateur.

Interpretation retenue:

- chaque utilisateur dispose d'une bibliotheque privee de ses stories
- une story deja generee peut etre revue plus tard
- le tableau de bord doit permettre de retrouver les creations passees

Statut:
Tranche.

### Q9. Conservation des images sources

Question:
Est-ce que tu veux conserver les images originales envoyees par l'utilisateur avec chaque story, ou seulement garder le resultat final genere et quelques metadonnees ?

Conseil:
Je recommande de **conserver le resultat final et les metadonnees**, mais de bien reflechir avant de garder les images sources sur le long terme. Pour une V1 robuste et respectueuse de la vie privee, un bon compromis est:

- garder les images sources uniquement si c'est necessaire pour regenerer proprement
- sinon, privilegier une suppression plus rapide des originaux

Ca reduit les risques de confidentialite et le poids du stockage.

Reponse:
Conserver dans tous les cas le resultat final et les metadonnees.

Interpretation retenue:

- le rendu final de la story doit etre stocke
- les metadonnees de generation doivent etre stockees
- la decision sur la conservation longue duree des images sources reste a preciser

Statut:
Partiellement tranche.

### Q10. Duree de vie des images sources

Question:
Une fois la story generee, est-ce que tu veux conserver les images sources dans le compte utilisateur, ou les supprimer apres un certain temps en gardant seulement le resultat final et les metadonnees ?

Conseil:
Je recommande de **supprimer les images sources apres generation ou apres une courte retention technique**, tout en gardant le rendu final et les metadonnees. C'est le choix le plus propre pour une V1 robuste:

- moins de risque sur les donnees personnelles
- moins de stockage
- moins de complexite juridique et technique

Si plus tard vous avez besoin de reedition complete a partir des sources, vous pourrez rendre cette retention configurable.

Reponse:
Supprimer les images sources apres generation, ou apres une courte retention technique.

Interpretation retenue:

- les images sources ne sont pas conservees durablement dans le compte utilisateur
- le stockage long terme conserve surtout le rendu final et les metadonnees
- une retention technique courte peut exister si elle est necessaire au pipeline
- la politique de retention doit pouvoir evoluer plus tard

Statut:
Tranche.

### Q11. Structure de la page de creation

Question:
Pour creer une story, est-ce que tu veux une seule grande page avec tous les champs visibles, ou un parcours en etapes successives ?

Conseil:
Je recommande un **wizard en 4 etapes simples** sur mobile:

- ajout des images
- saisie du contexte
- connexion Spotify si necessaire
- generation puis resultat

C'est plus lisible sur telephone, plus moderne visuellement, et ca permet de mieux gerer les validations et les erreurs.

Reponse:
Parcours en etapes successives.

Interpretation retenue:

- creation en mode wizard mobile-first
- progression claire et visible
- validations et erreurs gerees etape par etape
- experience desktop adaptee sans perdre la logique mobile

Statut:
Tranche.

### Q12. Ecran principal apres connexion

Question:
Apres connexion, est-ce que tu veux envoyer l'utilisateur directement sur la creation d'une nouvelle story, ou d'abord sur un tableau de bord avec ses stories recentes et un bouton principal pour en creer une ?

Conseil:
Je recommande un **tableau de bord simple avec un gros bouton "Nouvelle story"**. C'est meilleur pour la V1:

- l'utilisateur retrouve ses creations recentes
- il comprend tout de suite la structure du produit
- on garde un point d'entree stable pour mobile et desktop

Si tu envoies directement sur la creation, tu perds un peu la valeur de l'historique prive.

Reponse:
Je veux que l'utilisateur arrive sur la creation de nouvelles stories.

Interpretation retenue:

- l'ecran principal apres connexion est la page de creation
- l'action principale reste la creation d'une nouvelle story
- l'acces a l'historique se fait via une page dediee, pas sur le meme ecran

Statut:
Tranche.

### Q13. Navigation principale sur mobile

Question:
Sur mobile, est-ce que tu veux une navigation tres courte avec quelques onglets fixes en bas, ou plutot un menu hamburger plus discret ?

Conseil:
Je recommande une **bottom navigation simple a 3 ou 4 entrees maximum**. C'est generalement plus fluide pour un produit mobile-first. Par exemple:

- creer
- mes stories
- profil

Eventuellement un quatrieme acces si vous avez un vrai besoin, mais il faut rester tres compact pour garder une interface moderne et evidente.

Reponse:
Bottom navigation tres simple avec 3 entrees:

- creer
- mes stories
- profil

Precision importante:

- les stories deja creees ne sont plus affichees sur la page de creation
- l'historique recent vit dans l'onglet ou la page `Mes stories`

Statut:
Tranche.

### Q14. Navigation desktop

Question:
Sur ordinateur, est-ce que tu veux reprendre ces memes sections dans une barre en haut, ou preferer une autre structure comme une sidebar ?

Conseil:
Je recommande **une barre de navigation horizontale en haut sur desktop**, avec les memes 3 sections:

- creer
- mes stories
- profil

Pourquoi:

- plus naturel sur ordinateur qu'une bottom navigation
- plus propre visuellement pour une interface simple
- plus coherent avec un produit qui reste leger en nombre de pages

Je ne conseille une sidebar que si vous prevoyez beaucoup plus d'espaces ou d'outils plus tard.

Reponse:
Validation d'une barre de navigation horizontale en haut sur desktop.

Interpretation retenue:

- desktop avec navigation en haut
- memes 3 sections que sur mobile: creer, mes stories, profil
- navigation differenciee selon le support, mais architecture produit identique
- l'interface desktop reste plus aeree et naturelle sans recopier la navigation mobile

Statut:
Tranche.

### Q15. Direction visuelle globale

Question:
Pour le design general du site, est-ce que tu veux quelque chose de tres epure et minimal, ou plutot une direction plus creative, editoriale et expressive ?

Conseil:
Je recommande une direction **creative mais propre**, pas un style SaaS trop generique. Pour Story Forge, un bon axe serait:

- interface nette et simple a utiliser
- visuels immersifs et mise en avant du format story
- typographie avec un peu de personnalite
- touches de couleur fortes mais controlees

Ca permet d'avoir un site dans l'air du temps sans sacrifier la clarte.

Reponse:
Je veux:

- une interface simple a utiliser
- une mise en avant du format story
- une typographie avec un peu de personnalite
- des couleurs pures, assez sobres

Interpretation retenue:

- direction visuelle creative mais maitrisee
- interface claire et lisible avant tout
- le format story doit etre visuellement central dans l'UI
- la palette doit rester sobre, sans effet flashy ou surcharge

Statut:
Tranche.

### Q16. Ambiance de theme

Question:
Pour l'interface generale, est-ce que tu preferes un theme majoritairement clair, majoritairement sombre, ou un mix des deux selon les zones ?

Conseil:
Je recommande un **theme clair sobre pour l'interface**, avec eventuellement des zones plus sombres pour la previsualisation de story. C'est souvent le meilleur compromis:

- plus propre et plus lisible pour les formulaires
- plus simple a rendre elegant sur desktop et mobile
- bon contraste pour mettre en valeur le rendu vertical de la story

Un site entierement sombre peut etre beau, mais il devient plus vite lourd ou generique.

Reponse:
Theme clair en general, et sombre seulement la ou c'est utile.

Interpretation retenue:

- interface principale majoritairement claire
- zones sombres reservees aux endroits ou elles ont un vrai interet visuel ou fonctionnel
- la previsualisation de story ou certaines sections immersives peuvent utiliser un traitement plus sombre
- le theme sombre ne doit pas dominer l'experience globale

Statut:
Tranche.

### Q17. Rôle de la landing page

Question:
Avant connexion, est-ce que tu veux une landing page tres simple avec un seul gros appel a l'action, ou une landing page un peu plus riche qui explique clairement le fonctionnement du produit ?

Conseil:
Je recommande une **landing page courte mais explicative** avec:

- une accroche claire
- un apercu du rendu story
- 3 etapes de fonctionnement
- un bouton principal pour commencer

Ca reste leger, mais ca aide beaucoup a comprendre le produit avant de demander la connexion Spotify.

Reponse:
Landing page courte mais explicative, avec:

- une accroche claire
- un apercu du rendu story
- 3 etapes de fonctionnement
- un bouton principal pour commencer

Statut:
Tranche.

### Q18. Promesse principale affichee

Question:
Quel ton veux-tu pour la phrase d'accroche principale sur la landing page: plutot emotionnel et creatif, ou plutot clair et fonctionnel ?

Conseil:
Je recommande une accroche **claire avec une touche creative**, pas trop abstraite. Par exemple, l'idee generale devrait faire comprendre en une phrase:

- que l'utilisateur part de ses images
- qu'il ajoute un contexte
- que Story Forge genere une story avec une musique adaptee

Une promesse trop poetique risque de rendre le produit moins immediatement comprehensible.

Reponse:
Une accroche claire avec une touche creative. Il faut comprendre tout de suite:

- qu'on part des images de l'utilisateur
- qu'il ajoute un contexte
- que le site genere une story avec une musique adaptee

Interpretation retenue:

- la promesse marketing doit rester immediatement comprehensible
- le hero de landing page doit expliquer le produit sans jargon
- la creativite sert le desirabilite, mais ne doit pas masquer le fonctionnement

Statut:
Tranche.

### Q19. Apercu visuel principal sur la landing page

Question:
Pour l'apercu principal du produit sur la landing page, est-ce que tu veux plutot une maquette de telephone avec une story exemple, ou un visuel plus abstrait et artistique ?

Conseil:
Je recommande **une maquette de telephone avec une vraie preview de story** et un petit indice visuel sur la musique choisie. Par exemple:

- un ecran vertical 9:16 bien visible
- une image de story exemple
- un badge ou mini lecteur indiquant la musique selectionnee
- une animation tres legere au lieu d'un effet trop charge

C'est plus clair pour expliquer le produit en 2 secondes, surtout sur un site mobile-first.

Reponse:

- un ecran vertical 9:16
- une story exemple
- un badge ou mini lecteur pour la musique
- une animation legere seulement

Interpretation retenue:

- le hero visuel de la landing page doit montrer concretement le produit
- le format story vertical doit etre la piece centrale du design
- la musique doit etre visible sans prendre trop de place
- les animations doivent rester discretes et elegantes

Statut:
Tranche.

### Q20. Etape avant la connexion Spotify

Question:
Quand l'utilisateur clique sur le bouton principal pour commencer, est-ce que tu veux le rediriger directement vers la connexion Spotify, ou afficher d'abord un petit ecran d'explication sur ce qui sera utilise ?

Conseil:
Je recommande un **court ecran de transition avant la connexion Spotify**, avec:

- pourquoi Spotify est necessaire
- quelles donnees sont utilisees a haut niveau
- un bouton clair pour continuer

C'est meilleur pour la confiance utilisateur, surtout si on lui demande un acces a ses habitudes d'ecoute.

Reponse:
Afficher un ecran tres court avant la connexion Spotify, avec:

- pourquoi Spotify est necessaire
- un bouton clair pour continuer

Interpretation retenue:

- l'explication avant connexion doit rester minimale
- il ne faut pas surcharger l'utilisateur avec trop de texte
- on privilegie la clarte du besoin Spotify plutot qu'un ecran de permissions trop dense

Statut:
Tranche.

### Q21. Retour apres connexion Spotify

Question:
Une fois Spotify connecte avec succes, est-ce que tu veux envoyer l'utilisateur directement sur la premiere etape d'upload d'images, ou afficher d'abord un petit ecran de confirmation ?

Conseil:
Je recommande de **rediriger directement vers la premiere etape de creation**, avec juste un petit indicateur visuel du type `Spotify connecte`. C'est meilleur pour l'UX:

- moins de friction
- sensation de progression immediate
- parcours plus fluide sur mobile

Un ecran de confirmation complet risque surtout d'ajouter une etape de trop.

Reponse:
Envoyer directement l'utilisateur sur la premiere etape de creation.

Precision:

- pas d'ecran de confirmation intermediaire
- pas besoin d'un indicateur visuel dedie du type `Spotify connecte` sur ce moment du parcours
- si l'utilisateur est dans le flux de creation, la connexion Spotify est implicite

Interpretation retenue:

- le parcours apres OAuth doit rester immediat
- on evite toute etape inutile entre la connexion et l'action
- l'etat Spotify pourra etre visible plus tard dans le profil ou les parametres si besoin, mais pas comme element central ici

Statut:
Tranche.

### Q22. Experience d'upload d'images

Question:
Sur la premiere etape de creation, est-ce que tu veux un upload tres simple, ou bien donner deja un peu de controle sur l'ordre et l'aperçu des images ?

Conseil:
Je recommande pour la V1:

- selection multiple d'images
- apercu en miniatures
- possibilite de supprimer une image avant generation
- possibilite de reordonner les images

Je ne conseille pas d'ajouter tout de suite des fonctions plus lourdes comme recadrage complexe, filtres ou edition avancee. Sur mobile, il vaut mieux rester rapide et net.

Reponse:

- selection multiple d'images
- apercu en miniatures
- suppression d'une image avant generation
- pas besoin de reorganisation de l'ordre des images

Interpretation retenue:

- l'upload doit rester simple et rapide
- l'utilisateur peut verifier visuellement ses images avant generation
- il peut retirer une image, mais pas reordonner la selection en V1
- pas d'edition avancee dans cette etape

Statut:
Tranche.

### Q23. Saisie du contexte

Question:
Pour l'etape de contexte, est-ce que tu veux juste une zone de texte libre, ou une zone de texte avec quelques aides comme des exemples ou des suggestions de formulation ?

Conseil:
Je recommande **une zone de texte libre avec une aide legere**:

- un champ principal simple
- un exemple visible sous le champ
- 2 ou 3 suggestions cliquables du type `anniversaire`, `souvenir`, `sortie entre amis`

Ca reste tres fluide, mais ca aide l'utilisateur a comprendre quoi ecrire sans rendre l'interface lourde.

Reponse:
2 ou 3 suggestions cliquables comme `anniversaire`, `souvenir`, `sortie entre amis`.

Interpretation retenue:

- champ de contexte principal en texte libre
- aide legere avec quelques suggestions cliquables
- suggestions concues pour accelerer la saisie, pas pour enfermer l'utilisateur
- l'etape doit rester simple et rapide a completer

Statut:
Tranche.

### Q24. Ecran de generation

Question:
Pendant que l'IA genere la story et choisit la musique, est-ce que tu veux un simple loader, ou un vrai ecran d'attente un peu travaille ?

Conseil:
Je recommande un **ecran d'attente travaille mais sobre**, avec:

- un apercu visuel ou cadre vertical de la story en cours
- un message de progression simple
- une animation legere
- pas de fausse barre de progression trop precise si vous n'avez pas de vrai suivi technique

Ca rend l'attente plus qualitative sans promettre une precision que le backend ne garantit pas.

Reponse:

- un cadre vertical de story en cours
- un message de progression simple
- une animation legere

Interpretation retenue:

- l'ecran de generation doit rester immersif sans etre charge
- la forme verticale rappelle le resultat attendu
- l'attente doit etre habillee mais sobre
- pas de complexite artificielle dans l'affichage de progression

Statut:
Tranche.

### Q25. Actions principales sur la page de resultat

Question:
Une fois la story generee, quelles actions veux-tu mettre le plus en avant visuellement ?

Conseil:
Je recommande cet ordre de priorite sur la page de resultat:

- telecharger la story
- regenerer l'image
- changer la musique
- creer une nouvelle story

Pourquoi:

- le telechargement est ton objectif principal de sortie
- les options de regeneration restent utiles sans prendre la place du resultat
- l'interface reste claire si on limite a peu d'actions principales visibles

Reponse:
Validation de cet ordre de priorite:

- telecharger la story
- regenerer l'image
- changer la musique
- creer une nouvelle story

Interpretation retenue:

- le telechargement est l'action principale de la page de resultat
- les actions de regeneration restent secondaires mais visibles
- la page doit rester lisible et centree sur le rendu final

Statut:
Tranche.

### Q26. Presentation de la page Mes stories

Question:
Sur la page `Mes stories`, est-ce que tu veux un affichage tres simple en liste/cartes, ou quelque chose de plus visuel type galerie dense ?

Conseil:
Je recommande une **galerie de cartes verticales assez aeree**, pas une liste textuelle. Par exemple:

- miniature du rendu story
- date de creation
- court extrait du contexte
- acces rapide a voir et telecharger

Ca reste tres clair sur mobile, tout en mettant bien en valeur le format story.

Reponse:
Validation d'une galerie de cartes verticales assez aeree, avec:

- miniature du rendu story
- date de creation
- court extrait du contexte
- acces rapide a voir et telecharger

Interpretation retenue:

- `Mes stories` doit etre visuel avant d'etre textuel
- le format carte verticale renforce l'identite story du produit
- l'utilisateur doit retrouver rapidement une creation sans ouvrir chaque fiche

Statut:
Tranche.

### Q27. Recherche et filtres dans Mes stories

Question:
Sur la page `Mes stories`, est-ce que tu veux deja une barre de recherche et des filtres en V1, ou garder un ecran plus simple ?

Conseil:
Je recommande pour la V1:

- pas de barre de recherche complexe
- un tri simple par plus recent d'abord
- eventuellement un filtre minimal plus tard si le volume augmente

Ca garde l'interface propre et evite d'ajouter des controles qui ne serviront pas beaucoup au debut.

Reponse:
Plus tard, mais pas pour l'instant.

Interpretation retenue:

- pas de recherche en V1
- pas de filtres en V1
- affichage simple avec tri par plus recent d'abord
- recherche et filtres gardes comme evolution future

Statut:
Tranche.

### Q28. Contenu de la page Profil

Question:
Sur la page `Profil`, est-ce que tu veux un espace tres minimal, ou une vraie page de parametres avec plusieurs options ?

Conseil:
Je recommande une **page profil simple mais utile** pour la V1, avec:

- les infos de base du compte
- l'etat du compte Spotify connecte
- une action pour reconnecter ou changer le compte Spotify
- un bouton de deconnexion
- une zone secondaire pour suppression de compte si tu veux la prevoir

Ca reste sobre, mais assez solide pour un vrai produit.

## Decisions prises

- Le produit est un generateur de story a partir d'images + contexte utilisateur.
- La musique est choisie via Spotify a partir des habitudes d'ecoute de l'utilisateur.
- Le site doit etre mobile-first, avec une version desktop soignee.
- La V1 genere une seule story verticale au format 9:16.
- L'utilisateur peut regenerer l'image et la musique separement apres generation.
- La landing page peut etre consultee sans connexion.
- La connexion Spotify est demandee juste avant la premiere generation.
- La generation est inaccessible sans connexion Spotify.
- Les stories sont privees par defaut.
- Le telechargement direct de la story generee est une action principale de la V1.
- Une story doit accepter de 1 a 5 images.
- La limite d'images doit rester configurable plus tard.
- Chaque story generee est conservee dans un historique prive utilisateur.
- Le resultat final de chaque story est conserve.
- Les metadonnees de generation sont conservees.
- Les images sources sont supprimees apres generation, ou apres une courte retention technique.
- La retention des images sources doit pouvoir evoluer plus tard si necessaire.
- La creation d'une story se fait via un parcours en etapes successives.
- Apres connexion, l'utilisateur arrive directement sur la page de creation.
- Sur mobile, la navigation principale est une bottom navigation a 3 entrees: creer, mes stories, profil.
- Les stories deja creees ne sont pas affichees sur la page de creation.
- Sur desktop, la navigation principale est une barre horizontale en haut avec creer, mes stories et profil.
- La direction visuelle doit etre creative mais propre, avec une palette sobre et des couleurs pures.
- Le theme global est majoritairement clair, avec des zones sombres seulement quand elles apportent une vraie valeur visuelle ou fonctionnelle.
- La landing page doit etre courte mais explicative, avec une accroche, un apercu, 3 etapes et un bouton principal.
- L'accroche principale de la landing page doit etre claire, compréhensible immediatement, avec une touche creative.
- L'apercu principal de la landing page est un ecran vertical 9:16 avec une story exemple, un indice musical et une animation legere.
- Avant la connexion Spotify, on affiche un ecran tres court qui explique seulement pourquoi Spotify est necessaire, avec un bouton clair pour continuer.
- Apres connexion Spotify, l'utilisateur est redirige directement vers la premiere etape de creation, sans ecran ni indicateur intermediaire.
- L'etape d'upload permet la selection multiple, l'apercu en miniatures et la suppression d'image, sans reorganisation.
- L'etape de contexte repose sur un champ libre avec une aide legere et 2 ou 3 suggestions cliquables.
- L'ecran de generation montre un cadre vertical, un message simple et une animation legere.
- La page de resultat met en avant en priorite: telecharger, regenerer l'image, changer la musique, creer une nouvelle story.
- La page `Mes stories` utilise une galerie de cartes verticales assez aeree avec miniature, date, extrait de contexte et acces rapide.
- La page `Mes stories` reste simple en V1, sans recherche ni filtres, avec tri par date recente.

## Hypotheses temporaires

- Pour l'instant, on considere que la V1 s'appuie sur les modules IA deja codes par l'equipe.
- Le site web sert surtout de couche produit, UX, orchestration et stockage.
- Tant que Q28 n'est pas tranchee, on suppose une page `Profil` simple avec gestion du compte Spotify.

## Pages a definir

- Landing page
- Connexion / onboarding
- Creation d'une story
- Bibliotheque des stories
- Consultation / telechargement d'une story
- Parametres utilisateur

## Notes

- Les slides PDF sont presentes dans le dossier, mais pour l'instant le brainstorming ne depend pas de leur structure.
- Le projet ne se limite pas a une simple vitrine: il faut penser parcours utilisateur, backend, stockage et integration Spotify.
- Certaines regles produit doivent etre prevues comme configurables pour eviter de modifier le code a chaque ajustement de la V1.
- La protection de la vie privee doit influencer les choix de stockage des fichiers utilisateur.
