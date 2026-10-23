const mqtt = require("mqtt");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

function describeState(state) {
  const labels = {
    IDLE: "Idle",
    READY: "Ready",
    RUNNING: "Printing",
    PAUSE: "Paused",
    FINISH: "Finished",
    FAILED: "Failed",
    PREPARE: "Preparing",
    SLICING: "Slicing",
  };

  return labels[state] ?? state ?? "Waiting for status";
}

async function main() {
  const questions = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  const host = (await questions.question("Printer IP address: ")).trim();
  const serial = (await questions.question("Printer serial number: ")).trim();
  const password = (await questions.question("LAN access code: ")).trim();

  const uploadToken = (
    await questions.question("Dashboard printer upload token: ")
  ).trim();

  questions.close();

  console.log("Connecting to the printer…");

  const client = mqtt.connect({
    protocol: "mqtts",
    host,
    port: 8883,
    username: "bblp",
    password,
    clientId: `dashboard-test-${Date.now()}`,
    connectTimeout: 10_000,
    reconnectPeriod: 5_000,

    // Temporary local test: accept the printer's certificate.
    rejectUnauthorized: false,
  });

  client.on("connect", () => {
    connected = true;
    latestStatus = {};

    client.subscribe(`device/${serial}/report`, (error, granted) => {
      if (error || granted?.some((item) => item.qos === 128)) {
        console.error("Could not subscribe to printer status.");
        client.end(true);
        return;
      }

      console.log("Connected! Waiting for status. Press Ctrl+C to stop.");
    });
  });

  let connected = false;

  let latestStatus = {};

  const uploadUrl =
    "https://tpkhcrappxeohjjisabh.supabase.co/functions/v1/smooth-handler";

  let uploadInFlight = null;

  async function sendSnapshot() {
    const readings = connected ? latestStatus : {};

    const snapshot = {
      connected,
      state: readings.State ?? null,
      progress_percent: readings["Progress (%)"] ?? null,
      remaining_minutes: readings["Minutes remaining"] ?? null,
      nozzle_temperature_c: readings["Nozzle temperature"] ?? null,
      bed_temperature_c: readings["Bed temperature"] ?? null,
    };

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-printer-token": uploadToken,
        },
        body: JSON.stringify(snapshot),
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        console.error(`Printer upload failed: HTTP ${response.status}`);
        return;
      }

      console.log("Printer status saved to Supabase.");
    } catch (error) {
      console.error("Printer upload failed:", error.message);
    }
  }

  function uploadStatus() {
    if (!uploadInFlight) {
      uploadInFlight = sendSnapshot().finally(() => {
        uploadInFlight = null;
      });
    }

    return uploadInFlight;
  }

  const uploadTimer = setInterval(uploadStatus, 30_000);

  client.on("message", (_topic, message) => {
    try {
      const report = JSON.parse(message.toString());
      const status = report.print;

      if (!status) return;

      

      const fields = {
        State: status.gcode_state,
        "Progress (%)": status.mc_percent,
        "Minutes remaining": status.mc_remaining_time,
        "Nozzle temperature": status.nozzle_temper,
        "Bed temperature": status.bed_temper,
      };

      const available = Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(available).length) {
        latestStatus = {
        ...latestStatus,
        ...available,
        };

        console.log({
            connected,
            State: describeState(latestStatus.State),
            "Progress (%)": latestStatus["Progress (%)"] ?? "Waiting for data",
            "Minutes remaining":
                latestStatus["Minutes remaining"] ?? "Waiting for data",
            "Nozzle temperature":
                latestStatus["Nozzle temperature"] ?? "Waiting for data",
            "Bed temperature":
                latestStatus["Bed temperature"] ?? "Waiting for data",
            receivedAt: new Date().toLocaleTimeString(),
        });

      } else {
        console.log("Received a printer status message.");
      }
    } catch {
      console.log("Received a message we could not read.");
    }
  });

  client.on("error", (error) => {
    console.error("Connection error:", error.message);
    
  });

  client.on("close", () => {
    connected = false;

    console.log({
        connected,
        status: "Disconnected",
    });
  });

  process.once("SIGINT", async () => {
    console.log("Stopping and reporting disconnected…");

    clearInterval(uploadTimer);
    client.end(true);
    connected = false;

    if (uploadInFlight) {
      await uploadInFlight;
    }

    await uploadStatus();
  });

  client.on("reconnect", () => {
    console.log("Trying to reconnect…");
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});