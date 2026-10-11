# LevelUp learning arcade

A buildless, responsive learning prototype in English, Uzbek, and Russian. The redesigned landing page uses an editorial layout inspired by the YUYA reference: oversized typography, open whitespace, and a gallery of four subjects. Open `dist/index.html` through any static web server. No build or npm install is needed.

## Included

- Four learning worlds: coding and Windows; Office; mathematics; typing.
- Ten introductory quests covering Python, C++, C#, Windows, Excel, Word, PowerPoint, linear/quadratic functions, and typing.
- Four playable games: robot maze, shortcut memory, typing-powered railway, and a separate first-person 3D block duel arena.
- Earn 50 XP once per quest; levels, badges, daily streaks, and progress use browser local storage.
- Initial language uses the browser time zone and preferred languages, with a persistent manual override. Uzbekistan time zones select Uzbek. This is a location heuristic, not IP geolocation.
- Desmos loads in an iframe only when requested. A direct calculator link is also provided. Answers are checked by the lesson form, independently of the iframe.
- The landing page has no WebGL or animation loop. The 3D arena loads only on its own page after redeeming a credit pass. Optional Google Fonts fall back to system fonts. The original sunset artwork is served locally as a 212 KB JPEG; its full-resolution PNG and generation prompt are in `artwork/`.

## 3D arena

Modern 1.9+ inspired combat uses a fixed 20 Hz simulation, directional movement and collision, sprint jumps, inertia, knockback, three-block ray-tested reach, sword/axe cooldowns, falling critical hits, directional shields, shield disable, diamond armor damage reduction, and golden apples. Matches are first to two rounds, with a three-minute round limit. An easy practice bot, stationary dummy, and direct LAN duel modes are included. The practice bot walks at 60% input, reassesses aim every 300 ms with limited turning, swings no more than once per 1.8 seconds, shields briefly, and takes 1.5-second breaks every six seconds. It uses a sword and does not sprint or deliberately jump. Its schedule resets each round. Low graphics is the default: pixel ratio 1, instanced blocks, no shadows, and no postprocessing. Three.js r160.1 is vendored with its MIT license; textures and models are original, generated in code.

