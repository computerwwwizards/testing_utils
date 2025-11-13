# Guidelines

This project should be a CLI executable by npx or pnpmx
also will expose APIS to use programmatically

Nevertheless the part that works as and entry for the cli shoudl be seprated of the "engine" execution part that shoudl be imported in order to test only the "engine" part via unitary tests

## Code Generation Rules

1. AI-generated code should NOT be commented - keep the code clean without AI-generated comments

2. Tests should be next to the implementation files - place test files at the same level as the code they test