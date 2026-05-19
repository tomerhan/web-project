export function getShortSummary(article: any) {
  try {
    const a = (article as any).abstract?.trim();
    if (a && a.length > 0) {
      const parts = a.split('.').map((p: string) => p.trim()).filter(Boolean);
      return parts.slice(0, 2).join('. ') + (parts.length > 2 ? '…' : '');
    }
    const kf = (article as any).keyFindings;
    if (kf && Array.isArray(kf) && kf.length > 0) return kf.slice(0, 2).join('; ');
    if ((article as any).summary) return (article as any).summary;
    return 'No summary available.';
  } catch (e) { return 'No summary available.'; }
}
