import { Upload as UploadIcon, FileVideo, Image, Sparkles, Globe, Lock, Users, Calendar, DollarSign, Tag, Eye, MessageSquare, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [allowComments, setAllowComments] = useState(true);
  const [allowRatings, setAllowRatings] = useState(true);
  const [monetize, setMonetize] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

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
              <div className="space-y-6">
                <Card className="p-6 gradient-card space-y-6">
                  <h3 className="text-xl font-semibold">Video Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title (required)</Label>
                    <Input id="title" placeholder="Enter an engaging title" maxLength={100} />
                    <p className="text-xs text-muted-foreground">0 / 100</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell viewers about your video (tags, timestamps, links)"
                      rows={6}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground">0 / 5000</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-smooth cursor-pointer aspect-video flex flex-col items-center justify-center">
                        <Image className="mb-2 text-muted-foreground" size={24} />
                        <p className="text-xs text-muted-foreground">Upload</p>
                      </div>
                      <div className="border rounded-lg bg-muted aspect-video"></div>
                      <div className="border rounded-lg bg-muted aspect-video"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input placeholder="Add tags separated by commas" />
                    <div className="flex gap-2 flex-wrap mt-2">
                      <Badge variant="secondary">
                        <Tag size={12} className="mr-1" />
                        Tutorial
                      </Badge>
                      <Badge variant="secondary">
                        <Tag size={12} className="mr-1" />
                        Coding
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="news">News & Politics</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="tech">Science & Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>

                <Card className="p-6 gradient-card space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Eye size={20} />
                    Visibility & Audience
                  </h3>

                  <RadioGroup value={visibility} onValueChange={setVisibility}>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="public" id="public" />
                        <div className="flex-1">
                          <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                            <Globe size={18} />
                            <span className="font-medium">Public</span>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Everyone can watch your video
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="unlisted" id="unlisted" />
                        <div className="flex-1">
                          <Label htmlFor="unlisted" className="flex items-center gap-2 cursor-pointer">
                            <Users size={18} />
                            <span className="font-medium">Unlisted</span>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Anyone with the link can watch
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="private" id="private" />
                        <div className="flex-1">
                          <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                            <Lock size={18} />
                            <span className="font-medium">Private</span>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Only you and people you choose can watch
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="space-y-2">
                    <Label htmlFor="schedule" className="flex items-center gap-2">
                      <Calendar size={18} />
                      Schedule publish (optional)
                    </Label>
                    <Input
                      id="schedule"
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                </Card>

                <Card className="p-6 gradient-card space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <MessageSquare size={20} />
                    Engagement Settings
                  </h3>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={18} />
                      <div>
                        <p className="font-medium">Allow Comments</p>
                        <p className="text-sm text-muted-foreground">
                          Let viewers comment on your video
                        </p>
                      </div>
                    </div>
                    <Switch checked={allowComments} onCheckedChange={setAllowComments} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <ThumbsUp size={18} />
                      <div>
                        <p className="font-medium">Show Like/Dislike</p>
                        <p className="text-sm text-muted-foreground">
                          Display rating counts
                        </p>
                      </div>
                    </div>
                    <Switch checked={allowRatings} onCheckedChange={setAllowRatings} />
                  </div>
                </Card>

                <Card className="p-6 gradient-card space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <DollarSign size={20} />
                    Monetization
                  </h3>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} />
                      <div>
                        <p className="font-medium">Enable Monetization</p>
                        <p className="text-sm text-muted-foreground">
                          Earn from ads on this video
                        </p>
                      </div>
                    </div>
                    <Switch checked={monetize} onCheckedChange={setMonetize} />
                  </div>

                  {monetize && (
                    <div className="p-4 bg-accent rounded-lg space-y-2">
                      <p className="text-sm font-medium">Monetization Options</p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          Display ads
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          Overlay ads
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          Sponsored content
                        </label>
                      </div>
                    </div>
                  )}
                </Card>

                <div className="flex gap-4">
                  <Button variant="gradient" className="flex-1" size="lg">
                    <UploadIcon className="mr-2" size={18} />
                    Publish Now
                  </Button>
                  <Button variant="outline" className="flex-1" size="lg">
                    Save as Draft
                  </Button>
                </div>
              </div>
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
