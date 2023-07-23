"use strict";
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
    token: 'GITHUB_TOKEN',
    base: 'GET_LATEST_PR_BASE',
    status: 'GET_LATEST_PR_STATUS', // 'open', 'closed'
};
exports.GetLatestPrOutputs = {
    number: 'latest_pr_number',
    mergedAt: 'latest_pr_merged_at',
};
const getLatestPr = async (base, status) => {
    // input
    let baseValue = base;
    let prStatus = status;
    if (!baseValue) {
        baseValue = core_1.default.getInput(exports.GetLatestPrInputs.base);
        if (!baseValue) {
            baseValue = process.env[exports.GetLatestPrInputs.base];
        }
    }
    if (!status) {
        prStatus = core_1.default.getInput(exports.GetLatestPrInputs.status); // open, closed
        if (!prStatus) {
            prStatus = process.env[exports.GetLatestPrInputs.status];
        }
    }
    let githubToken = core_1.default.getInput(exports.GetLatestPrInputs.token);
    if (!githubToken) {
        githubToken = process.env[exports.GetLatestPrInputs.token] ?? '';
    }
    const MyOctokit = action_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods);
    const octokit = new MyOctokit({ auth: githubToken });
    try {
        const { data } = await octokit.pulls.list({
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
};
exports.default = getLatestPr;
