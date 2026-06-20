import mongoose from "mongoose";

import { app } from "./app.js";
import { env } from "./config/env.js";

async function start(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);

  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error("Unable to start API", error);
  process.exit(1);
});
