import { Octokit } from '@octokit/action';
import {
  RestEndpointMethodTypes,
  restEndpointMethods,
} from '@octokit/plugin-rest-endpoint-methods';
import core from '@actions/core';
import github from '@actions/github';
import { handleError } from './handle-error';

export const GetLatestPrInputs = {
  base: 'base',
  status: 'status', // 'open', 'closed'
};

export const GetLatestPrOutputs = {
  number: 'latest_pr_number',
  mergedAt: 'latest_pr_merged_at',
};

type PrStatus = 'open' | 'closed' | 'all' | undefined;

type GetLatestPrsResult =
  | RestEndpointMethodTypes['pulls']['list']['response']['data']
  | null;

const getLatestPr = async (
  base?: string,
  status?: PrStatus
): Promise<GetLatestPrsResult | null> => {
  // input

  let baseValue = base;
  let prStatus: PrStatus = status;

  if (!baseValue) {
    baseValue = core.getInput(GetLatestPrInputs.base);
    if (!baseValue) {
      baseValue = process.env.GET_LATEST_PR_BASE;
    }
  }

  if (!status) {
    prStatus = core.getInput(GetLatestPrInputs.status) as PrStatus; // open, closed

    if (!prStatus) {
      prStatus = process.env.GET_LATEST_PR_STATUS as PrStatus;
    }
  }

  const MyOctokit = Octokit.plugin(restEndpointMethods);
  const octokit = new MyOctokit();

  try {
    const { data } = await octokit.pulls.list({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
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

      return data;
    } else {
      throw new Error(`Lasted Pr (base=${base}) not found`);
    }
  } catch (err: unknown) {
    handleError(err);
  }

  core.setOutput(GetLatestPrOutputs.number, '');
  core.setOutput(GetLatestPrOutputs.mergedAt, '');
  return null;
};

export default getLatestPr;