Attack recharge follows the Java 1.9+ model for unenchanted diamond weapons: sword speed 1.6 (12.5 ticks / 0.625 seconds), axe speed 1.0 (20 ticks / 1 second). Early swings are allowed and reset recharge. Base damage scales by `0.2 + 0.8 * strength²`, with a half-tick offset when sampling attack strength. Only strength above 90% allows falling critical hits, sprint bonus knockback, and charged axe shield disable. The original small white indicator sits below the crosshair while charging and fills smoothly between simulation ticks. Target hurt immunity remains independent of recharge. The attack-strength formula and half-tick sample are visible in the [Paper 1.21.4 player source patch](https://github.com/PaperMC/Paper/blob/ver/1.21.4/paper-server/patches/sources/net/minecraft/world/entity/player/Player.java.patch). Full Minecraft engine parity is still outside this browser implementation.

Controls: WASD move, R sprint (Ctrl also supported), Shift sneak, Space jump, left click attack, right click shield/eat, 1/2/3 select sword/axe/apple. R avoids the browser's Ctrl+W shortcut. F holds shield and J attacks as keyboard alternatives. Entry and resume request actual Pointer Lock; Esc releases it and pauses both bot and peer modes. Promise-based and legacy event-based APIs are supported, rejected requests can be retried, and the game does not silently report a locked cursor or start playing after rejection. Guest players also capture their mouse from an explicit button. Canvas focus and Pointer Lock are requested synchronously from the entry click. Optional fullscreen is requested immediately after Pointer Lock, before either promise is awaited, preserving browser user activation. Pending entry can be cancelled safely; late rejected requests cannot break a subsequent retry, and late locks after cancellation are released. The capture dialog displays the native rejection name and message instead of a silent retry.

The Codex embedded browser rejected Pointer Lock during QA with Chromium's internal UnknownError. The user confirmed mouse capture works in their standalone browser. API lifecycle tests pass and drag gameplay was checked in the embedded browser. The error dialog links to `arena/input-test.html`, a standalone, translated test which calls `document.body.requestPointerLock()` directly without the game or capture helper. It reports the native error, browser version, click activation, focus and actual lock state, allowing the remaining failure to be isolated in the user's browser. It sends no diagnostic data anywhere. Credits and passes are shared through the signed-in Firebase account; legacy XP remains browser-local.

Rendering uses one requestAnimationFrame callback per display refresh (browser VSync), without a 60 FPS gameplay cap or 30 FPS menu cap. Combat uses an independent fixed 20 Hz clock. Camera FOV easing uses elapsed time so high-refresh displays do not change its speed. Hidden tabs stop rendering and pause the duel; resuming resets the frame clock to avoid replaying the hidden interval. The browser, display, and GPU determine achievable FPS; the site cannot override driver VSync. Synthetic scheduler tests cover 60, 75, 120, 144, and 240 Hz.

Graphics has Low, Balanced, and High presets. Low remains the default for new browsers, while an explicitly selected preset is remembered locally. High lazily imports its own module and replaces 16px materials with original 128px color/normal/roughness maps, physically based lighting and environment reflections. It adds 2048px soft shadow maps, procedural sky/cloud shaders, animated grass blades and water, depth-based contact shading when supported, separable bloom, screen-space sun rays, FXAA, and ACES-style tone mapping. High render targets use HDR half-float storage when supported and unsigned-byte storage otherwise. Switching back restores the original materials, sky, and lighting and disables all extra passes. The landing page does not import these files. High has not been benchmarked on school hardware; it is intended as an optional graphics upgrade.

Direct multiplayer uses WebRTC with manual invitation/reply codes and no external ICE servers. Both browsers need an active credit pass or developer access and access to the site. The host simulates both players and sends authoritative snapshots; the guest predicts local movement. This is for peers on a reachable local network, not internet matchmaking. Network isolation/firewalls may prevent connections. Codes are exchanged by the players; the site does not send messages for them. The host can cheat and is not a trusted assessment or competitive server.

This is an original browser approximation, not the Minecraft Java engine or a claim of exact parity across Minecraft versions. Simplifications include deterministic charged-axe shield disable, no enchantments, no hunger/fall damage, no inventory building, and no shield durability. Apples restore four health over five seconds and grant four absorption health for two minutes. Browser frame scheduling and network latency affect feel. Performance has not been measured on the user's specified school laptop.

## Scope

This is a starter learning product with short introductory exercises, not a complete course. Code exercises are output-prediction tasks, not a code execution sandbox. Office exercises are simulations, not integrations with installed Office applications. Google accounts and cross-device credit balances are implemented. Trusted multiplayer server scores, classroom management, internet matchmaking, and cross-device legacy XP are not implemented. Browser-local progress can be edited by the device owner and is not suitable for graded assessment.

## Next production work

Add classroom membership management and a trusted multiplayer room service for internet matches. Compare the movement/combat feel with the intended Minecraft release on target hardware. Expand curricula with reviewed Uzbek and Russian content and practical projects. For direct graph-state integration and automated Desmos expression checking, provision a Desmos API key and use the official API instead of the standalone iframe.

## Local preview

Run `python -m http.server 4173 --bind 127.0.0.1 --directory dist` from this directory, then visit http://127.0.0.1:4173.

## GitHub and public hosting

Source repository: https://github.com/elshod-gosling/levelup-learning-arcade

Public website: https://elshod-gosling.github.io/levelup-learning-arcade/

Pushes to `main` run `.github/workflows/pages.yml`, check the learning logic and combat, and publish only `dist/` to GitHub Pages. No installation or build step is needed. All assets and arena links use relative paths so project-subdirectory hosting works. Legacy quest XP stays local to each hosting origin; credits use the same Firebase account on both hosts. The existing private Sites deployment remains available independently.

## Google accounts and learning credits

Firebase project `zehnedu-1` provides Google Authentication and Firestore. Ordinary Gmail and school Google accounts are accepted; only verified Google sign-in identities may access their own wallet. The public web configuration lives in `dist/account-config.mjs`; these identifiers are not administrative credentials. The authenticated Firebase CLI account remains outside this repository. Browser authentication uses session persistence and explicitly asks students to select their Google account. Students should sign out on shared school PCs.

A learning round earns **10 credits** after at least **60 seconds** and a correct answer. **100 credits** purchases a **five-minute PvP pass**, giving a target of ten one-minute rounds (about ten minutes for a student who answers correctly). The normal UI counts visible, focused practice time and pauses its timer in a background tab. Firestore independently checks elapsed server time and the correct answer. The bank contains 32 translated rounds across coding/Windows, Office, math, and keyboard fluency; learners may select a subject or follow a mixed sequence. Existing subject lessons include a credits button. Wrong answers cost no credits. Unused credits carry over.

Credit rules use transactions, exact deltas, a server-controlled question sequence and private answer-key documents. Refreshes and simultaneous tabs cannot claim one round twice. Redeeming a pass costs exactly 100 credits; resuming an active pass is free. The pass expiry is checked against server time (a three-second network tolerance is allowed when writing its expiry). The arena synchronizes its clock, shows remaining time, stops play when the pass expires or the account signs out, and requires account access on direct arena URLs too. Every peer needs their own pass.

The owner's Google identity is provisioned with a **developer** wallet. The private `policy/access` document identifies the verified developer email; Firestore checks it before allowing a role promotion. The UI shows infinity and developer access bypasses credit costs, time limits, and introductory mini-game locks. Students cannot edit this policy, give themselves the role, or mint arbitrary credits. Website developer access does not grant Firebase project administrative credentials.

The economy is enforced by Firestore. The voxel game itself remains client-side, so modified browser code can bypass the normal game-entry UI; a trusted multiplayer backend is required for tamper-resistant competitive access. Legacy XP is separate from credits and cannot purchase a pass.

For an authorized maintainer, run `npm ci`, `npx.cmd firebase login` on Windows, then `node firebase/admin-project.mjs inspect` to inspect sanitized configuration. `seed` uploads the lesson bank and developer policy from the verified CLI account; `owner` provisions that account's developer wallet without overwriting an existing Auth user. `npx.cmd firebase deploy --only firestore:rules --project zehnedu-1` publishes the database rules. Keep authentication tokens, service-account keys, and OAuth secrets out of source. No paid Cloud Functions or billing upgrade was configured.

`node credit-tests.mjs` checks policy timing, pass reuse/expiry, active practice, and translations. `npm run test:rules` runs the Firestore emulator and checks correct/incorrect answers, early/duplicate/concurrent claims, forged balances, Google identity requirements, role authorization and pass costs. The emulator requires Java 21. GitHub Actions runs these rules tests before deploying the website; database rule changes must also be deployed to Firebase separately.
