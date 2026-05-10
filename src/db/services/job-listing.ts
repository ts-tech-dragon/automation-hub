import { getTimeInIST } from "../../../lib/helpers/index.js";
import connectDB from "../index.js";

// Run this once to initialize the collection constraints
async function initializeJobCollection() {
  const db = await connectDB();
  // Create a unique index on the 'link' field
  await db.collection("job_listing").createIndex({ link: 1 }, { unique: true });
  console.log("✅ Unique index created on 'link' field.");
}

export async function processJobListings(incomingJobs: any[]) {
  const db = await connectDB();
  if (!db) return [];

  try {
    // 1. Get all incoming links
    // 1. Create the identity filters
    // MongoDB treats each object here as: (title AND company AND location)
    const identityFilters = incomingJobs.map((job) => ({
      title: job.title,
      company: job.company,
      location: job.location,
    }));

    // 2. Find links that already exist in the DB (Bulk Query)
    // 2. Fetch existing jobs matching any of our specific triplets
    const existingJobs = await db
      .collection("job_listing")
      .find(
        { $or: identityFilters },
        { projection: { title: 1, company: 1, location: 1, _id: 0 } },
      )
      .toArray();

    // 3. Create a unique "Composite Key" for fast comparison
    // We use a specific separator like "|||" to avoid accidental string overlaps
    const existingKeysSet = new Set(
      existingJobs.map((j) => `${j.title}|||${j.company}|||${j.location}`),
    );

    // 4. Filter local array for truly NEW jobs
    const newJobs = incomingJobs.filter((job) => {
      const currentKey = `${job.title}|||${job.company}|||${job.location}`;
      return !existingKeysSet.has(currentKey);
    });

    if (newJobs.length === 0) {
      console.log("No new unique jobs found (Triple-check matched all).");
      return [];
    }

    // 5. Execution: Telegram -> Database
    console.log(
      `🚀 Found ${newJobs.length} new unique jobs. Sending to Telegram...`,
    );

    // 6. Bulk Insert the new entries
    await db.collection("job_listing").insertMany(newJobs);

    console.log("✅ Successfully saved new jobs to DB.");
    return newJobs; // Return the new jobs for further processing (e.g., notifications)
  } catch (error) {
    console.error("Job Processing Error:", error);
    return [];
  }
}
