/* eslint-disable @typescript-eslint/no-explicit-any */
import { Spectral, Document } from "@stoplight/spectral-core";
import { Json, Yaml } from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import fs from "node:fs";
import chalk from "chalk";

import rulesetUrlVersioning from "@stoplight/spectral-url-versioning";
import ourRuleset from "./spectral/ruleset";

type ValidateParams = {
  filePath: string;
};

const validate = async (params: ValidateParams) => {
  const content = fs.readFileSync(params.filePath, "utf-8");

  // this will be our API specification document
  let myDocument;

  // check if content is json or yaml
  if (params.filePath.endsWith(".json")) {
    myDocument = new Document(content, Json);
  } else {
    myDocument = new Document(content, Yaml);
  }

  const spectral = new Spectral();
  spectral.setRuleset({
    ...rulesetUrlVersioning,

    ...(ourRuleset as any),
  });

  // we lint our document using the ruleset we passed to the Spectral object
  const result = await spectral.run(myDocument);
  // console.log(result);
  const response = {
    totalIssues: result.length,
    // filter unique results by its message
    // issues: result
    //   .map((item) => item.message)
    //   .filter((value, index, self) => self.indexOf(value) === index),
    // Filter unique results by its message and inserted in object by a severity key.
    // The severity keyword is optional and can be error (0), warn (1), info (2), hint (3), or off. The default value is warn.
    // Use severities as a text.
    // result is: { issues: { "error": [...], "warn": [...], ... } }

    // make all messages unique
    error: {
      total: result.filter((item) => item.severity === 0).length,
      items: result
        .filter((item) => item.severity === 0)
        .map((item) => item.message)
        .filter((value, index, self) => self.indexOf(value) === index),
    },
    warn: {
      total: result.filter((item) => item.severity === 1).length,
      items: result
        .filter((item) => item.severity === 1)
        .map((item) => item.message)
        .filter((value, index, self) => self.indexOf(value) === index),
    },
    info: {
      total: result.filter((item) => item.severity === 2).length,
      items: result
        .filter((item) => item.severity === 2)
        .map((item) => item.message)
        .filter((value, index, self) => self.indexOf(value) === index),
    },
    hint: {
      total: result.filter((item) => item.severity === 3).length,
      items: result
        .filter((item) => item.severity === 3)
        .map((item) => item.message)
        .filter((value, index, self) => self.indexOf(value) === index),
    },
  };

  // pretty log errors
  console.log(chalk.red(response.error.items.map((item) => item).join("\n")));

  // pretty log warnings
  console.log(chalk.yellow(response.warn.items.map((item) => item).join("\n")));

  // pretty log infos
  console.log(chalk.blue(response.info.items.map((item) => item).join("\n")));

  // pretty log hints
  console.log(chalk.green(response.hint.items.map((item) => item).join("\n")));

  console.log(
    chalk.bold.red(`Errors: ${response.error.total} | `),
    chalk.bold.yellow(`Warnings: ${response.warn.total} | `),
    chalk.blue(`Infos: ${response.info.total} | `),
    chalk.green(`Hints: ${response.hint.total}`),
  );
};

export default validate;
