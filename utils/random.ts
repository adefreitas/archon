function cumulativeWeights(weights): Array<number> {
  let total = 0;
  let result = [];
  for (let weight of weights) {
    total += weight;
    result.push(total);
  }
  return result;
}

/*
 * Return an index into arr so that for everything less than the index arr[i] <= x, and everything after is > x.
 */
function pick(x: number, arr: Array<number>): number {
  let index = 0;
  while (x >= arr[index] && index < arr.length) {
    index++;
  }
  return index;
}

/** make a weighted random choice from items using the algorithm described by https://docs.python.org/3.5/library/random.html#examples-and-recipes
 * @param items an arrary of items to choose from
 * @param weights an array of relative weights for the items
 */
export function weightedRandom<T>(items: Array<T>, weights: Array<number>): T {
  if (!Array.isArray(items) ||
    !Array.isArray(weights) ||
    !(items.length == weights.length)) {
    throw new TypeError('Expected two equal length arrays');
  }
  const cumulative = cumulativeWeights(weights);
  const rand = Math.random() * cumulative[cumulative.length - 1];
  return items[pick(rand, cumulative)];
}
