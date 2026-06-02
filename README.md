# 🌌 DArk: ECHO SECTOR // OPERATIONAL BRIEFING

---

## 🛑 TRANSMISSION INCOMING...

> **DATE:** SYSTEM TIME ERROR // YEAR 2147
> **LOCATION:** ECHO SECTOR RESEARCH COMPLEX (CLASSIFIED AREA)
> **STATUS:** RE-ENTRY PROTOCOLS INITIALIZED

---

## 📜 The Intel (Story)

The abandoned **Echo Sector Research Complex** was officially sealed after a catastrophic systems failure. Communications were lost, security protocols activated, and every access route was locked behind automated defenses.

Weeks later, strange transmissions began broadcasting from deep within the facility.

You are an infiltration operative dispatched to investigate. Your mission is simple:

* **Penetrate** deeper into the facility.
* **Eliminate** hostile security units.
* **Recover** access keycards.
* **Survive** escalating lockdown events.
* **Reach the core** and uncover what remains inside Echo Sector.

Every layer becomes more dangerous than the last. **Trust nothing.**

---

## 🎯 Primary Directives (Objectives)

Progress through multiple facility layers by executing the following operational tasks:

* **Sector Clearing:** Neutralize all hostile forces inside active grids.
* **Asset Recovery:** Locate and collect color-coded electronic keycards.
* **Access Override:** Unlock sealed security thresholds.
* **Credit Retrieval:** Secure valuable terminal credits dropped from defeated automated units.
* **Marketplace Staging:** Spend your accrued credits on vital performance upgrades between facility layers.
* **Extraction:** Reach the layer's exit terminal to dive deeper.

⚠️ **CRITICAL FAILURE:** If your vital health metric hits **0**, the connection terminates and the mission fails.

---

## 🎛️ Input Telemetry (Controls)

| Key Bindings | Tactical Execution |
| --- | --- |
| **`W` `A` `S` `D**` | Direct Matrix Movement |
| **`Mouse`** | Rotational Target Acquisition / Aiming |
| **`Left Click`** | Discharge Core Weapon System |
| **`Shift`** | Walk Silently (Drastically suppresses audio footprint) |
| **`Space`** | Activate Cloak (Deploy temporary Invisibility Matrix) |
| **`L`** | Toggle Tactical Flashlight Array |
| **`P`** | System Operational Pause / Resume |
| **`R`** | Total System Diagnostic Reset (Restart Operation) |
| **`Enter`** | Complete Staging Protocols & Continue from Marketplace |
| **`1` - `5**` | Purchase Dedicated Marketplace Upgrades |

---

## 🤖 Hostile Threats (Enemy Pool)

### 🔹 Patrol Unit

*The standard automated facility defense drone.*

* **Parameters:** Balanced movement speed, medium range tracking capability.
* **Assessment:** Common threat; perfect for calculating projectile bounce angles.

### 🔹 Sniper Unit

*A long-range precise heavy support platform.*

* **Parameters:** Extremely accurate tracking, vast detection range, high damage payload.
* **Assessment:** Lethal down long, open sightlines. Break line of sight immediately.

### 🔹 Dash Unit

*An aggressive, hard-charging close-quarters assault drone.*

* **Parameters:** Maximum velocity mechanics, closes positional distances rapidly.
* **Assessment:** High threat priority in narrow corridors or sudden corner ambushes.

### 🔹 Cloaked Unit

*An advanced stealth-infiltrator assassin.*

* **Parameters:** Shifts periodically into full optical invisibility; highly evasive tracking signature.
* **Assessment:** Stalks your position silently. Listen closely for audio footprints to predict their alignment.

### 🔹 Explosive Unit

*An unstable, volatile structural demolition drone.*

* **Parameters:** Latches onto your tracking signature and charges at top velocity, self-detonating on contact.
* **Assessment:** Deals immense area-of-effect blast damage. Pop them before they cross your safety perimeter.

---

## 🔑 Security Clearances (Keycards)

Electronic barrier gates block further exploration. Access restricted facility quadrants by tracking down floating physical secure chips:

| Keycard Blueprint | Security Clearance Access Tier |
| --- | --- |
| 🟦 **Blue Keycard** | Grants clearance to **Basic Security Areas** |
| 🟥 **Red Keycard** | Grants clearance to **Advanced Security Areas** |
| 🟩 **Green Keycard** | Grants clearance to **High-Security Core Sectors** |

---

## 🚨 Containment Field Protocols (Lockdown System)

Certain rooms house sleeping security nodes. The split second you cross a threshold and enter their detection sightlines:

1. **Automated Isolation:** Entrance and exit boundaries slam shut and lock uniformly.
2. **Combat Sequence:** Threat containment systems initialize and active sirens trigger.
3. **Acoustic Overdrive:** Emergency lockdown combat audio streams dynamically loop through the sector.
4. **System Reset:** The containment field will **only** drop and unlock its doors once the total threat count hits exactly zero.

---

## 🛒 Terminal Terminal (The Marketplace)

Secure safe passage to the automated terminal networks between layer iterations to convert your collected credits into active hardware patches:

* **⚡ Damage Boost:** Overclocks the output frequency of your weapon system to multiply raw bullet damage.
* **🏹 Tri-Shooter:** Modifies weapon fire vectors to release three projectiles in a tight spread simultaneously.
* **💉 Medical Patch:** Inject emergency nanites to rapidly restore a huge block of missing health.
* **🛡️ Shield Cell:** Recharges your kinetic secondary energy barrier up to its 100% maximum capacity.
* **🔌 Cloak Charge:** Rewards an extra operational charge to your personal optical invisibility device.

---

## 💡 Operator Survival Tips

* **Geometrical Cover:** Use static cargo crates to completely absorb incoming sniper lines and incoming drone fire.
* **Acoustic Profiling:** Running sounds alert distant bots. Hold `Shift` to sneak past traps or setup clean, un-alerted flanking lines.
* **Weapon Discharge Echoes:** Firing your weapon leaves a massive sound footprint that instantly reveals your coordinates to every drone in the room.
* **Surgical Extraction:** Clear large arenas methodically room-by-room. Rushing across unknown sector thresholds risks triggering multiple overlapping lockdown systems.
* **Economic Strategy:** Don't blow all your credits early. Hoard your wealth to secure crucial damage modifiers and shield cells for the final layers.
* **Invisibility Outlets:** Activating your optical cloak instantly breaks tracking links, forcing confused drones to wander to your last known memory coordinates.

---

## 🛠️ Matrix Systems Log (Developer Tile Reference)

For map modifications and layout generation, use these hardcoded array coordinates inside the configuration arrays:

```markdown
 [0] Void / Wall      [4] Lockdown Gate     [7] Enemy Spawn      [10] Green Security Door
 [1] Floor            [5] Blue Security     [8] Exit Terminal    [20] Blue Keycard Item
 [2] Corridor         [6] Crate Obstacle    [9] Red Security     [21] Red Keycard Item
                                                                 [22] Green Keycard Item
                                                                 [30] Player Spawn Location

```

---

## 🏆 Operational Success

Infiltrate the deepest layer, systematically purge all terminal defense parameters, outmaneuver the lockdown protocol overrides, and escape the Echo Sector complex alive.

*Good luck, Operative.*

**Echo Sector is listening.** 🚨