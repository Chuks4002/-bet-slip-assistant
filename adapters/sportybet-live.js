const API_BASE = "https://bet-slip-assistant.onrender.com";

async function post(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  return response.json();
}

export default {
  name: "SportyBet Backend",

  async validateSelection(selection, dbg) {
    try {
      const result = await post("/api/validate", {
        selections: [selection]
      });

      return result.results?.[0] || {
        status: "FAILED",
        selection,
        reason: "empty_response"
      };
    } catch (e) {
      return {
        status: "FAILED",
        selection,
        reason: e.message
      };
    }
  },

  async buildBooking(results, dbg) {
    try {
      return await post("/api/build", {
        selections: results
      });
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  },

  async getBooking(code) {
    return {
      success: false,
      message: "Not implemented"
    };
  }
};

export async function searchEvents() {
  return [];
}

export async function getEventDetails() {
  return null;
}

export function findMarket() {
  return null;
}

export function findOutcome() {
  return null;
}
