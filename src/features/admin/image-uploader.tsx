import { useState, useRef, useEffect } from "react";

interface ImageUploaderProps {
  currentImage?: string | null;
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export default function ImageUploader({ currentImage, onFileSelect, className = "" }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize preview with currentImage if provided
  useEffect(() => {
    if (currentImage && !preview) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Notify parent
    onFileSelect(file);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerSelect}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-xl transition-all duration-200 overflow-hidden
          ${isDragging 
            ? "border-fuchsia-500 bg-fuchsia-500/10" 
            : "border-white/10 hover:border-white/30 bg-black/20"
          }
          ${preview ? "h-64" : "h-48"}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />

        {preview ? (
          <div className="relative h-full w-full">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
               <button 
                  type="button"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Change
               </button>
               <button 
                  type="button"
                  onClick={clearSelection}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
               >
                 Remove
               </button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-200/50 group-hover:text-purple-200 transaction-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">Drop valid image here</p>
            <p className="text-xs mt-1">or click to browse</p>
          </div>
        )}
      </div>
    </div>
  );
}
