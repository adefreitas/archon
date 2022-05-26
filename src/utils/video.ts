import ffmpeg from "fluent-ffmpeg";
import {
  INPUT_AUDIO_DIR,
} from "../constants/directories";

export async function generateVideo(
  index: number,
  input: string,
  output: string
) {
  console.log(`Video generation started for asset number ${index} 🏎`);
  return new Promise<void>((resolve) => {
    const handleVideoGenerationFinished = () => {
      console.log(`Video generation finished for asset number ${index} 🏁!`);
      resolve();
    };

    ffmpeg()
      .input(input)
      .input(`${INPUT_AUDIO_DIR}/bliptunes.mp3`)
      .on("end", handleVideoGenerationFinished)
      .save(output);
  });
}
