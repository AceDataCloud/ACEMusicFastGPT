import { createToolHandler, defineToolSet } from '@fastgpt-plugin/sdk-factory';
import z from 'zod';

import { invoke } from './src/client.ts';

const secretSchema = z.object({
  apiKey: z.string().min(1).meta({ title: 'Ace Data Cloud application API key', isSecret: true }),
});

const resultSchema = z.object({
  result: z.record(z.string(), z.unknown()).meta({ title: 'ACE Music response' }),
  task_id: z.string().meta({ title: 'Task ID, when supplied by the API' }),
});

export default defineToolSet({
  manifest: {
    pluginId: 'acedataAceMusic', version: '0.1.0',
    name: { en: 'ACE Music by Ace Data Cloud', 'zh-CN': 'ACE Music 音乐' },
    description: { en: 'Create music and lyrics, import references and retrieve tasks.', 'zh-CN': '生成歌曲和歌词、导入参考音轨并查询任务。' },
    versionDescription: { en: 'Initial native ACE Music toolset', 'zh-CN': 'ACE Music 首个原生工具集' },
    author: 'Ace Data Cloud', repoUrl: 'https://github.com/AceDataCloud/ACEMusicFastGPT',
    tutorialUrl: 'https://github.com/AceDataCloud/ACEMusicFastGPT#readme', tags: ['multimodal'], permission: [],
  },
  secretSchema,
  children: [
    {
      id: 'generate',
      name: { en: 'Create song from idea', 'zh-CN': '按描述生成歌曲' },
      description: { en: 'Submit one paid song generation. Save its task ID.', 'zh-CN': '按描述生成歌曲' },
      toolDescription: 'Submit one paid song generation. Save its task ID.',
      handler: createToolHandler({
        secretSchema, outputSchema: resultSchema,
        inputSchema: z.object({
          prompt: z.string().trim().min(1).max(20000).meta({ title: 'Music or lyrics idea', isToolParam: true }),
          model: z.enum(['acemusic-v1.1', 'acemusic-v1']).optional().meta({ title: 'Model', isToolParam: true }),
        }),
        handler: async (input, ctx) => {
          const result = await invoke(ctx.secrets?.apiKey ?? '', 'generate', input);
          const id = result.task_id ?? result.id;
          return { result, task_id: typeof id === 'string' ? id : '' };
        },
      }),
    },
    {
      id: 'custom',
      name: { en: 'Create song from lyrics', 'zh-CN': '按歌词生成歌曲' },
      description: { en: 'Submit one paid song generation with your own lyrics, style and title.', 'zh-CN': '按歌词生成歌曲' },
      toolDescription: 'Submit one paid song generation with your own lyrics, style and title.',
      handler: createToolHandler({
        secretSchema, outputSchema: resultSchema,
        inputSchema: z.object({
          lyric: z.string().trim().min(1).max(20000).meta({ title: 'Lyrics', isToolParam: true }),
          style: z.string().trim().min(1).max(20000).meta({ title: 'Musical style', isToolParam: true }),
          title: z.string().trim().min(1).max(20000).meta({ title: 'Title', isToolParam: true }),
          model: z.enum(['acemusic-v1.1', 'acemusic-v1']).optional().meta({ title: 'Model', isToolParam: true }),
        }),
        handler: async (input, ctx) => {
          const result = await invoke(ctx.secrets?.apiKey ?? '', 'custom', input);
          const id = result.task_id ?? result.id;
          return { result, task_id: typeof id === 'string' ? id : '' };
        },
      }),
    },
    {
      id: 'upload',
      name: { en: 'Import reference MP3', 'zh-CN': '导入参考 MP3' },
      description: { en: 'Import one publicly accessible HTTPS MP3 as a separately priced reference.', 'zh-CN': '导入参考 MP3' },
      toolDescription: 'Import one publicly accessible HTTPS MP3 as a separately priced reference.',
      handler: createToolHandler({
        secretSchema, outputSchema: resultSchema,
        inputSchema: z.object({
          audio_url: z.string().trim().min(1).max(20000).meta({ title: 'Public HTTPS MP3 URL', isToolParam: true }),
          name: z.string().trim().min(1).max(20000).optional().meta({ title: 'Display name', isToolParam: true }),
          audio_id: z.string().trim().min(1).max(20000).optional().meta({ title: 'Owned track ID', isToolParam: true }),
        }),
        handler: async (input, ctx) => {
          const result = await invoke(ctx.secrets?.apiKey ?? '', 'upload', input);
          const id = result.task_id ?? result.id;
          return { result, task_id: typeof id === 'string' ? id : '' };
        },
      }),
    },
    {
      id: 'cover',
      name: { en: 'Cover a track', 'zh-CN': '翻唱音轨' },
      description: { en: 'Submit one paid cover using a caller-owned track ID and new lyrics and style.', 'zh-CN': '翻唱音轨' },
      toolDescription: 'Submit one paid cover using a caller-owned track ID and new lyrics and style.',
      handler: createToolHandler({
        secretSchema, outputSchema: resultSchema,
        inputSchema: z.object({
          audio_id: z.string().trim().min(1).max(20000).meta({ title: 'Owned track ID', isToolParam: true }),
          lyric: z.string().trim().min(1).max(20000).meta({ title: 'Lyrics', isToolParam: true }),
          style: z.string().trim().min(1).max(20000).meta({ title: 'Musical style', isToolParam: true }),
          title: z.string().trim().min(1).max(20000).optional().meta({ title: 'Title', isToolParam: true }),
          audio_influence: z.number().min(1).max(100).optional().meta({ title: 'Audio influence (1–100)', isToolParam: true }),
        }),
        handler: async (input, ctx) => {
          const result = await invoke(ctx.secrets?.apiKey ?? '', 'cover', input);
          const id = result.task_id ?? result.id;
          return { result, task_id: typeof id === 'string' ? id : '' };
        },
      }),
    },
    {
      id: 'mashup',
      name: { en: 'Blend two tracks', 'zh-CN': '融合两首音轨' },
      description: { en: 'Submit one paid mashup with two distinct, compatible caller-owned track IDs.', 'zh-CN': '融合两首音轨' },
      toolDescription: 'Submit one paid mashup with two distinct, compatible caller-owned track IDs.',
      handler: createToolHandler({
        secretSchema, outputSchema: resultSchema,
        inputSchema: z.object({
          first_audio_id: z.string().trim().min(1).max(20000).meta({ title: 'First owned track ID', isToolParam: true }),
          second_audio_id: z.string().trim().min(1).max(20000).meta({ title: 'Second owned track ID', isToolParam: true }),
          lyric: z.string().trim().min(1).max(20000).meta({ title: 'Lyrics', isToolParam: true }),
          style: z.string().trim().min(1).max(20000).meta({ title: 'Musical style', isToolParam: true }),
          title: z.string().trim().min(1).max(20000).optional().meta({ title: 'Title', isToolParam: true }),
          audio_influence: z.number().min(1).max(100).optional().meta({ title: 'Audio influence (1–100)', isToolParam: true }),
        }),
        handler: async (input, ctx) => {
          const result = await invoke(ctx.secrets?.apiKey ?? '', 'mashup', input);
          const id = result.task_id ?? result.id;
          return { result, task_id: typeof id === 'string' ? id : '' };
        },
      }),
    },
    {
      id: 'lyrics',
      name: { en: 'Generate lyrics', 'zh-CN': '生成歌词' },
      description: { en: 'Request paid lyrics independently. The reply may contain lyrics or a pending task ID.', 'zh-CN': '生成歌词' },
      toolDescription: 'Request paid lyrics independently. The reply may contain lyrics or a pending task ID.',
      handler: createToolHandler({
        secretSchema, outputSchema: resultSchema,
        inputSchema: z.object({
          prompt: z.string().trim().min(1).max(20000).meta({ title: 'Music or lyrics idea', isToolParam: true }),
          style: z.string().trim().min(1).max(20000).optional().meta({ title: 'Musical style', isToolParam: true }),
        }),
        handler: async (input, ctx) => {
          const result = await invoke(ctx.secrets?.apiKey ?? '', 'lyrics', input);
          const id = result.task_id ?? result.id;
          return { result, task_id: typeof id === 'string' ? id : '' };
        },
      }),
    },
    {
      id: 'retrieve',
      name: { en: 'Retrieve task', 'zh-CN': '查询任务' },
      description: { en: 'Read the same task ID. Inspect its state and response for tracks or lyrics.', 'zh-CN': '查询任务' },
      toolDescription: 'Read the same task ID. Inspect its state and response for tracks or lyrics.',
      handler: createToolHandler({
        secretSchema, outputSchema: resultSchema,
        inputSchema: z.object({
          task_id: z.string().trim().min(1).max(20000).meta({ title: 'Task ID', isToolParam: true }),
        }),
        handler: async (input, ctx) => {
          const result = await invoke(ctx.secrets?.apiKey ?? '', 'retrieve', input);
          const id = result.task_id ?? result.id;
          return { result, task_id: typeof id === 'string' ? id : '' };
        },
      }),
    },
    {
      id: 'batch',
      name: { en: 'Retrieve multiple tasks', 'zh-CN': '批量查询任务' },
      description: { en: 'Read 1 to 100 existing task IDs, one per line.', 'zh-CN': '批量查询任务' },
      toolDescription: 'Read 1 to 100 existing task IDs, one per line.',
      handler: createToolHandler({
        secretSchema, outputSchema: resultSchema,
        inputSchema: z.object({
          task_ids: z.string().trim().min(1).meta({ title: 'Task IDs (one per line)', isToolParam: true }),
        }),
        handler: async (input, ctx) => {
          const result = await invoke(ctx.secrets?.apiKey ?? '', 'batch', input);
          const id = result.task_id ?? result.id;
          return { result, task_id: typeof id === 'string' ? id : '' };
        },
      }),
    },
    {
      id: 'history',
      name: { en: 'List task history', 'zh-CN': '查询任务历史' },
      description: { en: 'Read one page of the authenticated application’s task history.', 'zh-CN': '查询任务历史' },
      toolDescription: 'Read one page of the authenticated application’s task history.',
      handler: createToolHandler({
        secretSchema, outputSchema: resultSchema,
        inputSchema: z.object({
          page: z.number().int().min(1).max(10001).optional().meta({ title: 'Page (1–10001)', isToolParam: true }),
          page_size: z.number().int().min(1).max(100).optional().meta({ title: 'Items per page (1–100)', isToolParam: true }),
        }),
        handler: async (input, ctx) => {
          const result = await invoke(ctx.secrets?.apiKey ?? '', 'history', input);
          const id = result.task_id ?? result.id;
          return { result, task_id: typeof id === 'string' ? id : '' };
        },
      }),
    },
  ],
});
