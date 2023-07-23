import core from "@actions/core";
import { RequestError } from "@octokit/types";

export const handleError = (err: unknown) => {
  const octokitError = err as RequestError;

  if (octokitError) {
    core.debug(`status: ${octokitError.status}, name: ${octokitError.name}`);
    core.startGroup(octokitError.name);
    octokitError.errors?.forEach((oerr) => {
      if (oerr.message) {
        core.error(oerr.message);
      }
    });
    core.endGroup();
  } else {
    const error = err as Error;
    if (error) {
      core.error(error.message);
    } else {
      core.error(`Unknown error: ${err}`);
    }
  }
};
