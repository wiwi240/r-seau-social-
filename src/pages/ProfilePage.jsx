import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { authAtom, fetchMyProfileAtom, profileAtom, updateMyProfileAtom } from "../state/socialAtoms";

export default function ProfilePage() {
  const { user: authUser } = useAtomValue(authAtom);
  const { data, status, updateStatus, error } = useAtomValue(profileAtom);
  const fetchMyProfile = useSetAtom(fetchMyProfileAtom);
  const updateMyProfile = useSetAtom(updateMyProfileAtom);
  const [form, setForm] = useState({ username: "", description: "" });

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  useEffect(() => {
    if (data) {
      setForm({
        username: data.username || "",
        description: data.description || "",
      });
    }
  }, [data]);

  function handleSubmit(event) {
    event.preventDefault();
    updateMyProfile({
      username: form.username.trim(),
      description: form.description.trim(),
    });
  }

  const profile = data || authUser;

  return (
    <section className="section-stack">
      <article className="card">
        <h1>Mon profil</h1>
        {status === "loading" ? <p>Chargement...</p> : null}
        {profile ? (
          <>
            <p>
              <strong>Username:</strong> {profile.username}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Description:</strong> {profile.description || "Aucune description"}
            </p>
          </>
        ) : null}
      </article>

      <form className="card form-stack" onSubmit={handleSubmit}>
        <h2>Modifier le profil</h2>
        <label className="field">
          <span>Username</span>
          <input
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            required
          />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" className="primary-button" disabled={updateStatus === "loading"}>
          {updateStatus === "loading" ? "Mise à jour..." : "Enregistrer"}
        </button>
      </form>
    </section>
  );
}
