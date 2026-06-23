import { useState } from 'react';
import { Upload as UploadIcon, FileText, X, CheckCircle, Loader, Globe } from 'lucide-react';

interface UploadProps {
  onNavigate: (page: string) => void;
}

export default function Upload({ onNavigate }: UploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, status: 'processing' | 'complete'}[]>([]);
  const [webUrl, setWebUrl] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type === 'application/pdf') {
        addFile(file.name);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type === 'application/pdf') {
        addFile(file.name);
      }
    });
  };

  const addFile = (name: string) => {
    setUploadedFiles(prev => [...prev, { name, status: 'processing' }]);

    setTimeout(() => {
      setUploadedFiles(prev =>
        prev.map(f => f.name === name ? { ...f, status: 'complete' } : f)
      );
    }, 2000);
  };

  const handleWebConvert = () => {
    if (webUrl.trim()) {
      addFile(`web-article-${Date.now()}.pdf`);
      setWebUrl('');
    }
  };

  const removeFile = (name: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== name));
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-6 py-8 bg-background">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Articles</h1>
          <p className="text-muted-foreground">Upload PDF files or convert web pages to analyzed articles</p>
        </div>

        {/* PDF Upload Area */}
        <div className="bg-card rounded-lg border-2 border-dashed border-border p-12 mb-6 text-center hover:border-emerald-400 transition-colors"
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             style={{ borderColor: isDragging ? '#10b981' : undefined, backgroundColor: isDragging ? '#f0fdf4' : undefined }}>
          <UploadIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Drag PDF files here</h3>
          <p className="text-muted-foreground mb-4">or click to select files from your computer</p>
          <label className="inline-block px-6 py-3 bg-emerald-600 text-card rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
            Select Files
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-sm text-muted-foreground mt-4">Supports PDF files up to 50MB</p>
        </div>

        {/* Web to PDF Converter */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-semibold text-foreground">Web Page to PDF Converter</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Enter a URL of an online research article and the system will convert it to PDF format</p>
          <div className="flex gap-3">
            <input
              type="url"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="https://example.com/article..."
              className="flex-1 px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              onClick={handleWebConvert}
              disabled={!webUrl.trim()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Convert
            </button>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Uploaded Files ({uploadedFiles.length})</h3>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-8 h-8 text-emerald-600" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {file.status === 'processing' ? (
                          <>
                            <Loader className="w-4 h-4 text-emerald-600 animate-spin" />
                            <span className="text-sm text-muted-foreground">Processing and extracting text...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">Processed successfully</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.name)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {uploadedFiles.every(f => f.status === 'complete') && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => onNavigate('library')}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Go to Library
                </button>
                <button
                  onClick={() => setUploadedFiles([])}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Upload More
                </button>
              </div>
            )}
          </div>
        )}

        {/* Features Info */}
        <div className="mt-8 bg-emerald-50 rounded-lg p-6 border border-emerald-100">
          <h4 className="font-semibold text-emerald-900 mb-3">What happens after upload?</h4>
          <ul className="space-y-2 text-sm text-emerald-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>System extracts text from PDF and identifies title, authors, and abstract</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Automatic summary generation of key findings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Content indexing enables interactive Q&A</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Topic and methodology identification for future sorting and comparison</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
