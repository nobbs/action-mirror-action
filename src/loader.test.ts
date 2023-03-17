import {afterEach, beforeAll, describe, expect, jest, test} from "@jest/globals"

import * as github from "@actions/github"

import fs from "fs"
import {
  loadYaml,
  parseRepositoryShorthand,
  parseRepositoryString
} from "./loader"

describe("loader", () => {
  beforeAll(() => {
    github.context.serverUrl = "https://ghes.example.com"
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  test("should return an array of repositories", async () => {
    jest.spyOn(fs, "readFileSync").mockReturnValue(`
repositories:
  - source:
      owner: actions
      name: setup-node
    target:
      owner: nobbs
      name: setup-node
  - source:
      owner: actions
      name: checkout
    target:
      owner: nobbs
      name: checkout
`)

    const result = await loadYaml("test.yaml")

    expect(result).toHaveProperty("repositories")
    expect(result.repositories).toHaveLength(2)
    expect(result.repositories).toContainEqual({
      source: {
        owner: "actions",
        name: "setup-node",
        url: "https://github.com"
      },
      target: {
        owner: "nobbs",
        name: "setup-node",
        url: "https://ghes.example.com"
      }
    })
    expect(result.repositories).toContainEqual({
      source: {
        owner: "actions",
        name: "checkout",
        url: "https://github.com"
      },
      target: {
        owner: "nobbs",
        name: "checkout",
        url: "https://ghes.example.com"
      }
    })
  })

  test("should return an array of repositories", async () => {
    jest.spyOn(fs, "readFileSync").mockReturnValue(`
repositories:
  - source: actions/setup-node
    target: nobbs/setup-node
  - source: https://github.com/actions/checkout
    target: https://ghes.example.com/nobbs/checkout
  - source: https://github.com/actions/checkout.git
    target: https://ghes.example.com/nobbs/checkout.git
`)
    const result = await loadYaml("test.yaml")

    expect(result).toHaveProperty("repositories")
    expect(result.repositories).toHaveLength(3)
    expect(result.repositories).toContainEqual({
      source: {
        owner: "actions",
        name: "setup-node",
        url: "https://github.com"
      },
      target: {
        owner: "nobbs",
        name: "setup-node",
        url: "https://ghes.example.com"
      }
    })
    expect(result.repositories).toContainEqual({
      source: {
        owner: "actions",
        name: "checkout",
        url: "https://github.com"
      },
      target: {
        owner: "nobbs",
        name: "checkout",
        url: "https://ghes.example.com"
      }
    })
    expect(result.repositories).toContainEqual({
      source: {
        owner: "actions",
        name: "checkout",
        url: "https://github.com"
      },
      target: {
        owner: "nobbs",
        name: "checkout",
        url: "https://ghes.example.com"
      }
    })
  })

  test("should correctly parse a shorthand repository string", async () => {
    const result = parseRepositoryShorthand("actions/setup-node")

    expect(result).toEqual({
      owner: "actions",
      name: "setup-node"
    })
  })

  test("should correctly parse a full repository string", async () => {
    const result = parseRepositoryString(
      "https://github.com/actions/setup-node"
    )

    expect(result).toEqual({
      url: "https://github.com",
      owner: "actions",
      name: "setup-node"
    })
  })
})
