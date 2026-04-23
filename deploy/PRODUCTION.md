# Deploiement production Story Forge

Ce guide part d'une hypothese importante: l'ancien Droplet a probablement ete compromis. Ne remettez pas cet ancien serveur en ligne. Reparte d'un Droplet neuf Ubuntu et regenerez tous les secrets.

## Fichiers a utiliser

- `docker-compose.prod.yml`: stack Docker Compose de production
- `.env.production.example`: modele a copier vers `.env.production`
- `deploy/nginx/storyforge-http.conf`: config Nginx temporaire pour le bootstrap HTTP et l'emission du certificat
- `deploy/nginx/storyforge.conf`: config Nginx finale en HTTPS
- `deploy/systemd/storyforge.service`: service systemd pour relancer la stack au reboot

## 1. DNS et serveur propre

1. Creez un nouveau Droplet Ubuntu 24.04.
2. Pointez votre domaine vers l'IP du serveur.
3. N'utilisez ni snapshot ni backup du Droplet compromis.
4. Mettez le serveur a jour:

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

## 2. Paquets systeme

Installez Docker, Nginx et Certbot:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg nginx certbot
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker nginx
```

## 3. Pare-feu

N'utilisez pas UFW seul comme protection des conteneurs Docker. Docker peut publier des ports sans respecter UFW. La protection repose ici sur deux couches:

- les services sensibles ne publient pas de port public dans `docker-compose.prod.yml`
- le Cloud Firewall DigitalOcean n'autorise que `22`, `80` et `443`

Configurez quand meme UFW sur l'hote:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Dans DigitalOcean Cloud Firewall:

- autorisez `22/tcp` seulement depuis votre IP
- autorisez `80/tcp` et `443/tcp` depuis `0.0.0.0/0` et `::/0`
- n'autorisez jamais `3000`, `8000`, `5432`, `6379`

## 4. Recuperation du repo

```bash
sudo mkdir -p /opt/storyforge
sudo chown $USER:$USER /opt/storyforge
git clone <URL_DU_REPO> /opt/storyforge
cd /opt/storyforge
```

## 5. Variables d'environnement

Copiez le fichier d'exemple:

```bash
cp .env.production.example .env.production
```

Generez des secrets forts:

```bash
openssl rand -base64 48
openssl rand -hex 32
```

Renseignez dans `.env.production` au minimum:

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `SESSION_SECRET`
- `FRONTEND_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`

Points importants:

- `FRONTEND_BASE_URL` doit etre votre URL publique en `https`
- `NEXT_PUBLIC_API_BASE_URL` doit pointer vers `https://votre-domaine/api/v1`
- `SPOTIFY_REDIRECT_URI` doit correspondre exactement a l'URL configuree chez Spotify
- `ALLOWED_HOSTS` et `CORS_ALLOWED_ORIGINS` utilisent un tableau JSON
- laissez `CORS_ALLOWED_ORIGIN_REGEX=` vide en production

Exemple:

```dotenv
FRONTEND_BASE_URL=https://storyforge.example.com
NEXT_PUBLIC_API_BASE_URL=https://storyforge.example.com/api/v1
SPOTIFY_REDIRECT_URI=https://storyforge.example.com/api/v1/auth/spotify/callback
ALLOWED_HOSTS=["storyforge.example.com","www.storyforge.example.com"]
CORS_ALLOWED_ORIGINS=["https://storyforge.example.com","https://www.storyforge.example.com"]
```

## 6. Demarrage de la stack applicative

Lancez la stack:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Verifiez que l'application repond localement:

```bash
curl http://127.0.0.1:8000/health
curl -I http://127.0.0.1:3000/fr
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Attendu:

- `backend` publie seulement `127.0.0.1:8000`
- `frontend` publie seulement `127.0.0.1:3000`
- `postgres` et `redis` ne publient aucun port

Controle utile:

```bash
ss -ltnp | grep -E ':(80|443|3000|8000|5432|6379)\b'
```

Vous ne devez jamais voir `0.0.0.0:5432` ni `0.0.0.0:6379`.

## 7. Nginx HTTP pour le bootstrap

Editez d'abord les noms de domaine dans `deploy/nginx/storyforge-http.conf` et `deploy/nginx/storyforge.conf`.

Si vous n'utilisez pas `www`, retirez-le partout:

- dans les deux fichiers Nginx
- dans `.env.production`

Installez ensuite la config HTTP temporaire:

```bash
sudo mkdir -p /var/www/certbot
sudo cp deploy/nginx/storyforge-http.conf /etc/nginx/sites-available/storyforge.conf
sudo ln -sf /etc/nginx/sites-available/storyforge.conf /etc/nginx/sites-enabled/storyforge.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Certificat Let's Encrypt avec Certbot

Demandez le certificat:

```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d storyforge.example.com -d www.storyforge.example.com
```

Si vous n'utilisez pas `www`, retirez le second `-d`.

Verifiez ensuite que le timer de renouvellement existe:

```bash
systemctl status certbot.timer
```

## 9. Nginx HTTPS final

Installez la config TLS finale:

```bash
sudo cp deploy/nginx/storyforge.conf /etc/nginx/sites-available/storyforge.conf
sudo nginx -t
sudo systemctl reload nginx
```

Testez:

```bash
curl -I https://storyforge.example.com
curl https://storyforge.example.com/health
```

## 10. Redemarrage automatique au boot

Le service systemd suppose que le repo est dans `/opt/storyforge`. Si vous avez choisi un autre chemin, modifiez `deploy/systemd/storyforge.service` avant de l'installer.

```bash
sudo cp deploy/systemd/storyforge.service /etc/systemd/system/storyforge.service
sudo systemctl daemon-reload
sudo systemctl enable --now storyforge
```

## 11. Procedure de mise a jour

```bash
cd /opt/storyforge
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build --remove-orphans
sudo systemctl reload storyforge
```

Pour suivre les logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
```

## 12. Checklist de securite

- utilisez un Droplet neuf
- changez tous les secrets apres l'incident: Spotify, sessions, mots de passe DB/Redis, cles SSH si besoin
- ne deployeez jamais `docker-compose.yml` sur un serveur public
- ne publiez jamais `5432` ni `6379`
- gardez `EXPOSE_API_DOCS=false` en production
- laissez `SECURE_COOKIES=true`
- verifiez le Cloud Firewall apres chaque nouveau serveur
- appliquez les mises a jour systeme regulierement

## 13. Verification finale

Avant ouverture au public, confirmez:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl -I https://storyforge.example.com
curl https://storyforge.example.com/health
ss -ltnp | grep -E ':(80|443|3000|8000|5432|6379)\b'
```

Resultat attendu:

- le site repond en HTTPS
- le certificat est valide
- `3000` et `8000` sont lies a `127.0.0.1`
- `5432` et `6379` ne sont pas exposes
