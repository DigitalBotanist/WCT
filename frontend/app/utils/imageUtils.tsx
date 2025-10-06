
const resizeImage = async (imgUrl: string): Promise<string | null> => {
    try {
        const img = await loadImage(imgUrl);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
            // Set the new width and height for the image
            const newWidth = 700;
            const newHeight = (img.height / img.width) * newWidth; // Maintain aspect ratio

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw the image on the canvas at the new size
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Get the base64-encoded resized image
            const resizedBase64 = canvas.toDataURL("image/png"); 
            return resizedBase64;
        } else { 
            throw new Error("Failed to get canvas context")
        }
    } catch (error: any) {
        console.error("Error resizing image:", error);
        return null;
    }
};

const loadImage = async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;

        img.onload = () => resolve(img);
        img.onerror = () => reject("Failed to load image");
    });
};

export { resizeImage };
