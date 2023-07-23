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
exports.getRelatedPrs = exports.GetRelatedPrsOutput = exports.GetRelatedPrsInput = void 0;
const action_1 = require("@octokit/action");
const plugin_rest_endpoint_methods_1 = require("@octokit/plugin-rest-endpoint-methods");
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const get_latest_pr_1 = __importDefault(require("./get-latest-pr"));
exports.GetRelatedPrsInput = {
    head: 'related_pr_head',
    base: 'releated_pr_base',
};
exports.GetRelatedPrsOutput = {
    title: 'pr_title',
    body: 'pr_body',
    labels: 'pr_labels',
    milestone: 'pr_milestones',
    assignees: 'pr_assignees',
    reviewers: 'pr_reviewers',
};
const getRelatedPrs = (base) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // input
    let baseValue = base;
    if (!baseValue) {
        baseValue = core_1.default.getInput(exports.GetRelatedPrsInput.base);
    }
    let latestMerged;
    const latestPrResults = yield (0, get_latest_pr_1.default)();
    const latestPr = latestPrResults === null || latestPrResults === void 0 ? void 0 : latestPrResults.find((_, index) => index === 0);
    if (latestPr === null || latestPr === void 0 ? void 0 : latestPr.merged_at) {
        latestMerged = new Date(latestPr.merged_at);
    }
    else {
        latestMerged = new Date('1990-01-01T00:00:00Z');
    }
    const MyOctokit = action_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods);
    const octokit = new MyOctokit();
    let prs = [];
    do {
        let page = 1;
        const { data } = yield octokit.pulls.list({
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
        .flatMap((pr) => { var _a; return [pr.assignee, ...((_a = pr.assignees) !== null && _a !== void 0 ? _a : [])].map((assignee) => assignee === null || assignee === void 0 ? void 0 : assignee.login); })
        .filter((x, index, arr) => index === arr.findIndex((a) => x === a));
    const milestone = prs
        .filter((pr) => { var _a; return typeof ((_a = pr.milestone) === null || _a === void 0 ? void 0 : _a.number) === 'number'; })
        .find((_, index) => index === 0);
    const body = `## Description

${prs.map((pr) => `- #${pr.number}`).join('\n')}

    `;
    core_1.default.setOutput(exports.GetRelatedPrsOutput.title, `PRs which Merged into ${baseValue}`);
    core_1.default.setOutput(exports.GetRelatedPrsOutput.body, body);
    core_1.default.setOutput(exports.GetRelatedPrsOutput.labels, (labels !== null && labels !== void 0 ? labels : []).join(','));
    core_1.default.setOutput(exports.GetRelatedPrsOutput.assignees, (assignees !== null && assignees !== void 0 ? assignees : []).join(','));
    core_1.default.setOutput(exports.GetRelatedPrsOutput.milestone, (_a = milestone === null || milestone === void 0 ? void 0 : milestone.number) !== null && _a !== void 0 ? _a : '');
    core_1.default.setOutput(exports.GetRelatedPrsOutput.reviewers, (assignees !== null && assignees !== void 0 ? assignees : []).join(','));
    return prs;
});
exports.getRelatedPrs = getRelatedPrs;
