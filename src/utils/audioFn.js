var createBufferNew = require("audio-buffer-from");
var toWav = require("audiobuffer-to-wav");

export function paste(buffer, cutSelection, position, length) {
  var originalAudioBuffer = buffer;
  var offlineAudioContext = new OfflineAudioContext(
    1,
    2,
    originalAudioBuffer.sampleRate
  );

  const cutSelectionlength = length || cutSelection.length;

  let cursorPosition = position;
  var newAudioBuffer = offlineAudioContext.createBuffer(
    originalAudioBuffer.numberOfChannels,
    originalAudioBuffer.length + cutSelectionlength,
    originalAudioBuffer.sampleRate
  );

  for (
    var channel = 0;
    channel < originalAudioBuffer.numberOfChannels;
    channel++
  ) {
    var new_channel_data = newAudioBuffer.getChannelData(channel);
    var empty_segment_data = cutSelection.getChannelData(channel);
    var original_channel_data = originalAudioBuffer.getChannelData(channel);

    var before_data = original_channel_data.subarray(
      0,
      cursorPosition * originalAudioBuffer.sampleRate
    );

    var mid_data = empty_segment_data;

    var after_data = original_channel_data.subarray(
      Math.floor(cursorPosition * originalAudioBuffer.sampleRate),
      originalAudioBuffer.length * originalAudioBuffer.sampleRate
    );

    // if(start > 0){

    new_channel_data.set(before_data);
    //Fake
    // new_channel_data.set(empty_segment_data,(cursorPosition * newAudioBuffer.sampleRate));
    new_channel_data.set(mid_data, cursorPosition * newAudioBuffer.sampleRate);
    // new_channel_data.set(
    //   after_data,
    //   cutSelection.length * newAudioBuffer.sampleRate
    // );
    // console.log(cutSelection.length, "length");
    // console.log(cursorPosition + cutSelection.duration, "duration");
    // //real
    new_channel_data.set(
      after_data,
      (cursorPosition + cutSelection.duration) * newAudioBuffer.sampleRate
    );
    // } else {
    //   new_channel_data.set(after_data);
    // }
  }
  var arraybuffer = bufferToWave(newAudioBuffer, 0, newAudioBuffer.length);
  return arraybuffer;
}

export function replace(buffer, cutSelection, region, position, endPosition) {
  var originalAudioBuffer = buffer;
  var offlineAudioContext = new OfflineAudioContext(
    1,
    2,
    originalAudioBuffer.sampleRate
  );

  const regionCopy = copyBuffer(buffer, region);

  const regionCopyBuffer = regionCopy.copiedRegionBuffer;

  const replaceLength = regionCopyBuffer.length - cutSelection.length;

  let newAudioLength;
  if (replaceLength < 0) {
    //length of cutselection is greater than region selected
    newAudioLength = originalAudioBuffer.length + cutSelection.length;
  } else if (replaceLength > 0) {
    //length of cutselection is less than region selected
    newAudioLength = originalAudioBuffer.length - replaceLength;
  } else {
    //length of cutselection is the same size region selected
    newAudioLength = originalAudioBuffer.length;
  }

  let cursorPosition = position;
  var newAudioBuffer = offlineAudioContext.createBuffer(
    originalAudioBuffer.numberOfChannels,
    newAudioLength,
    originalAudioBuffer.sampleRate
  );

  for (
    var channel = 0;
    channel < originalAudioBuffer.numberOfChannels;
    channel++
  ) {
    var new_channel_data = newAudioBuffer.getChannelData(channel);
    var empty_segment_data = cutSelection.getChannelData(channel);
    var original_channel_data = originalAudioBuffer.getChannelData(channel);

    var before_data = original_channel_data.subarray(
      0,
      cursorPosition * originalAudioBuffer.sampleRate
    );
    var mid_data = empty_segment_data;
    // var after_data = original_channel_data.subarray(
    //   Math.floor(cursorPosition * originalAudioBuffer.sampleRate),
    //   originalAudioBuffer.length * originalAudioBuffer.sampleRate
    // );
    var after_data = original_channel_data.subarray(
      Math.floor(endPosition * originalAudioBuffer.sampleRate),
      originalAudioBuffer.length * originalAudioBuffer.sampleRate
    );

    // if(start > 0){

    new_channel_data.set(before_data);
    //Fake
    // new_channel_data.set(empty_segment_data,(cursorPosition * newAudioBuffer.sampleRate));
    new_channel_data.set(mid_data, cursorPosition * newAudioBuffer.sampleRate);
    // new_channel_data.set(
    //   after_data,
    //   cutSelection.length * newAudioBuffer.sampleRate
    // );
    // console.log(cutSelection.length, "length");
    // console.log(cursorPosition + cutSelection.duration, "duration");
    // //real
    new_channel_data.set(
      after_data,
      (cursorPosition + cutSelection.duration) * newAudioBuffer.sampleRate
    );
    // } else {
    //   new_channel_data.set(after_data);
    // }
  }
  var arraybuffer = bufferToWave(newAudioBuffer, 0, newAudioBuffer.length);
  return arraybuffer;
}

