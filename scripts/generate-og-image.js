#!/usr/bin/env node

/**
 * Script to generate Open Graph image for social sharing
 * Creates a 1200x630 image with GhostPaste branding
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

// Create canvas with standard OG image dimensions
const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

// Background gradient
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, "#0f172a"); // Dark background
gradient.addColorStop(1, "#1e293b"); // Slightly lighter
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Add subtle grid pattern
ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
ctx.lineWidth = 1;
const gridSize = 30;
for (let x = 0; x < width; x += gridSize) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
}
for (let y = 0; y < height; y += gridSize) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}

// Draw ghost logo
const ghostSize = 120;
const ghostX = width / 2;
const ghostY = height / 2 - 80;

// Ghost body
ctx.fillStyle = "#6366f1";
ctx.beginPath();
ctx.arc(ghostX, ghostY - ghostSize / 4, ghostSize / 2, Math.PI, 0, false);
ctx.lineTo(ghostX + ghostSize / 2, ghostY + ghostSize / 2);
// Wavy bottom
const waves = 3;
const waveWidth = ghostSize / waves;
for (let i = 0; i < waves; i++) {
  const x1 = ghostX + ghostSize / 2 - (i + 0.5) * waveWidth;
  const x2 = ghostX + ghostSize / 2 - (i + 1) * waveWidth;
  const cp1x = x1 - waveWidth / 4;
  const cp1y = ghostY + ghostSize / 2 + 20;
  const cp2x = x2 + waveWidth / 4;
  const cp2y = ghostY + ghostSize / 2 + 20;
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, ghostY + ghostSize / 2);
}
ctx.closePath();
ctx.fill();

// Ghost eyes (code brackets)
ctx.fillStyle = "#f8f9fa";
ctx.font = "bold 40px monospace";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("<", ghostX - 25, ghostY - 10);
ctx.fillText(">", ghostX + 25, ghostY - 10);

// Binary dots
ctx.fillStyle = "#f8f9fa";
ctx.globalAlpha = 0.8;
ctx.beginPath();
ctx.arc(ghostX - 20, ghostY + 20, 4, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 0.6;
ctx.beginPath();
ctx.arc(ghostX, ghostY + 20, 4, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 0.8;
ctx.beginPath();
ctx.arc(ghostX + 20, ghostY + 20, 4, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 1;

// Main text
ctx.fillStyle = "#f8f9fa";
ctx.font = "bold 72px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("GhostPaste", width / 2, height / 2 + 80);

// Tagline
ctx.fillStyle = "#94a3b8";
ctx.font = "32px sans-serif";
ctx.fillText(
  "Zero-Knowledge Encrypted Code Sharing",
  width / 2,
  height / 2 + 140
);

// Features badges
const features = [
  "🔒 Client-Side Encryption",
  "👻 Zero Knowledge",
  "⚡ Fast & Secure",
];
const badgeY = height - 80;
const badgeSpacing = width / (features.length + 1);

ctx.font = "20px sans-serif";
features.forEach((feature, index) => {
  const x = badgeSpacing * (index + 1);

  // Badge background
  ctx.fillStyle = "rgba(99, 102, 241, 0.2)";
  ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
  ctx.lineWidth = 2;
  const metrics = ctx.measureText(feature);
  const padding = 20;
  const badgeWidth = metrics.width + padding * 2;
  const badgeHeight = 40;

  ctx.beginPath();
  ctx.roundRect(
    x - badgeWidth / 2,
    badgeY - badgeHeight / 2,
    badgeWidth,
    badgeHeight,
    20
  );
  ctx.fill();
  ctx.stroke();

  // Badge text
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(feature, x, badgeY);
});

// Add URL
ctx.fillStyle = "#64748b";
ctx.font = "24px sans-serif";
ctx.textAlign = "right";
ctx.fillText("ghostpaste.dev", width - 50, height - 30);

// Save the image
const outputPath = path.join(__dirname, "..", "app", "opengraph-image.png");
const buffer = canvas.toBuffer("image/png");
fs.writeFileSync(outputPath, buffer);

console.log(`✅ Open Graph image generated at: ${outputPath}`);
console.log(`   Dimensions: ${width}x${height}`);
console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
