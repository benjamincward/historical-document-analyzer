// Follow-up chat component

const { Loader2 } = window.Icons;
const { useState } = React;

window.FollowUpChat = function ({ messages, loading, onAskQuestion }) {
    const [followUp, setFollowUp] = useState('');

    const handleSubmit = () => {
        if (followUp.trim()) {
            onAskQuestion(followUp);
            setFollowUp('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="space-y-4">
            {messages.length > 0 && (
                <div className="space-y-4 mt-6">
                    {messages.slice(1).map((msg, idx) => (
                        <div
                            key={idx}
                            className={`${msg.role === 'assistant'
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-blue-50 border-blue-200'
                                } rounded-lg p-4 border fade-in`}
                        >
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                {msg.role === 'assistant' ? '🤖 Analysis:' : '❓ Question:'}
                            </p>
                            <div className="text-gray-800 whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    ))}
                </div>
            )}

            {messages.length > 0 && (
                <div className="mt-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={followUp}
                            onChange={(e) => setFollowUp(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask a follow-up question about this document..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !followUp.trim()}
                            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};