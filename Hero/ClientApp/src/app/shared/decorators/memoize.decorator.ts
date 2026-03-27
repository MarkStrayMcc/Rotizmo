import { memoize } from "lodash";

export function Memoize() {
    return function (_, __, descriptor) {
        const oldFunction = descriptor.value;
        const newFunction = memoize(oldFunction, args => JSON.stringify(args));

        descriptor.value = function () {
            return newFunction.apply(this, arguments);
        };
    };
};