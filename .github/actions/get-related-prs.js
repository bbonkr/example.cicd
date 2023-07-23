"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedPrs = exports.GetRelatedPrsOutput = exports.GetRelatedPrsInput = void 0;
const action_1 = require("@octokit/action");
const plugin_rest_endpoint_methods_1 = require("@octokit/plugin-rest-endpoint-methods");
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const get_latest_pr_1 = __importDefault(require("./get-latest-pr"));
exports.GetRelatedPrsInput = {
    base: 'RELATED_PR_BASE',
    token: 'GITHUB_TOKEN',
};
exports.GetRelatedPrsOutput = {
    title: 'pr_title',
    body: 'pr_body',
    labels: 'pr_labels',
    milestone: 'pr_milestone',
    assignees: 'pr_assignees',
    reviewers: 'pr_reviewers',
};
const getRelatedPrs = async (base) => {
    // input
    let baseValue = base;
    if (!baseValue) {
        baseValue = core_1.default.getInput(exports.GetRelatedPrsInput.base);
        if (!baseValue) {
            baseValue = process.env[exports.GetRelatedPrsInput.base];
        }
    }
    if (!baseValue) {
        throw new Error('base required');
    }
    let githubToken = core_1.default.getInput(exports.GetRelatedPrsInput.token);
    if (!githubToken) {
        githubToken = process.env[exports.GetRelatedPrsInput.token] ?? '';
    }
    if (!githubToken) {
        throw new Error('GitHub token required');
    }
    let latestMerged;
    const latestPrResults = await (0, get_latest_pr_1.default)();
    const latestPr = latestPrResults?.find((_, index) => index === 0);
    if (latestPr?.merged_at) {
        latestMerged = new Date(latestPr.merged_at);
    }
    else {
        latestMerged = new Date('1990-01-01T00:00:00Z');
    }
    const MyOctokit = action_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods);
    const octokit = new MyOctokit({ auth: githubToken });
    let prs = [];
    do {
        let page = 1;
        const { data } = await octokit.pulls.list({
            owner: github_1.default.context.repo.owner,
            repo: github_1.default.context.repo.repo,
            base: baseValue,
            sort: 'created',
            direction: 'desc',
            page,
        });
        const upToPRs = data
            .slice()
            .filter((x) => x.merged_at && new Date(x.merged_at) > latestMerged);
        if (upToPRs && upToPRs.length > 0) {
            prs = [...prs, ...upToPRs];
        }
        else {
            break;
        }
        page = page + 1;
    } while (true);
    const labels = prs
        .flatMap((pr) => pr.labels.map((label) => label.name))
        .filter((x, index, arr) => index === arr.findIndex((a) => x === a));
    const assignees = prs
        .flatMap((pr) => [pr.assignee, ...(pr.assignees ?? [])].map((assignee) => assignee?.login))
        .filter((x, index, arr) => index === arr.findIndex((a) => x === a));
    const milestone = prs
        .filter((pr) => typeof pr.milestone?.number === 'number')
        .find((_, index) => index === 0);
    const body = `## Description

${prs.map((pr) => `- #${pr.number}`).join('\n')}

    `;
    core_1.default.setOutput(exports.GetRelatedPrsOutput.title, `PRs which Merged into ${baseValue}`);
    core_1.default.setOutput(exports.GetRelatedPrsOutput.body, body);
    core_1.default.setOutput(exports.GetRelatedPrsOutput.labels, (labels ?? []).join(','));
    core_1.default.setOutput(exports.GetRelatedPrsOutput.assignees, (assignees ?? []).join(','));
    core_1.default.setOutput(exports.GetRelatedPrsOutput.milestone, milestone?.number ?? '');
    core_1.default.setOutput(exports.GetRelatedPrsOutput.reviewers, (assignees ?? []).join(','));
    return prs;
};
exports.getRelatedPrs = getRelatedPrs;
