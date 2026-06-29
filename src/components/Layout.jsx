import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import { bootstrapSessionAtom, currentUserAtom, logoutAtom } from "../state/socialAtoms";

export default function Layout({ children }) {
  const user = useAtomValue(currentUserAtom);
  const logout = useSetAtom(logoutAtom);
  const bootstrapSession = useSetAtom(bootstrapSessionAtom);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <Link to="/" className="brand">
            My Social Network
          </Link>
          <span className="brand-tagline">Micro social app built with React and Jotai</span>
        </div>
        <nav className="nav">
          {user ? (
            <>
              <span className="user-chip">@{user.username}</span>
              <NavLink to="/" className="nav-link">
                Accueil
              </NavLink>
              <NavLink to="/profile" className="nav-link">
                Profil
              </NavLink>
              <button
                type="button"
                className="secondary-button"
                onClick={() => logout()}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Log in
              </NavLink>
              <NavLink to="/register" className="nav-link">
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
