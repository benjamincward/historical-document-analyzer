// Main application

const { useState } = React;
const { FileText, X } = window.Icons;

// Settings icon component
const Settings = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

function HistoricalDocAnalyzer() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [showSettings, setShowSettings] = useState(false);

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        setMessages([]);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const analysisText = await window.ClaudeAPI.analyzeDocument(file);
            setMessages([
                { role: 'user', content: 'Analyze this document' },
                { role: 'assistant', content: analysisText }
            ]);
        } catch (error) {
            setMessages([
                { role: 'user', content: 'Analyze this document' },
                { role: 'assistant', content: `Error: ${error.message}` }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async (question) => {
        if (!file || !question.trim()) return;

        setLoading(true);
        const updatedMessages = [...messages, {
            role: 'user',
            content: question
        }];

        try {
            const responseText = await window.ClaudeAPI.askFollowUp(file, messages, question);
            setMessages([...updatedMessages, {
                role: 'assistant',
                content: responseText
            }]);
        } catch (error) {
            setMessages([...updatedMessages, {
                role: 'assistant',
                content: `Error: ${error.message}`
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setMessages([]);
    };

    const handleUpdateApiKey = () => {
        window.ClaudeAPI.clearApiKey();
        const newKey = window.ClaudeAPI.getApiKey();
        if (newKey) {
            alert('API key updated successfully!');
        }
        setShowSettings(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Settings Modal */}
                {showSettings && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h2 className="text-xl font-bold mb-4">API Settings</h2>
                            <p className="text-gray-600 mb-4">
                                This app requires an Anthropic API key to function.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={handleUpdateApiKey}
                                    className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                                >
                                    Update API Key
                                </button>
                                <a
                                    href="https://console.anthropic.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 text-center"
                                >
                                    Get API Key
                                </a>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                <FileText className="w-8 h-8 text-amber-600" />
                                Historical Document Analyzer
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Upload historical documents, images, or manuscripts for AI-powered analysis
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSettings(true)}
                                className="text-gray-500 hover:text-gray-700 no-print"
                                title="API Settings"
                            >
                                <Settings className="w-6 h-6" />
                            </button>
                            {file && (
                                <button onClick={handleReset} className="text-gray-500 hover:text-gray-700 no-print">
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>

                    {!file ? (
                        <window.DocumentUploader onFileSelect={handleFileSelect} />
                    ) : (
                        <>
                            <window.DocumentAnalyzer
                                file={file}
                                preview={preview}
                                loading={loading}
                                onAnalyze={handleAnalyze}
                                hasAnalysis={messages.length > 0}
                            />
                            <window.FollowUpChat
                                messages={messages}
                                loading={loading}
                                onAskQuestion={handleAskQuestion}
                            />
                        </>
                    )}
                </div>

                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Supported Documents:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Historical photographs and images</li>
                        <li>• Scanned manuscripts and letters</li>
                        <li>• Historical PDFs and documents</li>
                        <li>• Artifacts, maps, and archival materials</li>
                    </ul>
                </div>

                <footer className="mt-8 text-center text-gray-600 text-sm">
                    <p>Powered by Claude AI | Built with React & Tailwind CSS</p>
                    <p className="mt-2 text-xs">Get your API key at console.anthropic.com</p>
                </footer>
            </div>
        </div>
    );
}

// Render the app
ReactDOM.render(<HistoricalDocAnalyzer />, document.getElementById('root'));