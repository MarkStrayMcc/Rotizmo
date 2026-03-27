import { Quote } from "@app/models/auto-generated/Quote";

export interface DocumentPreviewType {
    title: string;
    getUrl(quote: Quote): string;
}
