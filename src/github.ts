import * as github from "@actions/github"
import {Octokit} from "@octokit/rest"
import {RequestError} from "@octokit/types"

import {Repository, toUrl} from "./types"

class GitHub {
  client: Octokit
  githubComToken?: string

  constructor(token: string, githubComToken?: string) {
    this.client = new Octokit({
      auth: token,
      baseUrl: github.context.apiUrl
    })

    this.githubComToken = githubComToken
  }

  async isOrg(owner: string): Promise<boolean> {
    try {
      await this.client.orgs.get({
        org: owner
      })

      return true
    } catch (err) {
      const error = err as RequestError
      if (error.status === 404) {
        return false
      }

      throw error
    }
  }

  async doesRepositoryExist(name: string, owner: string): Promise<boolean> {
    try {
      await this.client.repos.get({
        owner,
        repo: name
      })

      return true
    } catch (err) {
      const error = err as RequestError
      if (error.status === 404) {
        return false
      }

      throw error
    }
  }

  async createRepository(name: string, owner: string): Promise<boolean> {
    const ownerIsOrg = await this.isOrg(owner)

    try {
      if (!ownerIsOrg) {
        await this.client.repos.createForAuthenticatedUser({
          name: name
        })
      } else {
        await this.client.repos.createInOrg({
          org: owner,
          name: name
        })
      }

      return true
    } catch (err) {
      const error = err as RequestError
      if (error.status === 422) {
        return false
      }

      throw error
    }
  }

  async disableRepositoryActions(repository: Repository): Promise<boolean> {
    try {
      await this.client.actions.setGithubActionsPermissionsRepository({
        owner: repository.owner,
        repo: repository.name,
        enabled: false
      })
    } catch (err) {
      const error = err as RequestError
      if (error.status === 404) {
        return false
      }

      throw error
    }

    return true
  }

  async setRepositoryVisibility(
    repository: Repository,
    visibility: "public" | "private" | "internal"
  ): Promise<boolean> {
    try {
      await this.client.repos.update({
        owner: repository.owner,
        repo: repository.name,
        visibility: visibility as unknown as "public" | "private"
      })
    } catch (err) {
      const error = err as RequestError
      if (error.status === 404) {
        return false
      }

      throw error
    }

    return true
  }

  async setRepositoryDescription(
    source: Repository,
    target: Repository,
    description: string
  ): Promise<boolean> {
    try {
      await this.client.repos.update({
        owner: target.owner,
        repo: target.name,
        description: description,
        homepage: toUrl(source)
      })
    } catch (err) {
      const error = err as RequestError
      if (error.status === 404) {
        return false
      }

      throw error
    }

    return true
  }

  async setRepositoryTopics(
    repository: Repository,
    topics: string[]
  ): Promise<boolean> {
    try {
      await this.client.repos.replaceAllTopics({
        owner: repository.owner,
        repo: repository.name,
        names: topics
      })
    } catch (err) {
      const error = err as RequestError
      if (error.status === 404) {
        return false
      }

      throw error
    }

    return true
  }
}

export default GitHub
