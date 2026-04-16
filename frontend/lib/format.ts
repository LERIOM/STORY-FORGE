export function formatStoryDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function excerpt(text: string, maxLength = 110) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}

