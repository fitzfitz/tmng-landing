import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Terminal,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import { useEffect } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-white/10 p-2 bg-white/5">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("bold") ? "bg-fuchsia-600/20 text-fuchsia-400" : ""
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("italic") ? "bg-fuchsia-600/20 text-fuchsia-400" : ""
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("strike") ? "bg-fuchsia-600/20 text-fuchsia-400" : ""
        }`}
        title="Strike"
      >
        <Strikethrough size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("code") ? "bg-fuchsia-600/20 text-fuchsia-400" : ""
        }`}
        title="Code"
      >
        <Code size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("heading", { level: 1 })
            ? "bg-fuchsia-600/20 text-fuchsia-400"
            : ""
        }`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-fuchsia-600/20 text-fuchsia-400"
            : ""
        }`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("heading", { level: 3 })
            ? "bg-fuchsia-600/20 text-fuchsia-400"
            : ""
        }`}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("bulletList")
            ? "bg-fuchsia-600/20 text-fuchsia-400"
            : ""
        }`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("orderedList")
            ? "bg-fuchsia-600/20 text-fuchsia-400"
            : ""
        }`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("link") ? "bg-fuchsia-600/20 text-fuchsia-400" : ""
        }`}
        title="Link"
      >
        <LinkIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
        className="p-2 rounded hover:bg-white/10 text-purple-200 transition-colors disabled:opacity-50"
        title="Unlink"
      >
        <Unlink size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("blockquote")
            ? "bg-fuchsia-600/20 text-fuchsia-400"
            : ""
        }`}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("codeBlock")
            ? "bg-fuchsia-600/20 text-fuchsia-400"
            : ""
        }`}
        title="Code Block"
      >
        <Terminal size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-white/10 text-purple-200 transition-colors disabled:opacity-50"
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-white/10 text-purple-200 transition-colors disabled:opacity-50"
        title="Redo"
      >
        <Redo size={16} />
      </button>
    </div>
  );
};

export function TiptapEditor({
  content,
  onChange,
  editable = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-fuchsia-400 hover:text-fuchsia-300 underline",
        },
      }),
      Markdown,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const storage = editor.storage as any;
      onChange(storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-purple max-w-none p-6 focus:outline-none min-h-[300px]",
      },
    },
  });

  // Sync content if it changes externally (e.g. initial load)
  useEffect(() => {
    const storage = editor?.storage as any;
    if (editor && content !== storage.markdown.getMarkdown()) {
      // Only set content if it's different to avoid cursor jumping or loops
      // Simple check, might need better diffing if bidirectional binding is heavy
      // But for initial load it's fine.
      // Actually checking against getMarkdown() might be tricky due to formatting diffs.
      // Ideally we only set content once on mount or when id changes.
      // But react-hook-form 'watch' value might change.
      // Let's rely on initial content and only update if editor is empty?
      // Or better:
      // If the editor content is empty and prop content is not, set it.
      if (editor.isEmpty && content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col h-full bg-black/20">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
