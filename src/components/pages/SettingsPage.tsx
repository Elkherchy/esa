import React, { useState } from 'react';
import { User, Bell, Shield, Sparkles, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';

export function SettingsPage() {
  const [notifications, setNotifications] = useState({
    documentUploaded: true,
    aiAnalysisComplete: true,
    permissionGranted: false,
    weeklyReport: true
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#111827] mb-2">Paramètres</h1>
        <p className="text-[#6B7280]">Gérez vos préférences et configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[#1D4ED8]" />
              <h3 className="text-[#111827]">Profil</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  defaultValue="Jean"
                />
                <Input
                  label="Nom"
                  defaultValue="Dupont"
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                defaultValue="jean.dupont@entreprise.fr"
                disabled
              />
              
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <Shield className="w-3.5 h-3.5" />
                Email géré par SSO - modification impossible
              </div>

              <div className="pt-4">
                <Button variant="primary">
                  <Save className="w-4 h-4" />
                  Enregistrer
                </Button>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-[#1D4ED8]" />
              <h3 className="text-[#111827]">Notifications</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm text-[#111827] mb-1">Nouveau document téléversé</div>
                  <div className="text-xs text-[#6B7280]">
                    Recevoir une notification quand un document est ajouté
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.documentUploaded}
                  onChange={(e) => setNotifications({...notifications, documentUploaded: e.target.checked})}
                  className="w-4 h-4 text-[#1D4ED8] border-[#E5E7EB] rounded focus:ring-[#1D4ED8]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm text-[#111827] mb-1">Analyse IA terminée</div>
                  <div className="text-xs text-[#6B7280]">
                    Notification quand l'IA a terminé l'analyse d'un document
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.aiAnalysisComplete}
                  onChange={(e) => setNotifications({...notifications, aiAnalysisComplete: e.target.checked})}
                  className="w-4 h-4 text-[#1D4ED8] border-[#E5E7EB] rounded focus:ring-[#1D4ED8]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm text-[#111827] mb-1">Permission accordée</div>
                  <div className="text-xs text-[#6B7280]">
                    Notification quand vous recevez l'accès à un document
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.permissionGranted}
                  onChange={(e) => setNotifications({...notifications, permissionGranted: e.target.checked})}
                  className="w-4 h-4 text-[#1D4ED8] border-[#E5E7EB] rounded focus:ring-[#1D4ED8]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm text-[#111827] mb-1">Rapport hebdomadaire</div>
                  <div className="text-xs text-[#6B7280]">
                    Recevoir un résumé hebdomadaire de l'activité
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weeklyReport}
                  onChange={(e) => setNotifications({...notifications, weeklyReport: e.target.checked})}
                  className="w-4 h-4 text-[#1D4ED8] border-[#E5E7EB] rounded focus:ring-[#1D4ED8]"
                />
              </label>
            </div>
          </Card>

          {/* Security */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-[#1D4ED8]" />
              <h3 className="text-[#111827]">Sécurité</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#374151] mb-2 block">Authentification</label>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">SSO Activé</Badge>
                  <span className="text-xs text-[#6B7280]">via OpenID Connect</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB]">
                <Button variant="ghost" className="border border-[#E5E7EB]">
                  Voir les sessions actives
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Settings */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-[#06B6D4]" />
              <h3 className="text-[#111827]">Paramètres IA</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#374151] mb-2 block">Modèle IA</label>
                <Select
                  options={[
                    { value: 'local-llm-v1', label: 'Local LLM v1 (Rapide)' },
                    { value: 'local-llm-v2', label: 'Local LLM v2 (Précis)' }
                  ]}
                  defaultValue="local-llm-v1"
                />
              </div>

              <div>
                <label className="text-sm text-[#374151] mb-2 block">Langue d'analyse</label>
                <Select
                  options={[
                    { value: 'fr', label: 'Français' },
                    { value: 'en', label: 'English' },
                    { value: 'auto', label: 'Détection automatique' }
                  ]}
                  defaultValue="fr"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-[#1D4ED8] border-[#E5E7EB] rounded focus:ring-[#1D4ED8]"
                />
                <span className="text-sm text-[#111827]">Analyse automatique</span>
              </label>
            </div>
          </Card>

          {/* Info */}
          <Card className="bg-gradient-to-br from-[#DBEAFE] to-[#CFFAFE] border-[#93C5FD]">
            <Sparkles className="w-6 h-6 text-[#1D4ED8] mb-3" />
            <h4 className="text-[#111827] text-sm mb-2">IA 100% locale</h4>
            <p className="text-xs text-[#0891B2]">
              Tous les traitements IA sont effectués localement. 
              Aucune donnée n'est envoyée à des services tiers.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
