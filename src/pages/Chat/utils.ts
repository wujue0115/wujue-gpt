export function parseChunkToContents(chunk: Uint8Array): string[] {
  const chunkData: string = new TextDecoder().decode(chunk);
  const dataArray: string[] = chunkData
    .trim()
    // Since the format of chunkData as follows: "data: {...} \n data: {...} ...",
    // use the split method to separate each data JSON string object
    .split("data:") 
    // Remove the content of the array at index 0 because it is ""
    .filter(str => str !== "")
    // Each JSON string object containing data may have leading and trailing whitespace and newline characters, 
    // which need to be stripped or cleaned. 
    .map(str => str.trim());

  const contents = dataArray.map(data => {
    const jsonData = data.includes("[DONE]") ? null : JSON.parse(data);
    return jsonData ? jsonData.choices[0].delta.content || "" : "";
  });
  return contents;
}

export function autoScrollDown(scrollElement: HTMLElement, hasUserWheel: boolean = false, userWheelDeltaY: number = 0) {
  if (hasUserWheel && userWheelDeltaY < 0) return;

  const clientHeight = scrollElement.clientHeight;
  const scrollTop = scrollElement.scrollTop;
  const scrollHeight = scrollElement.scrollHeight;
  const autoScrollBound = 100;
  if (hasUserWheel && userWheelDeltaY > 0 && scrollHeight - (clientHeight + scrollTop) > autoScrollBound) return;

  scrollElement.scrollTop = scrollHeight - clientHeight;
}