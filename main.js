const ytdl = require('ytdl-core');
const fs = require('fs');
const clear = require('console-clear');
const path = require('path');

const videoURL = 'https://youtu.be/WQq98YPV8yk?si=MZGTqbeoYxQirEtp';

const updateFrequency = 1; // Update progress every 1%

const downloadVideo = async (url) => {
  try {
    const info = await ytdl.getBasicInfo(url);
    const videoName = `${info.videoDetails.title}.mp4`;
    const video = ytdl(url, {
      quality: 'highest'
    });

    const writeStream = fs.createWriteStream(videoName);

    let downloadedBytes = 0;
    let lastUpdate = 0;

    video.pipe(writeStream);

    video.on('progress', (_, downloaded, total) => {
      downloadedBytes = downloaded;

      // Calculate the percentage downloaded
      const percentage = (downloaded / total * 100).toFixed(2);

      // Check if it's time to update (every 1%)
      if (downloaded - lastUpdate > (updateFrequency / 100) * total) {
        lastUpdate = downloaded;

        // Delay before updating the progress
        setTimeout(() => {
          console.clear();
          console.log(`Video: ${info.videoDetails.title}`);
          console.log(`Downloaded: ${percentage}%`);
          console.log(`Video Size: ${(total / (1024 * 1024)).toFixed(2)} MB`);
        }, 100); // Delay in milliseconds
      }
    });

    video.on('end', () => {
      const outputPath = `${videoName}_converted.mp4`;

      const { exec } = require('child_process');
      const ffmpegPath = 'C:/ffmpeg-n6.0-162-g07e3223dd0-win64-gpl-6.0/bin/ffmpeg.exe'; // Replace with the actual path to your FFmpeg executable
      const ffmpegProcess = exec(`"${ffmpegPath}" -i "${videoName}" -c:v copy -c:a aac "${outputPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error converting video: ${error}`);
        } else {
          clear();
          console.log(`Video downloaded successfully to ${outputPath}.`);
        }
      });

      ffmpegProcess.stdout.on('data', (data) => {
        // Parse the output to find the percentage progress
        const progressMatch = data.match(/(\d+(\.\d+)?%)/);
        if (progressMatch) {
          const progress = progressMatch[0];
          console.clear();
          console.log(`Video: ${info.videoDetails.title}`);
          console.log(`Downloaded: 100.00%`);
          console.log(`Video Size: ${(downloadedBytes / (1024 * 1024)).toFixed(2)} MB`);
          console.log(`Conversion Progress: ${progress}`);
        }
      });
    });

    video.on('error', (err) => {
      console.error('Error downloading video:', err);
    });
  } catch (err) {
    console.error('Error:', err);
  }
};

downloadVideo(videoURL);
