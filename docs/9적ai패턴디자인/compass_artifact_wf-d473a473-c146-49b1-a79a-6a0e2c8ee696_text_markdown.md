# Monster AI and combat design patterns for a 2D hack-and-slash RPG

**The most effective combat systems across Diablo, Hades, Hollow Knight, Path of Exile, Zelda, Ori, and FromSoftware games share a common architecture**: every enemy attack follows an Anticipation → Attack → Recovery cycle, enemies operate as finite state machines with distance-based behavior selection, and "game feel" emerges from layering hit-stop, screen shake, knockback, and sound within a 6-frame window around each impact. This report distills hundreds of specific design patterns from these games into implementable systems for an HTML5 Canvas 2D hack-and-slash, with copy-paste Claude Code prompts at the end.

---

## Enemy state machines and the incremental complexity ladder

Every game studied uses **finite state machines** (FSMs) for enemy AI, not complex behavior trees. Team Cherry confirmed Hollow Knight's entire enemy roster runs on Unity's PlayMaker FSMs — flowchart-style state graphs with states like Idle → Patrol → Alert → Wind-up → Attack → Recovery → Stagger. Diablo 2's modding files reveal each AI type is parameterized by just **5 numbers**: action delay, primary action chance, secondary action chance, engagement range, and tertiary action chance. This means a Zombie, Charger, Archer, and Caster share the same state machine structure but feel completely different through parameter tuning.

Hollow Knight's enemy roster demonstrates **incremental complexity** brilliantly. The Crawlid has zero attacks — it's a moving hazard. The Husk Wanderer adds a charge on aggro. The Husk Hornhead increases charge speed and reach. The Husk Warrior adds a blocking state. Each enemy tests exactly one new player skill. Hades uses the same approach across biomes: Tartarus introduces basic melee/ranged archetypes in walled rooms, Asphodel adds mobility-focused enemies on floating platforms, Elysium layers in shields and armor, and the Temple of Styx maximizes density in cramped corridors.

**The key design principle**: enemies should be sorted into 4-6 archetypes (Shambler, Swarmer, Ranged, Charger, Caster, Spawner), each with 3 escalation tiers (Base → Armored → Elite). Each archetype needs a distinct silhouette so players can identify threat type at a glance — Hollow Knight's "form informs function" rule means a spiked head telegraphs charge direction, wings mean flying, visible armor means blocking.

---

## How attacks are telegraphed before they execute

The GDKeys framework (Nicolas Kraj) provides a precise formula: **Anticipation Time = Player Reaction Time (0.25s) + Player Action Time + Difficulty Buffer**. If a dodge takes 10 frames to execute after button press, minimum anticipation must be 10 + 15 = 25 frames at 60fps. Hollow Knight's Hornet boss demonstrates this perfectly: her Dash has **15 frames** of anticipation (the minimum — tests pure reflexes), her Throw has **20 frames** (comfortable), and her Dive has a very long wind-up (the designated healing/punish window).

FromSoftware's evolution reveals how telegraph design scales with difficulty. Dark Souls 1 used predictable wind-ups matching weapon arc. Dark Souls 3 introduced **delayed attacks** — holding mid-wind-up to catch panic-rollers. Elden Ring made variable timing the primary design language: Margit holds his cane for **3-5 seconds** then releases instantly, and combo rhythms deliberately break pattern (0.7s → 0.7s → 1.2s wind-up) to punish autopilot play. The critical fairness principle: **every attack has at least one visual tell**, even if brief. Sekiro added a universal danger symbol (red kanji 危) for unblockable attacks requiring specific counters.

Diablo's approach differs for the ARPG context. The series uses **ground indicators** — red/orange shapes appearing 0.5-1.5s before damage lands. Arcane Enchanted places a small circle then spawns a rotating beam. Frozen shows growing orbs before explosion. Mortar shows landing zones. Game designer Mike Stout's key insight: **"If players don't understand the questions they are being asked, they cannot play your game."** Challenge comes from overlapping many well-communicated threats, never from confusion. His testing showed that changing telegraph timing within the same level — even making it easier — **increased player deaths** because muscle memory was disrupted.

The four visual channels for telegraphing, ranked by reliability:

- **Animation** (primary): Unique preparatory pose per attack type — crouching before charge, raising weapon overhead before slam, drawing arm back before throw
- **Ground indicators**: Colored shapes for AoE damage zones, growing circles for timed explosions
- **Particle effects**: Glowing weapons for enhanced attacks, elemental auras for status-inflicting moves
- **Audio cues**: Distinct sounds per attack type — Sekiro's deflect drum sound, Zelda's Guardian piano theme

---

## Pack AI, mob density, and the attack ticket system

Diablo 3's elite affix system reveals the most sophisticated pack coordination patterns. **Fire Chains explicitly overrides AI behavior** — champion monsters are reprogrammed to surround the player at all costs, even if they're normally ranged attackers. The Avenger affix creates escalation: each champion death makes survivors larger, faster, and stronger. Health Link forces shared damage across the pack, creating a "damage all equally" puzzle. Path of Exile's **Benevolent Guardian** grants immunity to nearby allies and must be killed first — creating mandatory target prioritization.

