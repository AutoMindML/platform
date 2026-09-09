SELECT
  MID AS Metadata_Id,
  Prompt AS Prompt,
  SourceUpdated AS Source_Updated,
  LLMResponse AS Llm_Response,
  LogicAction AS Logic_Action,
  ProcessingHistory AS Processing_History,
  TargetColumnName AS Target_Column_Name,
  [Status] AS STATUS,
  [ApplierStatus] AS Applier_Status
FROM
  Dbo.MetaData;