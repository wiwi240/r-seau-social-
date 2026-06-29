import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import PostComposer from "../components/PostComposer";
import PostList from "../components/PostList";
import {
  authAtom,
  createPostAtom,
  deletePostAtom,
  fetchPostsAtom,
  postsAtom,
  toggleLikeAtom,
} from "../state/socialAtoms";

export default function HomePage() {
  const { jwt, user, isReady } = useAtomValue(authAtom);
  const { items, status, createStatus, error } = useAtomValue(postsAtom);
  const fetchPosts = useSetAtom(fetchPostsAtom);
  const createPost = useSetAtom(createPostAtom);
  const deletePost = useSetAtom(deletePostAtom);
  const toggleLike = useSetAtom(toggleLikeAtom);

  useEffect(() => {
    if (jwt && isReady) {
      fetchPosts();
    }
  }, [fetchPosts, isReady, jwt]);

  if (!isReady) {
    return <p className="card">Vérification de la session...</p>;
  }

  if (!jwt) {
    return (
      <section className="card hero-copy">
        <h1>Welcome on My Social Network</h1>
        <p>
          This website is a training to React, global state handling and tokens. Here, authentification
          and routing will be used to create a small social media website.
        </p>
      </section>
    );
  }

  return (
    <section className="section-stack">
      <PostComposer onSubmit={createPost} loading={createStatus === "loading"} />
      {status === "loading" ? <p className="card">Chargement des posts...</p> : null}
      {error ? <p className="card error-text">{error}</p> : null}
      <PostList
        posts={items}
        currentUserId={user?.id}
        onDelete={deletePost}
        onToggleLike={toggleLike}
      />
    </section>
  );
}