// export function cut(params, instance) {
//   /*
//     ---------------------------------------------
//     The function will take the buffer used to create the waveform and will
//     create
//     a new blob with the selected area from the original blob using the
//     offlineAudioContext

//     */

//   // var self = this;
//   var start = params.start;
//   var end = params.end;

//   var originalAudioBuffer = instance.backend.buffer;

//   var lengthInSamples = Math.floor(
//     (end - start) * originalAudioBuffer.sampleRate
//   );
//   if (!window.OfflineAudioContext) {
//     if (!window.webkitOfflineAudioContext) {
//       // $('#output').append('failed : no audiocontext found, change browser');
//       alert("webkit context not found");
//     }
//     window.OfflineAudioContext = window.webkitOfflineAudioContext;
//   }
//   // var offlineAudioContext = new OfflineAudioContext(1, 2,originalAudioBuffer.sampleRate );
//   var offlineAudioContext = instance.backend.ac;

//   var emptySegment = offlineAudioContext.createBuffer(
//     originalAudioBuffer.numberOfChannels,
//     lengthInSamples,
//     originalAudioBuffer.sampleRate
//   );

//   var newAudioBuffer = offlineAudioContext.createBuffer(
//     originalAudioBuffer.numberOfChannels,
//     start === 0
//       ? originalAudioBuffer.length - emptySegment.length
//       : originalAudioBuffer.length,
//     originalAudioBuffer.sampleRate
//   );

//   for (
//     var channel = 0;
//     channel < originalAudioBuffer.numberOfChannels;
//     channel++
//   ) {
//     var new_channel_data = newAudioBuffer.getChannelData(channel);
//     var empty_segment_data = emptySegment.getChannelData(channel);
//     var original_channel_data = originalAudioBuffer.getChannelData(channel);

//     var before_data = original_channel_data.subarray(
//       0,
//       start * originalAudioBuffer.sampleRate
//     );
//     var mid_data = original_channel_data.subarray(
//       start * originalAudioBuffer.sampleRate,
//       end * originalAudioBuffer.sampleRate
//     );
//     var after_data = original_channel_data.subarray(
//       Math.floor(end * originalAudioBuffer.sampleRate),
//       originalAudioBuffer.length * originalAudioBuffer.sampleRate
//     );

//     empty_segment_data.set(mid_data);
//     // this.cutSelection = emptySegment
//     if (start > 0) {
//       new_channel_data.set(before_data);
//       // new_channel_data.set(empty_segment_data,(start * newAudioBuffer.sampleRate));
//       // new_channel_data.set(after_data,(end * newAudioBuffer.sampleRate));
//       new_channel_data.set(after_data, start * newAudioBuffer.sampleRate);
//     } else {
//       new_channel_data.set(after_data);
//     }
//   }
//   return {
//     newAudioBuffer,
//     cutSelection: emptySegment,
//   };
//   /*    instance.loadDecodedBuffer(newAudioBuffer);
//         // instance.loadDecodedBuffer(emptySegment);

