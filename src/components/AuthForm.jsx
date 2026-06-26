import { useState } from "react";

export default function AuthForm({ mode, onSubmit, loading, error }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    identifier: "",
    password: "",
  });

  const isRegister = mode === "register";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(
      isRegister
        ? {
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
          }
        : {
            identifier: form.identifier.trim(),
            password: form.password,
          }
    );
  }

  return (
    <form className="card form-stack auth-card" onSubmit={handleSubmit}>
      <div className="section-heading">
        <span className="eyebrow">{isRegister ? "Nouveau compte" : "Retour sur l'app"}</span>
        <h1>{isRegister ? "Inscription" : "Connexion"}</h1>
      </div>
      {isRegister && (
        <label className="field">
          <span>Username</span>
          <input name="username" value={form.username} onChange={handleChange} required />
        </label>
      )}
      {isRegister && (
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
      )}
      {!isRegister && (
        <label className="field">
          <span>Email ou username</span>
          <input name="identifier" value={form.identifier} onChange={handleChange} required />
        </label>
      )}
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "Chargement..." : isRegister ? "Créer le compte" : "Se connecter"}
      </button>
    </form>
  );
}
