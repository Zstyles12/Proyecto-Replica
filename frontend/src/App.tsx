import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';

export function App() {
  const handleLoginSuccess = (email: string, role: string) => {
    console.log(`[Réplica] Acceso exitoso para ${email} con rol: ${role}`);
  };

  const handleRegistroSuccess = (data: {
    name: string;
    email: string;
    role: string;
    licenseNumber?: string;
  }) => {
    console.log(`[Réplica] Registro exitoso para ${data.name} (${data.email}) con rol: ${data.role}`);
  };

  const handleForgotPasswordClick = () => {
    console.log('[Réplica] Solicitud de recuperación de clave...');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={handleLoginSuccess}
              onForgotPasswordClick={handleForgotPasswordClick}
              onBiometryClick={() => console.log('[Réplica] Inicio por Biometría iniciado')}
              onGoogleClick={() => console.log('[Réplica] OAuth Google iniciado')}
              onAppleClick={() => console.log('[Réplica] OAuth Apple iniciado')}
            />
          }
        />
        <Route
          path="/registro"
          element={
            <Registro
              onRegistroSuccess={handleRegistroSuccess}
              onGoogleClick={() => console.log('[Réplica] Registro con Google iniciado')}
              onAppleClick={() => console.log('[Réplica] Registro con Apple iniciado')}
              onTermsClick={() => console.log('[Réplica] Modal de Términos abierto')}
              onPrivacyClick={() => console.log('[Réplica] Modal de Privacidad abierto')}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
