import React, { useState } from "react";
import { LogOut, Mail, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../../../components/ui/Dialog";
import { LinkRow } from "./SettingsCard";
import { sessionActions, useAccount } from "../../../lib/session";
import type { AuthProvider } from "../../../services/auth";

const PROVIDER: Record<AuthProvider, string> = {
  google: "Entraste con Google",
  email: "Entraste con tu correo",
};

// Tu cuenta (features/profile/components/account-card.tsx de la app): con qué entraste, cerrar sesión y
// eliminar la cuenta, que borra todo.
export const AccountCard: React.FC = () => {
  const account = useAccount();
  const [confirm, setConfirm] = useState<"logout" | "delete" | null>(null);
  const [failed, setFailed] = useState(false);
  if (!account) return null;

  const remove = async () => {
    setFailed(false);
    if (!(await sessionActions.deleteAccount())) setFailed(true);
  };

  return (
    <div className="space-y-0.5 rounded-lg border border-border/40 bg-surface-raised p-2 shadow-raised dark:shadow-none">
      <div className="flex items-center gap-3 px-3 py-3">
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-voice-soft text-voice">
          <Mail size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-5 text-foreground">{account.email}</p>
          <p className="text-[13px] text-muted-foreground">{PROVIDER[account.provider]}</p>
        </div>
      </div>
      <LinkRow icon={LogOut} title="Cerrar sesión" onClick={() => setConfirm("logout")} />
      <LinkRow icon={Trash2} tint="emotion" title="Eliminar mi cuenta" onClick={() => setConfirm("delete")} />
      {failed ? (
        <p role="alert" className="px-3 pb-2 text-[13px] text-emotion">
          No pudimos eliminar tu cuenta. Revisa tu conexión e inténtalo otra vez.
        </p>
      ) : null}

      <ConfirmDialog
        open={confirm === "logout"}
        onClose={() => setConfirm(null)}
        onConfirm={() => sessionActions.signOut()}
        title="¿Cerrar sesión?"
        description="Tu diario queda guardado en tu cuenta para cuando vuelvas."
        confirmLabel="Cerrar sesión"
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        title="¿Eliminar tu cuenta?"
        description="Se borran tu diario, tus réplicas, tus frases guardadas y tus conversaciones. No se puede deshacer."
        confirmLabel="Eliminar"
        destructive
      />
    </div>
  );
};

export default AccountCard;
