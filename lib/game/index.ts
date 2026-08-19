export type CharacterId = "maya" | "dev" | "tara" | "finn" | "kabir";

export type RoomFeature =
  | "daylight"
  | "morningSun"
  | "quiet"
  | "size"
  | "kitchenClose"
  | "desk"
  | "floorSpace"
  | "balcony"
  | "guitarSpace"
  | "farFromCommonSpace";

export type FeatureValue = boolean | "low" | "medium" | "strong" | "small" | "large";
export type PreferencePriority = "need" | "want" | "like";
export type Assignment = Record<CharacterId, string | null>;
export type RoomPair = readonly [string, string];

export type Character = {
  id: CharacterId;
  name: string;
  role: string;
  personality: string;
  quote: string;
  color: string;
  prop: string;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  color: string;
  features: Partial<Record<RoomFeature, FeatureValue>>;
};

export type Preference = {
  id: string;
  characterId: CharacterId;
  priority: PreferencePriority;
  feature: RoomFeature;
  value: FeatureValue;
  icon: string;
  label: string;
};

export type Hint = {
  text: string;
  characterId?: CharacterId;
  focusRoomId?: string;
};

export type SimulationEvent = {
  time: string;
  characterId?: CharacterId;
  text: string;
  reaction?: string;
  tone?: "warm" | "comic" | "tense";
};

export type RelationshipRule = {
  id: string;
  characterIds: readonly [CharacterId, CharacterId];
  priority: Exclude<PreferencePriority, "need">;
  icon: string;
  label: string;
  consequence: string;
};

export type House = {
  name: string;
  description: string;
  rooms: Room[];
  sharedWalls?: RoomPair[];
};

export type GameLevel = {
  id: string;
  number: number;
  title: string;
  chapter: string;
  target: string;
  difficulty: number;
  teaching: string;
  openingCopy?: string;
  house: House;
  characterIds: CharacterId[];
  preferences: Preference[];
  relationships: RelationshipRule[];
  intendedAssignment: Record<CharacterId, string>;
  successThreshold: number;
  authoredMaxHarmony: number;
  showHarmony: boolean;
  successTitle: string;
  nearMissTitle?: string;
  hints: Hint[];
  simulation: SimulationEvent[];
};

export type FailedNeed = Preference & { roomId: string | null };

export type HarmonyResult = {
  complete: boolean;
  hardValid: boolean;
  harmony: number;
  passed: boolean;
  failedNeeds: FailedNeed[];
  satisfiedSoftWeight: number;
  totalSoftWeight: number;
  softResults: Array<{ preference: Preference; satisfied: boolean; weight: number }>;
  relationshipResults: Array<{ rule: RelationshipRule; satisfied: boolean; weight: number }>;
};

export type SolvedAssignment = {
  assignment: Assignment;
  result: HarmonyResult;
  intended: boolean;
};

export type LevelSolverReport = {
  levelId: string;
  permutations: number;
  hardValidCount: number;
  perfectCount: number;
  maxHarmony: number;
  intendedIsValid: boolean;
  intendedIsBest: boolean;
  accidentalBestTie: boolean;
  solutions: SolvedAssignment[];
  warnings: string[];
};

export const CHARACTERS: Record<CharacterId, Character> = {
  maya: {
    id: "maya",
    name: "Maya",
    role: "Plant-minded creative",
    personality: "Warm, dry, and slightly obsessive about plants.",
    quote: "Technically every room can hold a plant. Some just shouldn't.",
    color: "coral",
    prop: "plant",
  },
  dev: {
    id: "dev",
    name: "Dev",
    role: "Social cook",
    personality: "Thinks cooking counts as a personality.",
    quote: "I don't need to be near the kitchen. It would just improve everyone's life.",
    color: "ochre",
    prop: "toast",
  },
  tara: {
    id: "tara",
    name: "Tara",
    role: "Early-rising minimalist",
    personality: "Calm until somebody interferes with her sleep.",
    quote: "I wake up at 5:30.",
    color: "rose",
    prop: "yoga mat",
  },
  finn: {
    id: "finn",
    name: "Finn",
    role: "Remote worker",
    personality: "Introverted and mostly wants everybody to leave him alone.",
    quote: "I'm very social online.",
    color: "blue",
    prop: "laptop",
  },
  kabir: {
    id: "kabir",
    name: "Kabir",
    role: "Night-owl guitarist",
    personality: "Charming, messy, and owns one guitar too many.",
    quote: "The balcony would be perfect.",
    color: "green",
    prop: "guitar",
  },
};

