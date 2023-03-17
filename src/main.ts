import * as core from "@actions/core"
import Inputs from "./inputs"
import {loadYaml} from "./loader"

import GitHub from "./github"
import Mirror from "./mirror"
import {toUrl} from "./types"

async function run(): Promise<void> {
  try {
    const inputs = new Inputs()
    const github = new GitHub(inputs.token, inputs.githubComToken)
    const mirror = new Mirror(inputs.token, inputs.githubComToken)
    const config = await loadYaml(inputs.configFile)

    for (const repository of config.repositories) {
      // Check if repository source or target is not defined or still a string
      if (
        repository.source === undefined ||
        repository.target === undefined ||
        typeof repository.source === "string" ||
        typeof repository.target === "string"
      ) {
        core.error(
          `Repository source or target is not defined or still a string: ${JSON.stringify(
            repository
          )}`
        )
        continue
      }

      core.startGroup(
        `Mirroring ${toUrl(repository.source)} to ${toUrl(repository.target)}`
      )

      // Check if repository exists, if not create it
      if (
        !(await github.doesRepositoryExist(
          repository.target.name,
          repository.target.owner
        ))
      ) {
        core.warning(
          `Repository ${repository.target.owner}/${repository.target.name} does not exist, creating it`
        )
        await github.createRepository(
          repository.target.name,
          repository.target.owner
        )

        // disable actions for the target repository
        await github.disableRepositoryActions(repository.target)

        // set description for the target repository
        await github.setRepositoryDescription(
          repository.source,
          repository.target,
          `Automatically mirrored from ${toUrl(repository.source)}`
        )

        // set topics for the target repository
        const topics = ["actions", "mirror", repository.source.owner]
        await github.setRepositoryTopics(repository.target, topics)

        // set visibility for the target repository
        const visibility = (await github.isOrg(repository.target.owner))
          ? "internal"
          : "private"
        await github.setRepositoryVisibility(repository.target, visibility)

        // wait 15 seconds to make sure the repository is created
        await new Promise(resolve => setTimeout(resolve, 15000))
      }

      // mirror repository
      core.info(
        `Mirroring ${repository.source.owner}/${repository.source.name} to ${repository.target.owner}/${repository.target.name}`
      )
      await mirror.mirrorRepository(repository.source, repository.target)

      // close group
      core.endGroup()
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
