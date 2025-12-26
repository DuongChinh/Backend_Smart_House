// config/mqtt.js
import mqtt from "mqtt";

const connectMQTT = () => {
  const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
    clientId: "smartair_backend_" + Math.random().toString(16).substr(2, 8),
    username: "DuongChinh",
    password: "1234567890z",
    rejectUnauthorized: false, // Bỏ qua SSL check (an toàn với HiveMQ Cloud)
    reconnectPeriod: 5000,
  });

  client.on("connect", () => {
    console.log("HiveMQ Cloud Connected!");
    client.subscribe("home/ac/status", { qos: 1 });
    global.mqttClient = client;
  });

  client.on("message", (topic, message) => {
    if (topic === "home/ac/status") {
      const payload = message.toString();
      console.log("Nhận trạng thái từ ESP32:", payload);
      global.io?.emit("ac_status", payload);
    }
  });

  client.on("error", (err) => {
    console.error("MQTT Error:", err.message);
  });

  client.on("offline", () => {
    console.log("MQTT Client Offline");
  });

  return client;
};

export default connectMQTT;
