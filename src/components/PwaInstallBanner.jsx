import { useAtomValue, useSetAtom } from "jotai";
import {
  dismissInstallPromptAtom,
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
      </div>
      <div className="install-banner-actions">
        <button type="button" className="primary-button" onClick={() => installPwa()}>
          Installer
        </button>
        <button type="button" className="secondary-button" onClick={() => dismissInstallPrompt()}>
          Plus tard
        </button>
      </div>
    </aside>
  );
}
