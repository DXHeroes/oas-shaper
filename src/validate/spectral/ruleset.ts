import { Ruleset, RulesetDefinition } from "@stoplight/spectral-core";
import {
  truthy,
  pattern,
  schema,
  xor,
  falsy,
} from "@stoplight/spectral-functions";
import { oas2, oas3 } from "@stoplight/spectral-formats";
import ensurePropertiesExample from "./functions/ensurePropertiesExample";
import ensureSnakeCaseWithDigits from "./functions/ensureSnakeCaseWithDigits";
import unusedDefinition from "./functions/unusedDefinition";
import pathParamNames from "./functions/pathParamNames";
import paramNamesUnique from "./functions/paramNamesUnique";
import namingConvention from "./functions/namingConvention";
import consistentResponseBody from "./functions/consistentResponseBody";

const ruleset: RulesetDefinition | Ruleset = {
  rules: {
    "no-empty-description": {
      given: "$..description",
      message: "Description must not be empty",
      then: {
        function: truthy,
      },
    },

    "paths-kebab-case": {
      given: "$.paths[*]",
      message: "{{property}} is not kebab-case: {{error}}",
      severity: "warn",
      recommended: true,
      then: {
        function: pattern,
        functionOptions: {
          match: "^(/[a-z0-9-.]+|/{[a-zA-Z0-9_]+})+$",
        },
      },
    },

    // "request-headers-pascal-case": {
    //   given: '$.[parameters][?(@.in=="header")].name',
    //   message: "{{value}} {{error}} in {{path}}",
    //   severity: "hint",
    //   recommended: true,
    //   then: {
    //     function: casing,
    //     functionOptions: {
    //       type: "pascal",
    //       separator: {
    //         char: "-",
    //       },
    //     },
    //   },
    // },

    // "response-headers-pascal-case": {
    //   given: "$.[responses][*].headers.*~",
    //   message: "Header {{error}}: {{path}}",
    //   severity: "hint",
    //   recommended: true,
    //   then: {
    //     function: casing,
    //     functionOptions: {
    //       type: "pascal",
    //       separator: {
    //         char: "-",
    //       },
    //     },
    //   },
    // },

    "has-contact": {
      given: "$",
      message:
        "API MUST reference a contact, either url or email in #/info/contact",
      severity: "error",
      recommended: true,
      type: "style",
      formats: [oas3],
      then: {
        field: "info.contact",
        function: truthy,
      },
    },

    "use-semver": {
      description: "The API version field should follow semantic versioning",
      severity: "error",
      recommended: true,
      message:
        "Specs should follow semantic versioning. {{value}} is not a valid version.",
      given: "$.info.version",
      then: {
        function: pattern,
        functionOptions: {
          match: "^[0-9]+.[0-9]+.[0-9]+(-[a-z0-9+.-]+)?",
        },
      },
    },

    "properties-must-include-examples": {
      description: "Object properties must include examples",
      given: "$..properties..properties.*",
      severity: "error",
      message: "{{description}}; {{property}}",
      then: {
        function: ensurePropertiesExample,
      },
    },

    "params-must-include-examples": {
      description: "Parameters must include examples",
      given: "$..parameters.*",
      severity: "error",
      message: "{{description}}; missing {{property}}",
      then: {
        function: xor,
        functionOptions: {
          properties: ["example", "examples"],
        },
      },
    },

    "headers-should-include-examples": {
      description: "Headers should include examples",
      given: "$..headers.*",
      severity: "warn",
      message: "{{description}}; missing {{property}}",
      then: {
        function: ensurePropertiesExample,
      },
    },

    "schema-key-must-be-snake-cased": {
      description: "schema key must be snake cased (e.g. snake_case)",
      type: "style",
      given: "$.components['schemas'].*~",
      severity: "error",
      message: "{{error}}",
      then: {
        function: ensureSnakeCaseWithDigits,
      },
    },

    "parameter-key-must-be-snake-cased": {
      description: "parameter key must be snake cased (e.g. snake_case)",
      type: "style",
      given: "$.components['parameters'].*~",
      severity: "error",
      message: "{{error}}",
      then: {
        function: ensureSnakeCaseWithDigits,
      },
    },

    "example-key-must-be-snake-cased": {
      description: "example key must be snake cased (e.g. snake_case)",
      type: "style",
      given: "$.components['examples'].*~",
      severity: "error",
      message: "{{error}}",
      then: {
        function: ensureSnakeCaseWithDigits,
      },
    },

    "response-key-must-be-snake-cased": {
      description: "response key must be snake cased (e.g. snake_case)",
      type: "style",
      given: "$.components['responses'].*~",
      severity: "error",
      message: "{{error}}",
      then: {
        function: ensureSnakeCaseWithDigits,
      },
    },

    "boolean-naming-convention": {
      description: "Use 'is' prefix in names of boolean values",
      severity: "warn",
      formats: [oas3],
      given: "$",
      then: {
        function: namingConvention,
        functionOptions: {
          type: "boolean",
          match: "^is[A-Z]",
        },
      },
    },

    "consistent-response-body": {
      description:
        "Ensure the get, put, and patch response body schemas are consistent",
      message: "{{error}}",
      severity: "warn",
      formats: [oas3],
      given: "$.paths.*",
      then: {
        function: consistentResponseBody,
      },
    },

    "datetime-naming-convention": {
      description: "Use an 'at' suffix in names of date-time values",
      severity: "warn",
      formats: [oas3],
      given: "$",
      then: {
        function: namingConvention,
        functionOptions: {
          type: "date-time",
          match: "at$",
        },
      },
    },

    "delete-response-codes": {
      description: "A delete operation should have a 204 response",
      message: "A delete operation should have a `204` response",
      severity: "warn",
      formats: [oas3],
      given: "$.paths[*].delete.responses",
      then: {
        function: schema,
        functionOptions: {
          schema: {
            oneOf: [
              {
                required: ["202"],
              },
              {
                required: ["204"],
                not: {
                  required: ["200"],
                },
              },
            ],
          },
        },
      },
    },

    "204-no-response-body": {
      description: "A 204 response should have no response body",
      severity: "warn",
      formats: [oas3],
      given: "$.paths[*][*].responses.204",
      then: {
        field: "schema",
        function: falsy,
      },
    },

    "operation-summary-and-description": {
      description: "Operation should have a summary and description",
      message: "Operation should have a summary and description",
      severity: "warn",
      given: [
        "$.paths[*][?( @property === 'get' && @.summary && @.description )]",
        "$.paths[*][?( @property === 'put' && @.summary && @.description )]",
        "$.paths[*][?( @property === 'post' && @.summary && @.description )]",
        "$.paths[*][?( @property === 'patch' && @.summary && @.description )]",
        "$.paths[*][?( @property === 'delete' && @.summary && @.description )]",
        "$.paths[*][?( @property === 'options' && @.summary && @.description )]",
        "$.paths[*][?( @property === 'head' && @.summary && @.description )]",
        "$.paths[*][?( @property === 'trace' && @.summary && @.description )]",
      ],
      then: {
        function: truthy,
      },
    },

    "parameter-description": {
      description: "All parameters should have a description",
      message: "Parameter should have a description",
      severity: "warn",
      formats: [oas3],
      given: [
        "$.paths[*].parameters.*",
        "$.paths.*[get,put,post,patch,delete,options,head].parameters.*",
      ],
      then: {
        field: "description",
        function: truthy,
      },
    },

    "parameter-names-unique": {
      description:
        "All parameter names for an operation should be case-insensitive unique",
      message: "{{error}}",
      severity: "warn",
      formats: [oas3],
      given: "$.paths[*]",
      then: {
        function: paramNamesUnique,
      },
    },

    "path-parameter-names": {
      description: "Path parameter names should be consistent across all paths",
      message: "{{error}}",
      severity: "warn",
      formats: [oas3],
      given: "$.paths",
      then: {
        function: pathParamNames,
      },
    },

    "post-201-response": {
      description: "Using post for a create operation is recommended",
      message: "Using post for a create operation is recommended",
      severity: "warn",
      formats: [oas3],
      given: "$.paths[*].post.responses",
      then: {
        field: "201",
        function: truthy,
      },
    },

    "property-description": {
      description: "All schema properties should have a description",
      message: "Property should have a description",
      severity: "warn",
      resolved: false,
      given: "$..properties[?(@object() && @.$ref == undefined)]",
      then: {
        field: "description",
        function: truthy,
      },
    },

    "property-type": {
      description: "All schema properties should have a defined type",
      message: "Property should have a defined type",
      severity: "warn",
      resolved: false,
      given:
        "$..properties[?(@object() && @.$ref == undefined && @.allOf == undefined && @.oneOf == undefined && @.anyOf == undefined)]",
      then: {
        field: "type",
        function: truthy,
      },
    },

    "request-body-not-allowed": {
      description: "A get or delete operation must not accept a body parameter",
      severity: "error",
      formats: [oas2, oas3],
      given: "$.paths[*].[get,delete].parameters[*]",
      then: {
        field: "in",
        function: pattern,
        functionOptions: {
          notMatch: "/^body$/",
        },
      },
    },

    "schema-description-and-title": {
      description: "All schemas should have a description and title",
      message: "Schema should have a description and title",
      severity: "warn",
      formats: [oas3],
      given: [
        "$.definitions[?(@.description && @.title)]",
        "$.components.schemas[?(@.description && @.title)]",
      ],
      then: {
        function: truthy,
      },
    },

    "success-response-body": {
      description:
        "All success responses except 204 should define a response body",
      severity: "warn",
      formats: [oas2, oas3],
      given:
        "$.paths[*][get,put,post,patch,delete].responses[?(@property >= 200 && @property < 300 && @property != '202' && @property != '204')]",
      then: {
        field: "schema",
        function: truthy,
      },
    },

    "unused-definition": {
      description: "Potentially unused definition has been detected",
      severity: "warn",
      formats: [oas2, oas3],
      resolved: false,
      given: "$.definitions",
      then: {
        function: unusedDefinition,
      },
    },
  },
};

export default ruleset;
