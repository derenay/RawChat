import type { Functions } from "firebase/functions";
import { initializeApp } from "firebase/app"; 
import type { FirebaseApp } from "firebase/app"; 
import { getAuth } from "firebase/auth"; 
import type { Auth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import type { Firestore } from "firebase/firestore";
// .env.local'dan gelen değerleri konsolda kontrol et
console.log("VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
console.log("VITE_FIREBASE_AUTH_DOMAIN:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log("VITE_FIREBASE_PROJECT_ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
// Diğer VITE_FIREBASE_... değişkenlerini de bu şekilde kontrol edin

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Opsiyonel
};

// Oluşturulan firebaseConfig nesnesini konsolda kontrol et
console.log("Kullanılacak Firebase Config:", firebaseConfig);

let app: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;
let functionsInstance: Functions | undefined;

try {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  // Cloud Function'larınızın deploy edildiği bölgeyi buraya yazın.
  // functionsInstance = getFunctions(app, "europe-west1"); 
  console.log("Firebase başarıyla başlatıldı.");
} catch (error) {
  console.error("Firebase başlatılırken KRİTİK HATA:", error);
  console.error("Lütfen yukarıdaki `firebaseConfig` değerlerini ve Firebase konsolundaki ayarlarınızı kontrol edin!");
  // Hata durumunda uygulamanın çökmemesi için varsayılan null değerler atanabilir veya hata fırlatılabilir.
  // Bu örnekte, uygulamanın devam etmemesi için hata fırlatmak daha iyi olabilir.
  throw new Error("Firebase başlatılamadı. Yapılandırmanızı kontrol edin.");
}

export const auth = authInstance;
export const db = dbInstance;
// export const functions = functionsInstance; // Eğer kullanıyorsanız

export default app;