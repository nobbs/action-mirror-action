import * as core from "@actions/core"
import * as exec from "@actions/exec"
import fs from "fs"
import os from "os"
import path from "path"

import {Repository, toUrl} from "./types"

class Mirror {
  token?: string
  githubComToken?: string

  constructor(token?: string, githubComToken?: string) {
    this.token = token
    this.githubComToken = githubComToken
  }

  async mirrorRepository(
    source: Repository,
    target: Repository
  ): Promise<boolean> {
    // Create temporary directory
    const repo = `${source.owner}-${source.name}`
    const targetDir = this.createTemporaryDirectory(repo)

    const sourceRepo = toUrl(source, this.githubComToken)
    const targetRepo = toUrl(target, this.token)

    // clone process.env
    const env: {[key: string]: string} = {}
    for (const key in process.env) {
      env[key] = process.env[key] as string
    }

    // Clone source repository
    const cloneRC = await exec.exec(
      "git",
      ["clone", "--mirror", sourceRepo, targetDir],
      {
        env: env
      }
    )

    if (cloneRC !== 0) {
      core.warning(`Failed to clone ${sourceRepo}`)
      return false
    }

    // Push main or master branch
    const pushRC = await exec.exec("git", ["push", "--force", targetRepo], {
      cwd: targetDir
    })

    if (pushRC !== 0) {
      core.warning(`Failed to push ${targetRepo}`)
      return false
    }

    // Push all tags
    const tagsRC = await exec.exec(
      "git",
      ["push", "--tags", "--force", targetRepo],
      {
        cwd: targetDir
      }
    )

    if (tagsRC !== 0) {
      core.warning(`Failed to push tags to ${targetRepo}`)
      return false
    }

    // Delete temporary directory
    this.deleteTemporaryDirectory(targetDir)

    return true
  }

  private createTemporaryDirectory(name?: string): string {
    // fallback to temp if name is not set
    if (name === undefined) {
      name = "temp"
    }

    return fs.mkdtempSync(path.join(os.tmpdir(), name))
  }

  private deleteTemporaryDirectory(dir: string): void {
    // clean up temporary directory
    fs.rmSync(dir, {recursive: true})
  }
}

export default Mirror
