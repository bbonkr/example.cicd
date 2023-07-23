"use strict";
// import { Octokit } from '@octokit/action';
// import {
//   RestEndpointMethodTypes,
//   restEndpointMethods,
// } from '@octokit/plugin-rest-endpoint-methods';
// import core from '@actions/core';
// import github from '@actions/github';
// import { handleError } from './handle-error';
// const CreateOrUpdatePrInputs = {
//   head: 'pull_request_head',
//   base: 'pull_request_base',
//   title: 'pull_request_title',
//   body: 'pull_request_body',
//   labels: 'pull_request_labels',
//   milestone: 'pull_request_milestone',
//   project: 'pull_request_project',
//   assignees: 'pull_request_assignees',
//   reviewers: 'pull_request_reviewers',
// };
// type CreateOrUpdatePrOptions = {
//   head: string;
//   base: string;
//   title?: string;
//   body?: string;
//   labels?: string;
//   milestone?: string;
//   project?: string;
//   assignees?: string;
//   reviewers?: string;
// };
// type CreateOrUpdatePrResult = {
//   pullRequestNumber: number;
//   pullRequestUrl: string;
// };
// const createOrUpdatePr = async (
//   options: CreateOrUpdatePrOptions
// ): Promise<CreateOrUpdatePrResult | null> => {
//   let optionValue: CreateOrUpdatePrOptions = options
//     ? options
//     : {
//         head: core.getInput(CreateOrUpdatePrInputs.head),
//         base: core.getInput(CreateOrUpdatePrInputs.base),
//         title: core.getInput(CreateOrUpdatePrInputs.title),
//         body: core.getInput(CreateOrUpdatePrInputs.body),
//         labels: core.getInput(CreateOrUpdatePrInputs.body),
//         milestone: core.getInput(CreateOrUpdatePrInputs.milestone),
//         project: core.getInput(CreateOrUpdatePrInputs.project),
//         assignees: core.getInput(CreateOrUpdatePrInputs.assignees),
//         reviewers: core.getInput(CreateOrUpdatePrInputs.reviewers),
//       };
//   const MyOctokit = Octokit.plugin(restEndpointMethods);
//   const octokit = new MyOctokit();
//   try {
//     const owner = github.context.repo.owner;
//     const repo = github.context.repo.repo;
//     const { data: openedPrs } = await octokit.pulls.list({
//       owner,
//       repo,
//       state: 'open',
//     });
//     const openedPr = openedPrs.find((_, index) => index === 0);
//     let result: CreateOrUpdatePrResult;
//     if (openedPr) {
//       // close PR
//       const { data: updatedPR } = await octokit.pulls.update({
//         owner,
//         repo,
//         pull_number: openedPr.number,
//           state: 'closed',
//       });
//     }
//     const { data: createdPr } = await octokit.pulls.create({
//       owner,
//       repo,
//       base: optionValue.base,
//       head: optionValue.head,
//       title: optionValue.title,
//       body: optionValue.body,
//     });
//     result = {
//       pullRequestNumber: createdPr.number,
//       pullRequestUrl: createdPr.url,
//     };
//     return result;
//   } catch (err: unknown) {
//     handleError(err);
//   }
//   core.setOutput(GetPrOutput.prNumber, '');
//   return null;
// };
// export default createOrUpdatePr;