//         // var arraybuffer = this.bufferToWave(newAudioBuffer,0,newAudioBuffer.length);//Will create a new Blob with
//         var arraybuffer = this.bufferToWave(emptySegment,0,emptySegment.length);//Will create a new Blob with
//         let url = URL.createObjectURL(arraybuffer)
//         debugger

//     /!*    // Make it downloadable
//         var download_link = document.getElementById("download_link");
//         download_link.href = new_file;
//         var name = generateFileName();
//         download_link.download = name;

//         // Utility to add "compressed" to the uploaded file's name
//         function generateFileName() {
//           var origin_name = fileInput.files[0].name;
//           var pos = origin_name.lastIndexOf('.');
//           var no_ext = origin_name.slice(0, pos);

//           return no_ext + ".compressed.wav";
//         }*!/

//         var audio = new Audio(url);
//         audio.controls = true;
//         audio.volume = 0.5;
//         audio.autoplay = true;
//         //playSound(abuffer);
//         document.body.appendChild(audio);
//         // return (new Blob([arraybuffer], { type : 'audio/wav'}));
//         return emptySegment*/
// }

export function cut2(params, buffer) {
  /*

---------------------------------------------
This function works with wavesurfer.
Make a selection, using wavesurfer api take the start and end.
---------------------------------------------
The function will take the buffer used to create the waveform and will
create
a new blob with the selected area from the original blob using the
offlineAudioContext

-------------------------------------------
This function removes the selected region  leaving  empty space in region in case of paste

*/

  var self = this;
  var start = params.start;
  var end = params.end;

  var originalAudioBuffer;

  originalAudioBuffer = buffer;

  var lengthInSamples = Math.floor(
    (end - start) * originalAudioBuffer.sampleRate
  );

  var offlineAudioContext = new OfflineAudioContext(
    1,
    2,
    originalAudioBuffer.sampleRate
  );
  var new_channel_data,
    empty_segment_data,
    original_channel_data,
    before_data,
    after_data;

  var emptySegment = offlineAudioContext.createBuffer(
    originalAudioBuffer.numberOfChannels,
    lengthInSamples,
    originalAudioBuffer.sampleRate
  );

  var newAudioBuffer = offlineAudioContext.createBuffer(
    originalAudioBuffer.numberOfChannels,
    start === 0
      ? originalAudioBuffer.length - emptySegment.length
      : originalAudioBuffer.length,
    originalAudioBuffer.sampleRate
  );

  for (
    var channel = 0;
    channel < originalAudioBuffer.numberOfChannels;
    channel++
  ) {
    new_channel_data = newAudioBuffer.getChannelData(channel);
    empty_segment_data = emptySegment.getChannelData(channel);
    original_channel_data = originalAudioBuffer.getChannelData(channel);

    before_data = original_channel_data.subarray(
      0,
      start * originalAudioBuffer.sampleRate
    );
    after_data = original_channel_data.subarray(
      Math.floor(end * originalAudioBuffer.sampleRate),
      originalAudioBuffer.length * originalAudioBuffer.sampleRate
    );

    if (start > 0) {
      new_channel_data.set(before_data);
      new_channel_data.set(
        empty_segment_data,
        start * newAudioBuffer.sampleRate
      );
      new_channel_data.set(after_data, end * newAudioBuffer.sampleRate);
    } else {
      new_channel_data.set(after_data);
    }
  }

  var arraybuffer = bufferToWave(newAudioBuffer, 0, newAudioBuffer.length); //Will create a new Blob with the IntArray...
  var cutRegion = bufferToWave(emptySegment, 0, emptySegment.length);

  var getRegionRemoved = copyBuffer(buffer, params);

  return {
    newAudioBlob: arraybuffer,
    cutSelectionBlob: getRegionRemoved.copiedRegionBlob,
    cutSelectionBuffer: getRegionRemoved.copiedRegionBuffer,
    newAudioBuffer: newAudioBuffer,
  };
}

