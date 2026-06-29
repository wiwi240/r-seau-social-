import { useAtomValue, useSetAtom } from "jotai";
import {
  dismissInstallPromptAtom,
  installPromptAvailableAtom,
  installPromptUiAtom,
  installPwaAtom,
} from "../state/socialAtoms";

const promptCopy = {
  pages: {
    title: "Installe l'application",
    description: "Tu navigues régulièrement dans le réseau social. Installe la PWA pour y accéder plus vite.",
  },
  posts: {
    title: "Publie plus vite depuis l'app",
    description: "Tu postes souvent. Installe la PWA pour retrouver l'application directement depuis ton écran d'accueil.",
  },
};

export default function PwaInstallBanner() {
  const { isVisible, reason } = useAtomValue(installPromptUiAtom);
  const installPromptAvailable = useAtomValue(installPromptAvailableAtom);
  const dismissInstallPrompt = useSetAtom(dismissInstallPromptAtom);
  const installPwa = useSetAtom(installPwaAtom);

  if (!isVisible || !reason) {
    return null;
  }

  const copy = promptCopy[reason];

  return (
    <aside className="install-banner" role="dialog" aria-live="polite" aria-label="Installation de l'application">
      <div>
        <p className="install-banner-title">{copy.title}</p>
        <p className="install-banner-description">{copy.description}</p>
        {!installPromptAvailable ? (
          <p className="install-banner-help">
            Le raccourci n&apos;est pas proposé automatiquement pour le moment. Tu peux l&apos;installer
            plus tard depuis le menu de ton navigateur.
          </p>
        ) : null}
      </div>
      <div className="install-banner-actions">
        {installPromptAvailable ? (
          <button type="button" className="primary-button" onClick={() => installPwa()}>
            Installer
          </button>
        ) : null}
        <button type="button" className="secondary-button" onClick={() => dismissInstallPrompt()}>
          {installPromptAvailable ? "Plus tard" : "Fermer"}
        </button>
      </div>
    </aside>
  );
}
