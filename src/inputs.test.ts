import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  jest
} from "@jest/globals"
import Inputs, {InputVariable} from "./inputs"

describe("Inputs", () => {
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {...env}
  })

  afterEach(() => {
    process.env = env
  })

  test("should fail due to missing inputs", async () => {
    expect(() => new Inputs()).toThrow(/Input (.*) is required/)
  })

  test("should parse all required inputs", async () => {
    process.env["GITHUB_TOKEN"] = "some-token"
    process.env["INPUT_CONFIG-FILE"] = "/tmp/config.yaml"

    const inputs = new Inputs()
    expect(inputs.token).toEqual("some-token")
    expect(inputs.configFile).toEqual("/tmp/config.yaml")
  })

  test("parseString() - should correctly parse string inputs", async () => {
    process.env["INPUT_TEST"] = "test"

    const input = {
      name: "test",
      required: true
    } as InputVariable

    expect(Inputs["parseString"](input)).toBe("test")
  })

  test("parseString() - should correctly parse string inputs from env vars", async () => {
    process.env["TEST"] = "test"

    const input = {
      name: "test",
      required: true,
      env: "TEST"
    } as InputVariable

    expect(Inputs["parseString"](input)).toBe("test")
  })

  test("parseString() - should throw error if input is required and not provided", async () => {
    process.env["XYZ"] = "test"

    const input = {
      name: "test",
      required: true,
      env: "TEST"
    } as InputVariable

    expect(() => Inputs["parseString"](input)).toThrow(/Input (.*) is required/)
  })

  test("parseString() - should return empty string if input is not required and not provided", async () => {
    process.env["XYZ"] = "test"

    const input = {
      name: "test",
      required: false,
      env: "TEST"
    } as InputVariable

    expect(Inputs["parseString"](input)).toBe("")
  })

  test("parseString() - should fall back to default value if input is not required and not provided", async () => {
    process.env["XYZ"] = "test"

    const input = {
      name: "test",
      required: false,
      env: "TEST",
      default: "default"
    } as InputVariable

    expect(Inputs["parseString"](input)).toBe("default")
  })
})
