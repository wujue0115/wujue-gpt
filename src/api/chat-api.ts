import { MessageType } from "../types/message.types";


export default async function(messages: MessageType[]): Promise<MessageType | void> {
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
        stream: false,
      })
    });
  
    const data = await response.json();
    return data.choices[0].message;
  } catch (error) {
    console.error(error);
  }
}