"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Match } from "@/types";

/**
 * Turns a match into a picture and hands it to whatever the device shares with.
 *
 * The file is what travels, not a link. A link would have to be readable by
 * people who are not in the team — which is the one thing row-level security
 * is here to prevent — whereas an image the sharer already has the right to
 * see is theirs to pass on, exactly like a photograph of the pitch.
 *
 * A phone gets the share sheet. A desktop browser, which mostly cannot share
 * files, gets the card in a dialog to save or copy: the picture is the point
 * either way, so the fallback shows it rather than apologising.
 */
export default function ShareMatchButton({ match }: { match: Match }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // A blob URL is a handle on memory, not a string, so it has to be given
  // back — and only once the dialog holding it has gone.
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const fileName = `${match.date}-match.png`;

  const share = async () => {
    setBusy(true);
    try {
      const response = await fetch(`/api/share/match/${match.id}`);
      if (!response.ok) throw new Error(await response.text());

      const blob = await response.blob();
      const file = new File([blob], fileName, { type: "image/png" });

      // `canShare` with the files themselves, not just a check that `share`
      // exists: desktop Chrome has the method and refuses the attachment.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "The Dugout" });
        return;
      }

      setImage(URL.createObjectURL(blob));
    } catch (error) {
      // An abort is the person changing their mind, not a failure.
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast({
        title: "Couldn't make the picture",
        description: "Have another go in a moment.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!image) return;
    try {
      const blob = await (await fetch(image)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Couldn't copy it",
        description: "Save it instead and attach it yourself.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={share}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        Share
      </Button>

      <Dialog
        open={image !== null}
        onOpenChange={(open) => {
          if (!open) setImage(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>The result, as a picture</DialogTitle>
            <DialogDescription>
              Save it or copy it, then drop it in the group chat.
            </DialogDescription>
          </DialogHeader>

          {/* A plain `img`: a blob URL is memory this tab already holds, so
              there is nothing for the image optimiser to fetch or resize. */}
          {image && (
            <img
              src={image}
              alt="The match result"
              className="w-full rounded-xl border border-border"
            />
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild className="gap-1">
              <a href={image ?? "#"} download={fileName}>
                <Download className="h-4 w-4" />
                Save it
              </a>
            </Button>
            <Button variant="outline" className="gap-1" onClick={copy}>
              {copied ? (
                <Check className="h-4 w-4 text-win" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy it"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
