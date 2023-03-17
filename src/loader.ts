import * as github from "@actions/github"
import fs from "fs"
import YAML from "yaml"
import {Repository} from "./types"

type ConfigItem = {
  source: Repository | string
  target: Repository | string
}

type Config = {
  repositories: Array<ConfigItem>
}

export async function loadYaml(path: string): Promise<Config> {
  const file = fs.readFileSync(path, "utf8")
  const yaml = YAML.parse(file)

  // iterate over all repositories and parse the source and target strings
  // into a Repository object
  yaml.repositories = yaml.repositories.map((item: ConfigItem) => {
    if (typeof item.source === "string") {
      item.source = parseRepositoryString(item.source)
    }

    if (item.source.url === undefined) {
      item.source.url = "https://github.com"
    }

    if (typeof item.target === "string") {
      item.target = parseRepositoryString(item.target)
    }

    if (item.target.url === undefined) {
      item.target.url = github.context.serverUrl
    }

    return item
  })

  return yaml as Config
}

function parseRepositoryShorthand(input: string): Repository {
  const parts = input.split("/").filter(Boolean)

  return {
    owner: parts[0],
    name: parts[1].replace(/\.git$/, "")
  }
}

function parseRepositoryString(input: string): Repository {
  try {
    const url = new URL(input)

    return {
      url: url.origin,
      ...parseRepositoryShorthand(url.pathname)
    }
  } catch (error) {
    // if the input is not a valid URL, we assume it is a shorthand
  }

  return parseRepositoryShorthand(input)
}

export {parseRepositoryShorthand, parseRepositoryString}
