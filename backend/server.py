from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends, Header, Query
from fastapi.responses import RedirectResponse
import hashlib
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
UPLOAD_DIR = ROOT_DIR / "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
APP_NAME = "satnami-matrimony"

# Razorpay Configuration (legacy)
razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))

# Cashfree Configuration
CASHFREE_CLIENT_ID = os.environ.get('CASHFREE_CLIENT_ID', '')
CASHFREE_CLIENT_SECRET = os.environ.get('CASHFREE_CLIENT_SECRET', '')
CASHFREE_ENV = os.environ.get('CASHFREE_ENV', 'sandbox')
CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg" if CASHFREE_ENV == "sandbox" else "https://api.cashfree.com/pg"

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
def put_object(path: str, data: bytes, content_type: str) -> dict:
    file_path = UPLOAD_DIR / path
    os.makedirs(file_path.parent, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(data)
    return {"path": path, "url": f"/api/files/{path}"}

def get_object(path: str) -> tuple:
    file_path = UPLOAD_DIR / path
    if not file_path.exists():
        raise FileNotFoundError(f"File {path} not found")
    
    with open(file_path, "rb") as f:
        data = f.read()
    
    ext = file_path.suffix.lower()
    content_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif"
    }
    content_type = content_types.get(ext, "application/octet-stream")
    return data, content_type

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
    frontend_url: str

class PaymentVerifyRequest(BaseModel):
    order_id: str

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
        user = None
        query = {"profile_completed": True}
    
    profiles = await db.users.find(query, {"_id": 0, "password_hash": 0, "email": 0, "phone": 0}).to_list(1000)
    
    # Sort by plan priority (Platinum -> Diamond -> Gold -> Free) and match score
    def get_score(p):
        score = 0
        if p.get("is_premium"):
            plan = p.get("premium_plan", "") or ""
            if "platinum" in plan:
                score += 1000
            elif "diamond" in plan:
                score += 500
            elif "gold" in plan:
                score += 200
        
        if user:
            if p.get("caste") and user.get("caste") and p["caste"].lower() == user["caste"].lower():
                score += 150
            if p.get("state") and user.get("state") and p["state"].lower() == user["state"].lower():
                score += 100
            if p.get("city") and user.get("city") and p["city"].lower() == user["city"].lower():
                score += 50
            if p.get("marital_status") and user.get("marital_status") and p["marital_status"].lower() == user["marital_status"].lower():
                score += 40
            if p.get("religion") and user.get("religion") and p["religion"].lower() == user["religion"].lower():
                score += 30
        return score
        
    profiles.sort(key=get_score, reverse=True)
    return profiles[skip:skip+limit]

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
    
    # Exclude contact details from list search
    profiles = await db.users.find(query, {"_id": 0, "password_hash": 0, "email": 0, "phone": 0}).skip(skip).limit(limit).to_list(limit)
    
    # Sort by plan priority (Platinum -> Diamond -> Gold -> Free)
    def plan_priority(p):
        if not p.get("is_premium"):
            return 0
        plan = p.get("premium_plan", "") or ""
        if "platinum" in plan:
            return 3
        if "diamond" in plan:
            return 2
        if "gold" in plan:
            return 1
        return 0
        
    profiles.sort(key=plan_priority, reverse=True)
    return profiles

