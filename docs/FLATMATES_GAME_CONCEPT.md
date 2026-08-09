# Game Concept: FLATMATES

Design a charming, tactile, personality-driven puzzle game called **Flatmates**, primarily for iPad.

## High-Level Idea

**Flatmates is a cozy spatial logic puzzle game about figuring out how a group of very particular people can live together without driving each other insane.**

The player is given an apartment, a group of potential flatmates, and information about their personalities, habits, relationships, needs, and pet peeves.

The player must assign people to bedrooms and arrange certain objects around the apartment so that as many people as possible are happy.

The joy should come from:

- understanding people's personalities
- discovering relationships between their preferences
- physically rearranging a tiny apartment
- solving increasingly tangled logic puzzles
- watching the residents actually live with the arrangement afterward
- humorous consequences when you get things wrong

The game should feel cozy, clever, funny and human.

It should NOT feel like a generic mobile puzzle game.

---

# PLAYER FANTASY

"I am somehow responsible for finding the only possible living arrangement that prevents these six ridiculous people from murdering each other."

The player should feel like a combination of:

- roommate
- matchmaker
- interior planner
- amateur psychologist
- mediator
- gossip who knows far too much about everybody

The player isn't managing money, hunger bars or complicated statistics.

They're solving **people problems spatially**.

---

# CORE GAME LOOP

Every level follows roughly:

**MEET → INVESTIGATE → ARRANGE → TEST → WATCH**

### 1. Meet

The player arrives at a new apartment.

The apartment is presented as a beautiful illustrated cutaway/dollhouse.

Example:

┌────────────┬─────────────┐
│ Bedroom A  │ Bedroom B   │
│ ☀️ Window  │ 🚿 Ensuite  │
├────────────┼─────────────┤
│ Kitchen    │ Living Room │
│ 🍳         │ 🛋️ 🪴      │
├────────────┴──────┬──────┤
│ Bedroom C         │ 🚪   │
│ 🌳 Balcony        │ Hall │
└───────────────────┴──────┘

Beside/below it are the people hoping to live there.

Each character should immediately communicate personality through their appearance and animation.

---

# CHARACTERS

Characters are the heart of the game.

They should be memorable enough that players develop favourites.

Each person has approximately 3–5 traits.

Example:

## Kabir

🌙 Night owl  
🎸 Plays guitar  
🐈 Owns a cat named Chairman Meow  
🚿 Takes extremely long showers

Preferences:

✓ Wants a room away from the kitchen  
✓ Wants Chairman Meow nearby  
✗ Cannot share a wall with a light sleeper

---

## Tara

🌅 Wakes at 5:30 AM  
🧘 Does yoga every morning  
🤫 Needs silence to sleep  
🐈 Allergic to cats

Preferences:

✓ Wants morning sunlight  
✓ Wants enough floor space for yoga  
✗ Cannot be adjacent to Kabir  
✗ Cat cannot enter her room

---

## Dev

🍳 Obsessed with cooking  
🔥 Makes elaborate midnight meals  
🗣️ Extremely social

Preferences:

✓ Wants to be close to the kitchen  
✓ Wants a sociable roommate nearby  
✗ Hates tiny bedrooms

---

The writing should be short, observational and funny.

Avoid paragraphs of exposition.

Players should learn characters through little details.

---

# TYPES OF CONSTRAINTS

The puzzle system should support several categories.

## ROOM PREFERENCES

"I want the balcony room."

"I need morning sunlight."

"I need the ensuite."

"I want the biggest bedroom."

"I don't care about the room as long as it isn't pink."

---

## DISTANCE

"I need to be close to the bathroom."

"I want to be far from the kitchen."

"I don't want to live beside the front door."

---

## ADJACENCY

"I want to live next to Maya."

"I cannot share a wall with Kabir."

"I want to be near the cat."

---

## PEOPLE

"I don't want to live beside my ex."

"I want to be near someone social."

"I don't want to share a bathroom with Dev."

---

## OBJECTS

Characters can care about apartment objects.

