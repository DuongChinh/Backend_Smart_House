// services/mqttService.js
export const sendCommand = (command) => {
  if (global.mqttClient && global.mqttClient.connected) {
    global.mqttClient.publish("home/ac/control", command, { qos: 1 });
    console.log("Gửi lệnh đến ESP32:", command);
    return true;
  } else {
    console.log("MQTT chưa kết nối, không gửi được lệnh!");
    return false;
  }
};
