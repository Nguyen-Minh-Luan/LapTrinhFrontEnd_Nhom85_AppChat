
export  const formatRelativeTime = (timeStr: string | undefined) => {
  if (!timeStr) return "";
  const date = new Date(timeStr.replace(/-/g, "/"));
  const now = new Date();
  if (isNaN(date.getTime())) return "";
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  if (diffInHours < 12 && diffInHours >= 0) return `${hours}:${minutes}`;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMsgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffInDays = Math.floor((startOfToday - startOfMsgDay) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return `${hours}:${minutes}`;
  if (diffInDays === 1) return "Hôm qua";
  if (diffInDays < 8) return `${diffInDays} ngày trước`;
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
};
