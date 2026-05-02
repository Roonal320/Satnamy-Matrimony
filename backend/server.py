from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends, Header, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import requests
import razorpay

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
import certifi

# Connect to MongoDB - try Atlas, fallback to local
try:
    if 'mongodb+srv' in mongo_url:
        client = AsyncIOMotorClient(mongo_url, tls=True, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    else:
        client = AsyncIOMotorClient(mongo_url)
except Exception:
    client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client[os.environ['DB_NAME']]

# Also keep local connection as fallback for operations
local_client = AsyncIOMotorClient("mongodb://localhost:27017")
local_db = local_client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"

# Object Storage Configuration
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "satnami-matrimony"
storage_key = None

# Razorpay Configuration (legacy)
razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))

# DodoPay Configuration
DODO_API_KEY = os.environ.get('DODO_PAYMENTS_API_KEY', '')
DODO_MODE = os.environ.get('DODO_MODE', 'test_mode')
dodo_client = None
if DODO_API_KEY:
    dodo_client = dodopayments.DodoPayments(bearer_token=DODO_API_KEY, environment=DODO_MODE)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============ Object Storage Functions ============
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ============ Password & JWT Functions ============
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ Models ============
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    gender: str
    date_of_birth: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    height: Optional[str] = None
    weight: Optional[str] = None
    marital_status: Optional[str] = None
    religion: Optional[str] = None
    caste: Optional[str] = None
    mother_tongue: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    about: Optional[str] = None
    family_type: Optional[str] = None
    father_occupation: Optional[str] = None
    mother_occupation: Optional[str] = None
    siblings: Optional[str] = None

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class SearchFilters(BaseModel):
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    religion: Optional[str] = None
    caste: Optional[str] = None
    education: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    min_height: Optional[int] = None
    max_height: Optional[int] = None
    income: Optional[str] = None

class OrderCreate(BaseModel):
    plan: str
    amount: int

# ============ Auth Routes ============
@api_router.post("/auth/register")
async def register(data: RegisterRequest, response: Response):
    email = data.email.lower()
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "phone": data.phone,
        "gender": data.gender,
        "date_of_birth": data.date_of_birth,
        "profile_photo": None,
        "is_premium": False,
        "premium_until": None,
        "profile_completed": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "height": None,
        "weight": None,
        "marital_status": None,
        "religion": "Satnami",
        "caste": None,
        "mother_tongue": None,
        "education": None,
        "occupation": None,
        "income": None,
        "city": None,
        "state": None,
        "country": "India",
        "about": None,
        "family_type": None,
        "father_occupation": None,
        "mother_occupation": None,
        "siblings": None
    }
    
    # Create response before inserting (to avoid MongoDB mutating the dict)
    user_response = {k: v for k, v in user_doc.items() if k != "password_hash"}
    
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return user_response

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(user["id"], email)
    refresh_token = create_refresh_token(user["id"])
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    user.pop("password_hash")
    return user

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

# ============ Profile Routes ============
@api_router.put("/profile")
async def update_profile(request: Request, data: ProfileUpdate):
    user = await get_current_user(request)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if update_data:
        update_data["profile_completed"] = True
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated_user

@api_router.post("/profile/photo")
async def upload_photo(request: Request, file: UploadFile = File(...)):
    user = await get_current_user(request)
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{APP_NAME}/profiles/{user['id']}/{uuid.uuid4()}.{ext}"
    
    data = await file.read()
    result = put_object(path, data, file.content_type or "image/jpeg")
    
    await db.users.update_one({"id": user["id"]}, {"$set": {"profile_photo": result["path"]}})
    
    return {"path": result["path"], "message": "Photo uploaded successfully"}

@api_router.get("/files/{path:path}")
async def get_file(path: str, request: Request, auth: str = Query(None)):
    token = request.cookies.get("access_token") or (f"Bearer {auth}" if auth else None)
    if token and token.startswith("Bearer "):
        token = token[7:]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        logger.error(f"File fetch error: {e}")
        raise HTTPException(status_code=404, detail="File not found")

