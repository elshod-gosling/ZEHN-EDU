# LevelUp learning arcade

A buildless, responsive learning prototype in English, Uzbek, and Russian. The redesigned landing page uses an editorial layout inspired by the YUYA reference: oversized typography, open whitespace, and a gallery of four subjects. Open `dist/index.html` through any static web server. No build or npm install is needed.

## Included

- Four learning worlds: coding and Windows; Office; mathematics; typing.
- Ten introductory quests covering Python, C++, C#, Windows, Excel, Word, PowerPoint, linear/quadratic functions, and typing.
- Four playable games: robot maze, shortcut memory, typing-powered railway, and a separate first-person 3D block duel arena.
- Earn 50 XP once per quest; levels, badges, daily streaks, and progress use browser local storage.
- Initial language uses the browser time zone and preferred languages, with a persistent manual override. Uzbekistan time zones select Uzbek. This is a location heuristic, not IP geolocation.
- Desmos loads in an iframe only when requested. A direct calculator link is also provided. Answers are checked by the lesson form, independently of the iframe.
- The landing page has no WebGL or animation loop. The 3D arena loads only on its own page after completing a math quest. Optional Google Fonts fall back to system fonts. The original sunset artwork is served locally as a 212 KB JPEG; its full-resolution PNG and generation prompt are in `artwork/`.

## 3D arena

Modern 1.9+ inspired combat uses a fixed 20 Hz simulation, directional movement and collision, sprint jumps, inertia, knockback, three-block ray-tested reach, sword/axe cooldowns, falling critical hits, directional shields, shield disable, diamond armor damage reduction, and golden apples. Matches are first to two rounds, with a three-minute round limit. Training bot, stationary dummy, and direct LAN duel modes are included. Low graphics is the default: pixel ratio 1, instanced blocks, no shadows, and no postprocessing. Three.js r160.1 is vendored with its MIT license; textures and models are original, generated in code.

Controls: WASD move, R sprint (Ctrl also supported), Shift sneak, Space jump, left click attack, right click shield/eat, 1/2/3 select sword/axe/apple. R avoids the browser's Ctrl+W shortcut. F holds shield and J attacks as keyboard alternatives. Pointer lock is requested on entry; restricted embedded browsers use drag-look or arrow-key looking instead. Esc pauses. Graphics and sensitivity can be adjusted before entering.

Direct multiplayer uses WebRTC with manual invitation/reply codes and no external ICE servers. Both browsers must have completed a math quest and access to the site. The host simulates both players and sends authoritative snapshots; the guest predicts local movement. This is for peers on a reachable local network, not internet matchmaking. Network isolation/firewalls may prevent connections. Codes are exchanged by the players; the site does not send messages for them. The host can cheat and is not a trusted assessment or competitive server.

This is an original browser approximation, not the Minecraft Java engine or a claim of exact parity across Minecraft versions. Simplifications include deterministic charged-axe shield disable, no enchantments, no hunger/fall damage, no inventory building, and no shield durability. Apples restore four health over five seconds and grant four absorption health for two minutes. Browser frame scheduling and network latency affect feel. Performance has not been measured on the user's specified school laptop.

## Scope

This is a starter learning product with short introductory exercises, not a complete course. Code exercises are output-prediction tasks, not a code execution sandbox. Office exercises are simulations, not integrations with installed Office applications. Accounts, trusted server scores, classroom management, internet matchmaking, and cross-device saves are not implemented. Browser-local progress can be edited by the device owner and is not suitable for graded assessment.

## Next production work

Add an authenticated classroom backend and trusted multiplayer room service for internet matches. Compare the movement/combat feel with the intended Minecraft release on target hardware. Expand curricula with reviewed Uzbek and Russian content and practical projects. For direct graph-state integration and automated Desmos expression checking, provision a Desmos API key and use the official API instead of the standalone iframe.

## Local preview

Run `python -m http.server 4173 --bind 127.0.0.1 --directory dist` from this directory, then visit http://127.0.0.1:4173.
