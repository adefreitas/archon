export enum Attribute {
  HANDS = "hands",
  AURA = "aura",
  WATCHERS = "watchers",
  STAIRS = "stairs",
  ARCHES = "arches",
  GEMS = "gems",
  BLIPS = "blips",
}

export type Manifest = Array<AttributeManifest>;

export type NamedManifest = {
  [key in Attribute]?: AttributeManifest;
};

export interface AttributeManifest {
  attribute: Attribute;
  categories: Array<Category>;
}

export interface Category {
  category: string;
  rarity: number;
  files: Array<File>;
}

export interface File {
  file: string;
  rarity: number;
}

export type AttributeFrames = Array<Array<string>>;

export type Frames = {
  [key in Attribute]: AttributeFrames;
};
