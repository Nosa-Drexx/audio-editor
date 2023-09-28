"use client";
// Regions plugin

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Regions from "wavesurfer.js/dist/plugins/regions";
import Envelope from "wavesurfer.js/dist/plugins/envelope";
import { cut, cut2 } from "src/utils/audioFn";
// Create an instance of WaveSurfer

// Loop a region on click
var ws;
var wsRegions;

// Give regions a random color when they are created
const random = (min, max) => Math.random() * (max - min) + min;
const randomColor = () =>
  `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

export default function Home() {
  const [loop, setLoop] = useState(true);
  const waveForm = useRef(null);
  const [range, setRange] = useState(0);
  const [activeRegion, setActiveRegion] = useState(null);

  useEffect(() => {
    if (waveForm.current) {
      ws = WaveSurfer.create({
        container: waveForm.current,
        waveColor: "rgb(200, 0, 200)",
        progressColor: "rgb(100, 0, 100)",
      });

      fetch("/assets/audio/test-entry-voice.wav").then(async (response) => {
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
      const envelope = ws.registerPlugin(
        Envelope.create({
          volume: 0.8,
          lineColor: "rgba(255, 0, 0, 0.5)",
          lineWidth: "4",
          dragPointSize: isMobile ? 20 : 12,
          dragLine: !isMobile,
          dragPointFill: "rgba(0, 255, 255, 0.8)",
          dragPointStroke: "rgba(0, 0, 0, 0.5)",

          points: [
            { time: 11.2, volume: 0.5 },
            { time: 15.5, volume: 0.8 },
          ],
        })
      );

      // Initialize the Regions plugin
      wsRegions = ws.registerPlugin(Regions.create());
      // const isMobile = top.matchMedia('(max-width: 900px)').matches

      // Create some regions at specific time ranges

      wsRegions.addRegion({
        start: 10,
        end: 64.0204542431507,
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
      console.log(cutOutObj);
      ws.loadBlob(cutOutObj.newAudioBlob);
    }
  }

  useEffect(() => {
    console.log(activeRegion, "trial-active-reaion");
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
    </div>
  );
}
