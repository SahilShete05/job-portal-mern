const dotenv = require("dotenv");
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const app = require("./app");
const connectDB = require('./config/db');
const { setIO } = require('./utils/socket');
const { getCorsOrigins } = require('./config/cors');

const requireEnv = (name, requiredInProduction = false) => {
  if (!process.env[name] || String(process.env[name]).trim() === '') {
    if (!requiredInProduction || process.env.NODE_ENV === 'production') {
      console.error(`${name} is required but not set.`);
      return false;
    }
  }
  return true;
};

const requiredEnvOk = [
  requireEnv('MONGO_URI'),
  requireEnv('JWT_SECRET'),
  requireEnv('CORS_ORIGIN', true),
  requireEnv('RESEND_API_KEY', true),
  requireEnv('RESEND_FROM', true),
  requireEnv('CLOUDINARY_CLOUD_NAME', true),
  requireEnv('CLOUDINARY_API_KEY', true),
  requireEnv('CLOUDINARY_API_SECRET', true),
].every(Boolean);

if (!requiredEnvOk) {
  process.exit(1);
}

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const corsOrigins = getCorsOrigins();

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setIO(io);

require('./utils/socketHandlers')(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
