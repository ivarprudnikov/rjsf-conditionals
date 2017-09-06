import execute from "./actions";
import deepcopy from "deepcopy";
import deepEqual from "deep-equal";

function doRunRules(
  engine,
  formData,
  schema,
  uiSchema = {},
  extraActions = {}
) {
  let schemaCopy = deepcopy(schema);
  let uiSchemaCopy = deepcopy(uiSchema);
  let formDataCopy = deepcopy(formData);

  let res = engine.run(formData).then(events => {
    events.forEach(event =>
      execute(event, formDataCopy, schemaCopy, uiSchemaCopy, extraActions)
    );
  });

  return res.then(() => {
    return {
      schema: schemaCopy,
      uiSchema: uiSchemaCopy,
      formData: formDataCopy,
    };
  });
}

export default function runRules(
  formData = {},
  { rulesEngine, rules, schema, uiSchema = {}, extraActions = {} }
) {
  let engine = new rulesEngine([], schema);
  rules.forEach(rule => engine.addRule(rule));

  return doRunRules(
    engine,
    formData,
    schema,
    uiSchema,
    extraActions
  ).then(res => {
    if (deepEqual(res.formData, formData)) {
      return res;
    } else {
      return doRunRules(engine, res.formData, schema, uiSchema, extraActions);
    }
  });
}