@api_router.get("/profiles")
async def search_profiles(request: Request, skip: int = 0, limit: int = 20):
    # Allow public access - no auth required
    try:
        user = await get_current_user(request)
        query = {
            "id": {"$ne": user["id"]},
            "profile_completed": True
        }
        # Show opposite gender by default for logged-in users
        if user.get("gender"):
            opposite_gender = "Female" if user["gender"] == "Male" else "Male"
            query["gender"] = opposite_gender
    except:
        # Not logged in - show all profiles
        query = {"profile_completed": True}
    
    profiles = await db.users.find(query, {"_id": 0, "password_hash": 0, "email": 0, "phone": 0}).skip(skip).limit(limit).to_list(limit)
    return profiles

@api_router.post("/profiles/search")
async def advanced_search(request: Request, filters: SearchFilters, skip: int = 0, limit: int = 20):
    # Allow public access
    query = {"profile_completed": True}
    
    # Exclude current user if logged in
    try:
        user = await get_current_user(request)
        query["id"] = {"$ne": user["id"]}
    except:
        pass  # Not logged in, show all
    
    if filters.gender:
        query["gender"] = filters.gender
    if filters.marital_status:
        query["marital_status"] = filters.marital_status
    if filters.religion:
        query["religion"] = filters.religion
    if filters.caste:
        query["caste"] = filters.caste
    if filters.education:
        query["education"] = filters.education
    if filters.city:
        query["city"] = {"$regex": filters.city, "$options": "i"}
    if filters.state:
        query["state"] = {"$regex": filters.state, "$options": "i"}
    if filters.income:
        query["income"] = filters.income
    
    profiles = await db.users.find(query, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    return profiles

@api_router.get("/profiles/{user_id}")
async def get_profile(request: Request, user_id: str):
    await get_current_user(request)
    profile = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

# ============ Chat Routes ============
@api_router.post("/messages")
async def send_message(request: Request, data: MessageCreate):
    user = await get_current_user(request)
    
    message = {
        "id": str(uuid.uuid4()),
        "sender_id": user["id"],
        "receiver_id": data.receiver_id,
        "content": data.content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message)
    return message

@api_router.get("/messages/{other_user_id}")
async def get_messages(request: Request, other_user_id: str):
    user = await get_current_user(request)
    
    messages = await db.messages.find(
        {
            "$or": [
                {"sender_id": user["id"], "receiver_id": other_user_id},
                {"sender_id": other_user_id, "receiver_id": user["id"]}
            ]
        },
        {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    
    # Mark messages as read
    await db.messages.update_many(
        {"sender_id": other_user_id, "receiver_id": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    
    return messages

@api_router.get("/conversations")
async def get_conversations(request: Request):
    user = await get_current_user(request)
    
    # Get all unique conversation partners
    messages = await db.messages.find(
        {"$or": [{"sender_id": user["id"]}, {"receiver_id": user["id"]}]},
        {"_id": 0}
    ).to_list(10000)
    
    partner_ids = set()
    for msg in messages:
        if msg["sender_id"] == user["id"]:
            partner_ids.add(msg["receiver_id"])
        else:
            partner_ids.add(msg["sender_id"])
    
    conversations = []
    for partner_id in partner_ids:
        partner = await db.users.find_one({"id": partner_id}, {"_id": 0, "password_hash": 0, "id": 1, "name": 1, "profile_photo": 1})
        if partner:
            # Get last message
            last_msg = await db.messages.find_one(
                {"$or": [{"sender_id": user["id"], "receiver_id": partner_id}, {"sender_id": partner_id, "receiver_id": user["id"]}]},
                {"_id": 0}
            ).sort("created_at", -1)
            
            # Count unread
            unread = await db.messages.count_documents({"sender_id": partner_id, "receiver_id": user["id"], "read": False})
            
            conversations.append({
                "partner": partner,
                "last_message": last_msg,
                "unread_count": unread
            })
    
    return conversations

# ============ Premium Routes ============
PLANS = {
    "gold_3": {"name": "Gold", "months": 3, "amount": 149900, "features": ["unlimited_messaging", "view_contacts", "profile_boost"]},
    "gold_6": {"name": "Gold", "months": 6, "amount": 249900, "features": ["unlimited_messaging", "view_contacts", "profile_boost"]},
    "gold_12": {"name": "Gold", "months": 12, "amount": 399900, "features": ["unlimited_messaging", "view_contacts", "profile_boost"]},
    "diamond_3": {"name": "Diamond", "months": 3, "amount": 299900, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"]},
    "diamond_6": {"name": "Diamond", "months": 6, "amount": 499900, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"]},
    "diamond_12": {"name": "Diamond", "months": 12, "amount": 799900, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"]},
    "platinum_3": {"name": "Platinum", "months": 3, "amount": 499900, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"]},
    "platinum_6": {"name": "Platinum", "months": 6, "amount": 799900, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"]},
    "platinum_12": {"name": "Platinum", "months": 12, "amount": 1299900, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"]},
}

@api_router.get("/plans")
async def get_plans():
    return PLANS

@api_router.post("/premium/create-order")
async def create_premium_order(request: Request, data: OrderCreate):
    user = await get_current_user(request)
    
    plan_info = PLANS.get(data.plan)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    try:
        razor_order = razorpay_client.order.create({
            "amount": data.amount,
            "currency": "INR",
            "payment_capture": 1
        })
        
        await db.orders.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "order_id": razor_order["id"],
            "plan": data.plan,
            "plan_name": plan_info["name"],
            "months": plan_info["months"],
            "amount": data.amount,
            "status": "created",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return razor_order
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise HTTPException(status_code=500, detail="Payment order creation failed")

@api_router.post("/premium/verify")
async def verify_payment(request: Request, payment_id: str, order_id: str, signature: str):
    user = await get_current_user(request)
    
    order = await db.orders.find_one({"order_id": order_id, "user_id": user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    plan_info = PLANS.get(order["plan"], {})
    months = plan_info.get("months", 3)
    
    # Update order status
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": "completed", "payment_id": payment_id}}
    )
    
    # Update user premium status
    premium_until = datetime.now(timezone.utc) + timedelta(days=30 * months)
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "is_premium": True,
            "premium_plan": order["plan"],
            "premium_name": plan_info.get("name", "Gold"),
            "premium_features": plan_info.get("features", []),
            "premium_until": premium_until.isoformat()
        }}
    )
    
    return {"message": "Premium activated successfully", "premium_until": premium_until.isoformat()}

# ============ Startup Events ============
@app.on_event("startup")
async def startup():
    global db
    try:
        # Initialize storage
        init_storage()
        logger.info("Storage initialized")
        
        # Test MongoDB connection - fall back to local if Atlas fails
        try:
            await db.command("ping")
            logger.info("Connected to MongoDB Atlas")
        except Exception as atlas_err:
            logger.warning(f"Atlas connection failed: {atlas_err}. Falling back to local MongoDB.")
            db = local_db
        
        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.messages.create_index("sender_id")
        await db.messages.create_index("receiver_id")
        logger.info("Database indexes created")
        
        # Seed admin
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@satnamimatrimony.com")
        admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
        existing = await db.users.find_one({"email": admin_email}, {"_id": 0})
        
        if existing is None:
            admin_id = str(uuid.uuid4())
            await db.users.insert_one({
                "id": admin_id,
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "name": "Admin",
                "phone": "9999999999",
                "gender": "Male",
                "date_of_birth": "1990-01-01",
                "role": "admin",
                "profile_completed": True,
                "is_premium": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            logger.info(f"Admin created: {admin_email}")
        
        # Write test credentials
        with open("/app/memory/test_credentials.md", "w") as f:
            f.write("# Test Credentials\n\n")
            f.write(f"## Admin Account\n")
            f.write(f"- Email: {admin_email}\n")
            f.write(f"- Password: {admin_password}\n")
            f.write(f"- Role: admin\n\n")
            f.write("## Auth Endpoints\n")
            f.write("- POST /api/auth/register\n")
            f.write("- POST /api/auth/login\n")
            f.write("- GET /api/auth/me\n")
            f.write("- POST /api/auth/logout\n")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")

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