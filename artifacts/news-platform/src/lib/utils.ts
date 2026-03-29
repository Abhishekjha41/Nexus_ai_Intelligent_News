import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return dateString;
  }
}

export function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    Tech: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    Politics: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    Sports: "text-orange-400 border-orange-400/30 bg-orange-400/10",
    Finance: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    Entertainment: "text-pink-400 border-pink-400/30 bg-pink-400/10",
    World: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
    Science: "text-indigo-400 border-indigo-400/30 bg-indigo-400/10",
    Business: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  };
  return colors[category] || "text-gray-400 border-gray-400/30 bg-gray-400/10";
}

export function getSentimentColor(sentiment: string) {
  switch (sentiment?.toLowerCase()) {
    case 'positive': return 'text-emerald-400';
    case 'negative': return 'text-rose-400';
    default: return 'text-blue-400';
  }
}
