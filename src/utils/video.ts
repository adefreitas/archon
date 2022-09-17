import ffmpeg from "fluent-ffmpeg";
import {
  INPUT_AUDIO_DIR,
  OUTPUT_FRAMES_DIR,
  OUTPUT_VIDEO_DIR,
} from "../constants/directories";

export async function generateVideo(
  index: number,
  audioPath = `${INPUT_AUDIO_DIR}/bliptunes.mp3`
) {
  console.log(`Video generation started for asset number ${index} 🏎`);
  return new Promise<void>((resolve) => {
    const handleVideoGenerationFinished = () => {
      console.log(`Video generation finished for asset number ${index} 🏁!`);
      resolve();
    };

    ffmpeg()
      .input(`${OUTPUT_FRAMES_DIR}/raw/${index}/${index}_%01d.png`)
      .input(audioPath)
      .fps(25)
      .on("error", (e) => console.log("Error generating video", e))
      .on("end", handleVideoGenerationFinished)
      .videoCodec('libvpx-vp9')
      .audioCodec('libvorbis')
      .output(`${OUTPUT_VIDEO_DIR}/${index}/${index}_output.webm`)
      .duration(8)
      .run();
  });
}
