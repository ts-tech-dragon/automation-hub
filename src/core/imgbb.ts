import fs from "fs";
import FormData from "form-data";
import axios from "axios";

export async function uploadToImgBB(filePath: string) {
  const form = new FormData();
  form.append("image", fs.createReadStream(filePath));

  // Get a free key from https://api.imgbb.com/
  const res = await axios.post(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    form,
    {
      headers: form.getHeaders(),
    },
  );

  // CRUCIAL: Use 'display_url' or 'url', not the viewer link!
  return res.data.data.url;
}
