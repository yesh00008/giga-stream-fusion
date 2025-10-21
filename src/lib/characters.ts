// 2D Character Avatar System
// Generates diverse character combinations for boys, girls, men, women, and children

export type CharacterType = 'boy' | 'girl' | 'man' | 'woman' | 'child';
export type SkinTone = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
export type HairStyle = 'short' | 'long' | 'curly' | 'wavy' | 'straight' | 'bald' | 'ponytail' | 'bun' | 'braids' | 'spiky';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'white' | 'blue' | 'pink' | 'purple' | 'green';
export type Outfit = 'casual' | 'formal' | 'sporty' | 'business' | 'trendy' | 'traditional' | 'artistic' | 'tech' | 'creative' | 'professional';

export interface Character {
  id: string;
  type: CharacterType;
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  outfit: Outfit;
  accessories: string[];
  emoji: string;
  bgColor: string;
}

// Emoji sets for different character types
const characterEmojis = {
  boy: ['👦', '👦🏻', '👦🏼', '👦🏽', '👦🏾', '👦🏿', '🧒', '🧒🏻', '🧒🏼', '🧒🏽', '🧒🏾', '🧒🏿'],
  girl: ['👧', '👧🏻', '👧🏼', '👧🏽', '👧🏾', '👧🏿', '🧒', '🧒🏻', '🧒🏼', '🧒🏽', '🧒🏾', '🧒🏿'],
  man: ['👨', '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿', '🧑', '🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿', '👨‍💼', '👨‍💻', '👨‍🎨', '👨‍🔬', '👨‍🏫', '👨‍🎤', '👨‍🍳', '👨‍⚕️'],
  woman: ['👩', '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿', '🧑', '🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿', '👩‍💼', '👩‍💻', '👩‍🎨', '👩‍🔬', '👩‍🏫', '👩‍🎤', '👩‍🍳', '👩‍⚕️'],
  child: ['🧒', '🧒🏻', '🧒🏼', '🧒🏽', '🧒🏾', '🧒🏿', '👶', '👶🏻', '👶🏼', '👶🏽', '👶🏾', '👶🏿'],
};

const bgColors = [
  '#FFE5E5', '#FFF4E5', '#FFFFE5', '#E5FFE5', '#E5FFFF', '#E5E5FF', '#FFE5FF',
  '#FFD6E5', '#FFE5D6', '#D6FFE5', '#D6FFFF', '#E5D6FF', '#FFD6FF',
  '#FFC4C4', '#FFD4C4', '#FFFFC4', '#C4FFC4', '#C4FFFF', '#C4C4FF', '#FFC4FF',
  '#FFB3B3', '#FFC3B3', '#FFFFB3', '#B3FFB3', '#B3FFFF', '#B3B3FF', '#FFB3FF',
  '#FFA5A5', '#FFB5A5', '#FFFFA5', '#A5FFA5', '#A5FFFF', '#A5A5FF', '#FFA5FF',
];

// Generate 1000+ unique characters
export function generateCharacters(): Character[] {
  const characters: Character[] = [];
  let id = 1;

  const types: CharacterType[] = ['boy', 'girl', 'man', 'woman', 'child'];
  const skinTones: SkinTone[] = ['light', 'medium-light', 'medium', 'medium-dark', 'dark'];
  const hairStyles: HairStyle[] = ['short', 'long', 'curly', 'wavy', 'straight', 'bald', 'ponytail', 'bun', 'braids', 'spiky'];
  const hairColors: HairColor[] = ['black', 'brown', 'blonde', 'red', 'gray', 'white', 'blue', 'pink', 'purple', 'green'];
  const outfits: Outfit[] = ['casual', 'formal', 'sporty', 'business', 'trendy', 'traditional', 'artistic', 'tech', 'creative', 'professional'];
  const accessories = ['glasses', 'hat', 'scarf', 'watch', 'necklace', 'earrings', 'backpack', 'bag'];

  types.forEach((type) => {
    const emojis = characterEmojis[type];
    
    emojis.forEach((emoji) => {
      skinTones.forEach((skinTone) => {
        hairStyles.forEach((hairStyle) => {
          hairColors.forEach((hairColor) => {
            outfits.forEach((outfit) => {
              // Create character with random accessories
              const characterAccessories = accessories
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 3));

              characters.push({
                id: `char-${id}`,
                type,
                skinTone,
                hairStyle,
                hairColor,
                outfit,
                accessories: characterAccessories,
                emoji,
                bgColor: bgColors[id % bgColors.length],
              });

              id++;
            });
          });
        });
      });
    });
  });

  return characters;
}

// Get a random default character
export function getRandomCharacter(): Character {
  const characters = generateCharacters();
  return characters[Math.floor(Math.random() * characters.length)];
}

// Get default character
export function getDefaultCharacter(): Character {
  return {
    id: 'char-default',
    type: 'man',
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'brown',
    outfit: 'casual',
    accessories: ['glasses'],
    emoji: '👨‍💻',
    bgColor: '#E5E5FF',
  };
}

// Filter characters by type
export function filterCharactersByType(type: CharacterType): Character[] {
  const allCharacters = generateCharacters();
  return allCharacters.filter(char => char.type === type);
}

// Search characters
export function searchCharacters(query: string): Character[] {
  const allCharacters = generateCharacters();
  const lowerQuery = query.toLowerCase();
  
  return allCharacters.filter(char => 
    char.type.includes(lowerQuery) ||
    char.hairStyle.includes(lowerQuery) ||
    char.hairColor.includes(lowerQuery) ||
    char.outfit.includes(lowerQuery) ||
    char.accessories.some(acc => acc.includes(lowerQuery))
  );
}
