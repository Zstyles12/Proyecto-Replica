import React from "react";
import { Link } from "react-router-dom";
import { CofreIcon } from "./CofreIcon";

// Abre Mi cofre (las frases que marcaste como favoritas). Es el mismo ícono en toda la web, en lugar de
// enlaces de texto. Sin contador: un número encima hace ruido (components/brand/cofre-button.tsx).
export const CofreButton = React.forwardRef<HTMLAnchorElement>((_props, ref) => (
  <Link
    ref={ref}
    to="/cofre"
    aria-label="Mi cofre"
    title="Mi cofre"
    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface transition-transform duration-press active:scale-[0.97] hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
  >
    <CofreIcon size={23} color="var(--voice)" heartColor="var(--emotion)" />
  </Link>
));
CofreButton.displayName = "CofreButton";
