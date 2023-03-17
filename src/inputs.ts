import * as core from "@actions/core"

type InputVariable = {
  name: string
  required: boolean
  default?: string
  env: string
}

class Inputs {
  private readonly options = {
    token: {
      name: "token",
      required: true,
      type: "string",
      env: "GITHUB_TOKEN"
    } as InputVariable,
    configFile: {
      name: "config-file",
      required: true,
      type: "string",
      env: "CONFIG_FILE",
      default: ".github/mirror-actions.yaml"
    } as InputVariable,
    githubComToken: {
      name: "github-com-token",
      required: false,
      type: "string",
      env: "GITHUB_COM_TOKEN"
    } as InputVariable
  }

  readonly token: string
  readonly configFile: string
  readonly githubComToken?: string

  constructor() {
    this.token = Inputs.parseString(this.options.token)
    this.configFile = Inputs.parseString(this.options.configFile)
    this.githubComToken = Inputs.parseString(this.options.githubComToken)
  }

  private static parseString(input: InputVariable): string {
    const value = core.getInput(input.name)
    const envValue = process.env[input.env]

    if (value !== undefined && value !== "") {
      return value
    } else if (envValue !== undefined && envValue !== "") {
      return envValue
    } else if (input.default !== undefined) {
      return input.default
    } else if (input.required) {
      throw new Error(`Input ${input.name} is required`)
    } else {
      return ""
    }
  }
}

export default Inputs
export {InputVariable}
