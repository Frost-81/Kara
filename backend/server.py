from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from google.cloud import firestore as firestore_module
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage

# Google Generative AI (Gemini)
try:
    from google import genai
    from google.genai import types as genai_types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Firestore connection (uses Application Default Credentials on Cloud Run)
db = firestore_module.AsyncClient(project=os.environ.get('GOOGLE_CLOUD_PROJECT', 'kara-immobilier-service'))

# Google Generative AI configuration
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
GOOGLE_CLOUD_PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "kara-immobilier-service")
GOOGLE_CLOUD_LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
GEMINI_USE_VERTEX_AI = os.environ.get("GEMINI_USE_VERTEX_AI", "true").lower() == "true"


def create_genai_client():
    if not GEMINI_AVAILABLE:
        return None
    if GEMINI_USE_VERTEX_AI and GOOGLE_CLOUD_PROJECT:
        return genai.Client(
            vertexai=True,
            project=GOOGLE_CLOUD_PROJECT,
            location=GOOGLE_CLOUD_LOCATION,
        )
    if GOOGLE_API_KEY:
        return genai.Client(api_key=GOOGLE_API_KEY)
    return None


GENAI_CLIENT = create_genai_client()

# Email configuration
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

ERROR_NOTIFICATION_EMAIL = os.environ.get("ERROR_NOTIFICATION_EMAIL", "infokaraimmo@gmail.com")
SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_USE_TLS = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"

# ==================== Gmail SMTP Email Helpers ====================

SERVICE_TYPE_LABELS = {
    "rental": "Location",
    "management": "Gestion locative",
    "information": "Information",
}

