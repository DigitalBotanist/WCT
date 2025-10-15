const AnimalInfoButton = ({
    text,
    handleClick,
}: {
    text: string;
    handleClick: () => void;
}) => {
    return (
        <button
            onClick={handleClick}
            className="bg-background-900/40 p-2 rounded-lg cursor-pointer hover:bg-primary-400/90 hover:text-black"
        >
            {text}
        </button>
    );
};

export default AnimalInfoButton;
