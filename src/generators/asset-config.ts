import {
  AssetConfigGeneratorCounters,
  AssetConfigGeneratorSettings,
  Attribute,
  Frames,
  NamedManifest,
  CategoryConfig,
  AttributeManifest,
  Category,
} from "../types";
import { getAudioFile, getFiles } from "../utils/files";

export class AssetConfigGenerator {
  settings: AssetConfigGeneratorSettings;
  counters: AssetConfigGeneratorCounters;
  namedManifest: NamedManifest;
  attributes: Array<Attribute>;
  maxAmount: number;

  constructor(maxAmount: number, namedManifest: NamedManifest) {
    this.maxAmount = maxAmount;
    this.namedManifest = namedManifest;
    this.settings = {};
    this.counters = {};

    const keys = Object.keys(namedManifest);
    this.attributes = keys as Array<Attribute>;

    const getCategorySettings = (
      categories: Array<Category>
    ): CategoryConfig[] => {
      const totalRarities = categories
        .map((category) => category.rarity)
        .reduce((prev, current) => prev + current);
      let counter = 0;
      return categories.map((category) => {
        const total = Math.ceil(
          (category.rarity / totalRarities) * this.maxAmount
        );
        var result = {
          name: category.name,
          starting: counter,
          total: total,
          ending: counter + total,
          rarity: category.rarity,
        };
        counter = counter + total;
        return result;
      }).sort(() => 0.5 - Math.random());;
    };
    // console.log({ settings: JSON.stringify(this.settings) });

    const initialiseCountersAndSettings = () => {
      for (let i = 0; i < keys.length; i++) {
        const key: Attribute = namedManifest[keys[i]].attribute;

        const categorySettings: Array<CategoryConfig> = getCategorySettings(
          namedManifest[key].categories
        );

        this.settings[key] = {
          categories: categorySettings,
        };

        this.counters[key] = 0;
      }
    };

    initialiseCountersAndSettings();
  }

  private updateCounters() {
    Object.keys(this.counters).forEach((key) =>
      this.counters[key]++
    );
    // this.counters["00_Auras"]++;
    // this.counters["01_Watchers"]++;
    // this.counters["02_Gems"]++;
    // this.counters["03_Stairs"]++;
    // this.counters["05_Blips"]++;
    // this.counters["06_Blip_Aura"]++;
    // this.counters["07_Arches"]++;
    // this.counters["07_Hand_Top_Left"]++;
    // this.counters["08_Hand_Top_Right"]++;
    // this.counters["09_Hand_Bottom_Left"]++;
    // this.counters["10_Hand_Bottom_Right"]++;
    // this.counters["11_Elements"]++;
    // this.counters["12_Music"]++;
    

    const restartCountersIfNeeded = () => {
      const haveAllCountersReachedTheirMaximum =
        Object.values(this.counters).filter(
          (counter) => counter === this.maxAmount
        ).length === this.attributes.length;

      if (haveAllCountersReachedTheirMaximum) {
        console.log("max ammount reached, restarting");
        for (let i = 0; i < this.attributes.length; i++) {
          this.counters[i] = 0;
        }
      }
    }
    // Does it need to be restarted at any point?
    restartCountersIfNeeded();
  }

  private findAttributeCategoryByCounter(attribute: Attribute) {
    const category = this.settings[attribute].categories.find((category) => {
      return (
        this.counters[attribute] >= category.starting &&
        this.counters[attribute] <= category.ending
      );
    });

    const type = this.namedManifest[attribute].type;

    return {
      name: category.name,
      type,
      files: type === 'audio' ? getAudioFile(attribute, category.name) : getFiles(attribute, category.name),
      rarity: category.rarity,
    };
  }

  public generate(): {
    frames: Frames;
    data: any;
    audioPath: string
  } {
    const data = {};
    const frames: Frames = {
      "00_Auras": [],
      "01_Watchers": [],
      "02_Gems": [],
      "03_Stairs": [],
      "05_Blips": [],
      "06_Blip_Aura": [],
      "07_Arches": [],
      "07_Hand_Top_Left": [],
      "08_Hand_Top_Right": [],
      "09_Hand_Bottom_Left": [],
      "10_Hand_Bottom_Right": [],
      "11_Elements": [],
    };

    let audioPath: string = "";

    this.attributes.map((attribute) => {
      const result = this.findAttributeCategoryByCounter(attribute);
      data[attribute] = {
        name: result.name,
        rarity: result.rarity,
      };
      if (this.namedManifest[attribute].type === 'audio') {
        audioPath = result.files[0]
      } else {
        frames[attribute] = result.files;
      }
    });

    this.updateCounters();
    return {
      frames,
      data,
      audioPath,
    };
  }
}
