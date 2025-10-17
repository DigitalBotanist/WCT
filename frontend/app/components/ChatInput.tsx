import { useRef } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { resizeImage } from "~/utils/imageUtils";
import loadingIcon from "~/assets/loading.svg";
import sendIcon from "~/assets/send.svg";
import addIcon from "~/assets/add.svg";

const API_URL = import.meta.env.VITE_API_URL;

interface ChatInputProps {
    handleSend: (e: React.FormEvent) => void;
    imageBase64: string | null;
    csvFile: string | null;
    setImageBase64: React.Dispatch<React.SetStateAction<string | null>>;
    setCsvFile: React.Dispatch<React.SetStateAction<string | null>>;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    handleSend,
    imageBase64,
    setImageBase64,
    csvFile,
    setCsvFile,
    message,
    setMessage,
    loading,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null); // file input field
    const { userState } = useAuth();

    const handleAddClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImageBase64(null);
        setCsvFile(null);
        const filetype = file.type;

        if (filetype.startsWith("image")) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const imgUrl = reader.result as string;
                    const resizeBase64Image = await resizeImage(imgUrl); // resize the image
                    console.log(resizeBase64Image);
                    setImageBase64(resizeBase64Image);
                } catch (error: any) {
                    console.error("Error resizing the image: ", error);
                }
            };
            reader.readAsDataURL(file);
        } else if (filetype === "text/csv") {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    console.log("is csv data: ", true);

                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                        setCsvFile("uploading");
                        const response = await fetch(
                            `${API_URL}/attachment/csv`,
                            {
                                method: "POST",
                                body: formData,
                                headers: {
                                    Authorization: `Bearer ${userState.token}`,
                                },
                            }
                        );

                        if (response.ok) {
                            const result = await response.json();
                            console.log("File uploaded successfully:", result);
                            setCsvFile(result.id);
                        } else {
                            setCsvFile("error while uploading. upload again");
                        }
                    } catch (error) {
                        console.error("Error uploading file:", error);
                    }
                } catch (error: any) {
                    console.error("Error resizing the image: ", error);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileRemove = () => {
        setImageBase64(null);
        setCsvFile(null);
    };

    return (
        <form
            className="relative flex gap-2 w-19/20 mb-1"
            onSubmit={handleSend}
        >
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.csv" // customize accepted file types
            />
            {/* add attachments */}
            <button
                type="button"
                className="bg-background-600 p-3 rounded-md"
                onClick={handleAddClick}
            >
                <img className="w-10" src={addIcon} alt="" />
            </button>
            {/* show attachment status */}
            <div className="w-full">
                {imageBase64 && (
                    <div className="flex justify-between gap-3 absolute -translate-y-[120%] right-0 p-3 bg-linear-to-r from-teal-900 to-teal-600  rounded-xl">
                        <p>Image attached</p>
                        <div
                            className="text-red-600/70 font-extrabold cursor-pointer"
                            onClick={handleFileRemove}
                        >
                            X
                        </div>
                    </div>
                )}
                {csvFile && (
                    <div className="flex justify-between gap-5 absolute -translate-y-[120%] right-0 p-3 bg-linear-to-r from-teal-900 to-teal-600 rounded-xl">
                        <div className="">
                            <h4 className="text-sm">csv file: </h4>
                            <p>
                                {csvFile == "uploading"
                                    ? "uploading"
                                    : "csv file attached"}
                            </p>
                        </div>
                        <div
                            className="text-red-600/70 font-extrabold cursor-pointer"
                            onClick={handleFileRemove}
                        >
                            X
                        </div>
                    </div>
                )}
                <input
                    type="text"
                    name="message"
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-4 rounded-md border-2 border-background-600 focus:outline-1 focus:outline-primary-700"
                />
            </div>
            {/* loading
            {loading && (
                <div className="z-100 flex gap-2 justify-between items-center absolute p-3 -translate-y-[120%] left-1/2 bg-background-300 rounded-full">
                    <img
                        className="animate-spin h-6"
                        src={loadingIcon}
                        alt=""
                    />
                    <p className="text-text-100">loading</p>
                </div>
            )} */}
            <button
                className="bg-primary-800 p-4 rounded-md hover:bg-primary-700 disabled:bg-background-500 disabled:hover:bg-background-500 cursor-pointer"
                type="submit"
                disabled={loading || csvFile == "uploading"}
            >
                {loading ? (
                    <img
                        className="animate-spin h-6"
                        src={loadingIcon}
                        alt=""
                    />
                ) : (
                    <img className="w-8" src={sendIcon} alt="" />
                )}
            </button>
        </form>
    );
};

export default ChatInput;
