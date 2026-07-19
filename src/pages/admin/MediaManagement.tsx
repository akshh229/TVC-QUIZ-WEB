// src/pages/admin/MediaManagement.tsx
import { useState } from "react";
import { Upload, Trash2, Loader2, ImageOff, Eye } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMediaList, useUploadImage, useDeleteImage } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { isMockMode } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { MediaItem } from "@/lib/types";

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaManagement() {
  const { toast } = useToast();
  const { data: media = [], isLoading, isError, refetch } = useMediaList();
  const uploadImage = useUploadImage();
  const deleteImage = useDeleteImage();

  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState<MediaItem | null>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        await uploadImage.mutateAsync(file);
        toast({ title: `Uploaded ${file.name}`, variant: "success" });
      } catch (err) {
        toast({
          title: `Couldn't upload ${file.name}`,
          description: err instanceof Error ? err.message : undefined,
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteImage.mutateAsync(deleting.name);
      toast({ title: "Image deleted", variant: "success" });
      setDeleting(null);
    } catch (err) {
      toast({
        title: "Couldn't delete the image",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout
      title="Media"
      description={
        isMockMode
          ? "Demo mode — uploads live in this browser session only."
          : "Leader portraits and other images, stored in Supabase Storage."
      }
    >
      {/* Upload zone */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink/25 bg-card/60 px-6 py-10 text-ink/50 transition-colors hover:border-ink/40 hover:text-ink/70">
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            void handleUpload(e.target.files);
            e.target.value = "";
          }}
          aria-label="Upload images"
        />
        {uploadImage.isPending ? (
          <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="h-7 w-7" aria-hidden="true" />
        )}
        <span className="text-sm font-medium">
          {uploadImage.isPending ? "Uploading…" : "Click to upload images"}
        </span>
        <span className="text-xs">PNG or JPG · portraits work best for Guess the Leader</span>
      </label>

      {/* Grid */}
      <div className="mt-8">
        {isLoading && (
          <div className="flex min-h-[160px] items-center justify-center text-ink/50" role="status">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading media</span>
          </div>
        )}
        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 rounded-md border border-terracotta/30 bg-terracotta-soft px-4 py-8 text-center">
            <p className="text-sm text-terracotta">Couldn't load the media library.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}
        {!isLoading && !isError && media.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-ink/15 px-6 py-14 text-center text-ink/45">
            <ImageOff className="h-8 w-8" strokeWidth={1.25} aria-hidden="true" />
            <p className="text-sm">No images yet. Upload leader portraits to use in questions.</p>
          </div>
        )}
        {!isLoading && !isError && media.length > 0 && (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((item) => (
              <li
                key={item.name}
                className="group overflow-hidden rounded-lg border border-ink/10 bg-card shadow-card"
              >
                <div className="relative aspect-[4/5] bg-clay/15">
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-end justify-end gap-1.5 bg-gradient-to-t from-ink/50 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-0 bg-card/90 hover:bg-card"
                      onClick={() => setPreview(item)}
                      aria-label={`Preview ${item.name}`}
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-0 bg-card/90 text-terracotta hover:bg-card"
                      onClick={() => setDeleting(item)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <p className="truncate text-xs font-medium text-ink" title={item.name}>
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink/45">
                    {formatDate(item.createdAt)}
                    {item.size ? ` · ${formatSize(item.size)}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">{preview?.name}</DialogTitle>
            <DialogDescription>
              Copy this image's URL into a Guess the Leader question, or manage it below.
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <>
              <img
                src={preview.url}
                alt={preview.name}
                className="max-h-[50dvh] w-full rounded-md border border-ink/10 object-contain"
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(preview.url)
                      .then(() => toast({ title: "URL copied", variant: "success" }))
                      .catch(() =>
                        toast({ title: "Couldn't copy the URL", variant: "destructive" })
                      );
                  }}
                >
                  Copy URL
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleting(preview);
                    setPreview(null);
                  }}
                >
                  <Trash2 aria-hidden="true" /> Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this image?</DialogTitle>
            <DialogDescription>
              "{deleting?.name}" will be removed. Questions using it will show the placeholder
              instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleteImage.isPending}
            >
              {deleteImage.isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" /> Deleting…
                </>
              ) : (
                "Delete image"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
