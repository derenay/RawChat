// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // src/firebase.ts dosyanızdan auth'u import edin
import '../styles/AuthStyles.css'; // Login ve Signup sayfaları için ortak stiller

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); // Önceki hataları temizle
    setLoading(true);

    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin.');
      setLoading(false);
      return;
    }

    try {
      // Firebase Authentication ile giriş yapmayı dene
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/chat'); // Başarılı giriş sonrası ana sohbet sayfasına yönlendir
    } catch (err: any) {
      console.error("Firebase Login Hatası:", err.code, err.message);
      if (err.code === 'auth/user-not-found' || 
          err.code === 'auth/wrong-password' || 
          err.code === 'auth/invalid-credential') {
        setError('E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Lütfen geçerli bir e-posta adresi girin.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.');
      } else {
        // Bu, auth/configuration-not-found gibi bir hata olabilir.
        // Eğer config doğruysa, bu genel hata mesajı gösterilir.
        setError('Giriş başarısız oldu. Lütfen daha sonra tekrar deneyin veya yapılandırmanızı kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>AI Sohbete Giriş Yapın</h1>
          {/* Opsiyonel: <p>Devam etmek için bilgilerinizi girin.</p> */}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <p className="error-message" style={{ display: 'block', marginBottom: '16px' }}>
              {error}
            </p>
          )}
          <div className="form-group">
            <label htmlFor="login-email">E-posta Adresi</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ornek@eposta.com"
              aria-describedby={error ? "login-error-desc" : undefined}
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Şifre</label>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Şifreniz"
              aria-describedby={error ? "login-error-desc" : undefined}
            />
          </div>
          {error && <span id="login-error-desc" className="sr-only">{error}</span>} {/* Erişilebilirlik için */}
          
          <div className="form-actions">
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Hesabınız yok mu? <Link to="/signup">Hemen Kayıt Olun</Link>
          </p>
          {/* Opsiyonel: Ana sayfaya link
          <p><Link to="/">Ana Sayfaya Dön</Link></p> 
          */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;