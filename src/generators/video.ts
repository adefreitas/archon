import ffmpeg from "fluent-ffmpeg";
import {
  INPUT_AUDIO_DIR,
} from "../constants/directories";

export async function generateVideo(
  input: string,
  output: string
) {
  console.log("Video generation started 🏎");
  return new Promise<void>((resolve) => {
    const handleVideoGenerationFinished = () => {
      console.log("Video generation finished 🏁!");
      resolve();
    };

    ffmpeg()
      .input(input)
      .input(`${INPUT_AUDIO_DIR}/bliptunes.mp3`)
      .on("end", handleVideoGenerationFinished)
      .save(output);
  });
}
