import { Command } from "commander";
import validate from "./validate";

const program = new Command();

program
  .name("oas-shaper")
  .description("CLI tool for working with OpenAPI documents")
  .version("0.1.0");

program
  .command("validate")
  .description("Validate an OpenAPI document")
  .requiredOption("-f, --file <file>", "Path to the OpenAPI document")
  .action(async (params: { file: string }) => {
    await validate({ filePath: params.file });
  });

program.parse();
