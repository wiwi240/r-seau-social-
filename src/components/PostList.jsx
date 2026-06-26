import { Link } from "react-router-dom";

function formatDate(value) {
  if (!value) {
    return "Date inconnue";
  }

  return new Date(value).toLocaleString("fr-FR");
}

export default function PostList({
  posts,
  currentUserId,
  onDelete,
  onToggleLike,
  showActions = true,
}) {
  if (!posts.length) {
    return <p className="card">Aucun post pour le moment.</p>;
  }

  return (
    <div className="list-stack">
      {posts.map((post) => {
        const isOwner = post.userId === currentUserId;
        const liked = post.users_likes.includes(currentUserId);

        return (
          <article key={post.id} className="card post-card">
            <div className="post-header">
              {post.user?.username ? (
                <Link to={`/user/${post.user.username}`} className="author-link">
                  @{post.user.username}
                </Link>
              ) : (
                <span>@unknown</span>
              )}
              <span className="muted-text">{formatDate(post.createdAt)}</span>
            </div>
            <p>{post.text}</p>
            <div className="post-actions">
              {showActions ? (
                <>
                  <button type="button" className="secondary-button" onClick={() => onToggleLike(post)}>
                    {liked ? "Retirer le like" : "Liker"} ({post.like || 0})
                  </button>
                  {isOwner ? (
                    <button type="button" className="danger-button" onClick={() => onDelete(post.id)}>
                      Supprimer
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
