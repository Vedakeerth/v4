const fs = require('fs');
const path = 'd:/veda/web v4/v4/components/admin-dashboard-tabs/ProductsTab.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldFuncStartStr = "    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'image' | 'gallery', index?: number) => {";
const nextFuncStartStr = "    const removeGalleryImage = (index: number) => {";

const oldFuncStart = content.indexOf(oldFuncStartStr);
const nextFuncStart = content.indexOf(nextFuncStartStr);

if (oldFuncStart === -1 || nextFuncStart === -1) {
    console.error('Function boundaries not found!', oldFuncStart, nextFuncStart);
    process.exit(1);
}

const replacementFunc = `    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'image' | 'gallery', index?: number) => {
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
                formDataPayload.append('quotationID', editingProduct ? editingProduct.id : uploadSessionId);
                formDataPayload.append('rootFolder', 'products');

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
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            reject(new Error('Invalid JSON response'));
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
            if (targetField === 'image') {
                setFormData(prev => ({ ...prev, image: uploadedUrls[0] }));
            } else if (targetField === 'gallery') {
                setFormData(prev => {
                    const currentImages = prev.images ? prev.images.split(',').map(i => i.trim()).filter(Boolean) : [];
                    if (index !== undefined && index < currentImages.length) {
                        currentImages[index] = uploadedUrls[0];
                        return { ...prev, images: [...currentImages, ...uploadedUrls.slice(1)].join(', ') };
                    } else {
                        return { ...prev, images: [...currentImages, ...uploadedUrls].join(', ') };
                    }
                });
            }
        }
        
        setIsUploading(false);
        setUploadProgress(null);
        e.target.value = '';
    };

`;

content = content.substring(0, oldFuncStart) + replacementFunc + content.substring(nextFuncStart);

content = content.replace(
    '<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "gallery")} disabled={isUploading} />',
    '<input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, "gallery")} disabled={isUploading} />'
);

content = content.replace(
    '<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} disabled={isUploading} />',
    '<input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} disabled={isUploading} />'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Update successful');
