import path from "path";

const PNG = /\.png$/i;

export function isLocalTrayPng(filePath: unknown): boolean {
  if (typeof filePath !== "string") return false;
  const trimmed = filePath.trim();
  if (!trimmed || !PNG.test(trimmed)) return false;
  if (/^[a-z]+:/i.test(trimmed) && !/^[a-zA-Z]:[\\/]/.test(trimmed)) return false;
  const resolved = path.resolve(trimmed);
  return path.extname(resolved).toLowerCase() === ".png";
}
