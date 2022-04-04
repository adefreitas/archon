import * as ffmpeg from "fluent-ffmpeg";
import { OUTPUT_DIR, TEMP_DIR } from "../constants/directories";

export async function generateVideo() {
  console.log("Video generation started 🏎");
  ffmpeg()
    .input(`./${TEMP_DIR}/output%01d.png`)
    .loop(5)
    .fps(5)
    .on('end', () => { console.log("Video generation finished 🏁!") })
    .save(`./${OUTPUT_DIR}/output.webm`);
}