@api_router.get("/profiles/{user_id}")
async def get_profile(request: Request, user_id: str):
    current_user = await get_current_user(request)
    profile = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    # Record view in views collection if viewing someone else's profile
    if current_user["id"] != user_id:
        await db.views.update_one(
            {"viewer_id": current_user["id"], "viewed_id": user_id},
            {"$set": {"timestamp": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        
    # Mask/remove contact details for non-premium users
    if not current_user.get("is_premium", False) and current_user["id"] != user_id:
        profile["email"] = None
        profile["phone"] = None
        
    return profile

@api_router.get("/views")
async def get_profile_views(request: Request):
    user = await get_current_user(request)
    
    # Check if user is premium
    if not user.get("is_premium", False):
        raise HTTPException(status_code=403, detail="Upgrade to Premium to see who viewed your profile")
        
    # Find views where viewed_id is current user
    views_cursor = db.views.find({"viewed_id": user["id"]}).sort("timestamp", -1)
    views_list = await views_cursor.to_list(100)
    
    viewers = []
    for v in views_list:
        viewer = await db.users.find_one(
            {"id": v["viewer_id"]},
            {"_id": 0, "id": 1, "name": 1, "profile_photo": 1, "city": 1, "state": 1, "occupation": 1, "date_of_birth": 1}
        )
        if viewer:
            viewer["viewed_at"] = v["timestamp"]
            viewers.append(viewer)
            
    return viewers

# ============ Chat Routes ============
@api_router.post("/messages")
async def send_message(request: Request, data: MessageCreate):
    user = await get_current_user(request)
    
    # Block non-premium users from sending messages
    if not user.get("is_premium", False):
        raise HTTPException(status_code=403, detail="Messaging is only available to premium subscribers")
        
    message = {
        "id": str(uuid.uuid4()),
        "sender_id": user["id"],
        "receiver_id": data.receiver_id,
        "content": data.content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message)
    message.pop("_id", None)
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
        partner = await db.users.find_one(
            {"id": partner_id}, 
            {"_id": 0, "id": 1, "name": 1, "profile_photo": 1, "city": 1, "state": 1}
        )
        if partner:
            # Get last message
            last_msg_list = await db.messages.find(
                {"$or": [
                    {"sender_id": user["id"], "receiver_id": partner_id}, 
                    {"sender_id": partner_id, "receiver_id": user["id"]}
                ]},
                {"_id": 0}
            ).sort("created_at", -1).to_list(1)
            
            last_msg = last_msg_list[0] if last_msg_list else None
            
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
    "gold_1": {"name": "Gold", "months": 1, "amount": 50000, "features": ["unlimited_messaging", "view_contacts", "profile_boost"]},
    "gold_3": {"name": "Gold", "months": 3, "amount": 120000, "features": ["unlimited_messaging", "view_contacts", "profile_boost"]},
    "gold_6": {"name": "Gold", "months": 6, "amount": 200000, "features": ["unlimited_messaging", "view_contacts", "profile_boost"]},
    "gold_12": {"name": "Gold", "months": 12, "amount": 300000, "features": ["unlimited_messaging", "view_contacts", "profile_boost"]},
    "diamond_1": {"name": "Diamond", "months": 1, "amount": 100000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"]},
    "diamond_3": {"name": "Diamond", "months": 3, "amount": 240000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"]},
    "diamond_6": {"name": "Diamond", "months": 6, "amount": 400000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"]},
    "diamond_12": {"name": "Diamond", "months": 12, "amount": 600000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight"]},
    "platinum_1": {"name": "Platinum", "months": 1, "amount": 150000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"]},
    "platinum_3": {"name": "Platinum", "months": 3, "amount": 390000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"]},
    "platinum_6": {"name": "Platinum", "months": 6, "amount": 600000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"]},
    "platinum_12": {"name": "Platinum", "months": 12, "amount": 990000, "features": ["unlimited_messaging", "view_contacts", "profile_boost", "bold_listing", "spotlight", "personal_matchmaker", "priority_support"]},
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
        
    payu_key = os.environ.get("PAYU_MERCHANT_KEY", "dummy_merchant_key")
    payu_salt = os.environ.get("PAYU_MERCHANT_SALT", "dummy_merchant_salt")
    payu_env = os.environ.get("PAYU_ENV", "sandbox")
    
    payu_url = "https://test.payu.in/_payment" if payu_env == "sandbox" else "https://secure.payu.in/_payment"
    
    txnid = f"txn_{uuid.uuid4().hex[:12]}"
    
    # Amount is passed in paise from frontend, convert to rupees for PayU
    amount_in_rupees = float(data.amount) / 100.0
    amount_str = f"{amount_in_rupees:.2f}"
    
    productinfo = data.plan
    firstname = user.get("name", "Customer")
    email = user["email"]
    phone = user.get("phone", "")
    
    # Sanitize phone
    phone_digits = "".join(c for c in phone if c.isdigit())
    if len(phone_digits) != 10:
        phone_digits = "9999999999"
        
    # Backend callback endpoint URL
    host = request.headers.get("host", "localhost:8000")
    proto = request.headers.get("x-forwarded-proto", "http")
    surl = f"{proto}://{host}/api/premium/payu-callback"
    furl = f"{proto}://{host}/api/premium/payu-callback"
    
    udf1 = ""
    udf2 = ""
    udf3 = ""
    udf4 = ""
    udf5 = ""
    
    # Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
    hash_string = f"{payu_key}|{txnid}|{amount_str}|{productinfo}|{firstname}|{email}|{udf1}|{udf2}|{udf3}|{udf4}|{udf5}||||||{payu_salt}"
    generated_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().lower()
    
    # Save the order as created in orders collection
    await db.orders.insert_one({
        "id": txnid,
        "user_id": user["id"],
        "order_id": txnid,
        "plan": data.plan,
        "plan_name": plan_info["name"],
        "months": plan_info["months"],
        "amount": data.amount,
        "status": "created",
        "frontend_url": data.frontend_url,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "payu_url": payu_url,
        "key": payu_key,
        "txnid": txnid,
        "amount": amount_str,
        "productinfo": productinfo,
        "firstname": firstname,
        "email": email,
        "phone": phone_digits,
        "surl": surl,
        "furl": furl,
        "hash": generated_hash
    }

@api_router.post("/premium/payu-callback")
async def payu_callback(request: Request):
    form_data = await request.form()
    data = dict(form_data)
    
    txnid = data.get("txnid")
    status = data.get("status")
    amount = data.get("amount")
    productinfo = data.get("productinfo")
    firstname = data.get("firstname")
    email = data.get("email")
    returned_hash = data.get("hash")
    key = data.get("key")
    
    udf1 = data.get("udf1", "")
    udf2 = data.get("udf2", "")
    udf3 = data.get("udf3", "")
    udf4 = data.get("udf4", "")
    udf5 = data.get("udf5", "")
    
    # Find order in DB
    order = await db.orders.find_one({"order_id": txnid})
    
    # Safe fallback frontend URL in case order not found
    fallback_frontend = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")[0]
    
    if not order:
        logger.error(f"PayU Callback: Order {txnid} not found")
        return RedirectResponse(url=f"{fallback_frontend}/premium?status=failure&error=Order+not+found", status_code=303)
        
    frontend_url = order.get("frontend_url") or fallback_frontend
    payu_salt = os.environ.get("PAYU_MERCHANT_SALT", "dummy_merchant_salt")
    
    # Verification Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    hash_string = f"{payu_salt}|{status}||||||{udf5}|{udf4}|{udf3}|{udf2}|{udf1}|{email}|{firstname}|{productinfo}|{amount}|{txnid}|{key}"
    calculated_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().lower()
    
    if calculated_hash != returned_hash:
        logger.error(f"PayU Callback: Hash verification failed for txn {txnid}. Calculated: {calculated_hash}, Received: {returned_hash}")
        await db.orders.update_one(
            {"order_id": txnid},
            {"$set": {"status": "failed", "error": "Hash verification failed"}}
        )
        return RedirectResponse(url=f"{frontend_url}/premium?status=failure&error=Hash+verification+failed", status_code=303)
        
    if status == "success":
        await db.orders.update_one(
            {"order_id": txnid},
            {"$set": {"status": "completed", "payment_id": data.get("mihpayid", txnid)}}
        )
        
        plan_info = PLANS.get(order["plan"], {})
        months = plan_info.get("months", 3)
        premium_until = datetime.now(timezone.utc) + timedelta(days=30 * months)
        
        await db.users.update_one(
            {"id": order["user_id"]},
            {"$set": {
                "is_premium": True,
                "premium_plan": order["plan"],
                "premium_name": plan_info.get("name", "Gold"),
                "premium_features": plan_info.get("features", []),
                "premium_until": premium_until.isoformat()
            }}
        )
        
        return RedirectResponse(url=f"{frontend_url}/premium?status=success&txnid={txnid}", status_code=303)
    else:
        await db.orders.update_one(
            {"order_id": txnid},
            {"$set": {"status": "failed", "payment_id": data.get("mihpayid"), "error_message": data.get("error_Message", "Payment failed")}}
        )
        return RedirectResponse(url=f"{frontend_url}/premium?status=failure&txnid={txnid}", status_code=303)

# ============ Startup Events ============
@app.on_event("startup")
async def startup():
    global db
    try:

        
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
        os.makedirs("memory", exist_ok=True)
        with open("memory/test_credentials.md", "w") as f:
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

origins = [o.strip() for o in os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',') if o.strip()]
if "*" in origins:
    origins = ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()