def _send_gmail_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an HTML email via Gmail SMTP. Returns True on success."""
    if not all([SMTP_USERNAME, SMTP_PASSWORD]):
        logger.warning("Gmail SMTP not configured — email not sent")
        return False
    try:
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg.attach(MIMEText(html_content, 'html'))
        with smtplib.SMTP('smtp.gmail.com', 587, timeout=15) as smtp:
            smtp.starttls()
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(msg)
        logger.info(f"Gmail send to={to_email} subject={subject!r}")
        return True
    except Exception as e:
        logger.error(f"Gmail send failed to={to_email}: {e}")
        return False

def send_contact_notification(contact: dict) -> None:
    """Notify the agency of a new contact submission, and confirm to the visitor."""
    name = contact.get("name", "")
    email = contact.get("email", "")
    phone = contact.get("phone") or "Non fourni"
    service_type_raw = contact.get("service_type") or ""
    service_type = SERVICE_TYPE_LABELS.get(service_type_raw, service_type_raw or "Non précisé")
    property_type = contact.get("property_type") or "Non précisé"
    message_body = contact.get("message", "")

    # --- Internal notification ---
    internal_subject = f"Nouveau message — {name} | {service_type}"
    internal_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
      <div style="background:#0f172a; padding:24px; color:#fff;">
        <h2 style="margin:0; font-size:20px;">Kara Immobilier Service</h2>
        <p style="margin:6px 0 0; color:#5eead4; font-size:13px; letter-spacing:1px;">NOUVEAU MESSAGE DE CONTACT</p>
      </div>
      <div style="padding:24px; background:#f8fafc;">
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:8px 0; color:#475569; width:140px;">Nom</td><td style="padding:8px 0; font-weight:600;">{name}</td></tr>
          <tr><td style="padding:8px 0; color:#475569;">Email</td><td style="padding:8px 0;"><a href="mailto:{email}" style="color:#0d9488;">{email}</a></td></tr>
          <tr><td style="padding:8px 0; color:#475569;">Téléphone</td><td style="padding:8px 0;">{phone}</td></tr>
          <tr><td style="padding:8px 0; color:#475569;">Type de service</td><td style="padding:8px 0; font-weight:600; color:#0d9488;">{service_type}</td></tr>
          <tr><td style="padding:8px 0; color:#475569;">Type de bien</td><td style="padding:8px 0;">{property_type}</td></tr>
        </table>
        <div style="margin-top:18px; background:#fff; padding:16px; border-left:3px solid #14b8a6; border-radius:2px;">
          <p style="margin:0 0 6px; color:#475569; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Message</p>
          <p style="margin:0; line-height:1.6;">{message_body}</p>
        </div>
        <p style="margin-top:24px; color:#94a3b8; font-size:12px;">Envoyé depuis le site karaimmobilier.com</p>
      </div>
    </div>
    """
    _send_gmail_email(NOTIFICATION_EMAIL, internal_subject, internal_html)

    # --- Visitor confirmation ---
    if email:
        confirm_subject = "Nous avons bien reçu votre message — Kara Immobilier Service"
        confirm_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
          <div style="background:#0f172a; padding:24px; color:#fff; text-align:center;">
            <h2 style="margin:0;">Kara Immobilier Service</h2>
            <p style="margin:6px 0 0; color:#5eead4; font-size:13px; letter-spacing:1px;">PLUS DE REVENUS. MOINS DE STRESS.</p>
          </div>
          <div style="padding:28px; background:#f8fafc;">
            <p>Bonjour <strong>{name}</strong>,</p>
            <p>Merci d'avoir pris contact avec <strong>Kara Immobilier Service</strong>. Nous avons bien reçu votre message et un de nos experts vous recontactera <strong>en moins de 24 heures</strong>.</p>
            <div style="background:#fff; padding:16px; border-left:3px solid #14b8a6; border-radius:2px; margin:18px 0;">
              <p style="margin:0 0 6px; color:#475569; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Récapitulatif de votre demande</p>
              <p style="margin:6px 0;"><strong>Service :</strong> {service_type}</p>
              <p style="margin:6px 0; line-height:1.6;">{message_body}</p>
            </div>
            <p>En attendant, n'hésitez pas à nous contacter directement :</p>
            <p style="margin:6px 0;">📞 <strong>438-439-9590</strong><br/>
            ✉️ <a href="mailto:infokaraimmo@gmail.com" style="color:#0d9488;">infokaraimmo@gmail.com</a><br/>
            📍 9008 2e Avenue, Montréal</p>
            <p style="color:#475569; font-size:13px; margin-top:24px;">À très bientôt,<br/><strong>L'équipe Kara Immobilier Service</strong></p>
          </div>
          <div style="padding:16px; text-align:center; color:#94a3b8; font-size:11px; background:#0f172a;">
            © Kara Immobilier Service — Montréal | Laval | Longueuil | Brossard | Trois-Rivières
          </div>
        </div>
        """
        _send_gmail_email(email, confirm_subject, confirm_html)

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
    service_type: Optional[str] = None
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

class ErrorNotificationRequest(BaseModel):
    source: str
    message: str
    stack: Optional[str] = None
    metadata: Optional[dict] = None

class ErrorNotificationResponse(BaseModel):
    status: str

# ==================== Chat Sessions Storage ====================
chat_sessions = {}
GEMINI_MODEL_NAME = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")


def get_gemini_chat(session_key: str, language: str = "fr"):
    """Get or create a Gemini chat session for the specified language."""
    if not GENAI_CLIENT:
        return None

    if session_key not in chat_sessions:
        system_message = SYSTEM_MESSAGE_EN if language == "en" else SYSTEM_MESSAGE_FR
        chat_sessions[session_key] = GENAI_CLIENT.chats.create(
            model=GEMINI_MODEL_NAME,
            config=genai_types.GenerateContentConfig(
                system_instruction=system_message,
                temperature=0.7,
            ),
        )
    return chat_sessions[session_key]

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

def send_error_notification_email(subject: str, body: str):
    """Best-effort email notification via SMTP when configured."""
    if not all([SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD]):
        logger.warning("SMTP not configured; skipping email notification")
        return

    email = EmailMessage()
    email["Subject"] = subject
    email["From"] = SMTP_USERNAME
    email["To"] = ERROR_NOTIFICATION_EMAIL
    email.set_content(body)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as smtp:
        if SMTP_USE_TLS:
            smtp.starttls()
        smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(email)

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
    await db.collection('status_checks').document(status_obj.id).set(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    docs = db.collection('status_checks').stream()
    status_checks = []
    async for doc in docs:
        check = doc.to_dict()
        if isinstance(check.get('timestamp'), str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
        status_checks.append(check)
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
            "service_type": contact.service_type,
            "property_type": contact.property_type,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.collection('contacts').document(contact_id).set(contact_doc)
        
        # Send notification + confirmation emails in background
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
    docs = db.collection('contacts').stream()
    contacts = []
    async for doc in docs:
        contacts.append(doc.to_dict())
    return contacts

@api_router.post("/error-notification", response_model=ErrorNotificationResponse)
async def error_notification(payload: ErrorNotificationRequest, background_tasks: BackgroundTasks):
    """Centralized frontend error reporting endpoint with optional email notification."""
    try:
        error_doc = {
            "id": str(uuid.uuid4()),
            "source": payload.source,
            "message": payload.message,
            "stack": payload.stack,
            "metadata": payload.metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.collection('error_notifications').document(error_doc['id']).set(error_doc)

        subject = f"[Kara-Immo] Frontend error from {payload.source}"
        body = (
            f"Source: {payload.source}\n"
            f"Message: {payload.message}\n"
            f"Timestamp: {error_doc['created_at']}\n\n"
            f"Metadata: {payload.metadata}\n\n"
            f"Stack:\n{payload.stack or 'N/A'}"
        )
        background_tasks.add_task(send_error_notification_email, subject, body)

        return ErrorNotificationResponse(status="received")
    except Exception as e:
        logger.error(f"Failed to store error notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Impossible d'enregistrer la notification d'erreur")

# ==================== AI Chatbot ====================

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_message: ChatMessage):
    """Chat with the AI assistant using Google Generative AI (Gemini)"""
    try:
        if not GENAI_CLIENT:
            raise HTTPException(status_code=503, detail="AI assistant is not configured")
        
        session_id = chat_message.session_id or str(uuid.uuid4())
        language = chat_message.language or "fr"
        
        # Get or create session key for chat history management
        session_key = f"{session_id}_{language}"
        chat = get_gemini_chat(session_key, language)
        if chat is None:
            raise HTTPException(status_code=503, detail="AI assistant is not configured")
        
        # Send message and get response
        response = chat.send_message(chat_message.message)
        bot_response = response.text
        
        # Store chat history in Firestore
        chat_doc = {
            "session_id": session_id,
            "language": language,
            "user_message": chat_message.message,
            "bot_response": bot_response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.collection('chat_history').add(chat_doc)
        
        logger.info(f"Chat message processed for session {session_id}")
        
        return ChatResponse(
            response=bot_response,
            session_id=session_id
        )
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la communication avec l'assistant: {str(e)}")

# ==================== Appointments ====================

@api_router.post("/appointment", response_model=AppointmentResponse)
async def book_appointment(appointment: AppointmentRequest):
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
        
        await db.collection('appointments').document(appointment_id).set(appointment_doc)
        
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
    docs = db.collection('appointments').stream()
    appointments = []
    async for doc in docs:
        appointments.append(doc.to_dict())
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
