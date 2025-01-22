"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Album } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteAlbumDialog } from "./delete-album-dialog";
import { EditAlbumDialog } from "./edit-album-dialog";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{album.name}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditDialog(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>{album.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Created on {new Date(album.created_at).toLocaleDateString()}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/album/${album.id}`}>View Album</Link>
          </Button>
        </CardFooter>
      </Card>

      <DeleteAlbumDialog
        album={album}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
      
      <EditAlbumDialog
        album={album}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
