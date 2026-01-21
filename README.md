# Historical Document Analyzer

AI-powered historical document analysis tool built with React and Claude API.

## Features

- 📄 **Document Upload**: Support for PDFs, images (JPG, PNG)
- 🤖 **AI Analysis**: Powered by Claude AI for intelligent document analysis
- 💬 **Follow-up Questions**: Ask questions about uploaded documents
- 🎨 **Modern UI**: Built with React and Tailwind CSS
- 🚀 **Zero Backend**: Runs entirely client-side
- 💰 **Free Hosting**: Deploy on GitHub Pages

## Live Demo

[Your GitHub Pages URL here]

## Technologies Used

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **AI**: Claude API (Sonnet 4)
- **Hosting**: GitHub Pages

## Project Structure

```
historical-document-analyzer/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Custom styles
├── js/
│   ├── app.js            # Main application logic
│   └── api.js            # Claude API integration
├── components/
│   ├── DocumentUploader.js
│   ├── DocumentAnalyzer.js
│   └── FollowUpChat.js
├── assets/
│   └── icons.js          # SVG icon components
└── README.md
```

## Installation & Deployment

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/historical-document-analyzer.git
cd historical-document-analyzer
```

2. Open `index.html` in your browser

### Deploy to GitHub Pages

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages
   - Select `main` branch
   - Save

3. Access at: `https://YOUR-USERNAME.github.io/historical-document-analyzer/`

## Usage

1. **Upload Document**: Click the upload area and select a historical document (PDF or image)
2. **Analyze**: Click "Analyze Document" to get AI-powered analysis
3. **Ask Questions**: Use the chat interface to ask follow-up questions about the document

## Features Breakdown

### Document Analysis
- Document type and era identification
- Key content summarization
- Historical context explanation
- Notable details highlighting
- Preservation assessment

### Supported Documents
- Historical photographs
- Scanned manuscripts and letters
- Historical PDFs
- Artifacts and maps
- Archival materials

## Configuration

The app uses Claude API without requiring API keys (handled by the artifact system). For production use with your own API key:

1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Update `js/api.js` to include your key in headers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with Claude AI by Anthropic
- Icons from Heroicons
- Styling with Tailwind CSS

## Contact

Your Name - [Your LinkedIn](https://linkedin.com/in/yourprofile)

Project Link: [https://github.com/YOUR-USERNAME/historical-document-analyzer](https://github.com/YOUR-USERNAME/historical-document-analyzer)

---

⭐ Star this repo if you find it helpful!