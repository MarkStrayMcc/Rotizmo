import { Pipe, PipeTransform } from "@angular/core";
import { Document } from "@app/models";

/**
 * Usage:
 * scope: 'quote' - This will filter a list of documents with quote scope.
 * scope: 'policy' - This will filter a list of documents with policy scope.
 */
@Pipe({
    name: 'scope',
    pure: false
})
export class DocumentScopePipe implements PipeTransform {

    endorsements: Document[];

    /**
     * Filters a list of Documents by either quote or policy scope.
     * Documents with scopeId = All will always appear in the list.
     *
     * @param value The list of documents to be filtered
     * @returns {Document[]} The filtered list of documents
     */
    transform(value: Document[], scope: string): Document[] {
        this.endorsements = value;
        scope = scope.toLowerCase();
        return scope === "quote"
            ? this.endorsements.filter(c => c.scopeId === 1 || c.scopeId === 2)
            : scope === "policy"
            ? this.endorsements.filter(c => c.scopeId === 1 || c.scopeId === 3)
            : this.endorsements;
    }
}
