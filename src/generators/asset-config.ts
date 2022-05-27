import {
  AssetConfigGeneratorCounters,
  AssetConfigGeneratorSettings,
  Attribute,
  Frames,
  NamedManifest,
  CategoryConfig,
  AttributeManifest,
} from "../types";
import { getFiles } from "../utils/files";

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

    initialiseCountersAndSettings();

    function initialiseCountersAndSettings() {
      for (let i = 0; i < keys.length; i++) {
        let counter = 0;
        const key: Attribute = namedManifest[keys[i]].attribute.toLowerCase();
        const rarities = namedManifest[key].categories.map(
          (category) => category.rarity
        );
        const totalRarities = rarities.reduce(
          (prev, current) => prev + current
        );
        const categorySettings: Array<CategoryConfig> = getCategorySettings(
          namedManifest[key],
          totalRarities,
          counter
        );

        this.settings[key] = {
          categories: categorySettings,
        };

        this.counters[key] = 0;
        counter++;
      }
    }

    function getCategorySettings(
      attribute: AttributeManifest,
      totalRarities: number,
      counter: number
    ): CategoryConfig[] {
      return attribute.categories.map((category) => {
        const total = Math.ceil(
          (category.rarity / totalRarities) * this.maxAmount
        );
        return {
          name: category.name,
          starting: counter,
          total: total,
          ending: counter + total,
          rarity: category.rarity,
        };
      });
    }
    // console.log({ settings: JSON.stringify(this.settings) });
  }

  private updateCounters(attributeIndex: number = 0) {
    const isAttributeIndexExceeded = attributeIndex >= this.attributes.length;
    const isAttributeCounterInAcceptableRange =
      this.counters[this.attributes[attributeIndex]] < this.maxAmount;
    console.log(
      `updating counters for attribute ${
        this.attributes[attributeIndex]
      } current value ${this.counters[this.attributes[attributeIndex]]}`
    );

    if (isAttributeIndexExceeded) {
      return;
    }

    if (isAttributeCounterInAcceptableRange) {
      console.log(
        `updating attribute counter ${this.attributes[attributeIndex]} from ${
          this.counters[this.attributes[attributeIndex]]
        } to ${this.counters[this.attributes[attributeIndex]] + 1}`
      );
      this.counters[this.attributes[attributeIndex]]++;
      return;
    } else {
      this.counters[this.attributes[attributeIndex]] = 0;
      this.updateCounters(attributeIndex + 1);
    }
    // Does it need to be restarted at any point?
    restartCountersIfNeeded();

    function restartCountersIfNeeded() {
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
  }

  private findAttributeCategoryByCounter(attribute: Attribute) {
    const category = this.settings[attribute].categories.find((category) => {
      return (
        this.counters[attribute] >= category.starting &&
        this.counters[attribute] <= category.ending
      );
    });

    return {
      name: category.name,
      files: getFiles(attribute, category.name),
      rarity: category.rarity,
    };
  }

  public generate(): {
    frames: Frames;
    data: any;
  } {
    const data = {};
    const frames: { [key in Attribute]: Array<string> } = {
      hands: [],
      aura: [],
      watchers: [],
      stairs: [],
      arches: [],
      gems: [],
      blips: [],
    };

    this.attributes.map((attribute) => {
      const result = this.findAttributeCategoryByCounter(attribute);
      data[attribute] = {
        name: result.name,
        rarity: result.rarity,
      };
      frames[attribute] = result.files;
    });

    this.updateCounters();
    return {
      frames,
      data,
    };
  }
}
