import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Image, X } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";

interface QuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalPost: {
    id: string;
    author: string;
    authorUsername: string;
    authorAvatar?: string;
    authorBadge?: string | null;
    content: string;
    image?: string;
    timestamp: string;
  };
  onQuote: (content: string, imageFile?: File) => Promise<void>;
}

export function QuoteDialog({ open, onOpenChange, originalPost, onQuote }: QuoteDialogProps) {
  const [quoteContent, setQuoteContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onQuote(quoteContent, imageFile || undefined);
      setQuoteContent("");
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error posting quote:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quote Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quote Input */}
          <div>
            <Textarea
              placeholder="Add a comment, photo, or GIF before you share this post"
              value={quoteContent}
              onChange={(e) => setQuoteContent(e.target.value)}
              className="min-h-[120px] resize-none text-base"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="quote-image-upload"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById('quote-image-upload')?.click()}
                  className="gap-2"
                >
                  <Image size={18} />
                  Add Image
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                {quoteContent.length}/500
              </span>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-lg max-h-64 object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeImage}
              >
                <X size={16} />
              </Button>
            </div>
          )}

          {/* Original Post Preview */}
          <Card className="p-4 border-2">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={originalPost.authorAvatar} />
                <AvatarFallback>
                  {originalPost.author[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {originalPost.author}
                  </span>
                  {originalPost.authorBadge && (
                    <VerificationBadge type={originalPost.authorBadge as any} size={14} />
                  )}
                  <span className="text-xs text-muted-foreground">
                    @{originalPost.authorUsername}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {originalPost.timestamp}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {originalPost.content}
                </p>
                {originalPost.image && (
                  <img
                    src={originalPost.image}
                    alt="Post"
                    className="mt-3 rounded-lg max-h-48 object-cover w-full"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || (!quoteContent.trim() && !imageFile)}
              className="gap-2"
            >
              {submitting ? "Posting..." : "Quote Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