Examples:

🪴 Plants  
📺 Television  
🎸 Guitar  
🐈 Cat bed  
☕ Coffee machine  
🧺 Laundry basket  
🖥️ Desk  
🔊 Speakers  
🚲 Bicycle  
🗑️ Bin

Some objects can be moved.

This creates another puzzle layer.

For example:

Tara wants quiet.

Kabir wants his record player.

Moving the record player to the living room might solve their conflict.

---

# RELATIONSHIP CONSTRAINTS

Relationships should become one of the game's signature mechanics.

Characters can:

❤️ date  
💔 be exes  
👯 be best friends  
😤 dislike each other  
👨‍👩‍👧 be siblings  
🤫 secretly like someone  
🏢 work together

These relationships can affect preferences.

Example:

Maya:
"I'd rather be near Rhea."

Rhea:
"I'd rather NOT be near Maya."

That asymmetry creates comedy and interesting puzzles.

---

# INFORMATION REVEAL

Do not necessarily reveal everything immediately.

Early levels can show all constraints.

Later levels can introduce information through conversations.

Example:

Tap Maya.

Maya:

> "Anywhere is fine."

Then another roommate says:

> "Maya says that, but she'll complain for six months if she doesn't get sunlight."

The game converts this into:

☀️ Maya prefers a sunny room.

This makes discovering the puzzle feel like understanding people rather than reading a spreadsheet.

---

# DRAG-AND-DROP INTERACTION

Interaction must feel extremely tactile on iPad.

Characters sit along the bottom edge of the screen like little figurines.

The player picks one up.

The character reacts:

😯

Available bedrooms subtly highlight.

Drag them over a room.

The character peers into it.

Drop.

*plop*

They unpack a tiny object.

The room visually changes to reflect their personality.

Kabir gets:

🎸 guitar  
👕 clothes on chair  
🐈 cat

Tara gets:

🧘 yoga mat  
🪴 plant  
📚 books

This should make rearranging characters pleasurable even before considering the puzzle.

---

# LIVE SATISFACTION FEEDBACK

Do not simply show green/red checkboxes everywhere.

Characters themselves communicate satisfaction.

😊 Completely happy

🙂 Mostly happy

😐 Something isn't right

😠 Major problem

Tap them to understand why.

Example:

TARA 😠

✓ Morning sunlight  
✓ Enough floor space  
✗ Shares wall with Kabir  
✗ Chairman Meow lives next door

This keeps the main screen visually clean.

---

# THE APARTMENT SHOULD REACT

Rooms aren't static containers.

Putting someone into a room should gradually transform it.

Empty room:

🛏️ 🪟

After Kabir moves in:

🛏️ 🎸  
👕  
🐈

After several people are assigned, the previously empty apartment becomes a lived-in little world.

This transformation should be one of the emotional rewards of solving a level.

---

# "OPEN THE HOUSE" PHASE

This is the biggest feature differentiating Flatmates from a straightforward placement puzzle.

Once the player thinks their arrangement works, they press:

**MOVE IN**

The apartment comes alive.

For roughly 15–30 seconds, the player watches the roommates go through a miniature day.

Morning:

Tara does yoga.

Dev makes coffee.

Someone queues for the bathroom.

Chairman Meow wanders into someone's bedroom.

Afternoon:

Someone works at their desk.

Someone cooks.

Someone steals food.

Evening:

Kabir plays guitar.

Someone watches television.

Someone tries to sleep.

Conflicts physically play out.

For example:

Kabir starts playing guitar.

Tara's eyes suddenly open.

😠

She bangs on the wall.

Kabir stops.

Two seconds later:

🎸

Tara:

😡

This turns abstract constraints into tiny comedy.

---

# SUCCESS

The goal isn't necessarily to make everyone 100% happy.

Levels can have different targets.

Examples:

**Everyone Happy**

All major needs satisfied.

**Good Enough**

Achieve 85% household harmony.

**Impossible Family**

Find the arrangement with the least conflict.

