import firebase_admin
from firebase_admin import credentials, firestore, auth as admin_auth
import requests

import os
from dotenv import load_dotenv
load_dotenv()

firebase_api_key =os.getenv("FIREBASE_API_KEY")
cred = credentials.Certificate("health-assistant-7fc4e-firebase-adminsdk-fbsvc-cbd7ba0d75.json")
firebase_admin.initialize_app(cred)
db = firestore.client()



def signup_user(name, email, password,role):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={firebase_api_key}"
    payload={
        "email":email,
        "password":password,
        "returnSecureToken": True
    }
    re=requests.post(url,json=payload)
    data=re.json()
    if "error" in data:
        return {"error": data["error"]["message"]}
    uid = data["localId"]
    # Store user in Firestore
    db.collection("user").document(uid).set({
        "uid": uid,
        "name": name,
        "authProvider": "local",
        "email": email,
        "role":role
    })
    return {
        "success": True,
        "idToken": data["idToken"],
        "uid": uid
    }


def login_user(email, password):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}"
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
    res = requests.post(url, json=payload)
    data = res.json()
    print(data)
    if "error" in data:
        return {"error": data["error"]["message"]}

    info_url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_api_key}"
    info_payload = {
        "idToken": data["idToken"]
    }
    info_res = requests.post(info_url, json=info_payload)
    info_data = info_res.json()

    if "error" in info_data:
        return {"error": info_data["error"]["message"]}

    # Step 3: Get user role from Firestore
    user_doc = db.collection("user").document(data["localId"]).get()
    if user_doc.exists:
        role = user_doc.to_dict().get("role")
    else:
        role = None

    return {
        "success": True,
        "idToken": data["idToken"],
        "uid": data["localId"],
        "role": role 
    }