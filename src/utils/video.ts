import ffmpeg from "fluent-ffmpeg";
import { INPUT_AUDIO_DIR, OUTPUT_FRAMES_DIR, OUTPUT_VIDEO_DIR } from "../constants/directories";

export async function generateVideo(
  index: number,
) {
  console.log(`Video generation started for asset number ${index} 🏎`);
  return new Promise<void>((resolve) => {
    const handleVideoGenerationFinished = () => {
      console.log(`Video generation finished for asset number ${index} 🏁!`);
      resolve();
    };

    ffmpeg()
      .input(`${OUTPUT_FRAMES_DIR}/raw/${index}/${index}_%01d.png`)
      .input(`${INPUT_AUDIO_DIR}/bliptunes.mp3`)
      .on("end", handleVideoGenerationFinished)
      .save(`${OUTPUT_VIDEO_DIR}/${index}/${index}_output.webm`);
  });
}
