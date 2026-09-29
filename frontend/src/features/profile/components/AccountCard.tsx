import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, LogOut, Check, Shield } from "lucide-react";
import type { Profile } from "../../../services/profile";
import { profileService } from "../../../services/profile";
import { journalService } from "../../../services/journal";
import { authService } from "../../../services/auth";
import { playSound } from "../../../lib/sounds";
import { USUARIO_CONTENT } from "../../../data/usuarioContent";

interface AccountCardProps {
  profile: Profile;
}

export const AccountCard: React.FC<AccountCardProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [exported, setExported] = useState(false);
  const { account: copy } = USUARIO_CONTENT.settings;

  const handleExport = () => {
    const entries = journalService.getEntries();
    profileService.exportUserDataJSON(entries);
    playSound("guardado");
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handleLogout = () => {
    if (window.confirm(copy.logoutConfirm)) {
      authService.clearSession();
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-surface-raised border border-border/40 shadow-xs space-y-4 select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-sunken text-muted-foreground flex items-center justify-center shrink-0 shadow-xs">
          <Shield size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-replica text-lg font-medium text-foreground truncate">
            {copy.title}
          </h3>
          <p className="text-xs text-muted-foreground font-voice truncate">
            {profile.email}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-border/20">
        {/* Botón de Exportar Diario en JSON */}
        <button
          type="button"
          onClick={handleExport}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-sunken border border-border/30 text-xs font-medium text-foreground transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            {exported ? (
              <Check size={15} className="text-voice" />
            ) : (
              <Download size={15} className="text-voice" />
            )}
            <span>{exported ? copy.exportSuccess : copy.exportButton}</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">JSON</span>
        </button>

        {/* Botón de Cerrar Sesión */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span>{copy.logoutButton}</span>
        </button>
      </div>
    </div>
  );
};

export default AccountCard;
