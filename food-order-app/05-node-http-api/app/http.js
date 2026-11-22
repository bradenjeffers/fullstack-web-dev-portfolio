// Small shared helpers so individual handlers don't repeat response boilerplate.

const MAX_BODY_BYTES = 64 * 1024;

// An error that carries the HTTP status it should be reported with.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const notFound = (label, id) => new HttpError(404, `${label} with id ${id} was not found`);

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

// Reads and parses a JSON object body. Rejects with an HttpError instead of
// throwing from inside an event callback (which would crash the process).
function readJsonBody(req, limit = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;

    req.on("data", (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > limit) {
        tooLarge = true;
        reject(new HttpError(413, "Request body is too large"));
        return;
      }
      chunks.push(chunk);
    });

    req.on("error", reject);

    req.on("end", () => {
      if (tooLarge) return;
      const raw = Buffer.concat(chunks).toString("utf-8");
      if (raw.trim() === "") {
        return reject(new HttpError(400, "Request body is required"));
      }
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return reject(new HttpError(400, "Request body must be valid JSON"));
      }
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return reject(new HttpError(400, "Request body must be a JSON object"));
      }
      resolve(parsed);
    });
  });
}

module.exports = { HttpError, notFound, sendJson, readJsonBody };
