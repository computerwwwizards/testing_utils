
# Problem Statement: Node.js Version Inference

## Goal
Automatically infer the Node.js version a project was built or is intended to run with, by analyzing project files and configurations. This helps ensure compatibility, reproducibility, and correct environment setup for development, CI/CD, and deployment.

## Why is this needed?
- Many JavaScript/Node.js projects do not explicitly document the Node.js version required.
- Different files and configurations may specify or imply the Node.js version (sometimes with conflicts).
- Automated tools, CI/CD pipelines, and developers need a reliable way to determine the correct Node.js version to use.

## Requirements
- **Configurable precedence:** Users can specify the order in which sources are checked (e.g., `.nvmrc` vs `package.json` vs CI/CD config).
- **Configurable conflict resolution:** Users can define how to handle conflicting version information.
- **Configurable conflict handling:** Users can choose what to do when conflicts are detected (warn, error, pick highest/lowest, etc).

## Possible sources for Node.js version
- `.nvmrc` file
- `package.json` (e.g., `engines.node` field)
- CI/CD configuration files (e.g., GitHub Actions, GitLab CI, CircleCI, etc. — usually YAML files)

## Example: Custom YAML Extraction
If a CI/CD YAML file is used, the tool should allow configuration of which field to extract, e.g.:

```yaml
steps:
	data:
		input:
			node_version: 18.16.0
```
Configuration could specify: `steps.data.input.node_version` as the path to extract.

## Summary
The tool should be flexible, extensible, and robust, supporting multiple sources and user-defined rules for inferring the Node.js version.
