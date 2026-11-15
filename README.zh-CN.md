# Tone.js

**简体中文** | [English](README.md)

[![codecov](https://codecov.io/gh/Tonejs/Tone.js/branch/dev/graph/badge.svg)](https://codecov.io/gh/Tonejs/Tone.js)

Tone.js 是一个用于在浏览器中创作交互式音乐的 Web Audio 框架。Tone.js 的架构旨在让音乐人和编写基于 Web 的音频应用的音频程序员都感到熟悉。在高层面上，Tone 提供了常见的 DAW（数字音频工作站）功能，例如用于同步和调度事件的全局 transport，以及预置的合成器和效果器。此外，Tone 还提供高性能的构建模块，用于创建你自己的合成器、效果器和复杂的控制信号。

- [API](https://tonejs.github.io/docs/)
- [示例](https://tonejs.github.io/examples/)

# 安装

有两种方式将 Tone.js 集成到项目中。首先，可以使用 `npm` 将其安装到本地项目中：

```bash
npm install tone      // 安装最新的稳定版本
npm install tone@next // 或者使用 'next' 版本
```

使用 JavaScript 的 `import` 语法将 Tone.js 添加到项目中：

```js
import * as Tone from "tone";
```

# Hello Tone

```javascript
//创建一个合成器并将其连接到主输出（你的扬声器）
const synth = new Tone.Synth().toDestination();

//播放一个八分音符时长的中音 'C'
synth.triggerAttackRelease("C4", "8n");
```

## Tone.Synth

`Tone.Synth` 是一个带有单个振荡器和 ADSR 包络的基础合成器。

### triggerAttack / triggerRelease

`triggerAttack` 启动音符（振幅上升），`triggerRelease` 让振幅回到 0（即**音符关闭**）。

```javascript
const synth = new Tone.Synth().toDestination();
const now = Tone.now();
// 立即触发起音
synth.triggerAttack("C4", now);
// 等待一秒后触发释音
synth.triggerRelease(now + 1);
```

### triggerAttackRelease

`triggerAttackRelease` 是 `triggerAttack` 和 `triggerRelease` 的组合。

第一个参数是音符，可以是赫兹为单位的频率（例如 `440`），也可以是「音高-八度」记法（例如 `"D#2"`）。

第二个参数是音符保持的时长。该值可以是秒数，也可以是[相对于速度的值](https://github.com/Tonejs/Tone.js/wiki/Time)。

`triggerAttackRelease` 的第三个参数（可选）是音符在 AudioContext 时间轴上**何时**播放。它可用于在将来调度事件。

```javascript
const synth = new Tone.Synth().toDestination();
const now = Tone.now();
synth.triggerAttackRelease("C4", "8n", now);
synth.triggerAttackRelease("E4", "8n", now + 0.5);
synth.triggerAttackRelease("G4", "8n", now + 1);
```

## 时间

Web Audio 具备先进的、采样级精确的调度能力。AudioContext 时间是 Web Audio API 用来调度事件的时间，从页面加载时的 0 开始，以**秒**为单位递增。

`Tone.now()` 获取 AudioContext 的当前时间。

```javascript
setInterval(() => console.log(Tone.now()), 100);
```

Tone.js 抽象掉了 AudioContext 时间。任何接受时间作为参数的方法都可以接受数字或字符串，而无需把所有值都定义成秒。例如 `"4n"` 是四分音符，`"8t"` 是八分三连音，`"1m"` 是一小节。

[了解时间编码](https://github.com/Tonejs/Tone.js/wiki/Time)。

# 启动音频

**重要**：在用户点击某个东西（例如播放按钮）之前，浏览器不会播放**任何**音频。只有在由用户操作（如 "click" 或 "keydown"）触发的事件监听器中调用 `Tone.start()` 之后，才能运行你的 Tone.js 代码。

`Tone.start()` 返回一个 promise，只有在该 promise 完成后音频才会就绪。在 AudioContext 运行之前调度或播放音频，会导致静音或错误的调度。

```javascript
//为播放按钮附加点击监听器
document.querySelector("button")?.addEventListener("click", async () => {
	await Tone.start();
	console.log("audio is ready");
});
```

# 调度

## Transport

`Tone.getTransport()` 返回主时间控制者。与 AudioContext 时钟不同，它可以随时启动、停止、循环和调整。你可以把它想象成数字音频工作站中的编排视图。

多个事件和片段可以沿 Transport 编排并同步。`Tone.Loop` 是一种创建循环回调的简单方式，可以调度其开始和停止。

```javascript
// 创建两个单音合成器
const synthA = new Tone.FMSynth().toDestination();
const synthB = new Tone.AMSynth().toDestination();
//每四分音符播放一个音符
const loopA = new Tone.Loop((time) => {
	synthA.triggerAttackRelease("C2", "8n", time);
}, "4n").start(0);
//通过从 "8n" 开始，在每个反拍四分音符上再播放一个音符
const loopB = new Tone.Loop((time) => {
	synthB.triggerAttackRelease("C4", "8n", time);
}, "4n").start("8n");
// 所有循环在 Transport 启动时开始
Tone.getTransport().start();
// 在 10 秒内将速度提升到 800 bpm
Tone.getTransport().bpm.rampTo(800, 10);
```

由于 JavaScript 回调**并非精确计时**，事件的采样级精确时间会作为参数传入回调函数。**请使用这个时间值来调度事件**。

# 乐器

有众多合成器可供选择，包括 `Tone.FMSynth`、`Tone.AMSynth` 和 `Tone.NoiseSynth`。

这些乐器都是**单音的**（单声部），这意味着它们一次只能演奏一个音符。

要创建**复音**合成器，请使用 `Tone.PolySynth`，它接受一个单音合成器作为第一个参数，并自动处理音符分配，因此你可以传入多个音符。其 API 与单音合成器类似，只是 `triggerRelease` 必须传入一个音符或音符数组。

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

# 采样

声音生成不局限于合成音色。你还可以加载采样，并以多种方式回放。`Tone.Player` 是加载和回放音频文件的一种方式。

```javascript
const player = new Tone.Player(
	"https://tonejs.github.io/audio/berklee/gong_1.mp3"
).toDestination();
await Tone.loaded();
player.start();
```

`Tone.loaded()` 返回一个 promise，在**所有**音频文件加载完成后兑现。它是一个有用的简写，可以替代等待每个音频缓冲区的 `onload` 事件。

## Tone.Sampler

多个采样也可以组合成一件乐器。如果你有按音符组织的音频文件，`Tone.Sampler` 会对采样进行移调，以填补音符之间的空隙。因此，例如你只采样了钢琴的每三个音，也可以把它变成完整的钢琴采样。

与其他合成器不同，Tone.Sampler 是复音的，因此不需要传入 Tone.PolySynth。

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

在上面的示例中，音源总是直接连接到 `Destination`，但合成器的输出也可以先经过一个（或多个）效果器，再送往扬声器。

```javascript
const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3",
	loop: true,
	autostart: true,
});
//创建一个失真效果器
const distortion = new Tone.Distortion(0.4).toDestination();
//将播放器连接到失真效果器
player.connect(distortion);
```

连接路由是灵活的，连接可以串行或并行。

```javascript
const player = new Tone.Player({
	url: "https://tonejs.github.io/audio/drum-samples/loops/ominous.mp3",
	autostart: true,
});
const filter = new Tone.Filter(400, "lowpass").toDestination();
const feedbackDelay = new Tone.FeedbackDelay(0.125, 0.5).toDestination();

// 将播放器并行连接到反馈延迟和滤波器
player.connect(filter);
player.connect(feedbackDelay);
```

多个节点可以连接到同一个输入，使音源能够共享效果器。`Tone.Gain` 是创建复杂路由时有用的工具节点。

# 信号

与底层的 Web Audio API 一样，Tone.js 几乎对一切都有音频速率信号控制。这是一个强大的特性，可以实现采样级精确的同步和参数调度。

`Signal` 属性有一些内置方法用于创建自动化曲线。

例如，`Oscillator` 上的 `frequency` 参数就是一个 Signal，因此你可以创建从一个频率到另一个频率的平滑渐变。

```javascript
const osc = new Tone.Oscillator().toDestination();
// 从 "C4" 开始
osc.frequency.value = "C4";
// 在 2 秒内渐变到 "C2"
osc.frequency.rampTo("C2", 2);
// 启动振荡器 2 秒
osc.start().stop("+3");
```

# AudioContext

Tone.js 在加载时创建一个 AudioContext，并使用 [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context) 对其进行 shim，以获得最大的浏览器兼容性。可以通过 `Tone.getContext` 访问该 AudioContext，或使用 `Tone.setContext(audioContext)` 设置你自己的 AudioContext。

# 性能

Tone.js 大量使用原生 Web Audio 节点（如 GainNode 和 WaveShaperNode）进行所有信号处理，这使得 Tone.js 在桌面和移动浏览器上都能良好工作。

[这篇 wiki](https://github.com/Tonejs/Tone.js/wiki/Performance) 文章提供了一些与性能相关的最佳实践建议。

# 测试

Tone.js 使用 [mocha](https://mochajs.org/) 和 [chai](http://chaijs.com/) 运行一套广泛的测试，覆盖率接近 100%。'dev' 分支上通过的构建会以 `tone@next` 发布到 npm。

# 贡献

有很多方式可以为 Tone.js 做贡献。如果你有兴趣，请查看[这篇 wiki](https://github.com/Tonejs/Tone.js/wiki/Contributing)。

# 参考与灵感

- [Chris Wilson 的许多仓库](https://github.com/cwilso)
- [Mohayonao 的许多仓库](https://github.com/mohayonao)
- [规范](http://webaudio.github.io/web-audio-api/)
- [Sound on Sound - Synth Secrets](http://www.soundonsound.com/sos/may99/articles/synthsec.htm)
- [Miller Puckette - Theory and Techniques of Electronic Music](http://msp.ucsd.edu/techniques.htm)
- [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context)
