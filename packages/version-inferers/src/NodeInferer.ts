import { createReadStream, existsSync } from "node:fs";
import VersionPrecedenceResolver from "./precedence-resolver/resolver/PrecedenceResolver";
import { CiYamlStreamSource } from "./precedence-resolver/stream-source/CiYamlStreamSource";
import { join, resolve } from "node:path";
import { NvmrcStreamSource } from "./precedence-resolver/stream-source/NvmrcStreamSource";
import { PackageJsonStreamSource } from "./precedence-resolver/stream-source/PackageJsonStreamSource";
import { ResolveOptions } from "./precedence-resolver/resolver/types";

export { ConflictStrategy } from "./precedence-resolver/resolver/types";

type NodeInfererOptions = 
  | { workflowFilePath: string; workflowOption: string[]; rootPath?: string }
  | { workflowFilePath?: undefined | null; rootPath?: string }


/**
 * Tries to infer the version of node of the project by reading, in the followinf order
 * - A yml file if provided a path for it
 * - .nvrmc if exists
 * - packaje.json
 *@example
  const nodeVersion = await inferNodeVersion({
    workflowFilePath: "./.github/workflows/deploy.yml",
    workflowOption: ["jobs", "deploy", "steps", "0", "with", "node-version"]
  })
 * 
 **/
export async function inferNodeVersion(
  options: NodeInfererOptions & ResolveOptions<'workflow' | 'nvmrc' | 'package.json'> = {}
){
  const versionInferer = new VersionPrecedenceResolver()
  const { rootPath = process.cwd()  } = options ;

  if(options.workflowFilePath){
    options.workflowOption

    const workflowPath = resolve(rootPath, options.workflowFilePath);
    if (existsSync(workflowPath)) {
      versionInferer
        .registerSource(
          'workflow', 
          new CiYamlStreamSource(
            ()=>createReadStream(workflowPath),
            options.workflowOption.join('.') 
          )
        ) 
    }
  }

  const nvmrcPath = join(rootPath, './.nvmrc');

  if (existsSync(nvmrcPath)) {
    versionInferer
      .registerSource(
        'nvmrc',
        new NvmrcStreamSource(
          ()=>createReadStream(nvmrcPath)
        )
      )
  }

  const packageJsonPath = join(rootPath, './package.json');

  if (existsSync(packageJsonPath)) {
    versionInferer
      .registerSource(
        'package.json',
        new PackageJsonStreamSource(
          ()=>createReadStream(packageJsonPath)
        )
      )
  }

  return await versionInferer.resolveVersion({
    conflictStrategy: options?.conflictStrategy,
    order: options.order
  })
}

