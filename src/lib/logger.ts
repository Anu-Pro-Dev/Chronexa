import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const customTimestamp = winston.format((info) => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  info.timestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  return info;
});

const jsonFormat = winston.format.printf((info) => {
  const { timestamp, level, message, ...rest } = info;
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...rest,
  });
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    customTimestamp(),
    jsonFormat
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'api.log') }),
    new winston.transports.Console()
  ],
});

export default logger;
