"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLatestPrOutputs = exports.GetLatestPrInputs = void 0;
const action_1 = require("@octokit/action");
const plugin_rest_endpoint_methods_1 = require("@octokit/plugin-rest-endpoint-methods");
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const handle_error_1 = require("./handle-error");
exports.GetLatestPrInputs = {
    base: 'base',
    status: 'status', // 'open', 'closed'
};
exports.GetLatestPrOutputs = {
    number: 'latest_pr_number',
    mergedAt: 'latest_pr_merged_at',
};
const getLatestPr = (base) => __awaiter(void 0, void 0, void 0, function* () {
    // input
    let baseValue = base;
    if (!baseValue) {
        baseValue = core_1.default.getInput(exports.GetLatestPrInputs.base);
    }
    const prStatus = core_1.default.getInput(exports.GetLatestPrInputs.status); // open, closed
    const MyOctokit = action_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods);
    const octokit = new MyOctokit();
    try {
        const { data } = yield octokit.pulls.list({
            owner: github_1.default.context.repo.owner,
            repo: github_1.default.context.repo.repo,
            base: baseValue,
            state: prStatus,
            sort: 'created',
            direction: 'desc',
            per_page: 1,
            page: 1,
        });
        const firstItem = data.find((_, index) => index === 0);
        if (firstItem) {
            core_1.default.setOutput(exports.GetLatestPrOutputs.number, firstItem.number);
            core_1.default.setOutput(exports.GetLatestPrOutputs.mergedAt, firstItem.merged_at);
            return data;
        }
        else {
            throw new Error(`Lasted Pr (base=${base}) not found`);
        }
    }
    catch (err) {
        (0, handle_error_1.handleError)(err);
    }
    core_1.default.setOutput(exports.GetLatestPrOutputs.number, '');
    core_1.default.setOutput(exports.GetLatestPrOutputs.mergedAt, '');
    return null;
});
exports.default = getLatestPr;
