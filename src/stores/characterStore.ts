import { create } from 'zustand';
import type { Character } from '../types/characters';
import { sampleCharacters } from '../data/sample-characters';

// Ключ для localStorage
const STORAGE_KEY = 'dnd-characters';

// Функция загрузки из localStorage
const loadCharacters = (): Character[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return sampleCharacters; // если ничего нет — используем примеры
};

// Функция сохранения в localStorage
const saveCharacters = (characters: Character[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
};

interface CharacterStore {
  characters: Character[];
  currentCharacter: Character | null;
  setCharacters: (characters: Character[]) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updated: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  setCurrentCharacter: (character: Character | null) => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  characters: loadCharacters(), // загружаем при старте
  currentCharacter: null,
  
  setCharacters: (characters) => {
    saveCharacters(characters);
    set({ characters });
  },
  
  addCharacter: (character) => set((state) => {
    const newCharacters = [...state.characters, character];
    saveCharacters(newCharacters);
    return { characters: newCharacters };
  }),
  
  updateCharacter: (id, updated) => set((state) => {
    const newCharacters = state.characters.map(char => 
      char.id === id ? { ...char, ...updated } : char
    );
    saveCharacters(newCharacters);
    return { characters: newCharacters };
  }),
  
  deleteCharacter: (id) => set((state) => {
    const newCharacters = state.characters.filter(char => char.id !== id);
    saveCharacters(newCharacters);
    return { characters: newCharacters };
  }),
  
  setCurrentCharacter: (character) => set({ currentCharacter: character })
}));