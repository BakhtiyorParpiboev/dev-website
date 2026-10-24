import express, { type Express, type ErrorRequestHandler } from "express";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { seoRouter } from "./routes/seo";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware((req) => ({
  publishableKey: publishableKeyFromHost(
    getClerkProxyHost(req) ?? "",
    process.env.CLERK_PUBLISHABLE_KEY,
  ),
})));

// Cookie-authenticated mutations must come from this site's own origin.
app.use("/api", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) { next(); return; }
  const origin = req.get("origin");
  const host = req.get("x-forwarded-host") || req.get("host");
  if (origin) {
    try {
      if (new URL(origin).host === host) { next(); return; }
    } catch { /* reject malformed origin */ }
    res.status(403).json({ error: "Cross-origin writes are not permitted." }); return;
  }
  if (req.get("sec-fetch-site") === "cross-site") {
    res.status(403).json({ error: "Cross-origin writes are not permitted." }); return;
  }
  next();
});
app.use("/api", router);
app.use(seoRouter);

const handleError: ErrorRequestHandler = (error, req, res, _next) => {
  if (error?.code === "23505" || error?.cause?.code === "23505") {
    res.status(409).json({ error: "That slug is already in use. Choose a different slug." }); return;
  }
  if (error?.type === "entity.too.large") {
    res.status(413).json({ error: "The upload is too large. Choose an image no larger than 5 MB." }); return;
  }
  if (error?.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON." }); return;
  }
  req.log.error({ err: error }, "Request failed");
  res.status(500).json({ error: "The request could not be completed. Please try again." });
};
app.use(handleError);

export default app;
