import type Message from "./Message";

export default interface MessageWithAttachment extends Message {
    attachments: [
        {
            id: string;
            type: string;
        },
    ];
}