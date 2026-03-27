import { Product } from "@app/models";

export function isAdmitted(product: Product) {
    return product && product.isAdmitted;
}
