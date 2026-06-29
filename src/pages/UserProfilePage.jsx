import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useParams } from "react-router-dom";
import PostList from "../components/PostList";
import {
  authAtom,
  clearViewedUserAtom,
  deletePostAtom,
  fetchUserByUsernameAtom,
  toggleLikeAtom,
  viewedUserAtom,
} from "../state/socialAtoms";

export default function UserProfilePage() {
  const { username } = useParams();
  const currentUserId = useAtomValue(authAtom).user?.id;
  const { profile, posts, status, error } = useAtomValue(viewedUserAtom);
  const fetchUserByUsername = useSetAtom(fetchUserByUsernameAtom);
  const clearViewedUser = useSetAtom(clearViewedUserAtom);
  const deletePost = useSetAtom(deletePostAtom);
  const toggleLike = useSetAtom(toggleLikeAtom);

  useEffect(() => {
    fetchUserByUsername(username);
    return () => {
      clearViewedUser();
    };
  }, [clearViewedUser, fetchUserByUsername, username]);

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
        onDelete={deletePost}
        onToggleLike={toggleLike}
      />
    </section>
  );
}
