type LocaleEntry = {
  key: string;
  codeLang: string;
  content: string;
};

export function groupAndSerializeLocales(entries: LocaleEntry[]): string {
  const grouped: Record<string, string[]> = {};

  for (const { key, codeLang, content } of entries) {
    if (!grouped[codeLang]) {
      grouped[codeLang] = [];
    }
    grouped[codeLang].push(`"${key}":${content}`);
  }

  const langEntries = Object.entries(grouped).map(([lang, items]) => `"${lang}":{${items.join(',')}}`);

  return `{${langEntries.join(',')}}`;
}
