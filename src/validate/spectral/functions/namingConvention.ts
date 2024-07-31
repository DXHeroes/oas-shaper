/* eslint-disable @typescript-eslint/no-explicit-any */

// Check naming convention.

// options:
//   type: 'boolean' | 'date-time'
//   match: RegExp
//   notMatch: RegExp

/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

import { pattern } from "@stoplight/spectral-functions";

function isBooleanSchema(schema: any) {
  return schema.type === "boolean";
}

function isDateTimeSchema(schema: any) {
  return schema.type === "string" && schema.format === "date-time";
}

function isSchemaType(type: any) {
  switch (type) {
    case "boolean":
      return isBooleanSchema;
    case "date-time":
      return isDateTimeSchema;
    default:
      return () => false;
  }
}

// Check all property names in the schema comply with the naming convention.
function propertyNamingConvention(
  schema: any,
  options: any,
  path: any,
  context: any,
): any {
  const errors = [];

  const { type, ...patternOpts } = options;
  const isType = isSchemaType(type);

  // Check property names
  for (const name of schema.properties ? Object.keys(schema.properties) : []) {
    if (
      isType(schema.properties[name]) &&
      pattern(name, patternOpts, context)
    ) {
      errors.push({
        message: `property "${name}" does not follow ${options.type} naming convention`,
        path: [...path, "properties", name],
      });
    }
  }

  if (schema.items) {
    errors.push(
      ...propertyNamingConvention(
        schema.items,
        options,
        [...path, "items"],
        context,
      ),
    );
  }

  for (const applicator of ["allOf", "anyOf", "oneOf"]) {
    if (schema[applicator] && Array.isArray(schema[applicator])) {
      for (const [index, value] of schema[applicator].entries()) {
        errors.push(
          ...propertyNamingConvention(
            value,
            options,
            [...path, applicator, index],
            context,
          ),
        );
      }
    }
  }

  return errors;
}

// input is ignored -- we take the whole document as input
// Rule is run on resolved doc.
const namingConvetion = (input: any, options: any, context: any) => {
  const oasDoc = input;

  const oas2 = oasDoc.swagger === "2.0";
  const oas3 = oasDoc.openapi?.startsWith("3.") || false;

  const { type, ...patternOpts } = options;
  const isType = isSchemaType(type);

  const errors = [];

  // Check all property names in the schema comply with the naming convention.
  for (const pathKey of Object.keys(oasDoc.paths)) {
    const pathItem = oasDoc.paths[pathKey];
    for (const opMethod of [
      "get",
      "put",
      "post",
      "delete",
      "options",
      "head",
      "patch",
      "trace",
    ]) {
      if (pathItem[opMethod]) {
        const op = pathItem[opMethod];

        // Processing for oas2 documents
        if (oas2) {
          // Check the oas2 parameters
          for (let i = 0; i < op.parameters?.length || 0; i += 1) {
            const param = op.parameters[i];
            if (
              param.in !== "body" &&
              isType(param) &&
              pattern(param.name, patternOpts, context)
            ) {
              errors.push({
                message: `parameter "${param.name}" does not follow ${options.type} naming convention`,
                path: ["paths", pathKey, opMethod, "parameters", i, "name"],
              });
            }
          }
          // Check the oas2 body parameter
          const bodyParam = op.parameters?.find((p: any) => p.in === "body");
          if (bodyParam) {
            const bodyIndex = op.parameters.indexOf(bodyParam);
            errors.push(
              ...propertyNamingConvention(
                bodyParam.schema,
                options,
                ["paths", pathKey, opMethod, "parameters", bodyIndex, "schema"],
                context,
              ),
            );
          }
          // Check the oas2 responses
          for (const [responseKey, response] of Object.entries(op.responses)) {
            if ((response as any).schema) {
              errors.push(
                ...propertyNamingConvention(
                  (response as any).schema,
                  options,
                  [
                    "paths",
                    pathKey,
                    opMethod,
                    "responses",
                    responseKey,
                    "schema",
                  ],
                  context,
                ),
              );
            }
          }
        }

        // Processing for oas3 documents
        if (oas3) {
          // Check the oas3 parameters
          for (let i = 0; i < op.parameters?.length || 0; i += 1) {
            const param = op.parameters[i];
            if (
              param.schema &&
              isType(param.schema) &&
              pattern(param.name, patternOpts, context)
            ) {
              errors.push({
                message: `parameter "${param.name}" does not follow ${options.type} naming convention`,
                path: ["paths", pathKey, opMethod, "parameters", i, "name"],
              });
            }
          }
          // Check the oas3 requestBody
          if (op.requestBody?.content) {
            for (const [contentTypeKey, contentType] of Object.entries(
              op.requestBody.content,
            )) {
              if ((contentType as any).schema) {
                errors.push(
                  ...propertyNamingConvention(
                    (contentType as any).schema,
                    options,
                    [
                      "paths",
                      pathKey,
                      opMethod,
                      "requestBody",
                      "content",
                      contentTypeKey,
                      "schema",
                    ],
                    context,
                  ),
                );
              }
            }
          }

          // Check the oas3 responses
          if (op.responses) {
            for (const [responseKey, response] of Object.entries(
              op.responses,
            )) {
              if ((response as any).content) {
                for (const [contentTypeKey, contentType] of Object.entries(
                  (response as any).content,
                )) {
                  if ((contentType as any).schema) {
                    errors.push(
                      ...propertyNamingConvention(
                        (contentType as any).schema,
                        options,
                        [
                          "paths",
                          pathKey,
                          opMethod,
                          "responses",
                          responseKey,
                          "content",
                          contentTypeKey,
                          "schema",
                        ],
                        context,
                      ),
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return errors;
};

export default namingConvetion;
