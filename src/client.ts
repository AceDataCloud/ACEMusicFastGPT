type Field = { key: string; kind: string; required: boolean };
type Operation = { endpoint: string; body: Record<string, unknown>; fields: Record<string, Field> };
const operations: Record<string, Operation> = {
  "generate": {
    "endpoint": "audios",
    "body": {
      "action": "generate",
      "custom": false,
      "async": true
    },
    "fields": {
      "prompt": {
        "key": "prompt",
        "kind": "text",
        "required": true
      },
      "model": {
        "key": "model",
        "kind": "model",
        "required": false
      }
    }
  },
  "custom": {
    "endpoint": "audios",
    "body": {
      "action": "generate",
      "custom": true,
      "async": true
    },
    "fields": {
      "lyric": {
        "key": "lyric",
        "kind": "text",
        "required": true
      },
      "style": {
        "key": "style",
        "kind": "text",
        "required": true
      },
      "title": {
        "key": "title",
        "kind": "text",
        "required": true
      },
      "model": {
        "key": "model",
        "kind": "model",
        "required": false
      }
    }
  },
  "upload": {
    "endpoint": "audios",
    "body": {
      "action": "upload",
      "async": true
    },
    "fields": {
      "audio_url": {
        "key": "audio_url",
        "kind": "url",
        "required": true
      },
      "name": {
        "key": "name",
        "kind": "text",
        "required": false
      },
      "audio_id": {
        "key": "audio_id",
        "kind": "text",
        "required": false
      }
    }
  },
  "cover": {
    "endpoint": "audios",
    "body": {
      "action": "cover",
      "model": "acemusic-v1.1",
      "async": true
    },
    "fields": {
      "audio_id": {
        "key": "audio_id",
        "kind": "text",
        "required": true
      },
      "lyric": {
        "key": "lyric",
        "kind": "text",
        "required": true
      },
      "style": {
        "key": "style",
        "kind": "text",
        "required": true
      },
      "title": {
        "key": "title",
        "kind": "text",
        "required": false
      },
      "audio_influence": {
        "key": "audio_influence",
        "kind": "strength",
        "required": false
      }
    }
  },
  "mashup": {
    "endpoint": "audios",
    "body": {
      "action": "mashup",
      "model": "acemusic-v1.1",
      "async": true
    },
    "fields": {
      "first_audio_id": {
        "key": "first_audio_id",
        "kind": "text",
        "required": true
      },
      "second_audio_id": {
        "key": "second_audio_id",
        "kind": "text",
        "required": true
      },
      "lyric": {
        "key": "lyric",
        "kind": "text",
        "required": true
      },
      "style": {
        "key": "style",
        "kind": "text",
        "required": true
      },
      "title": {
        "key": "title",
        "kind": "text",
        "required": false
      },
      "audio_influence": {
        "key": "audio_influence",
        "kind": "strength",
        "required": false
      }
    }
  },
  "lyrics": {
    "endpoint": "lyrics",
    "body": {},
    "fields": {
      "prompt": {
        "key": "prompt",
        "kind": "text",
        "required": true
      },
      "style": {
        "key": "style",
        "kind": "text",
        "required": false
      }
    }
  },
  "retrieve": {
    "endpoint": "tasks",
    "body": {
      "action": "retrieve"
    },
    "fields": {
      "task_id": {
        "key": "id",
        "kind": "text",
        "required": true
      }
    }
  },
  "batch": {
    "endpoint": "tasks",
    "body": {
      "action": "retrieve_batch"
    },
    "fields": {
      "task_ids": {
        "key": "ids",
        "kind": "ids",
        "required": true
      }
    }
  },
  "history": {
    "endpoint": "tasks",
    "body": {
      "action": "list"
    },
    "fields": {
      "page": {
        "key": "page",
        "kind": "page",
        "required": false
      },
      "page_size": {
        "key": "page_size",
        "kind": "size",
        "required": false
      }
    }
  }
};

export function buildRequest(operation: string, values: Record<string, unknown>) {
  const spec = operations[operation];
  if (!spec) throw new Error("Unknown ACE Music operation");
  const body = { ...spec.body };
  for (const [field, entry] of Object.entries(spec.fields)) {
    let value = values[field];
    if (typeof value === "string") value = value.trim();
    if (value == null || value === "") {
      if (entry.required) throw new Error(field + " is required");
      continue;
    }
    const kind = entry.kind;
    if (["strength", "page", "size"].includes(kind)) {
      const max = kind === "page" ? 10001 : 100;
      if (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > max ||
          (kind !== "strength" && !Number.isInteger(value))) throw new Error("Invalid " + field);
    } else if (kind === "ids") {
      if (typeof value !== "string") throw new Error("Enter one task ID per line");
      const ids = value.split(/\r?\n/).map(id => id.trim()).filter(Boolean);
      if (ids.length < 1 || ids.length > 100) throw new Error("Provide 1 to 100 task IDs");
      value = ids;
    } else {
      if (typeof value !== "string" || value.length > 20000) throw new Error("Invalid " + field);
      if (kind === "model" && !["acemusic-v1.1", "acemusic-v1"].includes(value)) throw new Error("Unknown ACE Music model");
      if (kind === "url") {
        const parsed = new URL(value);
        if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) throw new Error("Use a public HTTPS MP3 URL");
      }
    }
    body[entry.key] = value;
  }
  if (operation === "mashup") {
    if (body.first_audio_id === body.second_audio_id) throw new Error("The two reference track IDs must be distinct");
    body.mashup_audio_ids = [body.first_audio_id, body.second_audio_id];
    delete body.first_audio_id;
    delete body.second_audio_id;
  }
  return { endpoint: spec.endpoint, body };
}

export async function invoke(token: string, operation: string, values: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!token?.trim()) throw new Error("Configure an Ace Data Cloud application API key");
  const { endpoint, body } = buildRequest(operation, values);
  const response = await fetch("https://api.acedata.cloud/acemusic/" + endpoint, {
    method: "POST",
    headers: { Authorization: "Bearer " + token.trim(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    redirect: "error",
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error("ACE Music returned HTTP " + response.status + ". Check task history before submitting again.");
  const result = await response.json();
  if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Unexpected ACE Music response");
  return result as Record<string, unknown>;
}
