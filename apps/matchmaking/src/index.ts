import { Worker } from "bullmq";

const matchmakingWorker = new Worker(
  "events",
  async (job: any) => {
    console.log("Job found! ", job.id);
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  },
);

matchmakingWorker.on("ready", () => {
  console.log("Worker is ready");
});

matchmakingWorker.on("active", (job) => {
  console.log("Processing job", job.id);
});

matchmakingWorker.on("completed", (job) => {
  console.log("Completed job", job.id);
});

matchmakingWorker.on("failed", (job, err) => {
  console.log("Failed job", job?.id, err);
});

matchmakingWorker.on("error", (err) => {
  console.log("Worker error", err);
});
