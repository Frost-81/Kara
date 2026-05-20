from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# Emergent LLM imports (optional)
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False

# Firebase imports
try:
    import firebase_admin
    from firebase_admin import credentials, db, storage, auth, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

# SendGrid import (optional)
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db_mongo = client[os.environ['DB_NAME']]

# Firebase initialization
firebase_credentials_path = os.environ.get('FIREBASE_CREDENTIALS_PATH')
firebase_project_id = os.environ.get('FIREBASE_PROJECT_ID', 'kara-immobilier-service')
FIREBASE_DB_URL = os.environ.get('FIREBASE_DB_URL')

if FIREBASE_AVAILABLE and firebase_credentials_path and os.path.exists(firebase_credentials_path):
    try:
        if not firebase_admin.get_app():
            cred = credentials.Certificate(firebase_credentials_path)
            firebase_admin.initialize_app(cred, {
                'databaseURL': FIREBASE_DB_URL,
                'projectId': firebase_project_id
            })
        firebase_db = db
        firebase_firestore = firestore.client()
        logger_init = logging.getLogger(__name__)
        logger_init.info(f"Firebase initialized successfully with project: {firebase_project_id}")
    except Exception as e:
        FIREBASE_AVAILABLE = False
        logger_init = logging.getLogger(__name__)
        logger_init.warning(f"Firebase initialization failed: {str(e)}")
else:
    FIREBASE_AVAILABLE = False
    if not firebase_credentials_path:
        print("⚠️  FIREBASE_CREDENTIALS_PATH not set in .env")
    if firebase_project_id == 'kara-immobilier-service':
        print(f"✓ Firebase Project ID set to: {firebase_project_id}")

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# SendGrid configuration
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDGRID_FROM_EMAIL = os.environ.get('SENDGRID_FROM_EMAIL', 'infokaraimmo@gmail.com')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'infokaraimmo@gmail.com')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== Email Functions ====================

def send_notification_email(subject: str, html_content: str):
    """Send notification email via SendGrid"""
    if not SENDGRID_AVAILABLE or not SENDGRID_API_KEY:
        logger.warning("SendGrid not configured - email not sent")
        return False
    
    try:
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=NOTIFICATION_EMAIL,
            subject=subject,
            html_content=html_content
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info(f"Email sent successfully: {response.status_code}")
        return response.status_code == 202
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

def send_contact_notification(contact_data: dict):
    """Send notification for new contact form submission"""
    subject = f"Nouveau message de {contact_data['name']} - Kara Immobilier Service"
    html_content = f"""
    <h2>Nouveau message reçu</h2>
    <p><strong>Nom:</strong> {contact_data['name']}</p>
    <p><strong>Email:</strong> {contact_data['email']}</p>
    <p><strong>Téléphone:</strong> {contact_data.get('phone', 'Non fourni')}</p>
    <p><strong>Type de bien:</strong> {contact_data.get('property_type', 'Non spécifié')}</p>
    <p><strong>Message:</strong></p>
    <p>{contact_data['message']}</p>
    <hr>
    <p><em>Message envoyé depuis le site Kara Immobilier Service</em></p>
    """
    return send_notification_email(subject, html_content)

def send_appointment_notification(appointment_data: dict):
    """Send notification for new appointment booking"""
    subject = f"Nouvelle demande de RDV de {appointment_data['name']} - Kara Immobilier Service"
    html_content = f"""
    <h2>Nouvelle demande de rendez-vous</h2>
    <p><strong>Nom:</strong> {appointment_data['name']}</p>
    <p><strong>Email:</strong> {appointment_data['email']}</p>
    <p><strong>Téléphone:</strong> {appointment_data['phone']}</p>
    <p><strong>Date souhaitée:</strong> {appointment_data['preferred_date']}</p>
    <p><strong>Heure souhaitée:</strong> {appointment_data['preferred_time']}</p>
    <p><strong>Adresse du bien:</strong> {appointment_data.get('property_address', 'Non spécifiée')}</p>
    <p><strong>Notes:</strong> {appointment_data.get('notes', 'Aucune')}</p>
    <hr>
    <p><em>Demande envoyée depuis le site Kara Immobilier Service</em></p>
    """
    return send_notification_email(subject, html_content)

# ==================== Models ====================

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    property_type: Optional[str] = None

class ContactResponse(BaseModel):
    id: str
    status: str
    message: str

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = "fr"

class ChatResponse(BaseModel):
    response: str
    session_id: str

class AppointmentRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    preferred_date: str
    preferred_time: str
    property_address: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    status: str
    message: str

# ==================== Chat Sessions Storage ====================
chat_sessions = {}

