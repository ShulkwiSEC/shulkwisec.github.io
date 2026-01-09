// @/contexts/ImageModal.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ImageModalContext = createContext({
  showImage: (src: string) => {},
});

export const useImageModal = () => useContext(ImageModalContext);

export function ImageModalProvider({ children }: { children: React.ReactNode }) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        const imgSrc = (target as HTMLImageElement).src;
        setSelectedImg(imgSrc);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <ImageModalContext.Provider value={{ showImage: setSelectedImg }}>
      {children}
      
      <Dialog open={!!selectedImg} onOpenChange={() => setSelectedImg(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-transparent border-none">
          {selectedImg && (
            <img 
              src={selectedImg} 
              className="w-full h-full object-contain rounded-lg shadow-2xl" 
              alt="Enlarged view" 
            />
          )}
        </DialogContent>
      </Dialog>
    </ImageModalContext.Provider>
  );
}