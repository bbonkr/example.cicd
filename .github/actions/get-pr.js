"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("@octokit/action");
const plugin_rest_endpoint_methods_1 = require("@octokit/plugin-rest-endpoint-methods");
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const handle_error_1 = require("./handle-error");
const GetPrAsyncInput = {
    prNumber: 'pull_request_number',
};
const GetPrOutput = {
    prNumber: 'pull_request_number',
};
const getPrAsync = async (pullRequestNumber) => {
    let prNumber;
    if (!pullRequestNumber) {
        prNumber = core_1.default.getInput(GetPrAsyncInput.prNumber);
    }
    else {
        prNumber = `${pullRequestNumber}`;
    }
    const prNumberValue = parseInt(prNumber, 10);
    const MyOctokit = action_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods);
    const octokit = new MyOctokit();
    try {
        if (prNumberValue > 0) {
            const { data } = await octokit.pulls.get({
                owner: github_1.default.context.repo.owner,
                repo: github_1.default.context.repo.repo,
                pull_number: prNumberValue,
            });
            core_1.default.setOutput(GetPrOutput.prNumber, data.number);
            return data;
        }
        else {
            throw new Error(`Could not recognize pull_request number`);
        }
    }
    catch (err) {
        (0, handle_error_1.handleError)(err, core_1.default);
    }
    core_1.default.setOutput(GetPrOutput.prNumber, '');
    return null;
};
exports.default = getPrAsync;
