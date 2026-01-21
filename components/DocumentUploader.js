// Document uploader component

const { Upload } = window.Icons;

window.DocumentUploader = function ({ onFileSelect }) {
    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-amber-500 transition">
            <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) onFileSelect(file);
                }}
                className="hidden"
                id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Upload Historical Document</p>
                <p className="text-sm text-gray-500">PDF, JPG, PNG (images of manuscripts, photos, documents)</p>
            </label>
        </div>
    );
};