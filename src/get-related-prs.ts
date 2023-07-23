import { Octokit } from '@octokit/action';
import {
  RestEndpointMethodTypes,
  restEndpointMethods,
} from '@octokit/plugin-rest-endpoint-methods';
import core from '@actions/core';
import github from '@actions/github';
import getLatestPr from './get-latest-pr';

type GetListOfPrs =
  RestEndpointMethodTypes['pulls']['list']['response']['data'];

export const GetRelatedPrsInput = {
  base: 'RELATED_PR_BASE',
};

export const GetRelatedPrsOutput = {
  title: 'pr_title',
  body: 'pr_body',
  labels: 'pr_labels',

  milestone: 'pr_milestone',
  assignees: 'pr_assignees',
  reviewers: 'pr_reviewers',
};

export const getRelatedPrs = async (
  base?: string
): Promise<GetListOfPrs | null> => {
  // input
  let baseValue = base;
  if (!baseValue) {
    baseValue = core.getInput(GetRelatedPrsInput.base);
    if (!baseValue) {
      baseValue = process.env[GetRelatedPrsInput.base];
    }
  }

  if (!baseValue) {
    throw new Error('base required');
  }

  let latestMerged: Date;
  const latestPrResults = await getLatestPr();
  const latestPr = latestPrResults?.find((_, index) => index === 0);
  if (latestPr?.merged_at) {
    latestMerged = new Date(latestPr.merged_at);
  } else {
    latestMerged = new Date('1990-01-01T00:00:00Z');
  }

  const MyOctokit = Octokit.plugin(restEndpointMethods);

  const octokit = new MyOctokit();

  let prs: GetListOfPrs = [];

  do {
    let page = 1;
    const { data } = await octokit.pulls.list({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
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

  core.setOutput(
    GetRelatedPrsOutput.title,
    `PRs which Merged into ${baseValue}`
  );
  core.setOutput(GetRelatedPrsOutput.body, body);
  core.setOutput(GetRelatedPrsOutput.labels, (labels ?? []).join(','));
  core.setOutput(GetRelatedPrsOutput.assignees, (assignees ?? []).join(','));
  core.setOutput(GetRelatedPrsOutput.milestone, milestone?.number ?? '');
  core.setOutput(GetRelatedPrsOutput.reviewers, (assignees ?? []).join(','));

  return prs;
};
