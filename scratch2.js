const fs = require('fs');
const path = 'd:/veda/web v4/v4/components/admin-dashboard-tabs/ProjectsTab.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldFuncStartStr = "    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {";
const nextFuncStartStr = "    const handleSave = async () => {";

const oldFuncStart = content.indexOf(oldFuncStartStr);
const nextFuncStart = content.indexOf(nextFuncStartStr);

if (oldFuncStart === -1 || nextFuncStart === -1) {
    console.error('Function boundaries not found!', oldFuncStart, nextFuncStart);
    process.exit(1);
}

const replacementFunc = `    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);
        
        const uploadedUrls = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const formDataPayload = new FormData();
                formDataPayload.append('file', file);
                const projectId = editingProject ? editingProject.id : \`proj_\${Date.now()}\`;
                formDataPayload.append('quotationID', projectId);
                formDataPayload.append('rootFolder', 'projects');

                const responseData = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/upload-to-mega', true);

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const baseProgress = (i / files.length) * 100;
                            const fileProgress = (event.loaded / event.total) * (100 / files.length);
                            setUploadProgress(Math.round(baseProgress + fileProgress));
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error('Invalid response')); }
                        } else {
                            reject(new Error(\`Upload failed: \${xhr.status}\`));
                        }
                    };

                    xhr.onerror = () => reject(new Error('Network Error'));
                    xhr.send(formDataPayload);
                });
                
                if (responseData.success) {
                    uploadedUrls.push(responseData.data.url);
                } else {
                    console.error('Upload error response:', responseData.error);
                }
            } catch (error) {
                console.error('Upload failed', error);
            }
        }

        if (uploadedUrls.length > 0) {
            setFormData(prev => {
                const newFormData = { ...prev };
                if (!prev.image && uploadedUrls.length > 0) {
                    newFormData.image = uploadedUrls[0];
                }
                
                const currentImages = prev.images ? prev.images.split(',').map(i => i.trim()).filter(Boolean) : [];
                newFormData.images = [...currentImages, ...uploadedUrls].join(', ');
                
                // If it already had an image, but they upload more, the first uploaded image replaces the old cover?
                // Actually, let's always replace cover image with the first uploaded one, and append ALL to images array just in case
                newFormData.image = uploadedUrls[0];
                return newFormData;
            });
            toast.success(\`Successfully uploaded \${uploadedUrls.length} file(s)!\`);
        } else {
            toast.error("Upload failed. Please try again.");
        }
        
        setIsUploading(false);
        setUploadProgress(0);
        e.target.value = '';
    };

`;

content = content.substring(0, oldFuncStart) + replacementFunc + content.substring(nextFuncStart);

content = content.replace(
    '<input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />',
    '<input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Update successful');
