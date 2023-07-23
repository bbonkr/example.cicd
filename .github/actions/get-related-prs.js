"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedPrs = exports.GetRelatedPrsOutput = exports.GetRelatedPrsInput = void 0;
const action_1 = require("@octokit/action");
const plugin_rest_endpoint_methods_1 = require("@octokit/plugin-rest-endpoint-methods");
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
const getRelatedPrs = async (GetRelatedPrsOptions) => {
    const { github, core, context } = GetRelatedPrsOptions;
    const { owner, repo } = context.repo;
    // input
    let baseValue = GetRelatedPrsOptions.base;
    if (!baseValue) {
        baseValue = core.getInput(exports.GetRelatedPrsInput.base);
        if (!baseValue) {
            baseValue = process.env.RELATED_PR_BASE;
        }
    }
    if (!baseValue) {
        throw new Error('base required');
    }
    let githubToken = core.getInput(exports.GetRelatedPrsInput.token);
    if (!githubToken) {
        githubToken = process.env.GITHUB_TOKEN ?? '';
    }
    if (!githubToken) {
        throw new Error('GitHub token required');
    }
    let latestMerged;
    const latestPrResults = await (0, get_latest_pr_1.default)({ github, core, context });
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
            owner,
            repo,
            base: baseValue,
            sort: 'created',
            direction: 'desc',
            state: 'closed',
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
    const title = `PRs which Merged into ${baseValue}`;
    core.setOutput(exports.GetRelatedPrsOutput.title, title);
    core.setOutput(exports.GetRelatedPrsOutput.body, body);
    core.setOutput(exports.GetRelatedPrsOutput.labels, (labels ?? []).join(','));
    core.setOutput(exports.GetRelatedPrsOutput.assignees, (assignees ?? []).join(','));
    core.setOutput(exports.GetRelatedPrsOutput.milestone, milestone?.number ?? '');
    core.setOutput(exports.GetRelatedPrsOutput.reviewers, (assignees ?? []).join(','));
    // env.GETRELATEDPRSOUTPUT_PR_BODY
    // env.GETRELATEDPRSOUTPUT_PR_TITLE
    // env.GETRELATEDPRSOUTPUT_PR_LABELS
    // env.GETRELATEDPRSOUTPUT_PR_MILESTONE
    // env.GETRELATEDPRSOUTPUT_PR_ASSIGNEES
    // env.GETRELATEDPRSOUTPUT_PR_REVIEWERS
    core.exportVariable(`GetRelatedPrsOutput_${exports.GetRelatedPrsOutput.title}`.toUpperCase(), title);
    core.exportVariable(`GetRelatedPrsOutput_${exports.GetRelatedPrsOutput.body}`.toUpperCase(), body);
    core.exportVariable(`GetRelatedPrsOutput_${exports.GetRelatedPrsOutput.labels}`.toUpperCase(), (labels ?? []).join(','));
    core.exportVariable(`GetRelatedPrsOutput_${exports.GetRelatedPrsOutput.assignees}`.toUpperCase(), (assignees ?? []).join(','));
    core.exportVariable(`GetRelatedPrsOutput_${exports.GetRelatedPrsOutput.milestone}`.toUpperCase(), milestone?.number ?? '');
    core.exportVariable(`GetRelatedPrsOutput_${exports.GetRelatedPrsOutput.reviewers}`.toUpperCase(), (assignees ?? []).join(','));
    return prs;
};
exports.getRelatedPrs = getRelatedPrs;
exports.default = exports.getRelatedPrs;