The **attack ticket system** (used in DOOM and Ghost of Tsushima) is the key pattern for managing group combat. A combat manager maintains a limited pool of "attack tickets." Enemies must request a ticket before initiating an attack. With **2-3 tickets** available at once, only that many enemies actively attack while others circle, reposition, or use ranged harassment. Ghost of Tsushima's Theodore Fishman explained at GDC 2021: **"Enemies feel aggressive even though they attack 1-by-1"** — achieved through long initial wind-ups that overlap with other enemies' approach animations.

FromSoftware uses a **near/far group system**: 1-2 enemies form the "near group" (actively attacking), while others remain in the "far group" (idle, patrolling, or using ranged pokes). Turn-taking averages **2-3 seconds between individual enemy attacks** in group encounters. Composition rules follow patterns: ranged on elevated positions + melee at ground level, one shielded defender + one aggressive flanker, or a swarm of weak enemies distracting while an elite attacks.

For density, Diablo 3's farming data reveals the formula: **minimum encounter frequency = one new pack every 5-10 seconds of movement**, with no empty zones exceeding 15 seconds of travel. Corridors need minimum **8-10 tile widths** to accommodate large packs plus player maneuvering. The ideal ratio is **1 elite pack per 2-3 trash packs**, and all paths should loop or connect to eliminate backtracking dead ends.

---

## Boss phase transitions and dual-resource kill systems

Boss phase design follows a clear pattern across all games studied. **HP-threshold transitions** at 75%, 50%, and 25% are standard. Each threshold adds 1-2 new attacks without removing existing ones. A brief **invulnerability window** during transition animation (0.5-2s) gives players time to process the change. Hades' Megaera unlocks Flame Pillars and summoned adds at 75%, doubles adds at 50% and 25%. Hollow Knight's Mantis Lords use an elegant **1v1 → 2v1 escalation** — identical moveset, doubled complexity.

Hades' final boss demonstrates the most dramatic transition: when Hades' first HP bar depletes, he pauses dramatically, **refills his entire HP bar**, and releases a damaging shockwave. Phase 2 adds Brimstone Lasers (arena-spanning beams), Vase Summon mechanics, and Swipe Combos. The Extreme Measures 4 variant adds a third phase with limited visibility, mini-boss summons, Cerberus stampedes, and a vase-healing mechanic players must interrupt.

The **Theseus & Asterius dual-boss** from Hades is a masterclass in complementary threat design. Asterius is the aggressor (charges, leaps, combos) while Theseus defends (frontal shield negating damage, long-range spear throws). At 50% HP, Theseus calls Olympian Aid — a random god filling the arena with AoE attacks. Kill order matters: eliminating Asterius first is optimal because Theseus' enrage is more manageable than Asterius' speed buffs.

Sekiro's **posture system** adds a second kill dimension: both HP and Posture bars exist, and filling the Posture bar triggers an instant Deathblow. The critical link is that **lower HP = slower posture recovery**, creating three skill tiers — experts break posture through perfect deflects without touching HP; intermediates chip HP to slow posture regen; novices kite and whittle HP traditionally. Elden Ring's stance system uses datamined values ranging from **15-65 Stance HP for regular enemies** to **80-200 for bosses** (Radahn = 200), with recovery starting after base÷13 seconds and regenerating at 13/second. Any stance damage resets the recovery timer, rewarding sustained pressure.

---

## Sound design that makes combat feel physical

Zelda: BOTW's sound team recorded **over 10,000 sounds** using extensive Foley — hitting wooden sticks, rubbing metal pieces, stepping on different terrain materials. The critical layering technique: when sword, shield, and arrow sounds play simultaneously, they become indistinguishable. The solution is **footstep-synced offset**: right foot step triggers only shield noise; left foot step triggers arrow noise plus sword at a slight delay. Every weapon material (wood, metal, Guardian tech) has distinct swing, impact, and break sounds.

TotK built a **"physics engine for sound"** (Junya Osada, GDC 2024) — sounds generated procedurally from rigid body movement properties (size + material). A wagon produces wheel-rolling + shaking + creaking + chain-rattling automatically. Sound propagation uses **voxel-based pathfinding** between camera and source, with obstruction/occlusion calculated by ray casting through terrain. Reverb parameters auto-calculate using Eyring's Reverberation Time Equation based on detected room geometry.

The **4-layer sword sound model** (David Dumais Audio) provides the implementation framework:

1. **Whoosh** (weapon swing through air) — plays BEFORE impact, creates anticipation
2. **Scrape** (material identifier) — metallic scrape for blades, wooden crack for clubs
3. **Impact** (collision sound) — varies by target material, precisely aligned to visual contact frame
4. **Enhancer** (visceral layer) — gore/flesh sounds, elemental effects, reverb tail

For Web Audio API implementation: use **pitch randomization** (±2-5 semitones via `playbackRate` 0.9-1.1), maintain **3-5 sound variants per action** randomly selected, and apply frequency separation — sharp transients in highs (attack), weight in low-mids (body), rumble in sub-bass (power). The silence gap before impact transient is essential: cut non-impact audio where the transient begins to let it punch through.

