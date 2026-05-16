# Kara Immobilier Service - PRD (Product Requirements Document)

## Project Overview
**Nom**: Kara Immobilier Service  
**Type**: Site vitrine / Landing page bilingue (FR/EN)  
**Zones**: Montréal, Laval, Longueuil, Brossard, Trois-Rivières  
**Date de création**: Janvier 2026  
**Dernière mise à jour**: Mars 2026

---

## Contact Info
- **Téléphone**: 438-439-9590
- **Email**: infokaraimmo@gmail.com

---

## What's Been Implemented ✅

### Mars 2026 - Mise à jour majeure
- [x] Bilinguisme complet FR/EN avec sélecteur de langue
- [x] Nouveau service "Mise en Location" (photos, annonces, visites, enquête crédit)
- [x] 2 ans d'expérience (mis à jour)
- [x] Pages légales: Politique de confidentialité + Conditions d'utilisation
- [x] Chatbot IA bilingue (répond en FR ou EN selon la langue)
- [x] Persistance de la langue (localStorage)

### Janvier 2026 - MVP Initial
- [x] Page d'accueil avec sections Hero, Services, Avantages, Contact, Footer
- [x] Navigation sticky avec effet glassmorphism
- [x] Formulaire de contact fonctionnel avec stockage MongoDB
- [x] Chatbot IA intégré avec GPT-5.2
- [x] Design moderne minimaliste (Playfair Display + Manrope)
- [x] Responsive mobile

---

## Services offerts
1. Mise en location (photos, annonces, visites, enquête de crédit)
2. Gestion des locataires
3. Encaissement des loyers
4. Gestion des retards
5. Coordination réparations
6. Entretien & Maintenance
7. Communication 24/7

---

## Routes Frontend
| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/privacy` | Politique de confidentialité |
| `/terms` | Conditions d'utilisation |

---

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Lucide React, React Router
- **Backend**: FastAPI, Python 3.11
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 via emergentintegrations (bilingue)

---

## Backlog
- [ ] SendGrid email integration (clé API requise)
- [ ] Tableau de bord admin
- [ ] Blog/Actualités
- [ ] Témoignages clients
