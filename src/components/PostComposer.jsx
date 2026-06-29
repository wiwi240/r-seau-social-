import { useState } from "react";

export default function PostComposer({ onSubmit, loading }) {
  const [text, setText] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) {
      return;
    }

    try {
      await onSubmit(value);
      setText("");
    } catch {
      // L'erreur est deja geree par le state global, on conserve juste le brouillon.
    }
  }

  return (
    <form className="card form-inline composer-card" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Écrire un post..."
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={280}
      />
      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "Envoi..." : "Poster"}
      </button>
    </form>
  );
}
