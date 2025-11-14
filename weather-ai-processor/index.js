const { Storage } = require("@google-cloud/storage");
const { VertexAI } = require("@google-cloud/vertexai");

const storage = new Storage();
const bucketName = "weather-data-storage-vskarthik";
const project = "bold-streamer-476213-u0";
const location = "us-central1"; // keep for client region

exports.processWeatherData = async (req, res) => {
  try {
    // 1) Get latest weather file
    const [files] = await storage.bucket(bucketName).getFiles();
    const latestFile = files.sort(
      (a, b) => b.metadata.timeCreated.localeCompare(a.metadata.timeCreated)
    )[0];
    const [rawData] = await latestFile.download();
    const weatherData = JSON.parse(rawData.toString());

    // 2) Prepare prompt
    const textPrompt = `
    Analyze the following weather data and generate:
    1. A short descriptive summary.
    2. A mood/feeling word.
    Weather data: ${JSON.stringify(weatherData, null, 2)}
    `;

    // 3) Vertex AI (Note: model path is GLOBAL)
    const vertexAI = new VertexAI({ project, location });
    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: textPrompt }] }],
    });

    const aiOutput =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI output";
    console.log("✅ AI Output:", aiOutput);

    // 4) Save processed data
    const processedFile = storage
      .bucket(bucketName)
      .file(`processed/processed_${Date.now()}.json`);
    await processedFile.save(
      JSON.stringify({ raw: weatherData, ai_output: aiOutput }, null, 2)
    );

    res.status(200).send("✅ Processed data stored successfully!");
  } catch (err) {
    console.error("❌ Detailed Error:", err);
    res
      .status(500)
      .send(`❌ Error processing weather data: ${err.message || err}`);
  }
};
