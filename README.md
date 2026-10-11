# LevelUp learning arcade

A buildless, responsive learning prototype in English, Uzbek, and Russian. Open `dist/index.html` through any static web server. No build or npm install is needed.

## Included

- Four learning worlds: coding and Windows; Office; mathematics; typing.
- Ten introductory quests covering Python, C++, C#, Windows, Excel, Word, PowerPoint, linear/quadratic functions, and typing.
- Four playable 2D games: robot maze, shortcut memory, crystal-collection block arena, and typing-powered railway.
- Earn 50 XP once per quest; levels, badges, daily streaks, and progress use browser local storage.
- Initial language uses the browser time zone and preferred languages, with a persistent manual override. Uzbekistan time zones select Uzbek. This is a location heuristic, not IP geolocation.
- Desmos loads in an iframe only when requested. A direct calculator link is also provided. Answers are checked by the lesson form, independently of the iframe.
- No 3D, WebGL, game engine, landing-page animation loop, external images, or required JavaScript dependencies. Optional Google Fonts fall back to system fonts.

## Scope

This is a starter learning product with short introductory exercises, not a complete course. Code exercises are output-prediction tasks, not a code execution sandbox. Office exercises are simulations, not integrations with installed Office applications. The original block arena supports a bot and two players on the same keyboard; it is not Minecraft or online multiplayer. Accounts, server-verified scores, classroom management, real-time matchmaking, and cross-device saves are not implemented. Browser-local progress can be edited by the device owner and is not suitable for graded assessment.

## Next production work

Add an authenticated classroom backend and multiplayer room service for cross-device matches. Decide whether the intended reward should be the original lightweight block game or a separately hosted, licensed Minecraft integration. Expand curricula with reviewed Uzbek and Russian content and practical projects. For direct graph-state integration and automated Desmos expression checking, provision a Desmos API key and use the official API instead of the standalone iframe.

## Local preview

Run `python -m http.server 4173 --bind 127.0.0.1 --directory dist` from this directory, then visit http://127.0.0.1:4173.
