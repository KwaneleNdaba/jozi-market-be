/**
 * Socket.IO Connection Diagnostic
 * 
 * This script tests Socket.IO connection from Node.js to verify the server is working
 */

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";

console.log("🔍 Socket.IO Connection Diagnostic");
console.log("===================================\n");
console.log(`Connecting to: ${SOCKET_URL}\n`);

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: false,
});

socket.on('connect', () => {
  console.log("✅ Connected successfully!");
  console.log(`   Socket ID: ${socket.id}\n`);
  
  // Subscribe to a product
  console.log("📡 Subscribing to product...");
  socket.emit('subscribe:product', '6b2385f5-49ce-4e53-aa51-6411fe0f8939');
  
  // Listen for stock updates
  socket.on('stock:update', (data) => {
    console.log("📦 Stock update received:", JSON.stringify(data, null, 2));
  });
  
  console.log("✅ Listening for stock:update events\n");
  console.log("Waiting 5 seconds for any messages...\n");
  
  setTimeout(() => {
    console.log("✅ Test completed successfully!");
    console.log("   Socket.IO server is working correctly.\n");
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on('connect_error', (error) => {
  console.error("❌ Connection error:", error.message);
  console.error("   Error details:", error);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log("🔌 Disconnected:", reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error("❌ Connection timeout - server might not be running");
  process.exit(1);
}, 10000);
