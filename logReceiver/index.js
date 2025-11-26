// logReceiver/index.js
exports.logReceiver = (req, res) => {
  // accept JSON payloads
  const body = req.body || {};
  // write structured JSON to stdout => Cloud Logging will capture it
  console.log(JSON.stringify({
    resource: "frontend-log",
    timestamp: new Date().toISOString(),
    ...body
  }));
  res.status(204).end();
};
