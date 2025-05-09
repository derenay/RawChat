// src/pages/SignupPage.tsx
import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { UserCredential } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Firestore fonksiyonları eklendi
import { auth, db } from '../firebase'; // db (Firestore instance) import edildi
import '../styles/AuthStyles.css';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Şifreler eşleşmiyor!');
    }
    if (password.length < 6) {
      return setError('Şifre en az 6 karakter olmalıdır.');
    }
    setError('');
    setLoading(true);
    try {
      // 1. Firebase Authentication ile kullanıcı oluştur
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // 2. Firestore'da kullanıcı için bir doküman oluştur
        // users koleksiyonunda, kullanıcının uid'si ile bir doküman oluşturuyoruz.
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(), // Hesabın oluşturulma zamanı
          // Gelecekte buraya başka profil bilgileri de eklenebilir (displayName vb.)
        });
        console.log("Firestore'da kullanıcı dokümanı oluşturuldu:", user.uid);
      }
      
      navigate('/chat'); // Başarılı kayıt ve Firestore işlemi sonrası /chat'e yönlendir
    } catch (err: any) {
      console.error("Firebase signup veya Firestore error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kayıtlı.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre çok zayıf. Lütfen daha güçlü bir şifre seçin.');
      }  else if (err.code === 'auth/invalid-email') {
        setError('Geçersiz e-posta formatı.');
      }else {
        setError('Hesap oluşturulamadı veya kullanıcı verisi kaydedilemedi. Lütfen tekrar deneyin.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Yeni Hesap Oluşturun</h1>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="error-message" style={{display:'block'}}>{error}</p>}
          <div className="form-group">
            <label htmlFor="signup-email">E-posta Adresi</label>
            <input type="email" id="signup-email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ornek@eposta.com"/>
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">Şifre</label>
            <input type="password" id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="En az 6 karakter"/>
          </div>
          <div className="form-group">
            <label htmlFor="signup-confirm-password">Şifreyi Onayla</label>
            <input type="password" id="signup-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Şifrenizi tekrar girin"/>
          </div>
          <div className="form-actions">
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </div>
        </form>
        <div className="auth-footer">
          <p>Zaten bir hesabınız var mı? <Link to="/login">Giriş Yapın</Link></p>
        </div>
      </div>
    </div>
  );
};
export default SignupPage;