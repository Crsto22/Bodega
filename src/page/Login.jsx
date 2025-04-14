import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from "../img/Logo.png";
import { RotateCw } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos
    const newErrors = {};
    if (!email) newErrors.email = "El correo electrónico es obligatorio";
    if (!password) newErrors.password = "La contraseña es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Limpiar errores anteriores
    setErrors({});
    setAuthError('');
    setLoading(true);

    try {
      // Intentar iniciar sesión con Firebase
      await login(email, password);
      console.log('Inicio de sesión exitoso');
    } catch (error) {
      // Manejar errores de autenticación
      console.error('Error al iniciar sesión:', error);
      let errorMessage = 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.';

      // Personalizar mensajes de error
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciales incorrectas';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'El usuario no está registrado.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'La contraseña es incorrecta.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido.';
      }

      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-800 to-green-600 p-4">
      <div className="w-full max-w-md bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/30 transform transition-all hover:shadow-green-500/20 hover:shadow-xl">
        <div className="p-10">
          {/* Logo area with glow effect */}
          <div className="mx-auto w-36 flex items-center justify-center relative mb-8">
            <div className="absolute inset-0 blur-xl"></div>
            <img src={Logo} alt="Logo" className="relative z-10" />
          </div>

          {/* Alerta de error de autenticación mejorada */}
          {authError && (
            <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl shadow-inner text-red-200 text-sm animate-pulse">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                <p>{authError}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Campo de correo electrónico */}
              <div className="group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/70 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value) setErrors({ ...errors, email: "" });
                    }}
                    className={`block w-full pl-12 pr-4 py-4 bg-white/10 border ${
                      errors.email ? 'border-red-400 ring-1 ring-red-400/50' : 'border-white/20'
                    } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all`}
                    placeholder="Correo electrónico"
                  />
                </div>
                {errors.email && (
                  <div className="mt-2 px-3 py-1.5 bg-red-500/15 backdrop-blur-sm border border-red-500/20 rounded-lg text-red-200 text-sm flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-red-400" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Campo de contraseña */}
              <div className="group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/70 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value) setErrors({ ...errors, password: "" });
                    }}
                    className={`block w-full pl-12 pr-4 py-4 bg-white/10 border ${
                      errors.password ? 'border-red-400 ring-1 ring-red-400/50' : 'border-white/20'
                    } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all`}
                    placeholder="Contraseña"
                  />
                </div>
                {errors.password && (
                  <div className="mt-2 px-3 py-1.5 bg-red-500/15 backdrop-blur-sm border border-red-500/20 rounded-lg text-red-200 text-sm flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-red-400" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              className="group cursor-pointer relative w-full flex justify-center items-center py-4 px-6 rounded-xl text-white font-medium overflow-hidden mt-8"
              disabled={loading}
            >
              {/* Fondo del botón con gradiente animado */}
              <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-400 transform group-hover:scale-105 transition-all duration-300"></span>

              {/* Efecto de brillo */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>

              <span className="relative z-10 flex items-center">
                {loading ? (
                  <RotateCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Iniciar Sesión
                    <LogIn className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
