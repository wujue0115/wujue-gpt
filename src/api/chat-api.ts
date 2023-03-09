import { MessageType } from "../types/message.types";

async function* streamToAsyncIterator(stream: ReadableStream<Uint8Array>): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } catch (error) {
    console.error(error);
  }
}

export default async function(messages: MessageType[]): Promise<AsyncGenerator<Uint8Array> | void> {
  try {
    const url = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + import.meta.env.VITE_OPENAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        stream: true,
      })
    });

    const stream = response.body;
    if (!stream) throw new Error("stream is null");

    return streamToAsyncIterator(stream);
  } catch (error) {
    console.error(error);
  }
}