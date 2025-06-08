import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { setupRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

// Environment configuration for deployment
const host = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

console.log(`Starting server on ${host}:${port}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

const app = express();

// Configure JSON body parser with increased limits for large images
app.use(express.json({
  limit: '100mb',
  strict: true,
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf.toString(encoding as BufferEncoding));
    } catch (e: any) {
      log(`Invalid JSON received: ${e.message || 'Unknown error'}`);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Invalid JSON format',
        error: e.message || 'Unknown error'
      }));
      throw new Error('Invalid JSON format');
    }
  }
}));

// Updated URL-encoded parser with increased limits
app.use(express.urlencoded({ 
  extended: false, 
  limit: '100mb',
  parameterLimit: 100000
}));

// Serve static files
app.use(express.static(path.join(import.meta.dirname, "public")));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await setupRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error('Server error:', err);
      res.status(status).json({ message });
    });

    // Setup Vite for development or serve static files for production
    if (process.env.NODE_ENV !== "production") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server
    server.listen(port, host, () => {
      log(`Server running on http://${host}:${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();