# Tone.js

[![codecov](https://codecov.io/gh/Tonejs/Tone.js/branch/dev/graph/badge.svg)](https://codecov.io/gh/Tonejs/Tone.js)

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture of Tone.js aims to be familiar to both musicians and audio programmers creating web-based audio applications. On the high-level, Tone offers common DAW (digital audio workstation) features like a global transport for synchronizing and scheduling events as well as prebuilt synths and effects. Additionally, Tone provides high-performance building blocks to create your own synthesizers, effects, and complex control signals.

-   [API](https://tonejs.github.io/docs/)
-   [Examples](https://tonejs.github.io/examples/)

# Installation

There are two ways to incorporate Tone.js into a project. First, it can be installed locally into a project using `npm`:

```bash
npm install tone      // Install the latest stable version
npm install tone@next // Or, alternatively, use the 'next' version
```

Add Tone.js to a project using the JavaScript `import` syntax:

```js
import * as Tone from "tone";
```

Tone.js is also hosted at unpkg.com. It can be added directly within an HTML document, as long as it precedes any project scripts. [See the example here](https://github.com/Tonejs/Tone.js/blob/master/examples/simpleHtml.html) for more details.

```html
<script src="http://unpkg.com/tone"></script>
```

# Hello Tone

```javascript
//create a synth and connect it to the main output (your speakers)
const synth = new Tone.Synth().toDestination();

//play a middle 'C' for the duration of an 8th note
synth.triggerAttackRelease("C4", "8n");
```

## Tone.Synth

`Tone.Synth` is a basic synthesizer with a single oscillator and an ADSR envelope.

### triggerAttack / triggerRelease

`triggerAttack` starts the note (the amplitude is rising), and `triggerRelease` is when the amplitude is going back to 0 (i.e. **note off**).

```javascript
const synth = new Tone.Synth().toDestination();
const now = Tone.now();
// trigger the attack immediately
synth.triggerAttack("C4", now);
// wait one second before triggering the release
synth.triggerRelease(now + 1);
```

### triggerAttackRelease

`triggerAttackRelease` is a combination of `triggerAttack` and `triggerRelease`

The first argument to the note which can either be a frequency in hertz (like `440`) or as "pitch-octave" notation (like `"D#2"`).

The second argument is the duration that the note is held. This value can either be in seconds, or as a [tempo-relative value](https://github.com/Tonejs/Tone.js/wiki/Time).

The third (optional) argument of `triggerAttackRelease` is _when_ along the AudioContext time the note should play. It can be used to schedule events in the future.

```javascript
const synth = new Tone.Synth().toDestination();
const now = Tone.now();
synth.triggerAttackRelease("C4", "8n", now);
synth.triggerAttackRelease("E4", "8n", now + 0.5);
synth.triggerAttackRelease("G4", "8n", now + 1);
```

## Time

Web Audio has advanced, sample accurate scheduling capabilities. The AudioContext time is what the Web Audio API uses to schedule events, starts at 0 when the page loads and counts up in **seconds**.

`Tone.now()` gets the current time of the AudioContext.

```javascript
setInterval(() => console.log(Tone.now()), 100);
```

Tone.js abstracts away the AudioContext time. Instead of defining all values in seconds, any method which takes time as an argument can accept a number or a string. For example `"4n"` is a quarter-note, `"8t"` is an eighth-note triplet, and `"1m"` is one measure.

[Read about Time encodings](https://github.com/Tonejs/Tone.js/wiki/Time).

# Starting Audio

**IMPORTANT**: Browsers will not play _any_ audio until a user clicks something (like a play button). Run your Tone.js code only after calling `Tone.start()` from a event listener which is triggered by a user action such as "click" or "keydown".

`Tone.start()` returns a promise, the audio will be ready only after that promise is resolved. Scheduling or playing audio before the AudioContext is running will result in silence or incorrect scheduling.

```javascript
//attach a click listener to a play button
document.querySelector("button")?.addEventListener("click", async () => {
	await Tone.start();
	console.log("audio is ready");
});
```

# Scheduling

## Transport

`Tone.getTransport()` returns the main timekeeper. Unlike the AudioContext clock, it can be started, stopped, looped and adjusted on the fly. You can think of it like the arrangement view in a Digital Audio Workstation.

Multiple events and parts can be arranged and synchronized along the Transport. `Tone.Loop` is a simple way to create a looped callback that can be scheduled to start and stop.

```javascript
// create two monophonic synths
const synthA = new Tone.FMSynth().toDestination();
const synthB = new Tone.AMSynth().toDestination();
//play a note every quarter-note
const loopA = new Tone.Loop((time) => {
	synthA.triggerAttackRelease("C2", "8n", time);
}, "4n").start(0);
//play another note every off quarter-note, by starting it "8n"
const loopB = new Tone.Loop((time) => {
	synthB.triggerAttackRelease("C4", "8n", time);
}, "4n").start("8n");
// all loops start when the Transport is started
Tone.getTransport().start();
// ramp up to 800 bpm over 10 seconds
Tone.getTransport().bpm.rampTo(800, 10);
```

Since Javascript callbacks are **not precisely timed**, the sample-accurate time of the event is passed into the callback function. **Use this time value to schedule the events**.

# Instruments

There are numerous synths to choose from including `Tone.FMSynth`, `Tone.AMSynth` and `Tone.NoiseSynth`.

All of these instruments are **monophonic** (single voice) which means that they can only play one note at a time.

To create a **polyphonic** synthesizer, use `Tone.PolySynth`, which accepts a monophonic synth as its first parameter and automatically handles the note allocation so you can pass in multiple notes. The API is similar to the monophonic synths, except `triggerRelease` must be given a note or array of notes.

```javascript
const synth = new Tone.PolySynth(Tone.Synth).toDestination();
const now = Tone.now();
synth.triggerAttack("D4", now);
synth.triggerAttack("F4", now + 0.5);
synth.triggerAttack("A4", now + 1);
synth.triggerAttack("C5", now + 1.5);
synth.triggerAttack("E5", now + 2);
synth.triggerRelease(["D4", "F4", "A4", "C5", "E5"], now + 4);
```

# Samples

Sound generation is not limited to synthesized sounds. You can also load a sample and play that back in a number of ways. `Tone.Player` is one way to load and play back an audio file.

```javascript
const player = new Tone.Player(
	"https://tonejs.github.io/audio/berklee/gong_1.mp3"
).toDestination();
Tone.loaded().then(() => {
	player.start();
});
```

`Tone.loaded()` returns a promise which resolves when _all_ audio files are loaded. It's a helpful shorthand instead of waiting on each individual audio buffer's `onload` event to resolve.

## Tone.Sampler

Multiple samples can also be combined into an instrument. If you have audio files organized by note, `Tone.Sampler` will pitch shift the samples to fill in gaps between notes. So for example, if you only have every 3rd note on a piano sampled, you could turn that into a full piano sample.

Unlike the other synths, Tone.Sampler is polyphonic so doesn't need to be passed into Tone.PolySynth

```javascript
const sampler = new Tone.Sampler({
	urls: {
		C4: "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		A4: "A4.mp3",
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

Tone.loaded().then(() => {
	sampler.triggerAttackRelease(["Eb4", "G4", "Bb4"], 4);
});
```

# Effects

In the above examples, the sources were always connected directly to the `Destination`, but the output of the synth could also be routed through one (or more) effects before going to the speakers.

```javascript
const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3",
	loop: true,
	autostart: true,
});
//create a distortion effect
const distortion = new Tone.Distortion(0.4).toDestination();
//connect a player to the distortion
player.connect(distortion);
```

The connection routing is flexible, connections can run serially or in parallel.

```javascript
const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/drum-samples/loops/ominous.mp3",
	autostart: true,
});
const filter = new Tone.Filter(400, "lowpass").toDestination();
const feedbackDelay = new Tone.FeedbackDelay(0.125, 0.5).toDestination();

// connect the player to the feedback delay and filter in parallel
player.connect(filter);
player.connect(feedbackDelay);
```

Multiple nodes can be connected to the same input enabling sources to share effects. `Tone.Gain` is useful utility node for creating complex routing.

# Signals

Like the underlying Web Audio API, Tone.js is built with audio-rate signal control over nearly everything. This is a powerful feature which allows for sample-accurate synchronization and scheduling of parameters.

`Signal` properties have a few built in methods for creating automation curves.

For example, the `frequency` parameter on `Oscillator` is a Signal so you can create a smooth ramp from one frequency to another.

```javascript
const osc = new Tone.Oscillator().toDestination();
// start at "C4"
osc.frequency.value = "C4";
// ramp to "C2" over 2 seconds
osc.frequency.rampTo("C2", 2);
// start the oscillator for 2 seconds
osc.start().stop("+3");
```

# AudioContext

Tone.js creates an AudioContext when it loads and shims it for maximum browser compatibility using [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context). The AudioContext can be accessed at `Tone.getContext`. Or set your own AudioContext using `Tone.setContext(audioContext)`.

# MIDI

To use MIDI files, you'll first need to convert them into a JSON format which Tone.js can understand using [Midi](https://tonejs.github.io/Midi/).

# Performance

Tone.js makes extensive use of the native Web Audio Nodes such as the GainNode and WaveShaperNode for all signal processing, which enables Tone.js to work well on both desktop and mobile browsers.

[This wiki](https://github.com/Tonejs/Tone.js/wiki/Performance) article has some suggestions related to performance for best practices.

# Testing

Tone.js runs an extensive test suite using [mocha](https://mochajs.org/) and [chai](http://chaijs.com/) with nearly 100% coverage. Passing builds on the 'dev' branch are published on npm as `tone@next`.

# Contributing

There are many ways to contribute to Tone.js. Check out [this wiki](https://github.com/Tonejs/Tone.js/wiki/Contributing) if you're interested.

# References and Inspiration

-   [Many of Chris Wilson's Repositories](https://github.com/cwilso)
-   [Many of Mohayonao's Repositories](https://github.com/mohayonao)
-   [The Spec](http://webaudio.github.io/web-audio-api/)
-   [Sound on Sound - Synth Secrets](http://www.soundonsound.com/sos/may99/articles/synthsec.htm)
-   [Miller Puckette - Theory and Techniques of Electronic Music](http://msp.ucsd.edu/techniques.htm)
-   [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context)


## 🌐 Web Resources & Interactive Index
- [RAGDOLL SHOW THROW BREAK AND DESTROY](https://themindplay.github.io/ragdoll-show-throw-break-and-destroy.html)
- [DISASSEMBLE THE PICTURE PUZZLE](https://quizverses.github.io/disassemble-the-picture-puzzle.html)
- [CATEGORY OBBY56](https://themindzone.pages.dev/category-obby56.html)
- [STICKMAN DISMOUNT SIMULATOR](https://studyplaying.github.io/stickman-dismount-simulator.html)
- [CATEGORY INCREMENTAL388](https://thequizzone.pages.dev/category-incremental388.html)
- [CATEGORY BOARDGAMES](https://studyquests.github.io/category-boardgames.html)
- [PYRAMIDZ2](https://learnquester.pages.dev/pyramidz2.html)
- [CATEGORY CARTOON76](https://theskillquest.pages.dev/category-cartoon76.html)
- [INDEX31](https://quizverses.github.io/index31.html)
- [CATEGORY PLATFORM](https://theskillquest.pages.dev/category-platform.html)
- [PET RUNNER](https://thequizzone.pages.dev/pet-runner.html)
- [ASSASSIN COMMANDO CAR DRIVING](https://quizverses.github.io/assassin-commando-car-driving.html)
- [CATEGORY STICKMAN175](https://studyquests.github.io/category-stickman175.html)
- [GTA GRAND VEGAS CRIME](https://quizverses-9d2f2.web.app/gta-grand-vegas-crime.html)
- [LINGO DREAMS](https://quizverses.pages.dev/lingo-dreams.html)
- [CATEGORY UNBLOCKED WEBSITES](https://studyquests.github.io/category-unblocked-websites.html)
- [BRAINROT ICE TRUCK](https://themindzone.pages.dev/brainrot-ice-truck.html)
- [DICTATOR SIMULATOR 1984](https://learnquester.pages.dev/dictator-simulator-1984.html)
- [LULUS FASHION WORLD](https://quizverses.github.io/lulus-fashion-world.html)
- [CATEGORY POINT AND CLICK](https://theskillquest.pages.dev/category-point-and-click.html)
- [CATEGORY YOUTUBE](https://studyquests.github.io/category-youtube.html)
- [CATEGORY MATCH 3](https://studyquests.github.io/category-match-3.html)
- [CATEGORY MAHJONG](https://quizverses.pages.dev/category-mahjong.html)
- [MAHJONG PET QUEST](https://quizverses.pages.dev/mahjong-pet-quest.html)
- [PEG SOLITAIRE](https://quizverses.github.io/peg-solitaire.html)
- [MOJICON GARDEN JIGSOLITAIRE](https://quizverses-9d2f2.web.app/mojicon-garden-jigsolitaire.html)
- [CATEGORY CASUAL 11](https://quizverses.github.io/category-casual-11.html)
- [RACING PINBALL](https://thequizzone.pages.dev/racing-pinball.html)
- [QUIZMANIA TRIVIA GAME](https://themindzone.pages.dev/quizmania-trivia-game.html)
- [BUBBLE SHOOTER PIRATE TREASURES](https://thelearnquester.web.app/bubble-shooter-pirate-treasures.html)
- [CATEGORY AGILITY](https://learnquester.pages.dev/category-agility.html)
- [FIND THE FROG HIDDEN OBJECTS](https://thequizzone.pages.dev/find-the-frog-hidden-objects.html)
- [NAUTILUS SPACESHIP ESCAPE](https://thequizzone.pages.dev/nautilus-spaceship-escape.html)
- [BABY PIANO CHILDREN SONG](https://thequizzone.pages.dev/baby-piano-children-song.html)
- [MATHEMATICS RACING](https://studyquesthub.web.app/mathematics-racing.html)
- [CATEGORY SHOOTER 2](https://learnquester.pages.dev/category-shooter-2.html)
- [CATEGORY SNAKE40](https://learnquester.pages.dev/category-snake40.html)
- [TILE SORT MATCH 3](https://thequizzone.pages.dev/tile-sort-match-3.html)
- [FARM BLOCK](https://quizverses.github.io/farm-block.html)
- [MAKEUP FRUITS](https://quizverses.pages.dev/makeup-fruits.html)
- [SPRUNKI QUIZ](https://thelearnquester.web.app/sprunki-quiz.html)
- [DUO FAMILY SANTA](https://themindzone.pages.dev/duo-family-santa.html)
- [MAHJONG SORT PUZZLE](https://thelearnquester.web.app/mahjong-sort-puzzle.html)
- [CATEGORY MATCH 3117](https://quizverses-9d2f2.web.app/category-match-3117.html)
- [WALL HOP](https://thequizzone.pages.dev/wall-hop.html)
- [PIRATES MAHJONG](https://quizverses.pages.dev/pirates-mahjong.html)
- [GOODS TRIPLE MATCH 3D](https://quizverses-9d2f2.web.app/goods-triple-match-3d.html)
- [FESTIVAL VIBES MAKEUP](https://thelearnquester.web.app/festival-vibes-makeup.html)
- [MEGA SHARK](https://quizverses.github.io/mega-shark.html)
- [EXIT PUZZLE](https://quizverses.github.io/exit-puzzle.html)
- [CATEGORY ESCAPE](https://quizverses.pages.dev/category-escape.html)
- [MERGE SQUARES](https://quizverses.pages.dev/merge-squares.html)
- [CATEGORY SURVIVAL366](https://learnquester.pages.dev/category-survival366.html)
- [NEW YEARS MIRACLES CONNECT THE BALLS](https://quizverses.github.io/new-years-miracles-connect-the-balls.html)
- [CATEGORY CASUAL 3](https://quizverses.pages.dev/category-casual-3.html)
- [PET DOCTOR BUSINESS TYCOON PET CARE GAME](https://learnquester.pages.dev/pet-doctor-business-tycoon-pet-care-game.html)
- [SHIP CONTROL 3D](https://themindzone.pages.dev/ship-control-3d.html)
- [CAKE MERGE 2](https://themindzone.pages.dev/cake-merge-2.html)
- [LAQUEUS ESCAPE CHAPTER III](https://thelearnquester.web.app/laqueus-escape-chapter-iii.html)
- [CELEBRITY SPRING FASHION TRENDS](https://thequizzone.pages.dev/celebrity-spring-fashion-trends.html)
- [INDEX21](https://quizverses-9d2f2.web.app/index21.html)
- [CATEGORY UNBLOCKED WEBSITES](https://learnquester.pages.dev/category-unblocked-websites.html)
- [OBBY RAINBOW TOWER](https://learnquester.pages.dev/obby-rainbow-tower.html)
- [SUPER SLIME](https://quizverses.github.io/super-slime.html)
- [TRAFFIC RUN PUZZLE](https://thelearnquester.web.app/traffic-run-puzzle.html)
- [STICKMAN DUO ESCAPE THE TOMB](https://thequizzone.pages.dev/stickman-duo-escape-the-tomb.html)
- [MUKI WIZARD](https://thelearnquester.web.app/muki-wizard.html)
- [GOD OF LIGHT](https://learnquester.pages.dev/god-of-light.html)
- [SCREAMALS](https://thelearnquesters.pages.dev/screamals.html)
- [CATEGORY TITANIUM NETWORK](https://studyquests.github.io/category-titanium-network.html)
- [STELLAR FUSION](https://quizverses.github.io/stellar-fusion.html)
- [HOLE AND FILL COLLECT MASTER](https://quizverses-9d2f2.web.app/hole-and-fill-collect-master.html)
- [HERO PIPE](https://thelearnquester.web.app/hero-pipe.html)
- [JUMPING FISH RAGDOLL 3D](https://thelearnquesters.pages.dev/jumping-fish-ragdoll-3d.html)
- [BUBBLE RACE PARTY](https://learnquester.pages.dev/bubble-race-party.html)
- [RED LIGHT GREEN LIGHT](https://studyquesthub.web.app/red-light-green-light.html)
- [CATEGORY MOUSE1 707](https://studyquesthub.web.app/category-mouse1-707.html)
- [BOYFRIEND FOR HIRE](https://quizverses.github.io/boyfriend-for-hire.html)
- [DRAW ONE PART BRAIN PUZZLE](https://thelearnquesters.pages.dev/draw-one-part-brain-puzzle.html)
- [SAUSAGE FLIP FREE](https://thelearnquester.web.app/sausage-flip-free.html)
- [BLACKRIVER MYSTERY HIDDEN OBJECTS](https://quizverses-9d2f2.web.app/blackriver-mystery-hidden-objects.html)
- [RUSSIAN DERBY CRASH](https://thequizzone.pages.dev/russian-derby-crash.html)
- [HEXA TILE MASTER](https://thelearnquesters.pages.dev/hexa-tile-master.html)
- [CATEGORY SHOOTER 2](https://theskillquest.pages.dev/category-shooter-2.html)
- [ARROW CUBE ESCAPE](https://themindzone.pages.dev/arrow-cube-escape.html)
- [ZUMBA STORY](https://quizverses-9d2f2.web.app/zumba-story.html)
- [TAILOR STYLIST FASHION DIARY](https://thequizzone.pages.dev/tailor-stylist-fashion-diary.html)
- [CATEGORY SPEED158](https://studyquesthub.web.app/category-speed158.html)
- [CATEGORY PLATFORM260](https://thelearnquesters.pages.dev/category-platform260.html)
- [HAPPY FARM THE CROP](https://quizverses-9d2f2.web.app/happy-farm-the-crop.html)
- [INDEX2](https://quizverses-9d2f2.web.app/index2.html)
- [WIRED CHICKEN INC](https://quizverses.pages.dev/wired-chicken-inc.html)
- [CATEGORY MINING75](https://studyquesthub.web.app/category-mining75.html)
- [HIDDEN OBJECT FARM ADVENTURE](https://thelearnquesters.pages.dev/hidden-object-farm-adventure.html)
- [HORROR MINECRAFT PARTYTIME](https://themindzone.pages.dev/horror-minecraft-partytime.html)
- [CATEGORY CASUAL 4](https://thelearnquesters.pages.dev/category-casual-4.html)
- [FISHING CATCH THE SECRET BRAINROT](https://thequizzone.pages.dev/fishing-catch-the-secret-brainrot.html)
- [CATEGORY PUZZLE 8](https://iskillquest.pages.dev/category-puzzle-8.html)
- [CATEGORY POKI](https://theskillquest.pages.dev/category-poki.html)
- [HAPPY TOWN](https://themindzone.pages.dev/happy-town.html)
- [HUNGRY NOOB CAFE SIMULATOR](https://learnquesters.pages.dev/hungry-noob-cafe-simulator.html)
- [CATEGORY MONSTER](https://studyquesthub.web.app/category-monster.html)
- [HEXA ARROWS PUZZLE](https://thelearnquesters.pages.dev/hexa-arrows-puzzle.html)
- [INDEX2](https://thelearnquesters.pages.dev/index2.html)
- [BUBBLE BLASTERS](https://quizverses.github.io/bubble-blasters.html)
- [FREDDYS NIGHTMARES RETURN HORROR NEW YEAR](https://themindzone.pages.dev/freddys-nightmares-return-horror-new-year.html)
- [CATEGORY SPORTS](https://studyquests.github.io/category-sports.html)
- [ITALIAN BRAINROT JIGSAW](https://themindzone.pages.dev/italian-brainrot-jigsaw.html)
- [ARROW ESCAPE MASTER](https://quizverses.github.io/arrow-escape-master.html)
- [COLOR YARN SORT](https://quizverses.github.io/color-yarn-sort.html)
- [DREAM ROOM MAKEOVER](https://thelearnquesters.pages.dev/dream-room-makeover.html)
- [JELLY TOWER CRUSH](https://learnquester.pages.dev/jelly-tower-crush.html)
- [CATEGORY ART](https://studyquests.github.io/category-art.html)
- [HIDDEN OBJECT STREET OF SECRETS](https://learnquesters.pages.dev/hidden-object-street-of-secrets.html)
- [FOOD SORT PUZZLE](https://themindzone.pages.dev/food-sort-puzzle.html)
- [LAZY DOG](https://quizverses.github.io/lazy-dog.html)
- [SNAKE PUZZLE ESCAPE](https://thelearnquesters.pages.dev/snake-puzzle-escape.html)
- [CATEGORY THINKY 2](https://learnquester.pages.dev/category-thinky-2.html)
- [SOKOBAN PR](https://thequizzone.pages.dev/sokoban-pr.html)
- [INDEX10](https://quizverses-9d2f2.web.app/index10.html)
- [RESCUE SHARP TURN](https://themindzone.pages.dev/rescue-sharp-turn.html)
- [CATEGORY SOLITAIRE27](https://learnquester.pages.dev/category-solitaire27.html)
- [POKE THE PRESIDENTS](https://thequizzone.pages.dev/poke-the-presidents.html)
- [SWORD AND SPIN](https://studyquests.github.io/sword-and-spin.html)
- [HAZMOB FPS](https://thequizzone.pages.dev/hazmob-fps.html)
- [SLENDER BOY ESCAPE ROBBIE](https://studyquests.github.io/slender-boy-escape-robbie.html)
- [GRASS LAND](https://studyquests.github.io/grass-land.html)
- [CATEGORY CONTROLLER](https://quizverses.pages.dev/category-controller.html)
- [GT FORMULA CHAMPIONSHIP](https://thequizzone.pages.dev/gt-formula-championship.html)
- [WOODOKU BLOCK PUZZLE](https://quizverses.github.io/woodoku-block-puzzle.html)
