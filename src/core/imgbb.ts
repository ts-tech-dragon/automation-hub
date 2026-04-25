import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import { ENV_VARS } from "../../lib/constants/index.js";

const apiKey = ENV_VARS.IMGBB_API_KEY;

export async function uploadToImgBB(filePath: string) {
  const form = new FormData();
  form.append("image", fs.createReadStream(filePath));

  // Get a free key from https://api.imgbb.com/
  const res = await axios.post(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    form,
    {
      headers: form.getHeaders(),
    },
  );

  // CRUCIAL: Use 'display_url' or 'url', not the viewer link!
  return res.data.data.url;
}

export async function uploadBufferToImgBB(
  imageBuffer: Buffer,
): Promise<string> {
  // ImgBB requires the image to be a Base64 string for this method
  const base64Image = imageBuffer.toString("base64");

  const formData = new URLSearchParams();
  formData.append("image", base64Image);

  try {
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData,
    );
    return response.data.data.url;
  } catch (err) {
    console.error("❌ ImgBB Upload Failed:", err);
    throw err;
  }
}
