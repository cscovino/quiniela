// Types for third-place matrix consumed from /data/third-place-matrix.json
// Full matrix data is served from Firebase Hosting to keep the bundle small.

export type RoundOf32Slot =
  | 'M73'
  | 'M74'
  | 'M75'
  | 'M76'
  | 'M77'
  | 'M78'
  | 'M79'
  | 'M80'
  | 'M81'
  | 'M82'
  | 'M83'
  | 'M84'
  | 'M85'
  | 'M86'
  | 'M87'
  | 'M88';

export type ThirdPlaceSlot = 'M74' | 'M77' | 'M79' | 'M80' | 'M81' | 'M82' | 'M85' | 'M87';

export type CombinationKey = string;

export type ThirdPlaceMapping = Partial<Record<RoundOf32Slot, string>>;

export function getCombinationKey(qualifiedGroups: string[]): CombinationKey {
  return [...qualifiedGroups].sort().join('');
}
