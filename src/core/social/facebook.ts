import axios from "axios";
import { ENV_VARS } from "../../../lib/constants/index.js";
import { uploadToImgBB } from "../imgbb.js";
import { sendErrorToDiscord } from "../notifier/discord.js";

const IG_ID = ENV_VARS.IG_USER_ID;
const FB_ID = ENV_VARS.FB_PAGE_ID;
const TOKEN = ENV_VARS.FB_USER_TOKEN;
const THREADS_TOKEN = ENV_VARS.TH_USER_TOKEN;
const THREADS_ID = ENV_VARS.TH_USER_ID;

/**
 * 📢 POST TO INSTAGRAM (2-Step Process)
 */
type imageUrl = string;
type content = { caption: string };
async function postToInstagram(imageUrl: imageUrl, content: content) {
  // Step 1: Create Media Container
  const container = await axios.post(
    `https://graph.facebook.com/v20.0/${IG_ID}/media`,
    {
      image_url: imageUrl,
      caption: content.caption,
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

export async function multiPostToInstagram(
  imageUrls: imageUrl[],
  content: content,
) {
  // STEP 1: Create Child Containers for each image
  const childIds = [];
  for (const url of imageUrls) {
    const container = await axios.post(
      `https://graph.facebook.com/v20.0/${IG_ID}/media`,
      {
        image_url: url,
        is_carousel_item: true, // Crucial: tells IG this is part of a set
        access_token: TOKEN,
      },
    );
    childIds.push(container.data.id);
    console.log(`✅ Child Container Created: ${container.data.id}`);
  }

  // Wait for IG to process child containers (polling is better, but 10s is a start)
  await new Promise((resolve) => setTimeout(resolve, 15000));

  // STEP 2: Create Parent Carousel Container
  const parentContainer = await axios.post(
    `https://graph.facebook.com/v20.0/${IG_ID}/media`,
    {
      media_type: "CAROUSEL",
      children: childIds.join(","), // Comma-separated string of child IDs
      caption: content.caption,
      access_token: TOKEN,
    },
  );

  const carouselId = parentContainer.data.id;
  console.log("📸 Parent Carousel Created:", carouselId);

  // Wait for Parent to process
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // STEP 3: Publish the Carousel
  const publish = await axios.post(
    `https://graph.facebook.com/v20.0/${IG_ID}/media_publish`,
    {
      creation_id: carouselId,
      access_token: TOKEN,
    },
  );

  console.log("Final Post Published:", publish.data.id);
  return publish.data.id;
}

/**
 * 🔲 POST TO Threads (Direct Upload)
 */

export async function postToThreads(imageUrl: imageUrl, content: content) {
  // Step 1: Create Media Container
  const container = await axios.post(
    `https://graph.threads.net/v1.0/${THREADS_ID}/threads`,
    {
      image_url: imageUrl,
      text: content.caption,
      access_token: THREADS_TOKEN,
      media_type: "IMAGE",
    },
  );

  const creationId = container.data.id;
  console.log("📸 Threads Container Created:", creationId);

  // Wait 10 seconds for Meta to process the image
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Step 2: Publish Container
  const publish = await axios.post(
    `https://graph.threads.net/v1.0/${THREADS_ID}/threads_publish`,
    {
      creation_id: creationId,
      access_token: THREADS_TOKEN,
    },
  );

  console.log("Publist : ", publish.data);

  return publish.data.id;
}

export async function multiPostToThreads(
  imageUrls: imageUrl[],
  content: content,
) {
  try {
    // STEP 1: Create Child Containers for each image
    const childIds = [];
    for (const url of imageUrls) {
      const container = await axios.post(
        `https://graph.threads.net/v1.0/${THREADS_ID}/threads`,
        {
          image_url: url,
          media_type: "IMAGE",
          is_carousel_item: true, // Tells Threads this is part of a carousel
          access_token: THREADS_TOKEN,
        },
      );
      childIds.push(container.data.id);
      console.log(`✅ Threads Child Created: ${container.data.id}`);
    }

    // Wait for Threads to process the images
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // STEP 2: Create Parent Carousel Container
    const parentContainer = await axios.post(
      `https://graph.threads.net/v1.0/${THREADS_ID}/threads`,
      {
        media_type: "CAROUSEL",
        children: childIds.join(","), // Comma-separated list of child IDs
        text: content.caption, // Threads uses 'text' instead of 'caption'
        access_token: THREADS_TOKEN,
      },
    );

    const carouselId = parentContainer.data.id;
    console.log("📸 Threads Carousel Parent Created:", carouselId);

    // Wait for Parent to process
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // STEP 3: Publish the Carousel
    const publish = await axios.post(
      `https://graph.threads.net/v1.0/${THREADS_ID}/threads_publish`,
      {
        creation_id: carouselId,
        access_token: THREADS_TOKEN,
      },
    );

    console.log("Threads Post Published:", publish.data.id);
    return publish.data.id;
  } catch (error: any) {
    console.error(
      "❌ Threads Carousel Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

/**
 * 📘 POST TO FACEBOOK (Direct Upload)
 */
async function postToFacebook(imageUrl: string, content: content) {
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
      caption: content.caption,
      access_token: targetPage.access_token, // This is the magic key
    },
  );

  return fbRes.data.id;
}

export async function broadcastUpdate(
  imageUrl: string,
  content: content,
  isUrlCreated = false,
) {
  try {
    console.log("🚀 Debugging Broadcast...");

    // Try Instagram first and LOG EVERYTHING
    let publicURL;
    if (isUrlCreated) {
      publicURL = imageUrl;
    } else {
      publicURL = await uploadToImgBB(imageUrl);
    }

    try {
      const igId = await postToInstagram(publicURL, content);
      console.log("✅ IG SUCCESS ID:", igId);
    } catch (err: any) {
      console.error("❌ IG FAILED:", err.response?.data || err.message);
      sendErrorToDiscord(err, "POST TO Instagram");
    }

    // Try Threads LOG EVERYTHING
    try {
      const igId = await postToThreads(publicURL, content);
      console.log("✅ Threads SUCCESS ID:", igId);
    } catch (err: any) {
      console.error("❌ Threads FAILED:", err.response?.data || err.message);
      sendErrorToDiscord(err, "POST TO Threads");
    }

    // Try Facebook and LOG EVERYTHING
    // try {
    //   const fbId = await postToFacebook(publicURL, content);
    //   console.log("✅ FB SUCCESS ID:", fbId);
    // } catch (err: any) {
    //   console.error("❌ FB FAILED:", err.response?.data || err.message);
    // }
  } catch (error) {
    console.log("broadcastUpdate Error : ", (error as Error).message);
  }
}

export async function broadcastMultipleUpdates(
  imageUrlArr: string[],
  content: content,
) {
  try {
    console.log("🚀 Debugging Broadcast...");

    try {
      const igId = await multiPostToInstagram(imageUrlArr, content);
      console.log("✅ IG SUCCESS ID:", igId);
    } catch (err: any) {
      console.error("❌ IG FAILED:", err.response?.data || err.message);
      sendErrorToDiscord(err, "POST TO Instagram");
    }

    // Try Threads LOG EVERYTHING
    try {
      const igId = await multiPostToThreads(imageUrlArr, content);
      console.log("✅ Threads SUCCESS ID:", igId);
    } catch (err: any) {
      console.error("❌ Threads FAILED:", err.response?.data || err.message);
      sendErrorToDiscord(err, "POST TO Threads");
    }
  } catch (error) {
    console.log("broadcastUpdate Error : ", (error as Error).message);
  }
}
