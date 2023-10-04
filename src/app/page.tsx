"use client";
// Regions plugin

import { createElement, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Regions from "wavesurfer.js/dist/plugins/regions";
import Envelope from "wavesurfer.js/dist/plugins/envelope";
import {
  applyEnvelopeToAudio,
  bufferToWave,
  copy,
  copyBuffer,
  createBuffer,
  cut2,
  paste,
  removeRegion,
  replace,
} from "src/utils/audioFn";
// Create an instance of WaveSurfer

// Loop a region on click
var ws;
var wsRegions;
var envelope;

// Give regions a random color when they are created
const random = (min, max) => Math.random() * (max - min) + min;
const randomColor = () =>
  `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

export default function Home() {
  const [loop, setLoop] = useState(true);
  const waveForm = useRef(null);
  const [range, setRange] = useState(0);
  const [activeRegion, setActiveRegion] = useState(null);
  const [removedFromAudio, setRemovedFromAudio] = useState();
  const [cutEpisodes, setCutEpisodes] = useState([]);
  const [copiedEpisodes, setCopiedEpisodes] = useState([]);

  useEffect(() => {
    if (waveForm.current) {
      ws = WaveSurfer.create({
        container: waveForm.current,
        waveColor: "rgb(200, 0, 200)",
        progressColor: "rgb(100, 0, 100)",
      });

      // "/assets/audio/african-queen-the-paintress-empire-ft-elizabeth-louis (1).mp3"
      fetch(
        "/assets/audio/african-queen-the-paintress-empire-ft-elizabeth-louis (1).mp3"
      ).then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        // Create a Blob providing as first argument a typed array with the file buffer
        var blob = new window.Blob([new Uint8Array(arrayBuffer)]);

        // Load the blob into Wavesurfer
        ws.loadBlob(blob);
        // return response.arrayBuffer();
      });

      // ws.load("");
      ws.on("ready", function () {
        ws.play();
      });

      const isMobile = top
        ? top.matchMedia("(max-width: 900px)").matches
        : true;
      envelope = ws.registerPlugin(
        Envelope.create({
          volume: 0.8,
          lineColor: "rgba(255, 0, 0, 0.5)",
          lineWidth: "4",
          dragPointSize: isMobile ? 20 : 12,
          dragLine: !isMobile,
          dragPointFill: "rgba(0, 255, 255, 0.8)",
          dragPointStroke: "rgba(0, 0, 0, 0.5)",

          points: [
            { time: 11.2, volume: 0 },
            { time: 15.5, volume: 0.3 },
          ],
        })
      );

      // Initialize the Regions plugin
      wsRegions = ws.registerPlugin(Regions.create());
      // const isMobile = top.matchMedia('(max-width: 900px)').matches

      // Create some regions at specific time ranges
      wsRegions.addRegion({
        start: 0.45,
        end: Math.min(10),
        content: "hwll",
        color: "rgba(220, 31, 244, 0.5)",
        drag: true,
        resize: true,
      });

      wsRegions.enableDragSelection({
        color: "red",
      });

      wsRegions.on("region-updated", (region) => {
        // setActiveRegion(region);
        console.log("Updated region", region);
      });
      // Toggle looping with a checkbox
      {
        var looped = loop;
        document.querySelector(".loop-clip").onclick = (e) => {
          looped = e.target.checked;
        };

        let activeRegionHolder: any = activeRegion;
        wsRegions.on("region-in", (region) => {
          setActiveRegion(region);
        });
        wsRegions.on("region-out", (region) => {
          setActiveRegion(region);
          if (activeRegionHolder === region) {
            if (looped) {
              region.play();
            } else {
              activeRegionHolder = null;
              // setActiveRegion(null);
            }
          }
        });
        wsRegions.on("region-clicked", (region, e) => {
          e.stopPropagation(); // prevent triggering a click on the waveform
          activeRegionHolder = region;
          setActiveRegion(region);
          region.play();
          region.setOptions({ color: randomColor() });
        });
        // Reset the active region when the user clicks anywhere in the waveform
        ws.on("interaction", () => {
          activeRegionHolder = null;
          // setActiveRegion(null);
        });
      }
    }
  }, []);

  //set zoom on initial render
  useEffect(() => {
    ws.on("ready", function () {
      const minPxPerSec = Number(range);
      ws.zoom(minPxPerSec);
    });
  }, [ws, range]);

  // Update the zoom level on slider change
  function handleRange(e) {
    setRange(e.target.value);
    const minPxPerSec = Number(e.target.value);
    ws.zoom(minPxPerSec);
  }

  function handlePlay(e) {
    if (ws) {
      ws.playPause();
    }
  }
  function handlePause(e) {
    if (ws) {
      ws.playPause();
    }
  }

  function handleCut(e) {
    if (activeRegion && ws) {
      const cutOutObj = cut2(activeRegion, ws.getDecodedData());
      const removedRegion = cutOutObj.cutSelectionBuffer;
      // console.log(cutOutObj);
      setRemovedFromAudio(removedRegion);
      setCutEpisodes((prev) => [
        ...prev,
        {
          cutBuffer: cutOutObj.cutSelectionBuffer,
          cutBlob: cutOutObj.cutSelectionBlob,
        },
      ]);
      ws.loadBlob(cutOutObj.newAudioBlob);
    }
  }
  function handleDelete(e) {
    if (activeRegion && ws) {
      const cutOutObj = removeRegion(activeRegion, ws.getDecodedData());
      console.log(cutOutObj.cutSelectionBlob);
      ws.loadBlob(cutOutObj.newAudioBlob);
    }
  }
  function handleCopy(e) {
    if (activeRegion && ws) {
      const copiedRegion = copyBuffer(ws.getDecodedData(), activeRegion);

      setCopiedEpisodes((prev) => [
        ...prev,
        {
          copiedBuffer: copiedRegion.copiedRegionBuffer,
          copiedBlob: copiedRegion.copiedRegionBlob,
        },
      ]);
      const removedRegion = copiedRegion.copiedRegionBuffer;
      // console.log(cutOutObj);
      setRemovedFromAudio(removedRegion);
      // console.log(copiedRegion);
      // ws.loadBlob(copiedRegion);
    }
  }
  async function handlePaste(e) {
    if (activeRegion && ws) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "audio/*";

      const WaveContainer = document.createElement("div");

      const copiedWaves = WaveSurfer.create({
        container: WaveContainer,
        waveColor: "green",
        progressColor: "black",
      });

      fileInput?.addEventListener("change", async (e) => {
        const audioUploaded = fileInput.files["0"];

        await copiedWaves.loadBlob(audioUploaded);

        const pasted = paste(
          ws.getDecodedData(),
          copiedWaves.getDecodedData(),
          activeRegion.start
        );
        ws.loadBlob(pasted);
      });

      fileInput?.click();
    }
  }
  async function handleReplace(e) {
    if (activeRegion && ws) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "audio/*";

      const WaveContainer = document.createElement("div");

      const copiedWaves = WaveSurfer.create({
        container: WaveContainer,
        waveColor: "green",
        progressColor: "black",
      });

      fileInput?.addEventListener("change", async (e) => {
        const audioUploaded = fileInput.files["0"];

        await copiedWaves.loadBlob(audioUploaded);

        const replaced = replace(
          ws.getDecodedData(),
          copiedWaves.getDecodedData(),
          activeRegion,
          activeRegion.start,
          activeRegion.end
        );
        ws.loadBlob(replaced);
      });

      fileInput?.click();
    }
  }

  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  //To show Cut out Clips
  useEffect(() => {
    const cutWaveContainer = document.querySelector(`.wave-container`);

    removeAllChildNodes(cutWaveContainer); //prevent duplicates of cut wave on conainer
    cutEpisodes.forEach((episodesObj, index) => {
      if (cutEpisodes.length > 0) {
        const WaveContainer = document.createElement("div");
        const cutWaves = WaveSurfer.create({
          container: WaveContainer,
          waveColor: "rgb(200, 0, 200)",
          progressColor: "rgb(100, 0, 100)",
        });
        const cutControls = document.createElement("div");
        const url = URL.createObjectURL(episodesObj.cutBlob);

        const a = document.createElement("a");

        a.href = url;
        a.download = `JMT-CUT-${index}`;

        const playPauseBtn = document.createElement("button");
        const downloadBtn = document.createElement("button");
        playPauseBtn.innerHTML = "play/pause";
        downloadBtn.innerHTML = "download";

        playPauseBtn.addEventListener("click", () => {
          cutWaves.playPause();
        });
        downloadBtn.addEventListener("click", () => {
          a.click();
        });

        cutControls.appendChild(playPauseBtn);
        cutControls.appendChild(downloadBtn);

        WaveContainer.appendChild(cutControls);

        cutWaves.loadBlob(episodesObj.cutBlob);

        cutWaveContainer?.appendChild(WaveContainer);
      }
    });
  }, [cutEpisodes]);

  //To show copied out Clips
  useEffect(() => {
    const copyWaveContainer = document.querySelector(`.wave-container-copy`);

    removeAllChildNodes(copyWaveContainer); //prevent duplicates of cut wave on conainer
    copiedEpisodes.forEach((episodesObj, index) => {
      if (copiedEpisodes.length > 0) {
        const WaveContainer = document.createElement("div");
        const copiedWaves = WaveSurfer.create({
          container: WaveContainer,
          waveColor: "rgb(200, 0, 200)",
          progressColor: "rgb(100, 0, 100)",
        });
        const copyControls = document.createElement("div");
        const url = URL.createObjectURL(episodesObj.copiedBlob);

        const a = document.createElement("a");

        a.href = url;
        a.download = `JMT-COPIED-${index}`;

        const playPauseBtn = document.createElement("button");
        const downloadBtn = document.createElement("button");
        playPauseBtn.innerHTML = "play/pause";
        downloadBtn.innerHTML = "download";

        playPauseBtn.addEventListener("click", () => {
          copiedWaves.playPause();
        });
        downloadBtn.addEventListener("click", () => {
          a.click();
        });

        copyControls.appendChild(playPauseBtn);
        copyControls.appendChild(downloadBtn);

        WaveContainer.appendChild(copyControls);

        copiedWaves.loadBlob(episodesObj.copiedBlob);

        copyWaveContainer?.appendChild(WaveContainer);
      }
    });
  }, [copiedEpisodes]);

  const downloadAudio = () => {
    if (ws && envelope) {
      const value = applyEnvelopeToAudio(
        ws.getDecodedData(),
        ws.getDuration(),
        envelope.getPoints()
      );

      const url = URL.createObjectURL(value);

      const a = document.createElement("a");

      a.href = url;
      a.download = `JMT-audio-${"download"}`;
      a.click();
    }
  };

  useEffect(() => {
    // console.log(activeRegion, "trial-active-reaion");
  }, [activeRegion]);

  return (
    <div>
      <div id="waveform" ref={waveForm}></div>
      <input
        type="checkbox"
        checked={loop}
        onChange={() => setLoop(!loop)}
        className="loop-clip"
      />
      <label htmlFor="zoom">
        <input
          name="zoom"
          id="zoom"
          type="range"
          value={range}
          onChange={handleRange}
        />
      </label>
      <button onClick={handlePlay}>play</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={() => console.log(activeRegion)}>
        show Active region
      </button>
      <button onClick={handleCut}>cut audio</button>
      <button onClick={handleDelete}>Delete Region</button>
      <button onClick={handleCopy}>Copy Region</button>
      <button onClick={handlePaste}>Paste</button>
      <button onClick={handleReplace}>Replace</button>
      <button onClick={downloadAudio}>Download</button>

      <div>
        <h1>Cut Episodes</h1>
        <div className="wave-container"></div>
      </div>

      {/* List For Copied Episodes */}
      <div>
        <h1>Copied Episodes</h1>
        <div className="wave-container-copy"></div>
      </div>
    </div>
  );
}