Ori's atmosphere design uses **4-6 parallax layers**: static sky (0x scroll speed), far background (0.1-0.2x), mid-background (0.3-0.5x), gameplay layer (1.0x), near-foreground (1.2-1.5x), and close foreground (1.5-2.0x). **Atmospheric perspective** drives color: foreground = darker/more saturated, background = lighter/desaturated. Each biome has a strong primary palette with purple reserved as the universal danger signal. Ori itself emits blue light, serving as both player reference point and immediate-area illumination.

---

## The game feel stack: hit-stop, shake, and particles in 6 frames

Jan Willem Nijman's "Art of Screenshake" talk (Vlambeer, 2013) is the definitive reference for combat feel. His step-by-step transformation of a basic 2D shooter demonstrates that **hit-stop (1-3 frame pause on enemy hit)** is the single highest-impact addition for perceived combat quality. Hades implements **2-4 frames (~33-66ms) of per-hit micro-freeze** applied only to involved characters, not the entire world. Heavier weapons (Shield Bull Rush) get longer stops than rapid attacks (Rail auto-fire). Boss kills trigger an extended **0.5-1.0 second time-stop** with blood splatter for emotional punctuation.

The optimal hit-stop durations from Capcom analysis: light attacks **~3-5 frames (50-83ms)**, medium **~5-7 frames**, heavy **~7-9 frames**. Exceeding **150ms feels sluggish** in speed-oriented games. The key technique: **combine hit-stop with directional screen shake**, because the shake disperses attention so the temporal pause feels less jarring — at maximum combined intensity, **~75% of players can't detect the hit-stop** as a separate effect. For combo systems, deliberately weaken hit-stop on early hits and apply strongest combination on the **combo finisher** for a climactic finish.

The complete per-attack feedback chain at 60fps:

- **Frames 0-3**: Swing whoosh starts (pitch varies with weapon speed)
- **Frames 4-6**: Impact frame — hit-stop begins, impact sound plays, screen shake triggers, hit particles spawn, target flashes white
- **Frames 7-9**: Hit-stop ends, enemy reaction sound, knockback displacement begins
- **Frames 10+**: Reverb tail, knockback settles, particles fade

Screen shake should use **Perlin noise or damped sinusoid** (not pure random), be directional (matching attack vector), scale from **3-5 pixels for standard hits to 8-12 for heavy attacks**, and decay over 200-400ms. When hitting 3+ enemies simultaneously, **cap total freeze time** to prevent the "Dynasty Warriors problem" of constant stuttering.

---

## Essential GDC talks and developer resources

The most actionable talks found, ranked by implementation value:

- **"The Art of Screenshake"** — Jan Willem Nijman (Vlambeer, 2013): Step-by-step combat feel transformation with source code. Browser-playable HTML5 demo exists at game-dev-club-at-vt.itch.io/game-feel
- **"Anatomy of an Attack"** — GDKeys (Nicolas Kraj): Frame-level analysis of Hollow Knight combat with the Anticipation Time formula
- **"Honoring the Blade"** — Theodore Fishman (Sucker Punch, GDC 2021): Attack ticket system, group combat illusion, lethality contract
- **"Change and Constant: Breaking Conventions with BOTW"** — Fujibayashi et al. (Nintendo, GDC 2017): Multiplicative gameplay, 2D prototype approach
- **"Tunes of the Kingdom"** — Osada et al. (Nintendo, GDC 2024): Physics-based sound engine, voxel propagation
- **"Designing Path of Exile to Be Played Forever"** — Chris Wilson (GGG, GDC 2019): Content reuse, procedural systems, monster setup as core design work

Key reference sites: **The Level Design Book** (book.leveldesignbook.com) for enemy roster design, **GDKeys.com** for combat anatomy series, and **gamedesignskills.com** for enemy design frameworks.

---

## Claude Code prompts for implementation

The following prompts are designed to be pasted directly into Claude Code while working in a single-file HTML5 Canvas game. Each prompt builds on the previous systems. Use them in order.

---

### Prompt 1 — Enemy state machine and AI archetype system

