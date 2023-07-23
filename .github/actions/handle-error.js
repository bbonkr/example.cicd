"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const core_1 = __importDefault(require("@actions/core"));
const handleError = (err) => {
    var _a;
    const octokitError = err;
    if (octokitError) {
        core_1.default.debug(`status: ${octokitError.status}, name: ${octokitError.name}`);
        core_1.default.startGroup(octokitError.name);
        (_a = octokitError.errors) === null || _a === void 0 ? void 0 : _a.forEach((oerr) => {
            if (oerr.message) {
                core_1.default.error(oerr.message);
            }
        });
        core_1.default.endGroup();
    }
    else {
        const error = err;
        if (error) {
            core_1.default.error(error.message);
        }
        else {
            core_1.default.error(`Unknown error: ${err}`);
        }
    }
};
exports.handleError = handleError;
