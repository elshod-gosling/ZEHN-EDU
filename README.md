# ZEHN-EDU learning arcade

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

Modern 1.9+ inspired combat uses a fixed 20 Hz simulation, directional movement and collision, sprint jumps, inertia, knockback, three-block ray-tested reach, sword/axe cooldowns, falling critical hits, directional shields, shield disable, diamond armor damage reduction, and golden apples. Matches are first to two rounds, with a three-minute round limit. An easy practice bot, stationary dummy, and direct LAN duel modes are included. The practice bot walks at 60% input, reassesses aim every 300 ms with limited turning, swings no more than once per 1.8 seconds, shields briefly, and takes 1.5-second breaks every six seconds. It uses a sword and does not sprint or deliberately jump. Its schedule resets each round. Low graphics is the default: pixel ratio 1, exposed voxel faces, no shadows, and no postprocessing. Three.js r160.1 is vendored with its MIT license; textures and models are original, generated in code.

Attack recharge follows the Java 1.9+ model for unenchanted diamond weapons: sword speed 1.6 (12.5 ticks / 0.625 seconds), axe speed 1.0 (20 ticks / 1 second). Early swings are allowed and reset recharge. Base damage scales by `0.2 + 0.8 * strength²`, with a half-tick offset when sampling attack strength. Only strength above 90% allows falling critical hits, sprint bonus knockback, and charged axe shield disable. The original small white indicator sits below the crosshair while charging and fills smoothly between simulation ticks. Target hurt immunity remains independent of recharge. The attack-strength formula and half-tick sample are visible in the [Paper 1.21.4 player source patch](https://github.com/PaperMC/Paper/blob/ver/1.21.4/paper-server/patches/sources/net/minecraft/world/entity/player/Player.java.patch). Full Minecraft engine parity is still outside this browser implementation.

Controls: WASD move, R sprint (Ctrl also supported), Shift sneak, Space jump, left click attack, right click shield/eat, 1/2/3 select sword/axe/apple. R avoids the browser's Ctrl+W shortcut. F holds shield and J attacks as keyboard alternatives. Entry and resume request actual Pointer Lock; Esc releases it and pauses both bot and peer modes. Promise-based and legacy event-based APIs are supported, rejected requests can be retried, and the game does not silently report a locked cursor or start playing after rejection. Guest players also capture their mouse from an explicit button. Canvas focus and Pointer Lock are requested synchronously from the entry click. Optional fullscreen is requested immediately after Pointer Lock, before either promise is awaited, preserving browser user activation. Pending entry can be cancelled safely; late rejected requests cannot break a subsequent retry, and late locks after cancellation are released. The capture dialog displays the native rejection name and message instead of a silent retry.

The Codex embedded browser rejected Pointer Lock during QA with Chromium's internal UnknownError. The user confirmed mouse capture works in their standalone browser. API lifecycle tests pass and drag gameplay was checked in the embedded browser. The error dialog links to `arena/input-test.html`, a standalone, translated test which calls `document.body.requestPointerLock()` directly without the game or capture helper. It reports the native error, browser version, click activation, focus and actual lock state, allowing the remaining failure to be isolated in the user's browser. It sends no diagnostic data anywhere. Credits and passes are shared through the signed-in Supabase account; legacy XP remains browser-local.

Rendering uses one requestAnimationFrame callback per display refresh (browser VSync), without a 60 FPS gameplay cap or 30 FPS menu cap. Combat uses an independent fixed 20 Hz clock. Camera FOV easing uses elapsed time so high-refresh displays do not change its speed. Hidden tabs stop rendering and pause the duel; resuming resets the frame clock to avoid replaying the hidden interval. The browser, display, and GPU determine achievable FPS; the site cannot override driver VSync. Synthetic scheduler tests cover 60, 75, 120, 144, and 240 Hz.

Graphics has Low, Balanced, and High presets. Low remains the default for new browsers, while an explicitly selected preset is remembered locally. High lazily imports its own module and replaces 16px materials with original 128px color/normal/roughness maps, physically based lighting and environment reflections. It adds 2048px soft shadow maps, procedural sky/cloud shaders, animated grass blades and water, depth-based contact shading when supported, separable bloom, screen-space sun rays, FXAA, and ACES-style tone mapping. High render targets use HDR half-float storage when supported and unsigned-byte storage otherwise. Switching back restores the original materials, sky, and lighting and disables all extra passes. The landing page does not import these files. High has not been benchmarked on school hardware; it is intended as an optional graphics upgrade.

Direct multiplayer uses WebRTC with eight-character room codes. Supabase exchanges the connection offer and reply automatically; players share only the short code. The room table is private, only its two participants can read connection details, and hosting/joining requires an active credit pass or developer access. Pending connections time out after 90 seconds; abandoned server records expire after ten minutes and are cleaned when rooms are created. This is for peers on a reachable local network, with no external ICE servers. Network isolation/firewalls may prevent connections. The host simulates both players and can cheat; this is not a trusted competitive server.

This is an original browser approximation, not the Minecraft Java engine or a claim of exact parity across Minecraft versions. Simplifications include deterministic charged-axe shield disable, no enchantments, no hunger/fall damage, no inventory building, and no shield durability. Apples restore four health over five seconds and grant four absorption health for two minutes. Browser frame scheduling and network latency affect feel. Performance has not been measured on the user's specified school laptop.

## Scope

This is a starter learning product with short introductory exercises, not a complete course. Code exercises are output-prediction tasks, not a code execution sandbox. Office exercises are simulations, not integrations with installed Office applications. Email/password accounts, and cross-device credit balances are implemented. Trusted multiplayer server scores, classroom management, internet matchmaking, and cross-device legacy XP are not implemented. Browser-local progress can be edited by the device owner and is not suitable for graded assessment.

## Next production work

Add classroom membership management and a trusted multiplayer room service for internet matches. Compare the movement/combat feel with the intended Minecraft release on target hardware. Expand curricula with reviewed Uzbek and Russian content and practical projects. For direct graph-state integration and automated Desmos expression checking, provision a Desmos API key and use the official API instead of the standalone iframe.

## Local preview

Run `python -m http.server 4173 --bind 127.0.0.1 --directory dist` from this directory, then visit http://127.0.0.1:4173.

## GitHub and public hosting

Source repository: https://github.com/elshod-gosling/ZEHN-EDU

Public website: https://elshod-gosling.github.io/ZEHN-EDU/

Pushes to `main` run `.github/workflows/pages.yml`, check the learning logic and combat, and publish only `dist/` to GitHub Pages. No installation or build step is needed. All assets and arena links use relative paths so project-subdirectory hosting works. Legacy quest XP stays local to each hosting origin; credits use the same Supabase account on both hosts. The existing private Sites deployment remains available independently.

## Accounts and learning credits

Supabase provides email/password accounts and shared credit wallets. Browser sessions persist until explicit sign-out. The SDK is bundled locally in `dist/vendor/supabase.mjs`; account startup makes no requests to Google authentication services. Create-account handles email confirmation; password recovery opens a form for choosing a new password.

Apply `supabase/migrations/202610120001_levelup_accounts.sql` and `supabase/migrations/20261012155825_room_codes.sql` to the selected Supabase project, then configure its URL and public publishable/anon key in `dist/supabase-config.mjs`. Empty configuration disables registration and shared credits while ordinary lessons and browser-local quest rewards remain available. Never put secret or service-role keys into the static site.

Enable email/password sign-in and set the minimum password length to eight characters. Add both hosting origins to Auth redirect URLs, including `/?credits=1` under the GitHub project path. Configure email delivery before inviting students. The developer email is kept in the private settings table; developer access requires that account's email to be confirmed. Student metadata cannot grant developer access.

Each correct learning round earns 10 credits after at least 60 seconds. A five-minute PvP pass costs 100 credits; resuming an active pass is free. SQL functions lock each wallet row, check timing and answers on the server, and assign expiry from the server clock. Browser clients can read only their own wallet and cannot write balances, roles, or answer keys. The private lesson bank contains 32 rounds in English, Uzbek, and Russian.

The authenticated wallet and room RPCs intentionally use `SECURITY DEFINER` to perform restricted writes. Each checks `auth.uid()`, uses an empty search path, and denies anonymous execution. Supabase's advisor flags their authenticated execution for review; this is the intended API access model.

Account identities and previous hosted balances are not automatically transferred between providers. The previous cloud data is retained; migration of real students requires a separate verified identity mapping. Legacy quest XP remains local to each hosting origin. A trusted multiplayer server is still required for tamper-resistant competitive game access.

Run `npm ci` and `npm test`. `node supabase-tests.mjs` runs the actual SQL migration against embedded PostgreSQL to check access isolation, correct answers, server timing, pass spending and developer authorization. `npm run bundle:account` rebuilds the checked-in SDK; `node supabase/generate-migration.mjs` regenerates the migration from the schema and lesson bank. Neither build command is needed to serve the existing `dist/`.

Completed rounds use a separate podium camera. The winner wears a crown, raises a trophy and celebrates; the other fighter bows toward the winner. Draws show equal-height platforms. The result card shows the score and next-round/new-match action, with the host controlling continuation in friend duels. First-person equipment stays hidden during the ending and when returning to the menu. Reduced motion uses a static bow and disables confetti.

Run `node qa/prepare-podium-preview.mjs` and serve the repository root locally to inspect deterministic win/draw/guest endings at `/qa/.podium-preview/index.html`. These ignored QA fixtures do not contact account services or enter the deployed `dist/` output.
