import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import core from '@actions/core';
import github from '@actions/github';
import { handleError } from './handle-error';

export const GetLatestPrInputs = {
  token: 'GITHUB_TOKEN',
  base: 'GET_LATEST_PR_BASE',
  status: 'GET_LATEST_PR_STATUS', // 'open', 'closed'
};

export const GetLatestPrOutputs = {
  number: 'latest_pr_number',
  mergedAt: 'latest_pr_merged_at',
};

type PrStatus = 'open' | 'closed' | 'all' | undefined;

type GetLatestPrsResult =
  | RestEndpointMethodTypes['pulls']['list']['response']['data']
  | null;

type GitHub = typeof github;
type GitHubContext = typeof github.context;
type Core = typeof core;

type GetLatestPrsOptions = {
  github: GitHub;
  core: Core;
  context: GitHubContext;
  base?: string;
  status?: PrStatus;
};

export const getLatestPr = async (
  getLatesPrsOptions: GetLatestPrsOptions
): Promise<GetLatestPrsResult | null> => {
  // input

  const { github, core, context } = getLatesPrsOptions;

  let baseValue = getLatesPrsOptions.base;
  let prStatus: PrStatus = getLatesPrsOptions.status;

  if (!baseValue) {
    baseValue = core.getInput(GetLatestPrInputs.base);
    if (!baseValue) {
      baseValue = process.env.GET_LATEST_PR_BASE;
    }
  }

  if (!prStatus) {
    prStatus = core.getInput(GetLatestPrInputs.status) as PrStatus; // open, closed

    if (!prStatus) {
      prStatus = process.env.GET_LATEST_PR_STATUS as PrStatus;
    }
  }

  let githubToken = core.getInput(GetLatestPrInputs.token);
  if (!githubToken) {
    githubToken = process.env.GITHUB_TOKEN ?? '';
  }

  const octokit = github.getOctokit(githubToken, undefined);
  const { owner, repo } = context.repo;

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
      core.setOutput(GetLatestPrOutputs.number, firstItem.number);
      core.setOutput(GetLatestPrOutputs.mergedAt, firstItem.merged_at);

      // env.GETLATESTPROUTPUTS_LATEST_PR_NUMBER
      // env.GETLATESTPROUTPUTS_LATEST_PR_MERGED_AT
      core.exportVariable(
        `GetLatestPrOutputs_${GetLatestPrOutputs.number}`,
        firstItem.number
      );
      core.exportVariable(
        `GetLatestPrOutputs_${GetLatestPrOutputs.mergedAt}`,
        firstItem.merged_at
      );
      return data;
    } else {
      // throw new Error(`Lasted Pr (base=${baseValue}) not found`);
      core.notice(`Lasted Pr (base=${baseValue}) not found`);

      return null;
    }
  } catch (err: unknown) {
    handleError(err);
  }

  core.setOutput(GetLatestPrOutputs.number, '');
  core.setOutput(GetLatestPrOutputs.mergedAt, '');

  return null;
};

export default getLatestPr;
