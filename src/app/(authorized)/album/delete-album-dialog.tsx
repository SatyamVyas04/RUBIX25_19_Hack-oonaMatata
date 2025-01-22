"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Album } from "@/lib/types";
import { useRouter } from "next/navigation";

interface DeleteAlbumDialogProps {
  album: Album;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAlbumDialog({
  album,
  open,
  onOpenChange,
}: DeleteAlbumDialogProps) {
  const router = useRouter();

  async function deleteAlbum() {
    const response = await fetch(`/api/album/${album.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Album</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the album "{album.name}"? This will
            remove all images from the album (but won't delete the images
            themselves).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteAlbum}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
