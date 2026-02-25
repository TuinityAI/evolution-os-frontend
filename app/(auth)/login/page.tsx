'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { WorldMap } from '@/components/ui/world-map';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Correo electrónico no encontrado');
    }
    setIsSubmitting(false);
  };

  // Panama coordinates adjusted for dotted-map projection
  const panamaCoords = { lat: -8, lng: -79.5 };

  // Connection lines from Panama to countries per continent
  const mapDots = [
    // North America
    {
      start: panamaCoords, // Panama
      end: { lat: 49.0, lng: -74.0 }, // New York, USA
    },
    // South America
    {
      start: panamaCoords, // Panama
      end: { lat: -15.0, lng: -47.0 }, // Brazil
    },
    {
      start: panamaCoords, // Panama
      end: { lat: -30.0, lng: -60.0 }, // Argentina
    },
    // Europe
    {
      start: panamaCoords, // Panama
      end: { lat: 50.0, lng: -3.0 }, // Spain
    },
    {
      start: panamaCoords, // Panama
      end: { lat: 56.0, lng: 10.0 }, // Northern Europe
    },
    // Asia
    {
      start: panamaCoords, // Panama
      end: { lat: 45.0, lng: 140.0 }, // Japan
    },
    {
      start: panamaCoords, // Panama
      end: { lat: 42.0, lng: 120.0 }, // China
    },
    // Africa
    {
      start: panamaCoords, // Panama
      end: { lat: -20.0, lng: 25.0 }, // South Africa
    },
    // Oceania
    {
      start: panamaCoords, // Panama
      end: { lat: -28.0, lng: 150.0 }, // Australia
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* World Map Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[1600px] scale-125">
          <WorldMap dots={mapDots} lineColor="#3B82F6" />
        </div>
      </div>

      {/* Subtle gradient overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/40" />

      {/* Login Card */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Glassmorphism Card */}
          <div className="rounded-2xl border border-white/30 bg-white/20 p-6 shadow-xl backdrop-blur-md">
            {/* Logo */}
            <div className="mb-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mb-4 flex justify-center"
              >
                <img
                  src="https://res.cloudinary.com/db3espoei/image/upload/v1771993730/Logo_Evolution_ZL__1_-cropped_onzamv.svg"
                  alt="Evolution Zona Libre"
                  className="h-12 w-auto"
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-gray-500"
              >
                Sistema de Gestión Comercial
              </motion.p>
            </div>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@evolution.com"
                    className="h-10 w-full rounded-lg border border-white/40 bg-white/60 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 backdrop-blur-sm focus:border-blue-500 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-white/40 bg-white/60 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 backdrop-blur-sm focus:border-blue-500 focus:bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="mt-2 w-full bg-gray-800 font-semibold text-white hover:bg-gray-700"
                size="md"
                isLoading={isSubmitting}
              >
                Iniciar Sesión
              </Button>
            </motion.form>
          </div>

          {/* Footer with Tuinity Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <span className="text-xs text-gray-400">Powered by</span>
            <img
              src="/tuinity-logo.svg"
              alt="Tuinity"
              className="h-9 w-auto"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
