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

export type AssetConfigGeneratorSettings = {
  [key in Attribute]?: AssetConfigGeneratorSetting;
};

export interface AssetConfigGeneratorSetting {
  categories: Array<CategoryConfig>;
}

export interface CategoryConfig {
  name: string;
  rarity: number;
  starting: number;
  ending: number;
  total: number;
}

export type AssetConfigGeneratorCounters = {
  [key in Attribute]?: number;
};

export interface Category {
  name: string;
  rarity: number;
}

export type AttributeFrames = Array<string>;

export type Frames = {
  [key in Attribute]: AttributeFrames;
};