```
Implement a complete enemy AI system for this HTML5 Canvas 2D top-down hack-and-slash game. Base all enemy behavior on finite state machines (FSMs) as used in Hollow Knight (Team Cherry confirmed this architecture). Each enemy should have these states: IDLE, PATROL, ALERT, CHASE, WIND_UP, ATTACK, RECOVERY, STAGGER, DEATH.

Create a base Enemy class with these FSM states and transitions:
- IDLE: Stand still, check for player in aggro range
- PATROL: Move along a path or random walk within territory
- ALERT: Player entered aggro range — brief pause (0.3s) before transitioning to CHASE (gives visual "notice" cue)
- CHASE: Move toward player using simple pathfinding
- WIND_UP: Play anticipation animation for current attack (duration varies by attack type). This is the telegraph window.
- ATTACK: Execute attack hitbox (short duration, high commitment)
- RECOVERY: Post-attack cooldown — THIS IS THE PLAYER'S PUNISH WINDOW. Enemy is vulnerable.
- STAGGER: Knocked back on hit, brief hitstun (0.1-0.2s for trash, 0s for elites)
- DEATH: Death animation + possible on-death effects

Then create 6 enemy archetypes by subclassing, each parameterized differently (inspired by Diablo 2's 5-parameter AI system):

1. **Shambler** (Zombie archetype): Speed 0.3, aggroRange 200, attackRange 40, windUpTime 0.8s, recoveryTime 1.0s, actionDelay 1.5s. Walks straight at player. No special behavior. Good for density/fodder.

2. **Swarmer** (Fallen archetype): Speed 1.2, aggroRange 300, attackRange 30, windUpTime 0.3s, recoveryTime 0.5s, actionDelay 0.3s. Moves in groups. KEY BEHAVIOR: When an ally within 150px dies, 60% chance to FLEE for 2s, then regroup. Creates scatter/chaos.

3. **Ranger** (Archer archetype): Speed 0.8, aggroRange 400, preferredRange 250, attackRange 250, windUpTime 0.5s, recoveryTime 0.8s. MAINTAINS DISTANCE — if player is closer than preferredRange, retreats. Fires projectile at player's current position.

4. **Charger** (Brute archetype): Speed 0.5 normally, chargeSpeed 3.0, aggroRange 350, chargeRange 200, windUpTime 1.2s (long telegraph!), recoveryTime 1.5s. Normal approach until within chargeRange, then enters WIND_UP with visible charge-up animation, then CHARGES in a straight line. If hits wall, extra 0.5s stun (self-damage optional).

5. **Caster** (Mage archetype): Speed 0.6, aggroRange 400, castRange 300, windUpTime 1.0s, recoveryTime 1.2s. Positions at castRange, casts AoE spell at player's position with GROUND INDICATOR (red circle appears 0.8s before damage). Repositions after each cast.

6. **Spawner** (Nest archetype): Speed 0, HP 3x normal, spawnInterval 5s, maxSpawns 4. Stationary. Continuously spawns Shamblers until destroyed. Priority target for players.

Implementation details:
- Use a simple distance check for aggro (not raycasting)
- Each enemy stores its currentState and has an update(dt) method that runs the FSM
- Wind-up state should set a visual flag (this.isWindingUp = true) so the renderer can show telegraph
- Attack state creates a hitbox object with position, size, damage, duration
- Recovery state has no attack capability — enemy just stands there
- All timing values in seconds, use delta time accumulation
- Add a drawTelegraph(ctx) method that draws attack indicators during WIND_UP state
```

---

### Prompt 2 — Elite affix and monster hierarchy system

```
Add a monster hierarchy and elite affix system inspired by Diablo 3's categorization. This creates Normal, Champion (blue), Rare (yellow), and Boss tiers.

**Monster Hierarchy:**
- Normal: Base stats, spawn in packs of 4-8 of same type
- Champion (blue glow): 2x HP, 1.3x damage, 1-2 affixes. Spawn as pack of 3 sharing same affixes. Drop better loot.
- Rare (yellow glow): 3x HP, 1.5x damage, 2-3 affixes. Single leader + 4-6 normal minions. Some affixes only apply to leader.
- Boss: Fixed abilities, unique sprite, scripted phase transitions

**Affix System — Categorize into 3 groups (Diablo 3's rule: max 2 offensive, max 1 defensive, max 1 CC to prevent impossible combos):**

OFFENSIVE affixes:
1. **Molten**: 40px fire aura around enemy dealing 1 DPS. Leaves fire trail (persists 3s). ON DEATH: 150px radius explosion after 1.5s delay with clear red expanding circle warning. Players CAN dodge this.
2. **Mortar**: Every 4s, fires 3 arcing projectiles that land at player's position ± random offset. Show red circle ground indicators 0.8s before impact. KEY: Mortars have minimum range (100px) — melee players are SAFE if they stay close.
3. **ArcaneBeam**: Places anchor point near player. After 1s delay (shown as small growing circle), a beam extends and ROTATES 360° over 4s dealing high damage. Extremely dangerous in tight spaces.
4. **Multishot** (enhancing): Monster's base projectile attack fires 3 projectiles in a 30° spread instead of 1.

DEFENSIVE affixes:
5. **Shielding**: Every 8s, becomes invulnerable for 3s (glowing shield visual). Players must wait it out or focus other targets.
6. **HealthLink** (Champion-only): All champions in pack share one health pool. Damage to any = damage to all.

CC affixes:
7. **Vortex**: Every 6s, pulls player 100px toward the monster (requires line of sight). Brief visual warning — purple tendrils appear 0.5s before pull.
8. **Jailer**: Every 8s, roots player in place for 1.5s + deals burst damage. Red circle appears under player 0.3s before root activates.

ON-DEATH affixes (inspired by Path of Exile — these trigger when monster dies):
9. **Volatile**: On death, spawns a homing orb (speed starts at 1.0, accelerates by 0.5/s over 4s) that chases player and explodes for high damage on contact. Leaves poison ground for 3s.
10. **SoulConduit**: On death, revives up to 3 nearby dead enemies at 50% HP.

**Affix Application:**
- Create an applyAffix(enemy, affixName) function that wraps the enemy's update() to add affix behavior
- Affixes should modify the enemy's update loop, not replace it — the base AI still runs
- Champion packs: roll 1-2 affixes from allowed categories, apply same affixes to all pack members
- Rare monsters: roll 2-3 affixes with category limits (max 2 offensive, 1 defensive, 1 CC)
- Store active affixes as an array on the enemy for UI display

**Visual indicators:**
- Draw affix icons under enemy health bars (small colored dots: red=offensive, blue=defensive, yellow=CC)
- Ground effects should be semi-transparent colored circles/shapes
- Molten trail: orange-red dots along enemy path
- All ground indicators use alpha animation (fade in over telegraph duration)
```

