# Tone.js

[English](README.md) | **繁體中文**

[![codecov](https://codecov.io/gh/Tonejs/Tone.js/branch/dev/graph/badge.svg)](https://codecov.io/gh/Tonejs/Tone.js)

Tone.js 是一個用於在瀏覽器中創作互動式音樂的 Web Audio 框架。Tone.js 的架構旨在讓音樂人和撰寫基於 Web 的音訊應用的音訊程式設計師都感到熟悉。在高層面上，Tone 提供了常見的 DAW（數位音訊工作站）功能，例如用於同步和排程事件的全域 transport，以及預置的合成器和效果器。此外，Tone 還提供高效能的建構模組，用於建立你自己的合成器、效果器和複雜的控制訊號。

- [API](https://tonejs.github.io/docs/)
- [範例](https://tonejs.github.io/examples/)

# 安裝

有兩種方式將 Tone.js 整合到專案中。首先，可以使用 `npm` 將其安裝到本機專案中：

```bash
npm install tone      // 安裝最新的穩定版本
npm install tone@next // 或者使用 'next' 版本
```

使用 JavaScript 的 `import` 語法將 Tone.js 加入專案中：

```js
import * as Tone from "tone";
```

# Hello Tone

```javascript
//建立一個合成器並將其連接到主輸出（你的喇叭）
const synth = new Tone.Synth().toDestination();

//播放一個八分音符長度的中音 'C'
synth.triggerAttackRelease("C4", "8n");
```

## Tone.Synth

`Tone.Synth` 是一個帶有單一振盪器和 ADSR 封包的基礎合成器。

### triggerAttack / triggerRelease

`triggerAttack` 啟動音符（振幅上升），`triggerRelease` 讓振幅回到 0（即**音符關閉**）。

```javascript
const synth = new Tone.Synth().toDestination();
const now = Tone.now();
// 立即觸發起音
synth.triggerAttack("C4", now);
// 等待一秒後觸發釋音
synth.triggerRelease(now + 1);
```

### triggerAttackRelease

`triggerAttackRelease` 是 `triggerAttack` 和 `triggerRelease` 的組合。

第一個參數是音符，可以是赫茲為單位的頻率（例如 `440`），也可以是「音高-八度」記法（例如 `"D#2"`）。

第二個參數是音符保持的時長。該值可以是秒數，也可以是[相對於速度的值](https://github.com/Tonejs/Tone.js/wiki/Time)。

`triggerAttackRelease` 的第三個參數（可選）是音符在 AudioContext 時間軸上**何時**播放。它可用於在將來排程事件。

```javascript
const synth = new Tone.Synth().toDestination();
const now = Tone.now();
synth.triggerAttackRelease("C4", "8n", now);
synth.triggerAttackRelease("E4", "8n", now + 0.5);
synth.triggerAttackRelease("G4", "8n", now + 1);
```

## 時間

Web Audio 具備先進的、取樣級精確的排程能力。AudioContext 時間是 Web Audio API 用來排程事件的時間，從頁面載入時的 0 開始，以**秒**為單位遞增。

`Tone.now()` 取得 AudioContext 的目前時間。

```javascript
setInterval(() => console.log(Tone.now()), 100);
```

Tone.js 抽象掉了 AudioContext 時間。任何接受時間作為參數的方法都可以接受數字或字串，而無需把所有值都定義成秒。例如 `"4n"` 是四分音符，`"8t"` 是八分三連音，`"1m"` 是一小節。

[了解時間編碼](https://github.com/Tonejs/Tone.js/wiki/Time)。

# 啟動音訊

**重要**：在使用者點擊某個東西（例如播放按鈕）之前，瀏覽器不會播放**任何**音訊。只有在由使用者操作（如 "click" 或 "keydown"）觸發的事件監聽器中呼叫 `Tone.start()` 之後，才能執行你的 Tone.js 程式碼。

`Tone.start()` 傳回一個 promise，只有在該 promise 完成後音訊才會就緒。在 AudioContext 執行之前排程或播放音訊，會導致靜音或錯誤的排程。

```javascript
//為播放按鈕附加點擊監聽器
document.querySelector("button")?.addEventListener("click", async () => {
	await Tone.start();
	console.log("audio is ready");
});
```

# 排程

## Transport

`Tone.getTransport()` 傳回主時間控制者。與 AudioContext 時鐘不同，它可以隨時啟動、停止、循環和調整。你可以把它想像成數位音訊工作站中的編排檢視。

多個事件和片段可以沿 Transport 編排並同步。`Tone.Loop` 是一種建立循環回呼的簡單方式，可以排程其開始和停止。

```javascript
// 建立兩個單音合成器
const synthA = new Tone.FMSynth().toDestination();
const synthB = new Tone.AMSynth().toDestination();
//每四分音符播放一個音符
const loopA = new Tone.Loop((time) => {
	synthA.triggerAttackRelease("C2", "8n", time);
}, "4n").start(0);
//透過從 "8n" 開始，在每個反拍四分音符上再播放一個音符
const loopB = new Tone.Loop((time) => {
	synthB.triggerAttackRelease("C4", "8n", time);
}, "4n").start("8n");
// 所有循環在 Transport 啟動時開始
Tone.getTransport().start();
// 在 10 秒內將速度提升到 800 bpm
Tone.getTransport().bpm.rampTo(800, 10);
```

由於 JavaScript 回呼**並非精確計時**，事件的取樣級精確時間會作為參數傳入回呼函式。**請使用這個時間值來排程事件**。

# 樂器

有眾多合成器可供選擇，包括 `Tone.FMSynth`、`Tone.AMSynth` 和 `Tone.NoiseSynth`。

這些樂器都是**單音的**（單聲部），這意味著它們一次只能演奏一個音符。

要建立**複音**合成器，請使用 `Tone.PolySynth`，它接受一個單音合成器作為第一個參數，並自動處理音符分配，因此你可以傳入多個音符。其 API 與單音合成器類似，只是 `triggerRelease` 必須傳入一個音符或音符陣列。

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

# 取樣

聲音產生不侷限於合成音色。你還可以載入取樣，並以多種方式回放。`Tone.Player` 是載入和回放音訊檔案的一種方式。

```javascript
const player = new Tone.Player(
	"https://tonejs.github.io/audio/berklee/gong_1.mp3"
).toDestination();
await Tone.loaded();
player.start();
```

`Tone.loaded()` 傳回一個 promise，在**所有**音訊檔案載入完成後兌現。它是一個有用的簡寫，可以替代等待每個音訊緩衝區的 `onload` 事件。

## Tone.Sampler

多個取樣也可以組合成一件樂器。如果你有按音符組織的音訊檔案，`Tone.Sampler` 會對取樣進行移調，以填補音符之間的空隙。因此，例如你只取樣了鋼琴的每三個音，也可以把它變成完整的鋼琴取樣。

與其他合成器不同，Tone.Sampler 是複音的，因此不需要傳入 Tone.PolySynth。

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
await Tone.loaded();
sampler.triggerAttackRelease(["Eb4", "G4", "Bb4"], 4);
```

# 效果器

在上面的範例中，音源總是直接連接到 `Destination`，但合成器的輸出也可以先經過一個（或多個）效果器，再送往喇叭。

```javascript
const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3",
	loop: true,
	autostart: true,
});
//建立一個失真效果器
const distortion = new Tone.Distortion(0.4).toDestination();
//將播放器連接到失真效果器
player.connect(distortion);
```

連線路由是靈活的，連線可以串行或並行。

```javascript
const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/drum-samples/loops/ominous.mp3",
	autostart: true,
});
const filter = new Tone.Filter(400, "lowpass").toDestination();
const feedbackDelay = new Tone.FeedbackDelay(0.125, 0.5).toDestination();

// 將播放器並行連接到回饋延遲和濾波器
player.connect(filter);
player.connect(feedbackDelay);
```

多個節點可以連接到同一個輸入，使音源能夠共享效果器。`Tone.Gain` 是建立複雜路由時有用的工具節點。

# 訊號

與底層的 Web Audio API 一樣，Tone.js 幾乎對一切都有音訊速率訊號控制。這是一個強大的特性，可以實現取樣級精確的同步和參數排程。

`Signal` 屬性有一些內建方法用於建立自動化曲線。

例如，`Oscillator` 上的 `frequency` 參數就是一個 Signal，因此你可以建立從一個頻率到另一個頻率的平滑漸變。

```javascript
const osc = new Tone.Oscillator().toDestination();
// 從 "C4" 開始
osc.frequency.value = "C4";
// 在 2 秒內漸變到 "C2"
osc.frequency.rampTo("C2", 2);
// 啟動振盪器 2 秒
osc.start().stop("+3");
```

# AudioContext

Tone.js 在載入時建立一個 AudioContext，並使用 [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context) 對其進行 shim，以獲得最大的瀏覽器相容性。可以透過 `Tone.getContext` 存取該 AudioContext，或使用 `Tone.setContext(audioContext)` 設定你自己的 AudioContext。

# 效能

Tone.js 大量使用原生 Web Audio 節點（如 GainNode 和 WaveShaperNode）進行所有訊號處理，這使得 Tone.js 在桌面和行動瀏覽器上都能良好運作。

[這篇 wiki](https://github.com/Tonejs/Tone.js/wiki/Performance) 文章提供了一些與效能相關的最佳實務建議。

# 測試

Tone.js 使用 [mocha](https://mochajs.org/) 和 [chai](http://chaijs.com/) 執行一套廣泛的測試，覆蓋率接近 100%。'dev' 分支上通過的建置會以 `tone@next` 發佈到 npm。

# 貢獻

有很多方式可以為 Tone.js 做貢獻。如果你有興趣，請查看[這篇 wiki](https://github.com/Tonejs/Tone.js/wiki/Contributing)。

# 參考與靈感

- [Chris Wilson 的許多倉庫](https://github.com/cwilso)
- [Mohayonao 的許多倉庫](https://github.com/mohayonao)
- [規範](http://webaudio.github.io/web-audio-api/)
- [Sound on Sound - Synth Secrets](http://www.soundonsound.com/sos/may99/articles/synthsec.htm)
- [Miller Puckette - Theory and Techniques of Electronic Music](http://msp.ucsd.edu/techniques.htm)
- [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context)
