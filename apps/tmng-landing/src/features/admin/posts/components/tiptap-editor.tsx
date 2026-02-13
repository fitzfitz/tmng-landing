import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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
  Check,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) {
    return null;
  }

  const openLinkInput = () => {
    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setShowLinkInput(true);
  };

  const closeLinkInput = () => {
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const saveLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    closeLinkInput();
  };

  if (showLinkInput) {
    return (
      <div className="flex items-center gap-2 border-b border-white/10 p-2 bg-white/5 h-[53px]">
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Enter URL..."
          className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-fuchsia-500/50"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveLink();
            } else if (e.key === "Escape") {
              closeLinkInput();
            }
          }}
        />
        <button
          type="button"
          onClick={saveLink}
          className="p-1 rounded hover:bg-white/10 text-green-400 transition-colors"
        >
          <Check size={18} />
        </button>
        <button
          type="button"
          onClick={closeLinkInput}
          className="p-1 rounded hover:bg-white/10 text-red-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-white/10 p-2 bg-white/5 min-h-[53px]">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-white/10 text-purple-200 transition-colors ${
          editor.isActive("bold") ? "bg-fuchsia-600/20 text-fuchsia-400" : ""
        }`}
        title="Bold (Cmd+B)"
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
        title="Italic (Cmd+I)"
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
        title="Strike (Cmd+Shift+X)"
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
        title="Code (Cmd+E)"
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
        onClick={openLinkInput}
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
  // Use a ref to track the last content we emitted to the parent.
  // This helps us distinguish between external updates (which we should sync)
  // and internal updates (which we have already applied).
  const lastOnChange = useRef(content);

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
      Placeholder.configure({
        placeholder: "Write your post content in Markdown...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const storage = editor.storage as any;
      const newContent = storage.markdown.getMarkdown();

      // Only emit if content actually changed
      if (newContent !== lastOnChange.current) {
        lastOnChange.current = newContent;
        onChange(newContent);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-purple max-w-none p-6 focus:outline-none min-h-[300px] [&_.is-editor-empty:first-child::before]:text-purple-200/30 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none",
      },
    },
  });

  // Sync content if it changes externally
  useEffect(() => {
    if (editor && content !== lastOnChange.current) {
      // Check if the external content is different from what we last emitted.
      // If it is, it means the parent component changed the content (e.g. reset form, loaded new post).
      // We must update the editor.
      editor.commands.setContent(content);
      // Update our ref so we don't trigger an unnecessary onChange loop
      lastOnChange.current = content;
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
