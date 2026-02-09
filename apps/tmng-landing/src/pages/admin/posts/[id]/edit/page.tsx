import { useParams } from "react-router-dom";
import { PostEditor } from "@/features/admin/posts/components/post-editor";

export default function AdminEditPostPage() {
  const { id } = useParams();
  return <PostEditor postId={id} />;
}
