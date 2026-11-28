# ACE Music for FastGPT

Build, check and pack the plugin, then import the generated .pkg into the plugin runtime of your FastGPT instance.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm check
pnpm pack:plugin
```

Get an [application API key](https://platform.acedata.cloud/console/applications) with ACE Music access. Enter the raw key in the host's credential setting or server environment. Keep keys out of prompts, shared workflows and commits.

| Action | Inputs or result |
| --- | --- |
| Create song from idea | Prompt and optional ACE Music model. |
| Create song from lyrics | Lyrics, style and title. |
| Import reference MP3 | Public HTTPS MP3 URL. Save the delivered track ID. |
| Cover a track | One owned track ID, lyrics and style. |
| Blend two tracks | Two distinct compatible owned track IDs, lyrics and style. |
| Generate lyrics | Prompt and optional style. Returns lyrics or a pending task ID. |
| Retrieve task / multiple tasks | Use the original task IDs. |
| List task history | Optional page and items per page. |

Audio creation, reference import and writing lyrics are separately priced. Use the creation tool once, save its `task_id`, then retrieve the same task. If the connection breaks before a task ID arrives, inspect task history before resubmitting. The task state and `response` carry completion and partial failures. A partial result can contain one usable track. Play delivered tracks from `response.data[].audio_url`. Read [ACE Music API documentation](https://github.com/AceDataCloud/ACEMusicAPI) and [current pricing](https://platform.acedata.cloud/services/024e09b4-52cf-5e98-a91a-efedf43104c4).

Import a reference asset from a public HTTPS URL with an enabled MIDI, image or video type. Retrieve the original task ID until delivery. Read assets by ID or page for free, then pass the asset ID and type to v1.1 idea generation.
