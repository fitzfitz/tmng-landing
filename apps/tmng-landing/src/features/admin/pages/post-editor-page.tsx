import { AdminPageWrapper } from "../admin-page-wrapper";
import PostEditor from "../post-editor";
import { useEffect, useState } from "react";

export function PostEditorPage({ id }: { id?: string }) {
  const [postId, setPostId] = useState<string | null>(id || null);
  const [isReady, setIsReady] = useState(!!id);

  useEffect(() => {
    if (id) return;
    
    // Fallback: Parse ID from URL query param for legacy Edit Mode
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get("id");
    if (queryId) {
        setPostId(queryId);
    }
    setIsReady(true);
  }, [id]);

  if (!isReady) return null;

  return (
    <AdminPageWrapper currentPath="/admin/posts">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-purple-200">
            {postId ? "Edit Post" : "New Post"}
          </h1>
        </div>
        <PostEditor postId={postId || undefined} isNew={!postId} />
      </div>
    </AdminPageWrapper>
  );
}