---

### Prompt 3 — Attack telegraph and combat feel system (hit-stop, screen shake, particles)

```
Implement a complete combat feel system based on Vlambeer's "Art of Screenshake" principles and Hades' hit-stop design. This is the MOST IMPORTANT system for making combat feel satisfying.

**Hit-Stop System (Hades-style):**
Create a HitStopManager that can freeze specific entities (not the whole game world):
- When player hits an enemy: freeze BOTH player and enemy for a duration based on attack weight
- Light attack: 3 frames (50ms)
- Heavy attack: 5 frames (83ms)
- Critical hit: 7 frames (117ms)
- Combo finisher: 9 frames (150ms) — this is the maximum before it feels sluggish
- Boss kill: 30 frames (500ms) for dramatic punctuation
- Implementation: each entity has a hitStopTimer. When > 0, skip position/animation updates but STILL RENDER. Decrement by dt each frame.
- IMPORTANT: When hitting 3+ enemies simultaneously, cap total hit-stop to the single-hit duration (don't stack). This prevents the "Dynasty Warriors problem."

**Screen Shake System:**
- Create a ScreenShake class with: intensity, duration, decayRate, direction
- Use damped sinusoid (not random): offsetX = intensity * sin(time * frequency) * decay; offsetY = intensity * cos(time * frequency * 0.7) * decay
- Decay formula: decay = Math.pow(1 - (elapsed / duration), 2) — quadratic falloff
- Intensity scales: light hit = 3px, heavy hit = 6px, explosion = 10px, boss phase transition = 15px
- Direction: bias shake toward attack direction (add 60% of shake magnitude in attack vector direction)
- Apply shake as ctx.translate(shakeOffsetX, shakeOffsetY) before ALL rendering, reset after
- Multiple simultaneous shakes: take the maximum, don't sum (prevents excessive shake)

**Hit Flash:**
- On hit, set enemy.flashTimer = 0.08 (80ms)
- During flash, draw enemy sprite with globalCompositeOperation = 'source-atop' and fill white, OR simply draw a white rectangle over the enemy sprite with alpha 0.7
- This is the single fastest way to confirm hit registration visually

**Impact Particles:**
- On each hit, spawn 5-12 small particles at the hit point
- Particles: random velocity (speed 50-200, angle = attack direction ± 45°), size 2-4px, lifetime 0.2-0.5s, color matches damage type (white=physical, orange=fire, blue=ice)
- Particles decelerate (multiply velocity by 0.92 each frame) and fade (alpha decreases linearly)
- Add 1-2 larger "spark" particles (size 4-8px) that persist longer for visual emphasis

**Knockback:**
- On hit, apply knockback force to enemy in attack direction
- Knockback distance: light attack = 15px, heavy = 40px, charged = 80px
- Use deceleration curve: velocity *= 0.85 per frame
- If enemy hits wall during knockback, deal bonus damage (10% of hit damage) — Hades uses this "Wall Slam" mechanic

**The Complete Hit Event Chain (execute in this order at the impact frame):**
1. Play hit sound (impact layer — see sound system)
2. Trigger hit-stop on attacker and target
3. Spawn impact particles at contact point
4. Set enemy flash timer
5. Apply knockback force to enemy
6. Trigger screen shake (directional)
7. Apply damage number popup (float upward, fade out over 1s)
8. Check for stagger threshold / death

**Damage Number Popups:**
- Spawn at enemy position, float upward at 60px/s, fade alpha over 1s
- Normal damage: white, size 14px
- Critical damage: yellow, size 20px, add slight random horizontal offset
- Healing: green
```

---

### Prompt 4 — Boss phase system with dual-resource mechanics

