// Document analyzer component

const { FileText, Image, Loader2 } = window.Icons;

window.DocumentAnalyzer = function ({ file, preview, loading, onAnalyze, hasAnalysis }) {
    return (
        <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                    {file.type.startsWith('image/') ? (
                        <Image className="w-6 h-6 text-amber-600" />
                    ) : (
                        <FileText className="w-6 h-6 text-amber-600" />
                    )}
                    <div className="flex-1">
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    {!hasAnalysis && (
                        <button
                            onClick={onAnalyze}
                            disabled={loading}
                            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze Document'
                            )}
                        </button>
                    )}
                </div>
            </div>

            {preview && (
                <div className="rounded-lg overflow-hidden border border-gray-200 fade-in">
                    <img src={preview} alt="Document preview" className="w-full max-h-96 object-contain bg-gray-50" />
                </div>
            )}
        </div>
    );
};