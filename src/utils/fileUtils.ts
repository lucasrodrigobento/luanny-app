/**
 * Converts a File object to a Base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Result is in format "data:application/octet-stream;base64,XXXX..."
            // We only want the "XXXX..." part.
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Converts a Base64 string back into a File object.
 * @param base64 The base64 encoded string.
 * @param filename The name to give the resulting file.
 * @param mimeType The MIME type of the file. Defaults to 'application/octet-stream'.
 * @returns A File object.
 */
export const base64ToFile = (base64: string, filename: string, mimeType: string = 'application/octet-stream'): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
};
