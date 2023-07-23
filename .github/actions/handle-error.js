"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const handleError = (err, core) => {
    const octokitError = err;
    if (octokitError) {
        core.debug(`status: ${octokitError.status}, name: ${octokitError.name}`);
        core.startGroup(octokitError.name);
        octokitError.errors?.forEach((oerr) => {
            if (oerr.message) {
                core.error(oerr.message);
            }
        });
        core.endGroup();
    }
    else {
        const error = err;
        if (error) {
            core.error(error.message);
        }
        else {
            core.error(`Unknown error: ${err}`);
        }
    }
};
exports.handleError = handleError;