```
Implement a boss encounter system inspired by Hades phase transitions, FromSoftware's stance/posture mechanics, and Hollow Knight's telegraph design.

**Base Boss Class (extends Enemy):**
- Boss has phases array: [{hpThreshold: 1.0, moveset: [...], ...}, {hpThreshold: 0.5, moveset: [...], ...}]
- currentPhase index tracks which phase is active
- On taking damage, check if HP ratio crossed next phase threshold
- Phase transition sequence:
  1. Set boss.invulnerable = true
  2. Trigger screen shake (intensity 12, duration 1.0s)
  3. Play transition animation (boss glows, particles expand outward) for 1.5s
  4. Flash screen white briefly (100ms)
  5. Set boss.invulnerable = false
  6. Immediately use a new-phase signature attack to teach player the new threat

**Stance/Stagger System (simplified Elden Ring):**
- Boss has stanceHP (separate from regular HP) and maxStanceHP
- Player attacks deal stanceDamage in addition to regular damage (heavy attacks deal 3x stance damage)
- When stanceHP <= 0: boss enters STAGGERED state for 2.5s (kneeling animation), taking 1.5x damage. This is the big punish window.
- Stance recovery: after 3s of not taking stance damage, regenerate stanceHP at 15/second
- KEY MECHANIC (from Sekiro): stance recovery rate SLOWS as boss HP decreases. At 50% HP, recovery rate = 10/s. At 25% HP, recovery rate = 5/s. This makes the fight progressively easier to stagger.
- Draw stance bar below HP bar (different color — yellow/orange)

**Boss Attack Selection (FromSoftware distance-based system):**
- Each attack has: name, damage, windUpTime, activeTime, recoveryTime, minRange, maxRange, cooldown, weight
- Selection algorithm:
  1. Filter attacks by: player distance within [minRange, maxRange] AND cooldown elapsed
  2. Weight selection: recently used attacks get 0.3x weight (prevent repetition), attacks matching current distance get 2x weight
  3. Weighted random pick from filtered list
  4. Minimum 5 distinct attacks per boss (FromSoft standard)

**Example Boss — "The Warden" (3-phase, Hades-style):**

Phase 1 (100%-60% HP) — 4 attacks:
1. **Cleave**: windUp 0.6s (arm raises), range 0-80px, 120° arc in front, recovery 0.8s. Basic melee.
2. **Lunge**: windUp 1.0s (crouches, body compresses), charges forward 250px in straight line, 40px wide hitbox, recovery 1.2s. Charger attack.
3. **Slam**: windUp 1.2s (jumps up and hovers), lands at player position with 120px AoE circle (ground indicator shows during windUp), recovery 1.5s. Highest punish window.
4. **Projectile Fan**: windUp 0.8s, fires 5 projectiles in 60° spread, range 400px, recovery 0.6s. Forces dodge.

Phase 2 (60%-30% HP) — adds 2 attacks, existing attacks get 20% faster windups:
5. **Summon Adds**: Boss shields self (invulnerable 3s), summons 4 Shamblers. Must kill adds while boss recovers. Triggers once per phase at threshold.
6. **Ground Wave**: windUp 1.0s (stomps ground), 3 expanding ring shockwaves at 0.5s intervals, each ring 30px wide expanding outward at 200px/s. Player must jump/dash through gaps or move out of range.

Phase 3 (30%-0% HP) — adds enrage:
- All windUp times reduced by 30%
- Recovery times reduced by 20%
- Slam now leaves fire ground for 3s at landing point
- New attack: **Berserk Combo** — 3 consecutive Cleaves with only 0.2s between each (0.4s wind-up on first only), ends with 1.5s recovery. This is the FromSoft "combo string with punish only at the end" pattern.

**Boss Arena Design:**
- Boss room should be circular or rectangular, roughly 800x600px
- Add 2-4 destructible pillars (break after absorbing 3 boss attacks) that block projectiles and line-of-sight attacks
- Boss arena entrance triggers fog wall (no leaving until boss dies or player dies)
```

---

### Prompt 5 — Pack AI coordination and combat manager

```
Implement a CombatManager that coordinates enemy group behavior, inspired by the attack ticket system from DOOM/Ghost of Tsushima and Diablo 3's pack coordination.

**Attack Ticket System:**
- CombatManager is a singleton that tracks all active enemies
- Has maxAttackTickets = 3 (only 3 enemies can be in WIND_UP or ATTACK state simultaneously)
- activeAttackers = [] (enemies currently holding tickets)
- requestAttackTicket(enemy): returns true if tickets available AND enemy not already holding one. Push to activeAttackers.
- releaseAttackTicket(enemy): called when enemy enters RECOVERY state. Remove from activeAttackers.
- Enemies in CHASE state must call requestAttackTicket() before transitioning to WIND_UP. If denied, they enter a CIRCLE state instead (orbit player at attack range, maintaining spacing from other circling enemies).

**CIRCLE State (new state for denied enemies):**
- Enemy moves along a circle around the player at their attack range
- Direction: alternate clockwise/counterclockwise to create natural-looking surrounding
- Periodically re-request attack ticket every 0.5-1.0s
- While circling, enemy faces player and plays an idle-aggressive animation
- This creates the Ghost of Tsushima illusion: enemies look menacing and surrounding while only 2-3 actually attack

**Pack Spawning System (Hades wave model):**
- RoomEncounter class with waves array: [{enemies: [{type, count, position}], delay: 0}, ...]
- Wave 1 spawns immediately. Each subsequent wave triggers when all enemies in current wave are dead.
- Standard room: 2-3 waves. Total encounter: 30-60 seconds.
- Enemy composition per wave follows Hades' pairing rule: 1-2 ranged + 2-3 melee + 0-1 special per wave
- Spawn enemies at room edges with a brief spawn animation (materialize over 0.5s, invulnerable during spawn)

**Pack Behavior Patterns (apply per-pack, not individual):**

1. **Surround Formation** (Diablo 3 Fire Chains model):
   - Assign each pack member an angle offset around player (360° / packSize)
   - Each enemy moves toward their assigned position on the circle
   - Update target positions when player moves
   - This makes the pack naturally surround the player

2. **Scatter-Regroup** (Diablo 2 Fallen model):
   - On ally death within 150px: 60% chance each nearby ally enters FLEE state
   - FLEE: Move directly away from death location at 1.5x speed for 2s
   - After FLEE: enter REGROUP — move toward nearest surviving ally, then resume normal AI
   - Optional: Pack Leader (Shaman) can revive dead allies if not killed within 5s

3. **Leader-Follower** (Path of Exile aura model):
   - Rare monster has an aura radius (200px)
   - All minions within aura get buff (20% attack speed, or 15% damage reduction, etc.)
   - Minions prioritize staying within aura range
   - When leader dies: remove buff, minions enter a brief CONFUSED state (0.5s idle) then resume normal AI with reduced stats

4. **Priority Target** (Path of Exile Benevolent Guardian):
   - Healer/shielder enemy type that periodically grants 2s invulnerability to one nearby ally (8s cooldown)
   - Must be killed first to stop the immunity cycling
   - Make it visually distinct (glowing, different color) so player identifies priority

**Density Manager:**
- Track total active enemies on screen
- If below minEnemyCount (8) and no active encounter, spawn a wandering pack nearby
- Maximum enemies on screen: 25 (performance limit for Canvas)
- Enemy disposal: when enemy is more than 1500px from player and not in combat, remove from active list
```

