import axios from "axios";
import { ENV_VARS } from "../../../lib/constants/index.js";
import { uploadToImgBB } from "../imgbb.js";

const IG_ID = ENV_VARS.IG_USER_ID;
const FB_ID = ENV_VARS.FB_PAGE_ID;
const TOKEN = ENV_VARS.FB_USER_TOKEN;

/**
 * 📢 POST TO INSTAGRAM (2-Step Process)
 */
type imageUrl = string;
type content = { caption: string };
async function postToInstagram(imageUrl: imageUrl, caption: content) {
  // Step 1: Create Media Container
  const container = await axios.post(
    `https://graph.facebook.com/v20.0/${IG_ID}/media`,
    {
      image_url: imageUrl,
      caption: caption.caption,
      access_token: TOKEN,
    },
  );

  const creationId = container.data.id;
  console.log("📸 IG Container Created:", creationId);

  // Wait 10 seconds for Meta to process the image
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Step 2: Publish Container
  const publish = await axios.post(
    `https://graph.facebook.com/v20.0/${IG_ID}/media_publish`,
    {
      creation_id: creationId,
      access_token: TOKEN,
    },
  );

  console.log("Publist : ", publish.data);

  return publish.data.id;
}

/**
 * 📘 POST TO FACEBOOK (Direct Upload)
 */
async function postToFacebook(imageUrl: string, caption: string) {
  const userToken = process.env.FB_USER_TOKEN;
  const pageId = process.env.FB_PAGE_ID; // Should be 1056764777524801

  // 1. Get the list of pages this token can actually see
  const response = await axios.get(
    `https://graph.facebook.com/v20.0/me/accounts?access_token=${userToken}`,
  );
  const pages = response.data.data;

  // 2. Find our specific page
  const targetPage = pages.find((p: any) => String(p.id) === String(pageId));

  if (!targetPage) {
    console.error(
      "❌ Available Page IDs:",
      pages.map((p: any) => p.id),
    );
    throw new Error(
      `Facebook Page ID ${pageId} not found in token scope. Check Step 2 above!`,
    );
  }

  // 3. Post using the Page's specific Access Token
  const fbRes = await axios.post(
    `https://graph.facebook.com/v20.0/${pageId}/photos`,
    {
      url: imageUrl,
      caption: caption,
      access_token: targetPage.access_token, // This is the magic key
    },
  );

  return fbRes.data.id;
}

export async function broadcastUpdate(imageUrl: string, caption: string) {
  try {
    console.log("🚀 Debugging Broadcast...");

    // Try Instagram first and LOG EVERYTHING
    const publicURL = await uploadToImgBB(imageUrl);
    console.log("public URL : ", publicURL);
    try {
      // const igId = await postToInstagram(publicURL, caption);
      // console.log("✅ IG SUCCESS ID:", igId);
    } catch (err: any) {
      console.error("❌ IG FAILED:", err.response?.data || err.message);
    }

    // Try Facebook and LOG EVERYTHING
    try {
      const fbId = await postToFacebook(publicURL, caption);
      console.log("✅ FB SUCCESS ID:", fbId);
    } catch (err: any) {
      console.error("❌ FB FAILED:", err.response?.data || err.message);
    }
  } catch (error) {
    console.log("Error : ", (error as Error).message);
  }
}
