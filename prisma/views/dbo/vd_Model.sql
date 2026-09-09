SELECT
  CO.CID AS project_id,
  O.OID AS model_id,
  O.CName AS name,
  O.CDes AS description,
  M.OutputFeatures AS output_features,
  M.InputFeatures AS input_features,
  O.EDes AS select_data_query,
  O.Since AS created_at,
  O.LastModifiedDT AS updated_at,
  O.OwnerMID AS owner_mid,
  M.Active AS active,
  M.Version AS version,
  M.Status AS STATUS,
  M.Score AS score,
  M.Predict AS predict,
  M.LearningType AS learning_type,
  M.TaskType AS task_type,
  M.TrainingTime AS training_time,
  M.UpdateStatus AS update_status,
  M.Error AS error,
  M.TrainingOptions AS training_options,
  M.CurrentTrainingPhase AS current_training_phase,
  M.TotalTrainingPhases AS total_training_phases,
  M.Tag AS tag,
  toData.OID2 AS data_source_id,
  (
    SELECT
      EName
    FROM
      [Object]
    WHERE
      OID = toData.OID2
  ) AS data_source_md5,
  (
    SELECT
      dbo.fn_get_data_source_type(
        (
          SELECT
            [Type]
          FROM
            [Object]
          WHERE
            OID = toData.OID2
        )
      )
  ) AS data_source_type,
  toEngine.OID2 AS engine_id,
  (
    SELECT
      EName
    FROM
      Object
    WHERE
      OID = toEngine.OID2
  ) AS engine_md5
FROM
  Object AS O
  LEFT JOIN [dbo].[Model] AS M ON M.MID = O.OID
  LEFT JOIN CO ON CO.OID = O.OID
  LEFT JOIN ORel AS toData ON toData.OID1 = O.OID
  AND EXISTS (
    SELECT
      *
    FROM
      vd_Data_Source
    WHERE
      oid = toData.OID2
  )
  LEFT JOIN ORel AS toEngine ON toEngine.OID1 = O.OID
  AND EXISTS (
    SELECT
      TYPE
    FROM
      Object
    WHERE
      OID = toEngine.OID2
      AND TYPE = 111
  )
WHERE
  O.Type = 112;