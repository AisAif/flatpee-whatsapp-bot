export const isGroupMessage = (message) => {
  return message.from.includes("@g.us");
};

export const isBotMentioned = (message, currentUserId) => {
  if (!isGroupMessage(message)) return true;

  return message.mentionedIds.some((id) => {
    return id === currentUserId;
  });
};

export const createSeparator = () => "─".repeat(80);

export const truncateText = (text, maxLength = 100) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const formatProcessingTime = (startTime) => {
  return Date.now() - startTime;
};