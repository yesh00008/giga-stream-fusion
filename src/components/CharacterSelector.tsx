import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Character, CharacterType, generateCharacters } from "@/lib/characters";

interface CharacterSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (character: Character) => void;
  currentCharacter?: Character;
}

export function CharacterSelector({ open, onOpenChange, onSelect, currentCharacter }: CharacterSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<CharacterType | "all">("all");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);

  useEffect(() => {
    // Generate characters once on mount
    const allCharacters = generateCharacters();
    setCharacters(allCharacters);
    setFilteredCharacters(allCharacters.slice(0, 100)); // Show first 100 initially
  }, []);

  useEffect(() => {
    // Filter characters based on search and type
    let filtered = characters;

    if (selectedType !== "all") {
      filtered = filtered.filter(char => char.type === selectedType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(char =>
        char.type.includes(query) ||
        char.hairStyle.includes(query) ||
        char.hairColor.includes(query) ||
        char.outfit.includes(query) ||
        char.accessories.some(acc => acc.includes(query))
      );
    }

    setFilteredCharacters(filtered.slice(0, 200)); // Limit to 200 for performance
  }, [searchQuery, selectedType, characters]);

  const typeCategories: { type: CharacterType | "all"; label: string; count: number }[] = [
    { type: "all", label: "All", count: characters.length },
    { type: "man", label: "Men", count: characters.filter(c => c.type === "man").length },
    { type: "woman", label: "Women", count: characters.filter(c => c.type === "woman").length },
    { type: "boy", label: "Boys", count: characters.filter(c => c.type === "boy").length },
    { type: "girl", label: "Girls", count: characters.filter(c => c.type === "girl").length },
    { type: "child", label: "Children", count: characters.filter(c => c.type === "child").length },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Your Character</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search characters by type, style, color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 flex-wrap">
            {typeCategories.map((category) => (
              <Badge
                key={category.type}
                variant={selectedType === category.type ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedType(category.type)}
              >
                {category.label} ({category.count})
              </Badge>
            ))}
          </div>

          {/* Character Grid */}
          <div className="flex-1 overflow-y-auto border border-border rounded-lg p-4">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {filteredCharacters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => {
                    onSelect(character);
                    onOpenChange(false);
                  }}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-4xl
                    transition-all hover:scale-110 hover:shadow-lg
                    ${currentCharacter?.id === character.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-border'}
                  `}
                  style={{ backgroundColor: character.bgColor }}
                  title={`${character.type} - ${character.hairStyle} ${character.hairColor} hair - ${character.outfit}`}
                >
                  <div className="animate-bounce-subtle">{character.emoji}</div>
                </button>
              ))}
            </div>

            {filteredCharacters.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No characters found. Try a different search.</p>
              </div>
            )}

            {filteredCharacters.length > 0 && (
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Showing {filteredCharacters.length} of {
                  selectedType === "all" 
                    ? characters.length 
                    : characters.filter(c => c.type === selectedType).length
                } characters
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