---

### Prompt 6 — Sound system for combat audio

```
Implement a combat sound system using Web Audio API, inspired by Zelda BOTW's material-based audio and the 4-layer sword sound model.

**SoundManager class:**
- Initialize AudioContext on first user interaction
- Maintain a sound pool: Map<string, AudioBuffer[]> where each key maps to 3-5 variants
- Play method: playSound(name, options = {volume, pitch, pan})
  - Pick random variant from pool
  - Create AudioBufferSourceNode
  - Apply pitch randomization: playbackRate = basePitch * (0.95 + Math.random() * 0.1) — ±5% variation prevents repetition fatigue
  - Connect through GainNode (volume) → StereoPannerNode (spatial) → destination
  - Return the source node for potential early stopping

**Sound Categories to Create (use jsfxr or sfxr to generate base sounds):**

WEAPON SOUNDS (4-layer model per attack):
1. whoosh_light, whoosh_heavy — swing through air, plays 2-3 frames BEFORE impact
2. impact_flesh, impact_metal, impact_wood — varies by target type
3. impact_critical — layered on top of regular impact for crits (add bass rumble)
4. enhancer_slash, enhancer_blunt — additional texture layer (brief, quiet)

ENEMY SOUNDS:
5. enemy_hit_reaction — grunt/squeal on taking damage (3 variants minimum)
6. enemy_death — death cry (distinct from hit reaction — slightly longer, falling pitch)
7. enemy_aggro — alert sound when entering CHASE state (growl, hiss, bark)
8. enemy_attack_whoosh — enemy's own weapon swing

UI/FEEDBACK SOUNDS:
9. player_hit — player taking damage (brief, impactful, distinct from enemy hits)
10. player_heal — positive chime
11. level_up — ascending tone sequence
12. pickup_gold, pickup_item — satisfying collection sounds

BOSS SOUNDS:
13. boss_phase_transition — dramatic rumble + impact (1-2 seconds)
14. boss_slam_impact — heavy bass-heavy impact for boss AoE attacks
15. boss_death — extended dramatic sound with reverb tail

**Sound Timing Integration with Hit Events:**
```javascript
function onPlayerHitEnemy(attacker, target, attackType) {
  const now = audioCtx.currentTime;
  
  // Layer 1: Whoosh already playing (started in WIND_UP state)
  
  // Layer 2: Impact sound — PRECISELY on contact frame
  soundManager.playSound(
    target.material === 'metal' ? 'impact_metal' : 'impact_flesh',
    { volume: 0.8, pitch: attackType === 'heavy' ? 0.85 : 1.0 }
  );
  
  // Layer 3: Enhancer — 1 frame after impact (slight offset prevents masking)
  setTimeout(() => {
    soundManager.playSound('enhancer_slash', { volume: 0.3 });
  }, 16);
  
  // Layer 4: Enemy reaction — 2 frames after impact
  setTimeout(() => {
    soundManager.playSound('enemy_hit_reaction', { volume: 0.6 });
  }, 33);
  
  // Critical hit: add bass rumble layer
  if (attackType === 'critical') {
    soundManager.playSound('impact_critical', { volume: 0.9, pitch: 0.7 });
  }
}
```

**Spatial Audio (simplified for 2D):**
- Pan sounds based on relative X position to player: pan = clamp((enemy.x - player.x) / 400, -1, 1)
- Volume falloff: volume = 1.0 - clamp(distance / maxHearingRange, 0, 0.9) — never fully silent if on screen
- Boss attacks: always play at full volume centered (pan 0) — they're always important

**Ambient/Atmosphere (Ori-inspired):**
- Per-biome ambient loop: forest (birds + wind), dungeon (drips + echoes), fire zone (crackling + rumble)
- Use ConvolverNode with simple impulse response for area-appropriate reverb
- Crossfade between ambient tracks when transitioning between zones (1.5s crossfade)
```

