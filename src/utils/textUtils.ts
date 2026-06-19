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

export async function extractTextFromPDF(file: File): Promise<{ text: string; abstract: string }> {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).pdfjsLib !== 'undefined') {
      doExtraction((window as any).pdfjsLib);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        doExtraction(pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js library'));
      document.body.appendChild(script);
    }

    async function doExtraction(pdfjsLib: any) {
      try {
        const fileReader = new FileReader();
        fileReader.onload = async function () {
          try {
            const typedarray = new Uint8Array(this.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            let fullText = '';
            
            const maxPages = Math.min(pdf.numPages, 15);
            for (let i = 1; i <= maxPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n';
            }
            
            fullText = fullText.replace(/\s+/g, ' ').trim();
            
            let abstract = '';
            const abstractMatch = fullText.match(/abstract:?(.*?)(introduction|1\s+\bintroduction\b)/i);
            if (abstractMatch && abstractMatch[1]) {
              abstract = abstractMatch[1].trim().substring(0, 1000);
            } else {
              abstract = fullText.substring(0, 500) + '...';
            }
            
            resolve({ text: fullText, abstract });
          } catch (e) {
            reject(e);
          }
        };
        fileReader.readAsArrayBuffer(file);
      } catch (err) {
        reject(err);
      }
    }
  });
}

