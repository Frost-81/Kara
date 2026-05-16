# Kara Immobilier Service

Site web de gestion immobilière bilingue (FR/EN) pour Kara Immobilier Service.

## Fonctionnalités

- Site vitrine moderne et responsive
- Formulaire de contact
- Chatbot IA (GPT-5.2)
- Bilingue Français/Anglais
- Pages légales (Politique de confidentialité, Conditions d'utilisation)

## Structure du projet

```
kara-immobilier/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── requirements.txt   # Dépendances Python
│   └── .env              # Variables d'environnement
├── frontend/
│   ├── src/
│   │   ├── App.js        # Composant principal React
│   │   ├── translations.js # Traductions FR/EN
│   │   ├── App.css       # Styles
│   │   └── index.css     # Styles globaux
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env
└── README.md
```

## Prérequis

- Node.js 18+
- Python 3.10+
- MongoDB

## Installation

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
# ou
yarn install
```

## Configuration

### Backend (.env)

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=kara_immobilier
CORS_ORIGINS=http://localhost:3000
EMERGENT_LLM_KEY=votre_cle_api
SENDGRID_API_KEY=votre_cle_sendgrid
SENDGRID_FROM_EMAIL=infokaraimmo@gmail.com
NOTIFICATION_EMAIL=infokaraimmo@gmail.com
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Lancement en développement

### Backend

```bash
cd backend
uvicorn server:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm start
# ou
yarn start
```

## Déploiement

### Avec Docker

```bash
docker-compose up -d
```

### Sur Vercel (Frontend)

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez

### Sur Railway/Render (Backend)

1. Connectez votre repo
2. Configurez les variables d'environnement
3. Déployez

## API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/` | GET | Health check |
| `/api/contact` | POST | Soumettre formulaire contact |
| `/api/chat` | POST | Chatbot IA |
| `/api/appointment` | POST | Réserver un rendez-vous |

## Contact

- **Téléphone**: 438-439-9590
- **Email**: infokaraimmo@gmail.com
- **Zones**: Montréal, Laval, Longueuil, Brossard, Trois-Rivières

## Licence

© 2024 Kara Immobilier Service. Tous droits réservés.
