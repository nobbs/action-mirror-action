export type Repository = {
  owner: string
  name: string
  url?: string
}

/**
 * Convert a repository to a URL string.
 *
 * @param repository The repository to convert
 * @param token The token to use for authentication
 * @returns The repository as a URL string
 */
export function toUrl(repository: Repository, token?: string): string {
  const urlString = `${repository.url}/${repository.owner}/${repository.name}.git`
  const url = new URL(urlString)

  if (token === undefined || token === "") {
    // If no token is provided, return the url without credentials
    return url.toString()
  } else {
    // Otherwise, build a url with the token as the password for the username
    // "x-access-token"
    url.username = "x-access-token"
    url.password = token
    return url.toString()
  }
}
