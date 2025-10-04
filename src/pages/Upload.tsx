import { Upload as UploadIcon, FileVideo, Image, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload Content</h1>
          <p className="text-muted-foreground">Share your videos with the world</p>
        </div>

        <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video">
              <FileVideo className="mr-2" size={18} />
              Video Upload
            </TabsTrigger>
            <TabsTrigger value="short">
              <Sparkles className="mr-2" size={18} />
              Create Short
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="space-y-6 mt-6">
            <Card className="p-8 gradient-card">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-smooth cursor-pointer">
                <UploadIcon className="mx-auto mb-4 text-primary" size={48} />
                <h3 className="text-xl font-semibold mb-2">Drag and drop video files to upload</h3>
                <p className="text-muted-foreground mb-4">Your videos will be private until you publish them</p>
                <Button variant="gradient">
                  <FileVideo className="mr-2" size={18} />
                  Select File
                </Button>
              </div>
            </Card>

            {selectedFile && (
              <Card className="p-6 gradient-card space-y-4">
                <h3 className="text-xl font-semibold">Video Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter video title" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell viewers about your video"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-smooth cursor-pointer">
                    <Image className="mx-auto mb-2 text-muted-foreground" size={32} />
                    <p className="text-sm text-muted-foreground">Upload custom thumbnail</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="gradient" className="flex-1">
                    Publish
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="short" className="space-y-6 mt-6">
            <Card className="p-8 gradient-card">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-smooth cursor-pointer">
                <Sparkles className="mx-auto mb-4 text-secondary" size={48} />
                <h3 className="text-xl font-semibold mb-2">Create a Short Video</h3>
                <p className="text-muted-foreground mb-4">Upload vertical videos up to 60 seconds</p>
                <Button variant="gradient">
                  <FileVideo className="mr-2" size={18} />
                  Select Short Video
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-6 gradient-card">
          <h3 className="text-lg font-semibold mb-4">Upload Guidelines</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Maximum file size: 10GB</li>
            <li>• Supported formats: MP4, MOV, AVI, FLV, WMV</li>
            <li>• Recommended resolution: 1080p or higher</li>
            <li>• Copyright: Only upload content you own or have rights to</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
