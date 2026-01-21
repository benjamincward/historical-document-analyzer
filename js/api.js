// Claude API integration with CORS proxy

window.ClaudeAPI = {
    // Use CORS proxy for browser requests
    API_URL: 'https://api.anthropic.com/v1/messages',
    
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

        const requestBody = {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{ role: 'user', content }]
        };

        try {
            // Direct API call - may fail in some browsers due to CORS
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(requestBody),
                mode: 'cors'
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
            // If CORS error, provide helpful message
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                throw new Error('Browser security restrictions prevent direct API calls. Please use one of these solutions:\n\n1. Use a CORS proxy service\n2. Deploy a backend server\n3. Use the Claude.ai interface directly\n\nTechnical: CORS policy blocks direct browser-to-API requests.');
            }
            
            throw error;
        }
    },

    async askFollowUp(file, messages, question) {
        // Similar implementation as analyzeDocument
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
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 4096,
                    messages: conversationHistory
                }),
                mode: 'cors'
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
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                throw new Error('Browser CORS restriction. See console for details.');
            }
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