# ==================== System Message for Chatbot ====================
SYSTEM_MESSAGE_FR = """Tu es l'assistant virtuel de Kara Immobilier Service, une entreprise spécialisée dans la gestion et location immobilière au Québec (Montréal, Laval, Longueuil, Brossard, Trois-Rivières).

Tes responsabilités:
1. Répondre aux questions sur nos services de gestion immobilière:
   - Mise en location (photos professionnelles, annonces, visites, enquête de crédit et vérification)
   - Gestion des locataires (appels, suivis, plaintes)
   - Encaissement des loyers
   - Gestion des retards de paiement
   - Coordination des réparations
   - Suivi de l'entretien et maintenance
   - Communication avec les locataires

2. Aider les clients à prendre rendez-vous avec nos experts

3. Informer sur les avantages de nos services:
   - Gain de temps pour les propriétaires
   - Éviter les problèmes de gestion
   - Revenus locatifs sécurisés
   - Tranquillité d'esprit totale

Ton ton: Professionnel, chaleureux, et rassurant. Tu parles en français.
Tu peux demander les coordonnées du client s'il souhaite être recontacté ou prendre rendez-vous.

Contact: 438-439-9590 | infokaraimmo@gmail.com

Si on te demande de prendre rendez-vous, demande:
- Nom complet
- Numéro de téléphone
- Email
- Date et heure souhaitées
- Adresse du bien (optionnel)
"""

SYSTEM_MESSAGE_EN = """You are the virtual assistant of Kara Immobilier Service, a company specializing in property management and rentals in Quebec (Montreal, Laval, Longueuil, Brossard, Trois-Rivières).

Your responsibilities:
1. Answer questions about our property management services:
   - Property listing (professional photos, ads, visits, credit check and verification)
   - Tenant management (calls, follow-ups, complaints)
   - Rent collection
   - Late payment management
   - Repair coordination
   - Maintenance tracking
   - Tenant communication

2. Help clients book appointments with our experts

3. Inform about the benefits of our services:
   - Time savings for property owners
   - Avoid management problems
   - Secured rental income
   - Total peace of mind

Your tone: Professional, warm, and reassuring. You speak in English.
You can ask for the client's contact information if they wish to be contacted or book an appointment.

Contact: 438-439-9590 | infokaraimmo@gmail.com

If asked to book an appointment, ask for:
- Full name
- Phone number
- Email
- Preferred date and time
- Property address (optional)
"""

# ==================== Routes ====================

@api_router.get("/")
async def root():
    return {"message": "Bienvenue sur l'API Kara Business Service"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ==================== Contact Form ====================

@api_router.post("/contact", response_model=ContactResponse)
async def submit_contact(contact: ContactRequest, background_tasks: BackgroundTasks):
    """Submit a contact form request"""
    try:
        contact_id = str(uuid.uuid4())
        contact_doc = {
            "id": contact_id,
            "name": contact.name,
            "email": contact.email,
            "phone": contact.phone,
            "message": contact.message,
            "property_type": contact.property_type,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.contacts.insert_one(contact_doc)
        
        # Send email notification in background
        background_tasks.add_task(send_contact_notification, contact_doc)
        
        logger.info(f"New contact form submitted: {contact.email}")
        
        return ContactResponse(
            id=contact_id,
            status="success",
            message="Votre message a été envoyé avec succès. Nous vous recontacterons dans les plus brefs délais."
        )
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi du message")

@api_router.get("/contacts")
async def get_contacts():
    """Get all contact submissions (admin endpoint)"""
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    return contacts

# ==================== AI Chatbot ====================

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_message: ChatMessage):
    """Chat with the AI assistant"""
    try:
        session_id = chat_message.session_id or str(uuid.uuid4())
        language = chat_message.language or "fr"
        
        # Select system message based on language
        system_message = SYSTEM_MESSAGE_EN if language == "en" else SYSTEM_MESSAGE_FR
        
        # Create a new session key that includes language to handle language switches
        session_key = f"{session_id}_{language}"
        
        # Get or create chat instance for this session
        if session_key not in chat_sessions:
            chat_sessions[session_key] = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_key,
                system_message=system_message
            ).with_model("openai", "gpt-5.2")
        
        chat = chat_sessions[session_key]
        
        # Create user message
        user_message = UserMessage(text=chat_message.message)
        
        # Get response
        response = await chat.send_message(user_message)
        
        # Store chat history in database
        chat_doc = {
            "session_id": session_id,
            "language": language,
            "user_message": chat_message.message,
            "bot_response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_history.insert_one(chat_doc)
        
        return ChatResponse(
            response=response,
            session_id=session_id
        )
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la communication avec l'assistant: {str(e)}")

# ==================== Appointments ====================

@api_router.post("/appointment", response_model=AppointmentResponse)
async def book_appointment(appointment: AppointmentRequest, background_tasks: BackgroundTasks):
    """Book an appointment"""
    try:
        appointment_id = str(uuid.uuid4())
        appointment_doc = {
            "id": appointment_id,
            "name": appointment.name,
            "email": appointment.email,
            "phone": appointment.phone,
            "preferred_date": appointment.preferred_date,
            "preferred_time": appointment.preferred_time,
            "property_address": appointment.property_address,
            "notes": appointment.notes,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.appointments.insert_one(appointment_doc)
        
        # Send email notification in background
        background_tasks.add_task(send_appointment_notification, appointment_doc)
        
        logger.info(f"New appointment booked: {appointment.email} for {appointment.preferred_date}")
        
        return AppointmentResponse(
            id=appointment_id,
            status="success",
            message="Votre demande de rendez-vous a été enregistrée. Nous vous confirmerons le rendez-vous par email."
        )
    except Exception as e:
        logger.error(f"Error booking appointment: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la réservation du rendez-vous")

@api_router.get("/appointments")
async def get_appointments():
    """Get all appointments (admin endpoint)"""
    appointments = await db.appointments.find({}, {"_id": 0}).to_list(1000)
    return appointments

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