const room = (
  id: string,
  name: string,
  description: string,
  color: string,
  features: Room["features"],
): Room => ({ id, name, description, color, features });

const pref = (
  characterId: CharacterId,
  priority: PreferencePriority,
  feature: RoomFeature,
  value: FeatureValue,
  icon: string,
  label: string,
): Preference => ({
  id: `${characterId}-${priority}-${feature}`,
  characterId,
  priority,
  feature,
  value,
  icon,
  label,
});

const intended = (value: Partial<Record<CharacterId, string>>): Record<CharacterId, string> => value as Record<CharacterId, string>;

const apart = (
  first: CharacterId,
  second: CharacterId,
  priority: RelationshipRule["priority"],
  label: string,
  consequence: string,
): RelationshipRule => ({
  id: `${first}-${second}-${priority}-apart`,
  characterIds: [first, second],
  priority,
  icon: "↮",
  label,
  consequence,
});

export const GAME_LEVELS: GameLevel[] = [
  {
    id: "first-night",
    number: 1,
    title: "First Night",
    chapter: "Moving Day",
    target: "2–3 min",
    difficulty: 1,
    teaching: "Read room features and satisfy every Need.",
    house: {
      name: "The Tiny Two-Bed",
      description: "A small apartment with one bright room and one very short walk to the kitchen.",
      rooms: [
        room("sun", "Sun Room", "Large window and a bright empty sill.", "sun", { daylight: "strong", size: "medium" }),
        room("galley", "Galley Room", "A smaller window beside the kitchen.", "blue", { daylight: "low", kitchenClose: true, size: "medium" }),
      ],
    },
    characterIds: ["maya", "dev"],
    preferences: [
      pref("maya", "need", "daylight", "strong", "☀", "Strong daylight"),
      pref("dev", "want", "kitchenClose", true, "◒", "Near the kitchen"),
    ],
    relationships: [],
    intendedAssignment: intended({ maya: "sun", dev: "galley" }),
    successThreshold: 100,
    authoredMaxHarmony: 100,
    showHarmony: false,
    successTitle: "HOME SWEET HOME",
    hints: [
      { characterId: "maya", text: "Could I get whichever room gets the most sun?" },
      { text: "Watch the sunlight in the Sun Room.", focusRoomId: "sun" },
      { text: "Maya will be happiest in the Sun Room.", characterId: "maya", focusRoomId: "sun" },
    ],
    simulation: [
      { time: "0:00", text: "Boxes arrive. The apartment holds its breath.", tone: "warm" },
      { time: "0:02", characterId: "maya", text: "Maya puts one tiny plant on the sunny sill. It perks up.", reaction: "😊", tone: "warm" },
      { time: "0:05", characterId: "dev", text: "Dev walks straight into the kitchen and opens the fridge.", reaction: "Oh, this is dangerous.", tone: "comic" },
    ],
  },
  {
    id: "early-bird",
    number: 2,
    title: "Early Bird",
    chapter: "Moving Day",
    target: "4–5 min",
    difficulty: 1,
    teaching: "Use Wants to choose between rooms that satisfy a Need.",
    house: {
      name: "The Morning Flat",
      description: "Two peaceful rooms compete for the first light. The busy hall leads to the kitchen.",
      rooms: [
        room("east", "East Room", "Small, peaceful, and full of soft morning light.", "sun", { daylight: "strong", morningSun: true, quiet: true, size: "small" }),
        room("garden", "Garden Room", "A large green view with generous floor area.", "green", { daylight: "strong", quiet: true, size: "large" }),
        room("hall", "Hall Room", "Busy, dim, and immediately beside the kitchen.", "rose", { daylight: "low", quiet: false, size: "medium", kitchenClose: true }),
      ],
    },
    characterIds: ["tara", "maya", "dev"],
    preferences: [
      pref("tara", "need", "quiet", true, "◇", "Quiet"),
      pref("tara", "want", "morningSun", true, "☼", "Morning sun"),
      pref("maya", "need", "daylight", "strong", "☀", "Strong daylight"),
      pref("maya", "want", "size", "large", "↔", "Larger room"),
      pref("dev", "want", "kitchenClose", true, "◒", "Near the kitchen"),
    ],
    relationships: [],
    intendedAssignment: intended({ tara: "east", maya: "garden", dev: "hall" }),
    successThreshold: 33,
    authoredMaxHarmony: 100,
    showHarmony: false,
    successTitle: "EVERYONE'S HAPPY",
    nearMissTitle: "They're moved in… but you can do better.",
    hints: [
      { characterId: "tara", text: "Quiet matters most. Morning light would be nice too." },
      { text: "Both quiet rooms work. Only one gets the sunrise.", focusRoomId: "east" },
      { text: "Tara would be happiest in the East Room.", characterId: "tara", focusRoomId: "east" },
    ],
    simulation: [
      { time: "5:30", characterId: "tara", text: "Morning light reaches Tara as she unrolls her yoga mat.", reaction: "😊", tone: "warm" },
      { time: "7:10", characterId: "maya", text: "Maya gives every plant a place by the large window.", reaction: "one more", tone: "comic" },
      { time: "7:20", characterId: "dev", text: "Dev appears from the kitchen holding toast.", reaction: "breakfast?", tone: "warm" },
    ],
  },
  {
    id: "room-to-work",
    number: 3,
    title: "Room to Work",
    chapter: "Moving Day",
    target: "5–6 min",
    difficulty: 2,
    teaching: "Match fixed furniture and usable floor space to the right person.",
    house: {
      name: "The Working Flat",
      description: "The glamorous room is not always the useful room.",
      rooms: [
        room("studio", "Studio", "A quiet room with a desk below the shelves.", "blue", { desk: true, quiet: true, floorSpace: false, daylight: "low", size: "medium" }),
        room("east", "East Room", "Quiet morning light and a clear patch of floor.", "sun", { quiet: true, floorSpace: true, daylight: "medium", morningSun: true, size: "medium" }),
        room("garden", "Garden Room", "Large and bright, but close to household activity.", "green", { quiet: false, floorSpace: false, daylight: "strong", size: "large" }),
        room("galley", "Galley Room", "A small room at the kitchen door.", "rose", { quiet: false, floorSpace: false, daylight: "low", size: "small", kitchenClose: true }),
      ],
      sharedWalls: [["studio", "garden"], ["east", "galley"]],
    },
    characterIds: ["finn", "tara", "maya", "dev"],
    preferences: [
      pref("finn", "need", "desk", true, "▤", "Proper desk"),
      pref("finn", "like", "quiet", true, "◇", "Quiet"),
      pref("tara", "need", "quiet", true, "◇", "Quiet"),
      pref("tara", "need", "floorSpace", true, "□", "Open floor space"),
      pref("tara", "want", "morningSun", true, "☼", "Morning sun"),
      pref("maya", "want", "daylight", "strong", "☀", "Strong daylight"),
      pref("maya", "like", "size", "large", "↔", "Larger room"),
      pref("dev", "like", "kitchenClose", true, "◒", "Near the kitchen"),
    ],
    relationships: [
      apart("finn", "dev", "like", "Away from Dev's kitchen noise", "Dev tests a blender during Finn's first video call. Finn becomes a profile picture."),
    ],
    intendedAssignment: intended({ finn: "studio", tara: "east", maya: "garden", dev: "galley" }),
    successThreshold: 35,
    authoredMaxHarmony: 100,
    showHarmony: false,
    successTitle: "SURPRISINGLY FUNCTIONAL",
    hints: [
      { characterId: "finn", text: "The bed isn't going to double as my office." },
      { text: "The built-in desk is in the Studio.", focusRoomId: "studio" },
      { text: "Put Finn in the Studio.", characterId: "finn", focusRoomId: "studio" },
    ],
    simulation: [
      { time: "9:00", characterId: "finn", text: "Finn opens his laptop at the built-in desk and dismisses one notification.", reaction: "focus mode", tone: "warm" },
      { time: "9:04", characterId: "tara", text: "Tara unrolls her mat. It fits perfectly.", reaction: "😊", tone: "warm" },
      { time: "9:08", characterId: "maya", text: "Maya starts covering the bright window with plants.", reaction: "more", tone: "comic" },
      { time: "9:10", characterId: "dev", text: "Dev takes four steps into the kitchen and finds a saucepan.", reaction: "lunch?", tone: "comic" },
    ],
  },
  {
    id: "balcony-rights",
    number: 4,
    title: "Balcony Rights",
    chapter: "Moving Day",
    target: "5–7 min",
    difficulty: 3,
    teaching: "Balance room Needs with a shared-wall conflict.",
    house: {
      name: "The Balcony Flat",
      description: "One beautiful balcony and several firm opinions.",
      rooms: [
        room("balcony", "Balcony Room", "Small, sunny, and open to fresh air.", "green", { daylight: "strong", balcony: true, guitarSpace: false, quiet: false, floorSpace: false, size: "small" }),
        room("loft", "Loft Room", "A wide wall has space for a guitar stand and amp.", "blue", { daylight: "medium", guitarSpace: true, quiet: false, floorSpace: true, size: "large" }),
        room("galley", "Galley Room", "A dim room beside the kitchen.", "rose", { daylight: "low", quiet: false, floorSpace: false, size: "small", kitchenClose: true }),
        room("east", "East Room", "Quiet morning light and open floor.", "sun", { daylight: "medium", quiet: true, floorSpace: true, morningSun: true, size: "medium" }),
      ],
      sharedWalls: [["balcony", "galley"], ["loft", "east"]],
    },
    characterIds: ["maya", "kabir", "tara", "dev"],
    preferences: [
      pref("maya", "want", "daylight", "strong", "☀", "Strong daylight"),
      pref("maya", "want", "balcony", true, "♧", "Balcony"),
      pref("kabir", "need", "guitarSpace", true, "♫", "Space for guitar setup"),
      pref("kabir", "like", "balcony", true, "♧", "Balcony"),
      pref("tara", "need", "quiet", true, "◇", "Quiet"),
      pref("tara", "need", "floorSpace", true, "□", "Open floor space"),
      pref("tara", "want", "morningSun", true, "☼", "Morning sun"),
      pref("dev", "like", "kitchenClose", true, "◒", "Near the kitchen"),
    ],
    relationships: [
      apart("maya", "tara", "like", "No shared wall with dawn plant care", "Maya waters plants at sunrise. Tara hears every cheerful little pour."),
    ],
    intendedAssignment: intended({ maya: "balcony", kabir: "loft", tara: "east", dev: "galley" }),
    successThreshold: 30,
    authoredMaxHarmony: 89,
    showHarmony: false,
    successTitle: "COMPROMISE ACHIEVED",
    hints: [
      { characterId: "kabir", text: "Balcony would be nice. Guitar has to fit though." },
      { text: "The Loft has room for Kabir's setup.", focusRoomId: "loft" },
      { text: "Put Kabir in the Loft.", characterId: "kabir", focusRoomId: "loft" },
    ],
    simulation: [
      { time: "16:00", characterId: "kabir", text: "Kabir puts his guitar on its stand, looks toward the balcony, and shrugs.", reaction: "🙂", tone: "warm" },
      { time: "16:05", characterId: "maya", text: "Maya walks onto the balcony with a watering can.", reaction: "😊", tone: "warm" },
      { time: "16:10", characterId: "tara", text: "Tara begins yoga as Dev starts cooking.", reaction: "peace", tone: "warm" },
    ],
  },
  {
    id: "good-enough",
    number: 5,
    title: "Good Enough",
    chapter: "Moving Day",
    target: "6–8 min",
    difficulty: 3,
    teaching: "Reach a good Harmony score when 100% is impossible.",
    openingCopy: "Sometimes everyone getting exactly what they want isn't possible. 85% Harmony is enough to move in.",
    house: {
      name: "The Almost-Perfect Flat",
      description: "There is one large room, one desk, and no perfect answer.",
      rooms: [
        room("green", "Green Room", "The only large room with strong daylight.", "green", { daylight: "strong", size: "large", quiet: true }),
        room("east", "East Room", "A quiet room with gentle morning sun.", "sun", { daylight: "medium", size: "medium", quiet: true, morningSun: true }),
        room("galley", "Galley Room", "Small, busy, and close to the kitchen.", "rose", { daylight: "low", size: "small", quiet: false, kitchenClose: true }),
        room("box", "Box Room", "A cute blue nook with a tiny built-in desk.", "blue", { daylight: "low", size: "small", quiet: true, desk: true }),
      ],
      sharedWalls: [["green", "galley"], ["east", "box"]],
    },
    characterIds: ["maya", "tara", "dev", "finn"],
    preferences: [
      pref("maya", "want", "daylight", "strong", "☀", "Strong daylight"),
      pref("maya", "want", "size", "large", "↔", "Large room"),
      pref("tara", "need", "quiet", true, "◇", "Quiet"),
      pref("tara", "want", "morningSun", true, "☼", "Morning sun"),
      pref("dev", "want", "kitchenClose", true, "◒", "Near the kitchen"),
      pref("dev", "like", "size", "large", "↔", "Large room"),
      pref("finn", "need", "desk", true, "▤", "Proper desk"),
      pref("finn", "want", "quiet", true, "◇", "Quiet"),
    ],
    relationships: [
      apart("finn", "dev", "want", "No shared wall with Dev", "Dev's midnight snack becomes a three-pan event. Finn hears the entire menu."),
    ],
    intendedAssignment: intended({ maya: "green", tara: "east", dev: "galley", finn: "box" }),
    successThreshold: 85,
    authoredMaxHarmony: 92,
    showHarmony: true,
    successTitle: "GREAT MATCH",
    hints: [
      { characterId: "dev", text: "I'd love some space, but honestly… being near the kitchen matters more." },
      { characterId: "dev", text: "For Dev, the kitchen is a Want. A large room is only a Like." },
      { text: "The Galley Room gives Dev what matters more.", characterId: "dev", focusRoomId: "galley" },
    ],
    simulation: [
      { time: "18:00", characterId: "maya", text: "Maya fills the Green Room with plants.", reaction: "😊", tone: "warm" },
      { time: "18:04", characterId: "tara", text: "Tara sets an alarm beside the east-facing window.", reaction: "05:30", tone: "warm" },
      { time: "18:08", characterId: "dev", text: "Dev looks around his small room, then sees the kitchen.", reaction: "I'll survive.", tone: "comic" },
      { time: "18:12", characterId: "finn", text: "Finn opens his laptop at the tiny desk and closes the door.", reaction: "online", tone: "warm" },
    ],
  },
  {
    id: "housewarming",
    number: 6,
    title: "Housewarming",
    chapter: "Moving Day · Finale",
    target: "7–10 min",
    difficulty: 4,
    teaching: "Use room facts and shared walls to find the best of two valid homes.",
    house: {
      name: "The Housewarming Flat",
      description: "A proper apartment with a central living room and four distinct bedrooms.",
      rooms: [
        room("east-studio", "East Studio", "Desk, quiet floor space, and morning light beside the living room.", "sun", { desk: true, quiet: true, floorSpace: true, morningSun: true, daylight: "medium", size: "medium", farFromCommonSpace: false }),
        room("balcony", "Balcony Room", "A large bright room with a beautiful balcony.", "green", { desk: false, quiet: false, floorSpace: true, daylight: "strong", balcony: true, size: "large", farFromCommonSpace: false }),
        room("galley", "Galley Room", "A small room beside the kitchen.", "rose", { desk: false, quiet: false, floorSpace: false, daylight: "low", size: "small", kitchenClose: true, farFromCommonSpace: false }),
        room("back-office", "Back Office", "Small, bright, quiet, and far from the common rooms.", "blue", { desk: true, quiet: true, floorSpace: true, daylight: "strong", size: "small", farFromCommonSpace: true }),
      ],
      sharedWalls: [["east-studio", "galley"], ["balcony", "back-office"]],
    },
    characterIds: ["finn", "tara", "maya", "dev"],
    preferences: [
      pref("finn", "need", "desk", true, "▤", "Proper desk"),
      pref("finn", "want", "farFromCommonSpace", true, "⇥", "Far from common areas"),
      pref("finn", "like", "quiet", true, "◇", "Quiet"),
      pref("tara", "need", "quiet", true, "◇", "Quiet"),
      pref("tara", "need", "floorSpace", true, "□", "Open floor space"),
      pref("tara", "want", "morningSun", true, "☼", "Morning sun"),
      pref("maya", "need", "daylight", "strong", "☀", "Strong daylight"),
      pref("maya", "want", "balcony", true, "♧", "Balcony"),
      pref("maya", "like", "size", "large", "↔", "Large room"),
      pref("dev", "want", "kitchenClose", true, "◒", "Near the kitchen"),
    ],
    relationships: [
      apart("finn", "dev", "want", "No shared wall with Dev", "Dev hosts a tasting night beside Finn's meeting. Finn attends both by accident."),
    ],
    intendedAssignment: intended({ finn: "back-office", tara: "east-studio", maya: "balcony", dev: "galley" }),
    successThreshold: 50,
    authoredMaxHarmony: 100,
    showHarmony: true,
    successTitle: "HOME, FOR NOW.",
    nearMissTitle: "Livable. Technically.",
    hints: [
      { characterId: "finn", text: "I really don't want my desk beside where everyone hangs out." },
      { text: "Both desk rooms work. The Back Office is far from the common area.", focusRoomId: "back-office" },
      { characterId: "finn", text: "I'll take the Back Office.", focusRoomId: "back-office" },
    ],
    simulation: [
      { time: "0:00", text: "The front door opens. Everyone carries boxes inside.", tone: "warm" },
      { time: "0:04", characterId: "finn", text: "Finn sets up at the Back Office desk and closes the door. The living room becomes a murmur.", reaction: "😊", tone: "warm" },
      { time: "0:08", characterId: "tara", text: "Morning light enters as Tara lays her mat on the clear floor.", reaction: "😊", tone: "warm" },
      { time: "0:12", characterId: "maya", text: "Maya puts one plant on the balcony. Then another. Then another.", reaction: "…and one more", tone: "comic" },
      { time: "0:16", characterId: "dev", text: "Dev starts chopping in the kitchen.", reaction: "dinner soon", tone: "warm" },
      { time: "0:20", characterId: "tara", text: "Dev offers Tara a taste. She nods.", reaction: "approved", tone: "warm" },
      { time: "0:23", characterId: "finn", text: "Finn looks at everyone socializing, then slowly retreats.", reaction: "maybe later", tone: "comic" },
      { time: "0:26", text: "Everyone gathers around the table. For one evening, the flat feels settled.", tone: "warm" },
    ],
  },
];

