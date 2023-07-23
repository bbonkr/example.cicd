import { Octokit } from '@octokit/action';
import {
  RestEndpointMethodTypes,
  restEndpointMethods,
} from '@octokit/plugin-rest-endpoint-methods';
import core from '@actions/core';
import github from '@actions/github';
import getLatestPr from './get-latest-pr';

type GitHub = typeof github;
type GitHubContext = typeof github.context;
type Core = typeof core;

type GetListOfPrs =
  RestEndpointMethodTypes['pulls']['list']['response']['data'];

export const GetRelatedPrsInput = {
  base: 'RELATED_PR_BASE',
  token: 'GITHUB_TOKEN',
};

export const GetRelatedPrsOutput = {
  title: 'pr_title',
  body: 'pr_body',
  labels: 'pr_labels',

  milestone: 'pr_milestone',
  assignees: 'pr_assignees',
  reviewers: 'pr_reviewers',
};

type GetRelatedPrsOptions = {
  github: Octokit;
  context: GitHubContext;
  core: Core;
  base?: string;
};

export const getRelatedPrs = async (
  GetRelatedPrsOptions: GetRelatedPrsOptions
): Promise<GetListOfPrs | null> => {
  const { github, core, context } = GetRelatedPrsOptions;

  const { owner, repo } = context.repo;

  // input
  let baseValue = GetRelatedPrsOptions.base;
  if (!baseValue) {
    baseValue = core.getInput(GetRelatedPrsInput.base);
    if (!baseValue) {
      baseValue = process.env.RELATED_PR_BASE;
    }
  }

  if (!baseValue) {
    throw new Error('base required');
  }

  let githubToken = core.getInput(GetRelatedPrsInput.token);
  if (!githubToken) {
    githubToken = process.env.GITHUB_TOKEN ?? '';
  }

  if (!githubToken) {
    throw new Error('GitHub token required');
  }

  let latestMerged: Date;
  const latestPrResults = await getLatestPr({ github, core, context });
  const latestPr = latestPrResults?.find((_, index) => index === 0);
  if (latestPr?.merged_at) {
    latestMerged = new Date(latestPr.merged_at);
  } else {
    latestMerged = new Date('1990-01-01T00:00:00Z');
  }

  let prs: GetListOfPrs = [];

  do {
    let page = 1;
    const { data } = await github.rest.pulls.list({
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
    } else {
      break;
    }

    page = page + 1;
  } while (true);

  const labels = prs
    .flatMap((pr) => pr.labels.map((label) => label.name))
    .filter((x, index, arr) => index === arr.findIndex((a) => x === a));

  const assignees = prs
    .flatMap((pr) =>
      [pr.assignee, ...(pr.assignees ?? [])].map((assignee) => assignee?.login)
    )
    .filter((x, index, arr) => index === arr.findIndex((a) => x === a));

  const milestone = prs
    .filter((pr) => typeof pr.milestone?.number === 'number')
    .find((_, index) => index === 0);

  const body = `## Description

${prs.map((pr) => `- #${pr.number}`).join('\n')}

    `;
  const title = `PRs which Merged into ${baseValue}`;

  core.setOutput(GetRelatedPrsOutput.title, title);
  core.setOutput(GetRelatedPrsOutput.body, body);
  core.setOutput(GetRelatedPrsOutput.labels, (labels ?? []).join(','));
  core.setOutput(GetRelatedPrsOutput.assignees, (assignees ?? []).join(','));
  core.setOutput(GetRelatedPrsOutput.milestone, milestone?.number ?? '');
  core.setOutput(GetRelatedPrsOutput.reviewers, (assignees ?? []).join(','));

  // env.GETRELATEDPRSOUTPUT_PR_BODY
  // env.GETRELATEDPRSOUTPUT_PR_TITLE
  // env.GETRELATEDPRSOUTPUT_PR_LABELS
  // env.GETRELATEDPRSOUTPUT_PR_MILESTONE
  // env.GETRELATEDPRSOUTPUT_PR_ASSIGNEES
  // env.GETRELATEDPRSOUTPUT_PR_REVIEWERS
  core.exportVariable(
    `GetRelatedPrsOutput_${GetRelatedPrsOutput.title}`.toUpperCase(),
    title
  );

  core.exportVariable(
    `GetRelatedPrsOutput_${GetRelatedPrsOutput.body}`.toUpperCase(),
    body
  );
  core.exportVariable(
    `GetRelatedPrsOutput_${GetRelatedPrsOutput.labels}`.toUpperCase(),
    (labels ?? []).join(',')
  );
  core.exportVariable(
    `GetRelatedPrsOutput_${GetRelatedPrsOutput.assignees}`.toUpperCase(),
    (assignees ?? []).join(',')
  );
  core.exportVariable(
    `GetRelatedPrsOutput_${GetRelatedPrsOutput.milestone}`.toUpperCase(),
    milestone?.number ?? ''
  );
  core.exportVariable(
    `GetRelatedPrsOutput_${GetRelatedPrsOutput.reviewers}`.toUpperCase(),
    (assignees ?? []).join(',')
  );

  return prs;
};

export default getRelatedPrs;