export function removeRegion(params, buffer) {
  /*
---------------------------------------------
This function works with wavesurfer.
Make a selection, using wavesurfer api take the start and end.
---------------------------------------------
The function will take the buffer used to create the waveform and will
create
a new blob with the selected area from the original blob using the
offlineAudioContext

-------------------------------------------
This function removes the selected region with leaving any empty space

*/

  var self = this;
  var start = params.start;
  var end = params.end;

  var originalAudioBuffer;

  originalAudioBuffer = buffer;

  var lengthInSamples = Math.floor(
    (end - start) * originalAudioBuffer.sampleRate
  );

  var offlineAudioContext = new OfflineAudioContext(
    1,
    2,
    originalAudioBuffer.sampleRate
  );
  var new_channel_data,
    empty_segment_data,
    original_channel_data,
    before_data,
    after_data;

  var emptySegment = offlineAudioContext.createBuffer(
    originalAudioBuffer.numberOfChannels,
    lengthInSamples,
    originalAudioBuffer.sampleRate
  );

  var newAudioBuffer = offlineAudioContext.createBuffer(
    originalAudioBuffer.numberOfChannels,
    // start === 0?
    originalAudioBuffer.length - emptySegment.length,
    // : originalAudioBuffer.length,
    originalAudioBuffer.sampleRate
  );

  for (
    var channel = 0;
    channel < originalAudioBuffer.numberOfChannels;
    channel++
  ) {
    new_channel_data = newAudioBuffer.getChannelData(channel);
    empty_segment_data = emptySegment.getChannelData(channel);
    original_channel_data = originalAudioBuffer.getChannelData(channel);

    before_data = original_channel_data.subarray(
      0,
      start * originalAudioBuffer.sampleRate
    );
    after_data = original_channel_data.subarray(
      Math.floor(end * originalAudioBuffer.sampleRate),
      originalAudioBuffer.length * originalAudioBuffer.sampleRate
    );

    if (start > 0) {
      new_channel_data.set(before_data);
      new_channel_data.set(
        empty_segment_data,
        start * newAudioBuffer.sampleRate
      );
      //prevent empty white space
      new_channel_data.set(after_data, start * newAudioBuffer.sampleRate);
      // new_channel_data.set(after_data, end * newAudioBuffer.sampleRate);
    } else {
      new_channel_data.set(after_data);
    }
  }

  var arraybuffer = bufferToWave(newAudioBuffer, 0, newAudioBuffer.length); //Will create a new Blob with the IntArray...
  var cutRegion = bufferToWave(emptySegment, 0, emptySegment.length);

  return {
    newAudioBlob: arraybuffer,
    cutSelectionBlob: cutRegion,
    cutSelectionBuffer: emptySegment,
    newAudioBuffer: newAudioBuffer,
  };
}

// export function copy(region, buffer) {
//   // var selection = instance.getSelection();

//   /*   var original_buffer = instance.backend.buffer;
//        var new_buffer = instance.backend.ac.createBuffer(original_buffer.numberOfChannels, original_buffer.length, original_buffer.sampleRate);

//        var first_list_index = (selection.startPosition * original_buffer.sampleRate);
//        var second_list_index = (selection.endPosition * original_buffer.sampleRate);
//        var second_list_mem_alloc = (original_buffer.length - (selection.endPosition * original_buffer.sampleRate));

//        var new_list = new Float32Array(parseInt(first_list_index));
//        var second_list = new Float32Array(parseInt(second_list_mem_alloc));
//        var combined = new Float32Array(original_buffer.length);

//        original_buffer.copyFromChannel(new_list, 0);
//        original_buffer.copyFromChannel(second_list, 0, second_list_index)

//        combined.set(new_list)
//        combined.set(second_list, first_list_index)

