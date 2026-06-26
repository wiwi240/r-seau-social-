import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PostComposer from "../components/PostComposer";
import PostList from "../components/PostList";
import { createPost, deletePost, fetchPosts, toggleLike } from "../features/posts/postsSlice";

export default function HomePage() {
  const dispatch = useDispatch();
  const { jwt, user } = useSelector((state) => state.auth);
  const { items, status, createStatus, error } = useSelector((state) => state.posts);

  useEffect(() => {
    if (jwt) {
      dispatch(fetchPosts());
    }
  }, [dispatch, jwt]);

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
      <PostComposer onSubmit={(text) => dispatch(createPost(text))} loading={createStatus === "loading"} />
      {status === "loading" ? <p className="card">Chargement des posts...</p> : null}
      {error ? <p className="card error-text">{error}</p> : null}
      <PostList
        posts={items}
        currentUserId={user?.id}
        onDelete={(postId) => dispatch(deletePost(postId))}
        onToggleLike={(post) => dispatch(toggleLike(post))}
      />
    </section>
  );
}
