import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import PostList from "../components/PostList";
import { deletePost, toggleLike } from "../features/posts/postsSlice";
import { clearViewedUser, fetchUserByUsername } from "../features/users/usersSlice";

export default function UserProfilePage() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const { profile, posts, status, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUserByUsername(username));
    return () => {
      dispatch(clearViewedUser());
    };
  }, [dispatch, username]);

  return (
    <section className="section-stack">
      <article className="card">
        {status === "loading" ? <p>Chargement du profil...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {profile ? (
          <>
            <h1>@{profile.username}</h1>
            <p>{profile.description || "Aucune description"}</p>
          </>
        ) : null}
      </article>
      <PostList
        posts={posts}
        currentUserId={currentUserId}
        onDelete={(postId) => dispatch(deletePost(postId))}
        onToggleLike={(post) => dispatch(toggleLike(post))}
      />
    </section>
  );
}
