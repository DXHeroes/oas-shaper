/* eslint-disable @typescript-eslint/no-explicit-any */

// Check all definitions in the document to see if they are used
// Use the spectral unreferencedReusableObject to find its list of unused definitions,
// and then remove any that `allOf` a used schema.

import { unreferencedReusableObject } from "@stoplight/spectral-functions";

const isObject = (obj: any) => obj && typeof obj === "object";

// given should point to the member holding the potential reusable objects.
const unusedDefinition = (given: any, _: any, context: any) => {
  if (!isObject(given)) {
    return [];
  }
  const opts = {
    reusableObjectsLocation: "#/definitions",
  };
  const unreferencedDefinitionErrors: any = unreferencedReusableObject(
    given,
    opts,
    context,
  );

  const unusedDefinitions = unreferencedDefinitionErrors.map(
    (error: any) => error.path[1],
  );

  const allOfsUsedSchema = (schemaName: any) => {
    const schema = given[schemaName];
    if (!isObject(schema) || !Array.isArray(schema.allOf)) {
      return false;
    }

    return schema.allOf.some((subSchema: any) => {
      if (!isObject(subSchema) || !subSchema.$ref) {
        return false;
      }

      const reffedSchema = subSchema.$ref.split("/").pop();
      if (unusedDefinitions.includes(reffedSchema)) {
        return false;
      }

      return true;
    });
  };

  return unreferencedDefinitionErrors.filter(
    (error: any) => !allOfsUsedSchema(error.path[1]),
  );
};

export default unusedDefinition;
