import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.GuildMembers,
] });

client.once('ready', async () => {  
  console.log('ready!');
});

client.on('messageCreate', async (message) => {

  // メッセージの送信者がBotの場合 or 特定のチャンネル以外からのメッセージ送信の場合はreturn
  if (message.author.bot || message.channel.id != process.env.CHANNEL_ID) return;

  try {
    // 送信されたメッセージをpromptに設定
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `${message.content}`}],
      model: 'gpt-4-1106-preview',
    });

    if (completion.choices[0].message.content === undefined) throw new Error();

    const thread = await message.startThread({
      name: message.content,
      autoArchiveDuration: 60,
    })

    await thread.send(completion.choices[0].message.content);
  } catch (err) {
    console.log(err);
  };
});

client.login(process.env.TOKEN);