//        new_buffer.copyToChannel(combined, 0);

//        instance.loadDecodedBuffer(new_buffer);*/
//   // }else{
//   //   console.log('did not find selection')
//   // }*/
//   // var segmentDuration = instance.backend.buffer.duration;
//   var segmentDuration = region.end - region.start;

//   var originalBuffer = buffer;

//   var offlineAudioContext = new OfflineAudioContext(
//     1,
//     2,
//     originalBuffer.sampleRate
//   );

//   var emptySegment = offlineAudioContext.createBuffer(
//     originalBuffer.numberOfChannels,
//     segmentDuration * originalBuffer.sampleRate,
//     originalBuffer.sampleRate
//   );
//   for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
//     var chanData = originalBuffer.getChannelData(i);
//     var emptySegmentData = emptySegment.getChannelData(i);
//     var mid_data = chanData.subarray(
//       region.start * originalBuffer.sampleRate,
//       region.end * originalBuffer.sampleRate
//     );
//     emptySegmentData.set(mid_data);
//   }
//   /*// this.cutSelection = emptySegment
//     // emptySegment; // Here you go! Not empty anymore, contains a copy of the segment!
//     // instance.loadDecodedBuffer(emptySegment);

//     var arraybuffer = this.bufferToWave(emptySegment,0,emptySegment.length);//Will create a new Blob with
//     let url = URL.createObjectURL(arraybuffer)
//     debugger

//     var audio = new Audio(url);
//     audio.controls = true;
//     audio.volume = 0.5;
//     audio.autoplay = true;
//     //playSound(abuffer);
//     document.body.appendChild(audio);
//     */

//   var arraybuffer = bufferToWave(emptySegment, 0, emptySegment.length); //Will create a new Blob with
//   return { copiedRegionBlob: arraybuffer, copiedRegionBuffer: emptySegment };
// }

// export function bufferToWave(abuffer, offset, len) {
//   var numOfChan = abuffer.numberOfChannels,
//     length = len * numOfChan * 2 + 44,
//     buffer = new ArrayBuffer(length),
//     view = new DataView(buffer),
//     channels = [],
//     i,
//     sample,
//     pos = 0;

//   // write WAVE header
//   setUint32(0x46464952); // "RIFF"
//   setUint32(length - 8); // file length - 8
//   setUint32(0x45564157); // "WAVE"

//   setUint32(0x20746d66); // "fmt " chunk
//   setUint32(16); // length = 16
//   setUint16(1); // PCM (uncompressed)
//   setUint16(numOfChan);
//   setUint32(abuffer.sampleRate);
//   setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
//   setUint16(numOfChan * 2); // block-align
//   setUint16(16); // 16-bit (hardcoded in this demo)

//   setUint32(0x61746164); // "data" - chunk
//   setUint32(length - pos - 4); // chunk length

//   // write interleaved data
//   for (i = 0; i < abuffer.numberOfChannels; i++)
//     channels.push(abuffer.getChannelData(i));

//   while (pos < length) {
//     for (i = 0; i < numOfChan; i++) {
//       // interleave channels
//       sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
//       sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
//       view.setInt16(pos, sample, true); // update data chunk
//       pos += 2;
//     }
//     offset++; // next source sample
//   }

//   // create Blob
//   return new Blob([new Uint8Array(buffer)], { type: "audio/wav" });

//   function setUint16(data) {
//     view.setUint16(pos, data, true);
//     pos += 2;
//   }

//   function setUint32(data) {
//     view.setUint32(pos, data, true);
//     pos += 4;
//   }
// }

export function bufferToWave(abuffer, offset, len) {
  // console.log("hi");
  // var test = createBufferNew(abuffer, abuffer.sampleRate);
  var test = toWav(abuffer);
  // console.log(test);
  return new Blob([test], { type: "audio/wav" });
}