---

### Prompt 7 — Parallax background and atmosphere rendering

```
Implement a parallax scrolling background system inspired by Ori and the Blind Forest's layered depth design.

**ParallaxLayer class:**
Each layer has: image (or procedural drawing function), scrollSpeedX, scrollSpeedY, opacity, tint, blurAmount

**Layer Stack (6 layers, back to front):**
1. **Sky/Background** (scrollSpeed 0.05): Nearly static. Solid gradient or simple pattern. Lightest colors, lowest contrast. opacity 0.4.
2. **Far Mountains/Structures** (scrollSpeed 0.15): Large simple shapes (silhouettes of distant terrain). Tinted toward atmosphere color (blue/grey for depth). opacity 0.5.
3. **Mid Background** (scrollSpeed 0.35): Trees, ruins, environmental details. More detail than layer 2 but still muted. Ori rule: lighter/less saturated than gameplay layer. opacity 0.7.
4. **Gameplay Layer** (scrollSpeed 1.0): Player, enemies, interactive objects. BRIGHTEST, HIGHEST CONTRAST. This is where all gameplay-relevant elements render. Full opacity.
5. **Near Foreground** (scrollSpeed 1.3): Grass blades, low walls, decorative elements that pass OVER the player. Slightly darker, adds sense of depth. Semi-transparent (opacity 0.6) so player isn't obscured.
6. **Close Foreground** (scrollSpeed 1.7): Occasional large silhouette elements (tree branches, rocks). Very dark, very transparent (opacity 0.3). Creates sense of enclosed space.

**Rendering each layer:**
```javascript
function drawParallaxLayers(ctx, camera, layers) {
  layers.forEach(layer => {
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    
    // Atmospheric perspective tinting (Ori technique)
    // Farther layers get more blue/grey tint
    if (layer.tint) {
      ctx.fillStyle = layer.tint;
      ctx.globalAlpha = layer.tintStrength; // 0.1 for near, 0.4 for far
    }
    
    // Parallax scroll offset
    const offsetX = -camera.x * layer.scrollSpeedX;
    const offsetY = -camera.y * layer.scrollSpeedY;
    ctx.translate(offsetX % canvas.width, offsetY % canvas.height);
    
    // Draw layer content (tile if needed for infinite scroll)
    layer.draw(ctx);
    
    ctx.restore();
  });
}
```

**Atmospheric Perspective Rules (from Ori's color design):**
- Each biome defines: fogColor, fogDensity, ambientLightColor
- Layers farther from gameplay layer get more fog tinting:
  - Layer 1-2: ctx.fillStyle = fogColor at 40% alpha overlay
  - Layer 3: fogColor at 15% alpha overlay
  - Layer 4 (gameplay): no fog — full clarity
  - Layer 5-6: slightly darker tint (opposite of background — foreground is DARKER per Ori's rule)

**Per-Biome Color Palettes (inspired by Ori):**
- Forest: Primary green/teal, secondary gold highlights, fog = light blue
- Dungeon: Primary dark blue/grey, secondary purple accents, fog = dark grey. Purple = danger signal.
- Fire Zone: Primary orange/red, secondary black/dark brown, fog = warm amber
- Boss Arena: Desaturated version of current biome + red accents to signal danger

**Dynamic Lighting (simplified for Canvas):**
- Player character emits a circular light (Ori's blue glow):
  - Draw a radial gradient centered on player: transparent center → dark edges
  - Use globalCompositeOperation = 'multiply' to darken everything outside the light radius
  - Light radius = 200px in bright areas, 120px in dark areas (Elden Ring's limited visibility concept for tension)
- Torches/light sources: Additional radial gradients at fixed positions
- Boss phase transitions: briefly reduce light radius to 80px for dramatic effect (Hades EM4 darkness mechanic)

**Particle Systems for Atmosphere:**
- Floating particles (dust, embers, spores) per biome: 20-40 particles, slow drift, small size (1-3px), low alpha (0.2-0.4)
- These move at parallax speed 0.5-0.8 to create mid-depth atmosphere
- Forest: green/gold particles drifting upward slowly
- Dungeon: grey dust particles drifting downward
- Fire: orange embers rising rapidly with slight horizontal sway
```

---

## Conclusion

The most surprising finding across all seven game series is how simple the underlying systems are. Hollow Knight's acclaimed enemy AI runs on basic finite state machines. Diablo 2's entire monster behavior library is parameterized by 5 numbers per type. Hades achieves its renowned combat feel with just **3 frames of hit-stop**. The complexity players experience emerges from combining simple, well-tuned systems — the attack ticket pattern with 2-3 tickets creates the illusion of coordinated aggression, incremental enemy complexity teaches skills without tutorials, and the Anticipation → Attack → Recovery cycle with precisely calibrated timing windows makes every encounter readable yet challenging. The real craft lies not in architectural complexity but in **tuning the numbers**: a 0.2-second difference in wind-up time can make an attack feel fair or frustrating, and the relationship between telegraph duration and player reaction time (0.25s baseline + action time + difficulty buffer) is the single most important formula for combat that teaches rather than punishes.