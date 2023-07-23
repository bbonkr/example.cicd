"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestPr = exports.GetLatestPrOutputs = exports.GetLatestPrInputs = void 0;
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
const getLatestPr = async (getLatesPrsOptions) => {
    // input
    const { github, core } = getLatesPrsOptions;
    let baseValue = getLatesPrsOptions.base;
    let prStatus = getLatesPrsOptions.status;
    if (!baseValue) {
        baseValue = core.getInput(exports.GetLatestPrInputs.base);
        if (!baseValue) {
            baseValue = process.env.GET_LATEST_PR_BASE;
        }
    }
    if (!prStatus) {
        prStatus = core.getInput(exports.GetLatestPrInputs.status); // open, closed
        if (!prStatus) {
            prStatus = process.env.GET_LATEST_PR_STATUS;
        }
    }
    let githubToken = core.getInput(exports.GetLatestPrInputs.token);
    if (!githubToken) {
        githubToken = process.env.GITHUB_TOKEN ?? '';
    }
    const octokit = github.getOctokit(githubToken, undefined);
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    try {
        const { data } = await octokit.rest.pulls.list({
            owner,
            repo,
            base: baseValue,
            state: prStatus,
            sort: 'created',
            direction: 'desc',
            per_page: 1,
            page: 1,
        });
        const firstItem = data.find((_, index) => index === 0);
        if (firstItem) {
            core.setOutput(exports.GetLatestPrOutputs.number, firstItem.number);
            core.setOutput(exports.GetLatestPrOutputs.mergedAt, firstItem.merged_at);
            // env.GETLATESTPROUTPUTS_LATEST_PR_NUMBER
            // env.GETLATESTPROUTPUTS_LATEST_PR_MERGED_AT
            core.exportVariable(`GetLatestPrOutputs_${exports.GetLatestPrOutputs.number}`, firstItem.number);
            core.exportVariable(`GetLatestPrOutputs_${exports.GetLatestPrOutputs.mergedAt}`, firstItem.merged_at);
            return data;
        }
        else {
            // throw new Error(`Lasted Pr (base=${baseValue}) not found`);
            core.notice(`Lasted Pr (base=${baseValue}) not found`);
            return null;
        }
    }
    catch (err) {
        (0, handle_error_1.handleError)(err);
    }
    core.setOutput(exports.GetLatestPrOutputs.number, '');
    core.setOutput(exports.GetLatestPrOutputs.mergedAt, '');
    return null;
};
exports.getLatestPr = getLatestPr;
exports.default = exports.getLatestPr;
