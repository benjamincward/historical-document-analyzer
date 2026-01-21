// Claude API integration with better error handling

window.ClaudeAPI = {
    // API Configuration
    API_URL: 'https://api.anthropic.com/v1/messages',
    API_VERSION: '2023-06-01',

    // Get API key from localStorage or prompt user
    getApiKey: function () {
        let apiKey = localStorage.getItem('anthropic_api_key');
        if (!apiKey) {
            apiKey = prompt('Please enter your Anthropic API key:\n\nGet one at: https://console.anthropic.com/settings/keys\n\nIMPORTANT: Delete the old key you posted in chat first!');
            if (apiKey && apiKey.trim()) {
                apiKey = apiKey.trim();
                localStorage.setItem('anthropic_api_key', apiKey);
            }
        }
        return apiKey;
    },

    // Clear stored API key
    clearApiKey: function () {
        localStorage.removeItem('anthropic_api_key');
        alert('API key cleared. You will be prompted to enter a new one.');
    },

    /**
     * Analyze a document using Claude API
     * @param {File} file - The file to analyze
     * @returns {Promise<string>} - The analysis result
     */
    analyzeDocument: async function (file) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('API key is required. Please enter a valid Anthropic API key.');
        }

        console.log('Starting document analysis...');

        const base64Data = await this.fileToBase64(file);
        const mediaType = file.type || 'application/pdf';
        const content = [];

        // Add document to content
        if (file.type.startsWith('image/')) {
            content.push({
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Data
                }
            });
        } else if (file.type === 'application/pdf') {
            content.push({
                type: 'document',
                source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Data
                }
            });
        } else {
            throw new Error('Unsupported file type. Please upload an image (JPG, PNG) or PDF.');
        }

        content.push({
            type: 'text',
            text: `You are a historical document analyst. Analyze this historical document and provide:

1. **Document Type & Era**: Identify what type of document this is and approximate time period
2. **Key Content**: Summarize the main content, people, events, or information present
3. **Historical Context**: Explain the historical significance and context
4. **Notable Details**: Point out interesting or important details that stand out
5. **Preservation & Authenticity**: Comment on the document's condition and any notable features

Be detailed but concise. Format your response clearly.`
        });

        const requestBody = {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{ role: 'user', content }]
        };

        console.log('Sending request to Claude API...');

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': this.API_VERSION
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('API Error:', errorData);

                if (response.status === 401) {
                    this.clearApiKey();
                    throw new Error('Invalid API key. Please enter a valid key from console.anthropic.com');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                } else if (response.status === 400) {
                    throw new Error('Bad request. The file might be too large or corrupted.');
                } else {
                    throw new Error(`API Error (${response.status}): ${errorData?.error?.message || 'Request failed'}`);
                }
            }

            const data = await response.json();
            console.log('Analysis complete!');

            return data.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('\n');

        } catch (error) {
            console.error('Error in analyzeDocument:', error);

            // Network errors
            if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
                throw new Error('Network error. Please check your internet connection and try again. If the problem persists, your API key might be invalid.');
            }

            throw error;
        }
    },

    /**
     * Ask a follow-up question about a document
     * @param {File} file - The original file
     * @param {Array} messages - Conversation history
     * @param {string} question - The follow-up question
     * @returns {Promise<string>} - The response
     */
    askFollowUp: async function (file, messages, question) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('API key is required');
        }

        console.log('Asking follow-up question...');

        const base64Data = await this.fileToBase64(file);
        const mediaType = file.type || 'application/pdf';

        const newUserContent = [];
        if (file.type.startsWith('image/')) {
            newUserContent.push({
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Data }
            });
        } else if (file.type === 'application/pdf') {
            newUserContent.push({
                type: 'document',
                source: { type: 'base64', media_type: mediaType, data: base64Data }
            });
        }
        newUserContent.push({ type: 'text', text: question });

        const conversationHistory = [...messages, {
            role: 'user',
            content: newUserContent
        }];

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': this.API_VERSION
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 4096,
                    messages: conversationHistory
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                if (response.status === 401) {
                    this.clearApiKey();
                    throw new Error('Invalid API key');
                }
                throw new Error(errorData?.error?.message || 'API request failed');
            }

            const data = await response.json();
            return data.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('\n');

        } catch (error) {
            console.error('Error in askFollowUp:', error);

            if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
                throw new Error('Network error. Please check your connection.');
            }

            throw error;
        }
    },

    /**
     * Convert file to base64
     * @param {File} file - The file to convert
     * @returns {Promise<string>} - Base64 encoded string
     */
    fileToBase64: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    },

    /**
     * Test API key validity
     * @returns {Promise<boolean>} - True if key is valid
     */
    testApiKey: async function () {
        const apiKey = this.getApiKey();
        if (!apiKey) return false;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': this.API_VERSION
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'test' }]
                })
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }
};