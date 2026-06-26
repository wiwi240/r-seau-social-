import { useState } from "react";

export default function PostComposer({ onSubmit, loading }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) {
      return;
    }

    onSubmit(value);
    setText("");
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
