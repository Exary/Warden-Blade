/**
 * Characters available in the Animation Tests screen's sidebar list.
 * Entries without a jsonUrl/imageUrl are "pending" — listed for
 * reference but not actually loadable yet (e.g. a pack not purchased).
 */
export const CHARACTER_ROSTER = [
  {
    id: 'fire_warrior',
    label: 'Fire Warrior',
    jsonUrl: 'Assets/Fire_Warrior/Fire_WarriorAseprite/Fire_Warrior.json',
    imageUrl: 'Assets/Fire_Warrior/Fire_WarriorAseprite/Fire_Warrior.png',
  },
  {
    id: 'merakintsugi',
    label: 'Merakintsugi (pending)',
    // No jsonUrl/imageUrl yet — this is the $15 Platformer Character Pack
    // (https://merakintsugi.itch.io/platformer-character-pack), being
    // considered as a second playable character but not purchased yet.
    // Wire this up with real data once/if it's acquired.
    pending: true,
    note: 'Not purchased yet — this pack costs $15. Wire this up with real Aseprite JSON/PNG once acquired.',
  },
];
