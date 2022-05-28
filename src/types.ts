export enum Attribute {
  AURAS                           = "00_Auras",
	WATCHERS                        = "01_Watchers",
	GEMS                            = "02_Gems",
	STAIRS                          = "03_Stairs",
	BLIPS                           = "05_Blips",
	BLIP_AURA                       = "06_Blip_Aura",
	ARCHES                          = "07_Arches",
	HAND_TOP_LEFT                   = "07_Hand_Top_Left",
	HAND_TOP_RIGHT                  = "08_Hand_Top_Right",
	HAND_BOTTOM_LEFT                = "09_Hand_Bottom_Left",
	HAND_BOTTOM_RIGHT               = "10_Hand_Bottom_Right",
	ELEMENTS                        = "11_Elements",
  MUSIC                           = "12_Music"
}

export type Manifest = Array<AttributeManifest>;

export type NamedManifest = {
  [key in Attribute]?: AttributeManifest;
};

export interface AttributeManifest {
  attribute: Attribute;
  categories: Array<Category>;
  type: 'audio' | 'image'
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
  [key in Attribute]?: AttributeFrames;
};