**One Condition**

Everyone must be happy except Uncle Raj.

The scoring language should be playful rather than numerical wherever possible.

Example results:

🏡 DOMESTIC BLISS

or

🙂 SURPRISINGLY LIVABLE

or

😬 DEPOSIT DEFINITELY GONE

---

# CONFLICT CHAINS

Later levels should create interconnected problems.

Example:

Kabir needs Room A because it fits his desk.

But Room A shares a wall with Tara.

Move Tara to Room C.

But Room C has the balcony.

Dev wants the balcony because he smokes.

Move Dev to Room B.

But Room B is farthest from the kitchen.

And Dev cooks constantly.

The player gradually untangles the network.

This is where the real puzzle depth comes from.

---

# PETS

Pets should become major puzzle agents.

Cats especially.

Unlike humans, pets don't respect room assignments.

Example:

Chairman Meow's behaviour:

🐈 visits sunny rooms  
🐈 sleeps on soft furniture  
🐈 steals fish  
🐈 hates closed doors

Now a roommate being allergic to cats isn't simply:

"Don't put them beside Kabir."

The player might instead need to reposition:

cat bed  
food bowl  
plants  
doors

to influence where the cat travels.

Other pets can appear later:

🐕 dog  
🐇 rabbit  
🐦 parrot  
🐠 fish

Each introduces different spatial behaviours.

---

# SHARED RESOURCES

Later apartments introduce shared-resource puzzles.

Bathrooms.

Parking spaces.

Fridge shelves.

Desks.

Laundry machines.

Example:

Six roommates.

Two bathrooms.

One person showers for 45 minutes.

Two people leave for work at 8 AM.

One person wakes at noon.

The player needs to determine who should share which bathroom.

This introduces time-based constraints without turning the game into a management simulator.

---

# APARTMENT PROGRESSION

Start extremely small.

## Chapter 1 — FIRST FLAT

2 people  
2 bedrooms

Teach drag-and-drop.

---

## Chapter 2 — THIRD WHEEL

3 people  
3 bedrooms

Introduce adjacency.

---

## Chapter 3 — THE COUPLE

4 people

Introduce relationships.

---

## Chapter 4 — CHAIRMAN MEOW

Introduce pets.

---

## Chapter 5 — WORK FROM HOME

Introduce noise and schedules.

---

## Chapter 6 — ONE BATHROOM

Introduce shared resources.

---

Eventually apartments become much stranger.

Penthouse.

Old mansion.

Student housing.

Beach house.

Tiny Tokyo-style apartment.

Converted warehouse.

Houseboat.

Ski chalet.

Artist commune.

Huge chaotic family home.

---

# RECURRING CHARACTERS

Don't discard every character after one puzzle.

Some should recur.

The player watches their lives develop.

For example:

Chapter 2:

Kabir and Tara hate each other.

Chapter 5:

They're reluctantly living together again.

Chapter 8:

Something appears to be happening.

Chapter 11:

❤️

Chapter 14:

💔

Chapter 18:

"Oh no. These two again."

This creates a lightweight narrative without needing cutscenes.

---

# GROUP CHAT

Between some levels, show a tiny household group chat.

Example:

FLAT 4B

DEV:
who ate my leftovers

KABIR:
not me

TARA:
Kabir

KABIR:
okay but define "ate"

CHAIRMAN MEOW:
🐾

These should be extremely short.

They provide character development and foreshadow upcoming constraints.

---

# VISUAL DIRECTION

The game should look like a charming illustrated architectural dollhouse.

Think:

- editorial illustration
- slightly imperfect shapes
- warm colors
- subtle paper-like texture
- expressive but simple characters
- miniature furniture
- lots of tiny visual jokes

Avoid photorealism.

Avoid generic 3D mobile-game graphics.

Avoid glossy UI.

Avoid excessive gradients.

Avoid childish cartoon aesthetics.

The characters can have exaggerated silhouettes and extremely simple faces.

A character should be recognizable even when rendered very small.

---

# CAMERA