function featureMatches(roomValue: FeatureValue | undefined, expected: FeatureValue): boolean {
  return roomValue === expected;
}

function softWeight(priority: PreferencePriority): number {
  if (priority === "want") return 2;
  if (priority === "like") return 1;
  return 0;
}

export function emptyAssignment(level: GameLevel): Assignment {
  return Object.fromEntries(level.characterIds.map((id) => [id, null])) as Assignment;
}

export function evaluateAssignment(level: GameLevel, assignment: Assignment): HarmonyResult {
  const roomById = new Map(level.house.rooms.map((item) => [item.id, item]));
  const complete = level.characterIds.every((id) => Boolean(assignment[id]));
  const failedNeeds: FailedNeed[] = [];
  const softResults: HarmonyResult["softResults"] = [];
  const relationshipResults: HarmonyResult["relationshipResults"] = [];
  let satisfiedSoftWeight = 0;
  let totalSoftWeight = 0;

  for (const preference of level.preferences) {
    const assignedRoomId = assignment[preference.characterId];
    const assignedRoom = assignedRoomId ? roomById.get(assignedRoomId) : undefined;
    const satisfied = Boolean(assignedRoom && featureMatches(assignedRoom.features[preference.feature], preference.value));
    if (preference.priority === "need" && !satisfied) {
      failedNeeds.push({ ...preference, roomId: assignedRoomId });
    }
    const weight = softWeight(preference.priority);
    if (weight) {
      totalSoftWeight += weight;
      if (satisfied) satisfiedSoftWeight += weight;
      softResults.push({ preference, satisfied, weight });
    }
  }

  for (const rule of level.relationships) {
    const [firstCharacter, secondCharacter] = rule.characterIds;
    const firstRoom = assignment[firstCharacter];
    const secondRoom = assignment[secondCharacter];
    const sharesWall = Boolean(
      firstRoom && secondRoom && level.house.sharedWalls?.some(
        ([one, two]) => (one === firstRoom && two === secondRoom) || (one === secondRoom && two === firstRoom),
      ),
    );
    const satisfied = Boolean(firstRoom && secondRoom && !sharesWall);
    const weight = softWeight(rule.priority);
    totalSoftWeight += weight;
    if (satisfied) satisfiedSoftWeight += weight;
    relationshipResults.push({ rule, satisfied, weight });
  }

  const harmony = totalSoftWeight === 0 ? 100 : Math.round((satisfiedSoftWeight / totalSoftWeight) * 100);
  const hardValid = complete && failedNeeds.length === 0;
  return {
    complete,
    hardValid,
    harmony,
    passed: hardValid && harmony >= level.successThreshold,
    failedNeeds,
    satisfiedSoftWeight,
    totalSoftWeight,
    softResults,
    relationshipResults,
  };
}

