import type AnimalInfo from "./AnimalInfo";

export default interface ChatSession{
    id: string, 
    title?: string,
    context?: AnimalInfo, 
}