export function paste(instance, cutSelection) {
  var offlineAudioContext = instance.backend.ac;
  var originalAudioBuffer = instance.backend.buffer;

  let cursorPosition = instance.getCurrentTime();
  var newAudioBuffer = offlineAudioContext.createBuffer(
    originalAudioBuffer.numberOfChannels,
    originalAudioBuffer.length + cutSelection.length,
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
    // new_channel_data.set(empty_segment_data,(cursorPosition * newAudioBuffer.sampleRate));
    new_channel_data.set(mid_data, cursorPosition * newAudioBuffer.sampleRate);
    // new_channel_data.set(after_data,(cutSelection.length * newAudioBuffer.sampleRate));
    new_channel_data.set(
      after_data,
      (cursorPosition + cutSelection.duration) * newAudioBuffer.sampleRate
    );
    // } else {
    //   new_channel_data.set(after_data);
    // }
  }
  return newAudioBuffer;
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

  return {
    newAudioBlob: arraybuffer,
    cutSelection: cutRegion,
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
    cutSelection: cutRegion,
  };
}

export function copy(region, instance) {
  // var selection = instance.getSelection();

  /*   var original_buffer = instance.backend.buffer;
       var new_buffer = instance.backend.ac.createBuffer(original_buffer.numberOfChannels, original_buffer.length, original_buffer.sampleRate);
  
       var first_list_index = (selection.startPosition * original_buffer.sampleRate);
       var second_list_index = (selection.endPosition * original_buffer.sampleRate);
       var second_list_mem_alloc = (original_buffer.length - (selection.endPosition * original_buffer.sampleRate));
  
       var new_list = new Float32Array(parseInt(first_list_index));
       var second_list = new Float32Array(parseInt(second_list_mem_alloc));
       var combined = new Float32Array(original_buffer.length);
  
       original_buffer.copyFromChannel(new_list, 0);
       original_buffer.copyFromChannel(second_list, 0, second_list_index)
  
       combined.set(new_list)
       combined.set(second_list, first_list_index)
  
       new_buffer.copyToChannel(combined, 0);
  
       instance.loadDecodedBuffer(new_buffer);*/
  // }else{
  //   console.log('did not find selection')
  // }*/
  // var segmentDuration = instance.backend.buffer.duration;
  var segmentDuration = region.end - region.start;

  var originalBuffer = instance.backend.buffer;
  var emptySegment = instance.backend.ac.createBuffer(
    originalBuffer.numberOfChannels,
    segmentDuration * originalBuffer.sampleRate,
    originalBuffer.sampleRate
  );
  for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
    var chanData = originalBuffer.getChannelData(i);
    var emptySegmentData = emptySegment.getChannelData(i);
    var mid_data = chanData.subarray(
      region.start * originalBuffer.sampleRate,
      region.end * originalBuffer.sampleRate
    );
    emptySegmentData.set(mid_data);
  }
  /*// this.cutSelection = emptySegment
    // emptySegment; // Here you go! Not empty anymore, contains a copy of the segment!
    // instance.loadDecodedBuffer(emptySegment);
  
    var arraybuffer = this.bufferToWave(emptySegment,0,emptySegment.length);//Will create a new Blob with
    let url = URL.createObjectURL(arraybuffer)
    debugger
  
    var audio = new Audio(url);
    audio.controls = true;
    audio.volume = 0.5;
    audio.autoplay = true;
    //playSound(abuffer);
    document.body.appendChild(audio);
    */
  return emptySegment;
}

export function bufferToWave(abuffer, offset, len) {
  var numOfChan = abuffer.numberOfChannels,
    length = len * numOfChan * 2 + 44,
    buffer = new ArrayBuffer(length),
    view = new DataView(buffer),
    channels = [],
    i,
    sample,
    pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this demo)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // update data chunk
      pos += 2;
    }
    offset++; // next source sample
  }

  // create Blob
  return new Blob([buffer], { type: "audio/mpeg" });

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
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
