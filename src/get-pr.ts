import { Octokit } from '@octokit/action';
import {
  RestEndpointMethodTypes,
  restEndpointMethods,
} from '@octokit/plugin-rest-endpoint-methods';
import core from '@actions/core';
import github from '@actions/github';
import { handleError } from './handle-error';

const GetPrAsyncInput = {
  prNumber: 'pull_request_number',
};

const GetPrOutput = {
  prNumber: 'pull_request_number',
};

type GetPullResult =
  | RestEndpointMethodTypes['pulls']['get']['response']['data']
  | null;

const getPrAsync = async (
  pullRequestNumber?: number | string
): Promise<GetPullResult | null> => {
  let prNumber: string;
  if (!pullRequestNumber) {
    prNumber = core.getInput(GetPrAsyncInput.prNumber);
  } else {
    prNumber = `${pullRequestNumber}`;
  }

  const prNumberValue = parseInt(prNumber, 10);

  const MyOctokit = Octokit.plugin(restEndpointMethods);

  const octokit = new MyOctokit();

  try {
    if (prNumberValue > 0) {
      const { data } = await octokit.pulls.get({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: prNumberValue,
      });

      core.setOutput(GetPrOutput.prNumber, data.number);

      return data;
    } else {
      throw new Error(`Could not recognize pull_request number`);
    }
  } catch (err: unknown) {
    handleError(err);
  }

  core.setOutput(GetPrOutput.prNumber, '');

  return null;
};

export default getPrAsync;
