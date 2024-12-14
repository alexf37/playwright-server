import { Elysia } from "elysia";
import { chromium } from "playwright";
import z from "zod";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getRenderedHTML(url: string, sleepTime: number) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "load", timeout: 0 });
    await sleep(sleepTime);
    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

const requestParamsSchema = z.object({
  url: z.string(),
  sleepTime: z.number().optional().default(1500),
});

const app = new Elysia()
  .post("/", async (context) => {
    const body = await context.request.json();
    const { url, sleepTime } = requestParamsSchema.parse(body);
    return getRenderedHTML(url, sleepTime);
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