export function applyEnvelopeToAudio(abuffer, wsDuration, envelopePoints) {
  //The function loops through the audio length and generate volume for each position of the audio time depending on the evelope points passed in.
  //-------------
  //this function takes alot of computational resource expectially for long audios might be wise to run in a web worker

  const totalDuration = wsDuration;
  const audioLength = abuffer.length;
  // const audioLength = 2000;
  const numberOfChannels = abuffer.numberOfChannels;
  let newVolumesForAudio = [];
  var Y_initial = 0; //refrence gradient intial volume
  var X_initial = 0; // reference gradient intial time
  var Y_final; //reference gradient final volume
  var X_final; // reference graadient final volume
  var gradient; // gradient obtained from x_initial, x_final, y_initial, y_final

  console.log(envelopePoints);
  // console.log(abuffer.getChannelData(2));
  for (let i = 0; i < audioLength; i++) {
    const time = (i / audioLength) * totalDuration;

    const newValues = generateGraphPoints(
      time,
      envelopePoints,
      X_final,
      Y_final,
      X_initial,
      Y_initial,
      totalDuration
    );
    X_initial = newValues.X_initial;
    X_final = newValues.X_final;
    Y_final = newValues.Y_final;
    Y_initial = newValues.Y_initial;

    gradient = (Y_final - Y_initial) / (X_final - X_initial);

    let volumeOfCurrentTime = Y_initial + gradient * (time - X_initial);
    newVolumesForAudio.push(volumeOfCurrentTime < 0 ? 0 : volumeOfCurrentTime);

    // console.log(newVolumesForAudio);
  }

  console.log("round 2");
  //Mutate audio float data to change audio volume
  for (let i = 0; i < numberOfChannels; i++) {
    const channel = abuffer.getChannelData(i);

    for (let i = 0; i < audioLength; i++) {
      channel[i] *= newVolumesForAudio[i];
    }
  }
  console.log("finished");
  return bufferToWave(abuffer);
}

function generateGraphPoints(
  currentTime,
  envelopePoints,
  X_final,
  Y_final,
  X_initial,
  Y_initial,
  totalDuration
) {
  for (let i = 0; i < envelopePoints.length; i++) {
    if (Math.floor(currentTime) < Math.floor(envelopePoints[i].time)) {
      X_final = envelopePoints[i].time;
      Y_final = envelopePoints[i].volume;
      X_initial = X_initial;
      Y_initial = Y_initial;
      return {
        X_final,
        Y_final,
        X_initial,
        Y_initial,
      };
    } else if (Math.floor(currentTime) === Math.floor(envelopePoints[i].time)) {
      // console.log("hi");
      if (envelopePoints[i + 1]) {
        X_initial = envelopePoints[i].time;
        Y_initial = envelopePoints[i].volume;

        X_final = envelopePoints[i + 1].time;
        Y_final = envelopePoints[i + 1].volume;
        return {
          X_final,
          Y_final,
          X_initial,
          Y_initial,
        };
      } else {
        // console.log("me");
        X_initial = envelopePoints[i].time;
        Y_initial = envelopePoints[i].volume;

        X_final = totalDuration;
        Y_final = 0;
        return {
          X_final,
          Y_final,
          X_initial,
          Y_initial,
        };
      }
    }
  }

  // console.log(Y_initial, X_initial, "initial", currentTime);
  // console.log(Y_final, X_final, "final", currentTime);
  return {
    X_final,
    Y_final,
    X_initial,
    Y_initial,
  };
}

// export function buffer2wav(audioBuffer) {
//   const [left, right] = [
//     audioBuffer.getChannelData(0),
//     audioBuffer.getChannelData(1),
//   ];

//   // interleaved
//   const interleaved = new Float32Array(left.length + right.length);
//   for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
//     interleaved[dst] = left[src];
//     interleaved[dst + 1] = right[src];
//   }

//   // get WAV file bytes and audio params of your audio source
//   const wavBytes = getWavBytes(interleaved.buffer, {
//     isFloat: true, // floating point or 16-bit integer
//     numChannels: 2,
//     sampleRate: 48000,
//   });