function permutations<T>(items: T[]): T[][] {
  if (items.length < 2) return [items];
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]),
  );
}

function sameAssignment(level: GameLevel, one: Assignment, two: Record<CharacterId, string>): boolean {
  return level.characterIds.every((id) => one[id] === two[id]);
}

export function solveLevel(level: GameLevel): LevelSolverReport {
  const solutions: SolvedAssignment[] = permutations(level.house.rooms.map((item) => item.id))
    .map((roomIds) => {
      const assignment = emptyAssignment(level);
      level.characterIds.forEach((characterId, index) => {
        assignment[characterId] = roomIds[index];
      });
      return {
        assignment,
        result: evaluateAssignment(level, assignment),
        intended: sameAssignment(level, assignment, level.intendedAssignment),
      };
    })
    .filter((item) => item.result.hardValid)
    .sort((a, b) => b.result.harmony - a.result.harmony);

  const maxHarmony = solutions[0]?.result.harmony ?? 0;
  const intendedSolution = solutions.find((item) => item.intended);
  const bestCount = solutions.filter((item) => item.result.harmony === maxHarmony).length;
  const warnings: string[] = [];

  if (!intendedSolution) warnings.push("The intended assignment violates a Need.");
  if (intendedSolution && intendedSolution.result.harmony !== maxHarmony) warnings.push("The intended assignment is not the best assignment.");
  if (bestCount > 1) warnings.push("More than one assignment has the best Harmony score.");
  if (maxHarmony !== level.authoredMaxHarmony) warnings.push(`Authored maximum is ${level.authoredMaxHarmony}%, but the solver found ${maxHarmony}%.`);
  if (level.authoredMaxHarmony < 100 && maxHarmony === 100) warnings.push("A supposedly imperfect level has a 100% solution.");

  return {
    levelId: level.id,
    permutations: permutations(level.house.rooms).length,
    hardValidCount: solutions.length,
    perfectCount: solutions.filter((item) => item.result.harmony === 100).length,
    maxHarmony,
    intendedIsValid: Boolean(intendedSolution),
    intendedIsBest: Boolean(intendedSolution && intendedSolution.result.harmony === maxHarmony),
    accidentalBestTie: bestCount > 1,
    solutions,
    warnings,
  };
}

export function validateAllLevels(): LevelSolverReport[] {
  return GAME_LEVELS.map(solveLevel);
}
