// Claude API integration via Netlify Functions

window.ClaudeAPI = {
    // Use Netlify Function instead of direct API
    API_URL: '/.netlify/functions/analyze',
    
    getApiKey: function() {
        let apiKey = localStorage.getItem('anthropic_api_key');
        if (!apiKey) {
            apiKey = prompt('Please enter your Anthropic API key:\n\nGet one at: https://console.anthropic.com/settings/keys');
            if (apiKey && apiKey.trim()) {
                apiKey = apiKey.trim();
                localStorage.setItem('anthropic_api_key', apiKey);
            }
        }
        return apiKey;
    },

    clearApiKey: function() {
        localStorage.removeItem('anthropic_api_key');
    },

    async analyzeDocument(file) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('API key is required');
        }

        const base64Data = await this.fileToBase64(file);
        const mediaType = file.type || 'application/pdf';
        const content = [];

        if (file.type.startsWith('image/')) {
            content.push({
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Data }
            });
        } else if (file.type === 'application/pdf') {
            content.push({
                type: 'document',
                source: { type: 'base64', media_type: mediaType, data: base64Data }
            });
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

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: apiKey,
                    messages: [{ role: 'user', content }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                
                if (response.status === 401) {
                    this.clearApiKey();
                    throw new Error('Invalid API key. Please enter a valid key.');
                }
                
                throw new Error(errorData?.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('\n');
                
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    async askFollowUp(file, messages, question) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('API key is required');
        }

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
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: apiKey,
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
            console.error('Error:', error);
            throw error;
        }
    },

    fileToBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
};