Primarily a fixed isometric or slightly elevated dollhouse perspective.

The entire apartment should generally fit on the iPad screen.

Pinch to zoom for details.

Drag to pan only in larger later levels.

The camera should not constantly move.

The experience should feel calm.

---

# UI

Keep UI extremely minimal.

Top left:

←

Top center:

**4B — The Night Owl Problem**

Top right:

💡 Hint

Bottom:

character cards / draggable characters.

When selecting someone, their preferences appear in a floating card.

Avoid permanent HUD clutter.

The apartment itself should carry most of the information.

---

# SOUND

Sound design should be intimate and tactile.

Examples:

soft footsteps  
door clicks  
chair scraping  
muffled guitar  
kettle boiling  
cat meow  
shower  
distant traffic  
washing machine  
someone knocking on a wall

Music should be subtle, warm and lo-fi.

Silence should also be allowed to breathe.

---

# HUMOUR

Humour should come from recognizable human behaviour rather than jokes written for the player.

Examples:

Someone labels their milk.

Someone steals it anyway.

Someone leaves one spoonful of food in a container so they don't have to wash it.

Someone's boyfriend effectively moves in despite "not living here."

Someone has twelve houseplants.

Someone refuses to replace the toilet roll.

Someone owns a guitar and knows exactly four songs.

Someone's mother unexpectedly stays for three weeks.

The humour should make players think:

"I have literally lived with this person."

---

# SPECIAL LEVELS

Occasionally break the normal rules.

## The Breakup

A couple who previously shared a room have broken up.

Both refuse to leave the apartment.

Rearrange everyone.

---

## Mum's Visiting

A roommate's mother arrives tomorrow.

Temporarily rearrange the flat to make everything look respectable.

---

## The Party

Furniture matters more than bedrooms.

Arrange the apartment so 20 guests can coexist.

---

## The Heatwave

Only two bedrooms have air conditioning.

Everyone suddenly changes priorities.

---

## The New Cat

Nobody agreed to get another cat.

There is now another cat.

Solve it.

---

## The Landlord Inspection

Hide all evidence of:

the second cat  
the unauthorized roommate  
the broken chair  
the suspicious number of plants

before the landlord arrives.

---

# HINT SYSTEM

Hints should feel diegetic.

Instead of:

"HINT: Move Tara to Room 3."

The player receives a message.

TARA:

> "I'm starting to think I'd sleep better somewhere farther from the living room."

This preserves the fantasy.

---

# DIFFICULTY PHILOSOPHY

The game should never become stressful.

No countdown timers during normal puzzles.

No lives.

No energy system.

No punishment for experimentation.

Players should freely drag everyone around.

Undo should always be available.

The challenge should come from reasoning, not execution.

---

# MONETIZATION

Design this as a premium game.

No ads.

No energy.

No currencies.

No loot boxes.

No manipulative daily rewards.

Ideally:

one purchase → complete game.

Additional apartment/story packs could potentially exist later as genuine expansion content.

---

# WHAT MAKES FLATMATES DIFFERENT

The game should NOT merely be:

"Is This Seat Taken? but everyone is in bedrooms."

Its identity should come from four systems working together:

**1. PEOPLE**

Characters have memorable personalities and recurring relationships.

**2. SPACE**

Apartments contain rooms, objects, shared resources and environmental properties.

**3. BEHAVIOUR**

Characters and pets actually interact with the layout.

**4. CONSEQUENCES**

After arranging everything, the player watches the household live through their decisions.

The central emotional loop is:

**Read the people → understand the apartment → predict what will happen → arrange everything → watch your little social experiment unfold.**

---

# DESIGN NORTH STAR

Every puzzle should eventually produce a tiny story.

The player shouldn't remember:

"Level 27 was difficult."

They should remember:

"That was the apartment where I had to put the drummer beside the deaf grandmother because everyone else hated him."

That's Flatmates.

A cozy logic game about the universal truth that:

**Finding somewhere to live is easy. Finding people you can live with is the puzzle.**
