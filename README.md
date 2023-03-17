# Action Mirror Action

This action can be used to mirror external actions from GitHub (or any other Git
repository) into your own organization or repository. This is useful if you want
to use an action that is available on the GitHub Marketplace, but not yet in our
internal GitHub Enterprise instance.

This action is also being run from this repository to mirror the actions that
are listed in the `.github/mirror-actions.yaml` file. If you want to add a new
action to be mirrored, please open a pull request to add it to that file.

## Usage

The action is quite simple to use but it does require a few inputs to be set:

* `token`: The token to use for authentication. This should be a personal access
  token with `admin:org` permissions if you want to mirror into an organization,
  or better yet, an application token with the `Administration` scope on
  organization level.

* `config-file`: The path to the configuration file that contains the list of
  actions to mirror. This file should be in YAML format and should contain a
  list of objects called `repositories`. Each repository object should contain
  the following properties:

  * `source`: The URL of the repository to mirror from. It can be a full URL
    (e.g. `https://github.com/actions/checkout`) or just the slug of the
    repository (e.g. `actions/checkout`). If you use the slug, it will
    automatically use the GitHub.com URL.

  * `target`: The URL of the repository to mirror to or the slug of the
    repository. For the target, it's best to just use the repository slug, as it
    will fallback to the GitHub Enterprise URL if it's not specified.

* `github-com-token`: The token to use for authentication when mirroring from
  GitHub.com. This is only required if you want to mirror from GitHub.com and
  are facing issues with the rate limit. If you don't specify this token, the
  action will try without authentication and may fail.
