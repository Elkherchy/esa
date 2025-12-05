import React, { useState } from 'react';
import { Lock, Mail, FileText, Shield, Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export function LoginPage({ onLogin, isLoading = false }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    await onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D4ED8] via-[#0891B2] to-[#06B6D4] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left column - Branding & Features */}
          <div className="hidden lg:block">
            <div className="space-y-8 text-white">
              {/* Logo & Title */}
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:scale-105 transition-transform duration-300">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-white mb-4 text-4xl font-bold leading-tight">
                    Coffre-Fort Documentaire IA
                  </h1>
                  <p className="text-white/90 text-lg whitespace-nowrap">
                    Solution sécurisée de gestion documentaire avec intelligence artificielle locale
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex gap-4 items-start p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white mb-2 font-semibold text-lg">Sécurité maximale</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Chiffrement de bout en bout et analyse IA 100% locale
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white mb-2 font-semibold text-lg">Intelligence artificielle</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Résumés automatiques et extraction de mots-clés
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white mb-2 font-semibold text-lg">Gestion des permissions</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Contrôle temporel et basé sur les rôles utilisateurs
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="pt-8">
                <p className="text-white/70 text-sm">
                  Propulsé par Mayan EDMS • Infrastructure bancaire certifiée
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Login form */}
          <div className="w-full">
            <Card className="bg-white shadow-2xl border-0 backdrop-blur-sm">
              <div className="p-8 lg:p-10">
                {/* Mobile logo */}
                <div className="lg:hidden text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] rounded-2xl mb-4 shadow-lg">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-[#111827] mb-2 text-2xl font-bold">Coffre-Fort IA</h2>
                </div>

                {/* Form header */}
                <div className="mb-8">
                  <h2 className="text-[#111827] mb-3 text-2xl font-bold">Connexion</h2>
                  <p className="text-[#6B7280] whitespace-nowrap">
                    Connectez-vous pour accéder à votre espace documentaire sécurisé
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email input with icon */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#374151] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#6B7280]" />
                      Adresse email
                    </label>
                    <input
                    type="email"
                    placeholder="nom.prenom@entreprise.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                      className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all hover:border-[#1D4ED8]/50"
                    />
                  </div>

                  {/* Password input with icon and show/hide */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#374151] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#6B7280]" />
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                        className="w-full px-4 pr-12 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all hover:border-[#1D4ED8]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-[#E5E7EB] text-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-2 cursor-pointer checked:bg-[#1D4ED8] checked:border-[#1D4ED8] transition-all group-hover:border-[#1D4ED8] accent-[#1D4ED8]"
                      />
                      <span className="text-sm text-[#6B7280] group-hover:text-[#111827] transition-colors">Se souvenir de moi</span>
                    </label>
                    <button 
                      type="button" 
                      className="text-sm font-medium text-[#1D4ED8] hover:text-[#1E40AF] hover:underline transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 bg-[#FEE2E2] rounded-lg border border-[#FCA5A5]">
                      <p className="text-sm text-[#DC2626]">{error}</p>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    className="w-full mt-6 group shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </Card>

            {/* Mobile features */}
            <div className="lg:hidden mt-6 text-center">
              <p className="text-white/90 text-sm">
                🔒 Sécurisé • ✨ IA Locale • 🏦 Certifié bancaire
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}