//   return wavBytes;
//   // const wav = new Blob([wavBytes], { type: "audio/wav" });

//   // // create download link and append to Dom
//   // const downloadLink = document.createElement("a");
//   // downloadLink.href = URL.createObjectURL(wav);
//   // downloadLink.setAttribute("download", "my-audio.wav");
// }

// export function getWavBytes(buffer, options) {
//   const type = options.isFloat ? Float32Array : Uint16Array;
//   const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;

//   const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }));
//   const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

//   // prepend header, then add pcmBytes
//   wavBytes.set(headerBytes, 0);
//   wavBytes.set(new Uint8Array(buffer), headerBytes.length);

//   return wavBytes;
// }

// // adapted from https://gist.github.com/also/900023
// // returns Uint8Array of WAV header bytes
// export function getWavHeader(options) {
//   const numFrames = options.numFrames;
//   const numChannels = options.numChannels || 2;
//   const sampleRate = options.sampleRate || 44100;
//   const bytesPerSample = options.isFloat ? 4 : 2;
//   const format = options.isFloat ? 3 : 1;

//   const blockAlign = numChannels * bytesPerSample;
//   const byteRate = sampleRate * blockAlign;
//   const dataSize = numFrames * blockAlign;

//   const buffer = new ArrayBuffer(44);
//   const dv = new DataView(buffer);

//   let p = 0;

//   function writeString(s) {
//     for (let i = 0; i < s.length; i++) {
//       dv.setUint8(p + i, s.charCodeAt(i));
//     }
//     p += s.length;
//   }

//   function writeUint32(d) {
//     dv.setUint32(p, d, true);
//     p += 4;
//   }

//   function writeUint16(d) {
//     dv.setUint16(p, d, true);
//     p += 2;
//   }

//   writeString("RIFF"); // ChunkID
//   writeUint32(dataSize + 36); // ChunkSize
//   writeString("WAVE"); // Format
//   writeString("fmt "); // Subchunk1ID
//   writeUint32(16); // Subchunk1Size
//   writeUint16(format); // AudioFormat https://i.stack.imgur.com/BuSmb.png
//   writeUint16(numChannels); // NumChannels
//   writeUint32(sampleRate); // SampleRate
//   writeUint32(byteRate); // ByteRate
//   writeUint16(blockAlign); // BlockAlign
//   writeUint16(bytesPerSample * 8); // BitsPerSample
//   writeString("data"); // Subchunk2ID
//   writeUint32(dataSize); // Subchunk2Size

//   return new Uint8Array(buffer);
// }

export function createBuffer(originalBuffer, duration) {
  var sampleRate = originalBuffer.sampleRate;
  var frameCount = duration * sampleRate;
  var channels = originalBuffer.numberOfChannels;
  return new AudioContext().createBuffer(channels, frameCount, sampleRate);
}

export function copyBuffer(wsBuffer, region, toStart = 0) {
  const fromStart = region.start;
  const fromEnd = region.end;
  const fromBuffer = wsBuffer;
  let toBuffer = createBuffer(wsBuffer, fromEnd - fromStart);
  //--------------------
  var sampleRate = fromBuffer.sampleRate;
  var frameCount = (fromEnd - fromStart) * sampleRate;
  for (var i = 0; i < fromBuffer.numberOfChannels; i++) {
    var fromChanData = fromBuffer.getChannelData(i);
    var toChanData = toBuffer.getChannelData(i);
    for (
      var j = 0,
        f = Math.round(fromStart * sampleRate),
        t = Math.round(toStart * sampleRate);
      j < frameCount;
      j++, f++, t++
    ) {
      toChanData[t] = fromChanData[f];
    }
  }

  const copiedBlob = bufferToWave(toBuffer, 0, toBuffer.length);

  return {
    copiedRegionBlob: copiedBlob,
    copiedRegionBuffer: toBuffer,
  };
}
